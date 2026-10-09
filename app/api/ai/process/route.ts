import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { mapDbClothToWardrobeItem, DbCloth } from '@/lib/supabase/types';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'wardrobe-user-clothes';
const FASTAPI_URL = 'http://127.0.0.1:8001/api/ai/process-clothing';

interface AiProcessResult {
  status: string;
  detection: {
    label: string;
    confidence: number;
    bbox: number[];
  };
  segmentation: {
    cropped_dimensions: number[];
    cropped_image_path?: string;
    cropped_image_base64?: string;
  };
  color_analysis: {
    dominant_color: {
      name: string;
      hex: string;
      rgb: number[];
    };
    palette: Array<{ name: string; hex: string; percentage: number }>;
    suggested_partner_colors: Array<{ color: string; compatibility: number }>;
  };
  identified_cloth_or_accessory: {
    name: string;
    article_type: string;
    display_name: string;
    category: string;
    item_type: string;
    confidence: number;
    color: string;
    colorHex: string;
    gender: string;
    occasion: string;
  };
}

async function callPythonSubprocess(filePath: string, occasion: string, gender: string): Promise<AiProcessResult> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'ai', 'process_single.py');
    const child = spawn('python', [pythonScript, filePath, occasion, gender]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}: ${stderr}`));
      }

      const startIdx = stdout.indexOf('__JSON_START__');
      const endIdx = stdout.indexOf('__JSON_END__');
      if (startIdx === -1 || endIdx === -1) {
        return reject(new Error(`Could not parse JSON from python output: ${stdout}`));
      }

      try {
        const jsonStr = stdout.substring(startIdx + '__JSON_START__'.length, endIdx);
        const parsed = JSON.parse(jsonStr);
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    });
  });
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_USER_ID = '11111111-1111-1111-1111-111111111111';

function normalizeUserId(id?: string | null): string {
  if (!id || !UUID_REGEX.test(id)) {
    return DEFAULT_USER_ID;
  }
  return id;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userId = normalizeUserId(formData.get('userId') as string);
    const targetOccasion = (formData.get('targetOccasion') as string) || 'Casual';
    const targetGender = (formData.get('targetGender') as string) || 'Unisex';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
    }

    const fileBytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileBytes);

    let aiResult: AiProcessResult | null = null;

    // 1. Try FastAPI microservice
    try {
      const fastApiFormData = new FormData();
      const blob = new Blob([fileBuffer], { type: file.type });
      fastApiFormData.append('file', blob, file.name);
      fastApiFormData.append('target_occasion', targetOccasion);
      fastApiFormData.append('target_gender', targetGender);

      const res = await fetch(FASTAPI_URL, {
        method: 'POST',
        body: fastApiFormData,
        signal: AbortSignal.timeout(12000), // 12 second timeout
      });

      if (res.ok) {
        aiResult = await res.json();
      }
    } catch (e) {
      console.warn('FastAPI microservice call failed, using Python subprocess fallback:', e);
    }

    // 2. Subprocess fallback if FastAPI wasn't reached
    if (!aiResult) {
      const tempPath = path.join(os.tmpdir(), `upload-${Date.now()}-${file.name}`);
      fs.writeFileSync(tempPath, fileBuffer);

      try {
        aiResult = await callPythonSubprocess(tempPath, targetOccasion, targetGender);
      } finally {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    }

    if (!aiResult) {
      return NextResponse.json(
        { success: false, error: 'AI processing pipeline failed to analyze garment' },
        { status: 500 }
      );
    }

    const itemId = `cloth-${Date.now()}`;
    const cleanExt = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const rawStorageKey = `users/${userId}/clothes/${itemId}/raw.${cleanExt}`;
    const croppedStorageKey = `users/${userId}/clothes/${itemId}/cropped.png`;

    // 3. Upload Raw Image to Supabase Storage
    const { error: rawUploadErr } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(rawStorageKey, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (rawUploadErr) {
      console.error('Supabase raw image upload error:', rawUploadErr);
    }

    const { data: rawPublic } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(rawStorageKey);
    const rawImageUrl = rawPublic.publicUrl;

    // 4. Upload SAM 2 Cropped Transparent Image to Supabase Storage
    let croppedImageUrl = rawImageUrl;
    if (aiResult.segmentation?.cropped_image_base64) {
      const croppedBuffer = Buffer.from(aiResult.segmentation.cropped_image_base64, 'base64');
      const { error: cropUploadErr } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(croppedStorageKey, croppedBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (!cropUploadErr) {
        const { data: cropPublic } = supabaseAdmin.storage
          .from(BUCKET_NAME)
          .getPublicUrl(croppedStorageKey);
        croppedImageUrl = cropPublic.publicUrl;
      }
    }

    // 5. Insert AI attributes into Supabase 'clothes' table
    const itemData = aiResult.identified_cloth_or_accessory;
    const colorData = aiResult.color_analysis.dominant_color;

    let masterCategory = 'Apparel';
    if (itemData.category === 'Shoes' || itemData.item_type === 'footwear') {
      masterCategory = 'Footwear';
    } else if (itemData.category === 'Accessories' || itemData.item_type === 'accessory') {
      masterCategory = 'Accessories';
    }

    const aiTags = [
      itemData.category,
      itemData.article_type,
      colorData.name,
      targetOccasion,
      'YOLO11-Detected',
      'SAM2-Segmented',
    ];

    const { data: insertedDbCloth, error: dbErr } = await supabaseAdmin
      .from('clothes')
      .insert({
        user_id: userId,
        gender: targetGender,
        master_category: masterCategory,
        sub_category: itemData.category,
        article_type: itemData.article_type,
        base_colour: colorData.name,
        season: 'All-Season',
        usage_type: targetOccasion,
        product_display_name: itemData.name || `${colorData.name} ${itemData.display_name}`,
        s3_bucket: BUCKET_NAME,
        s3_key: rawStorageKey,
        s3_image_url: rawImageUrl,
        s3_cropped_key: croppedStorageKey,
        s3_cropped_url: croppedImageUrl,
        color_hex: colorData.hex,
        material: 'Premium Fabric',
        pattern: 'Solid',
        style_aesthetic: 'Classic',
        ai_tags: aiTags,
        ai_status: 'processed',
        usage_count: 0,
        is_favorite: false,
      })
      .select()
      .single();

    if (dbErr) {
      console.error('Supabase clothes DB insert error:', dbErr);
      return NextResponse.json({ success: false, error: dbErr.message }, { status: 500 });
    }

    const savedWardrobeItem = mapDbClothToWardrobeItem(insertedDbCloth as DbCloth);

    return NextResponse.json({
      success: true,
      item: savedWardrobeItem,
      ai: {
        detection: aiResult.detection,
        segmentation: {
          cropped_dimensions: aiResult.segmentation.cropped_dimensions,
          cropped_image_url: croppedImageUrl,
          cropped_image_base64: aiResult.segmentation.cropped_image_base64
            ? `data:image/png;base64,${aiResult.segmentation.cropped_image_base64}`
            : undefined,
          raw_image_url: rawImageUrl,
        },
        color_analysis: aiResult.color_analysis,
        identified_cloth_or_accessory: aiResult.identified_cloth_or_accessory,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('AI clothing process route error:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
