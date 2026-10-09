'use client';

import React, { useState } from 'react';
import { X, Sparkles, UploadCloud, Check } from 'lucide-react';
import { ClothingCategory, WardrobeItem } from '@/types/wardrobe';
import { useApp } from '@/context/AppContext';

interface AddClothingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClothingModal: React.FC<AddClothingModalProps> = ({ isOpen, onClose }) => {
  const { addWardrobeItem, currentUser } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('Tops');
  const [color, setColor] = useState('Navy');
  const [colorHex, setColorHex] = useState('#1D2D50');
  const [season, setSeason] = useState<WardrobeItem['season']>('All-Season');
  const [occasion, setOccasion] = useState<WardrobeItem['occasion']>('Casual');
  const [style, setStyle] = useState<WardrobeItem['style']>('Minimal');
  const [brand, setBrand] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStage, setAiStage] = useState('');
  const [aiTelemetry, setAiTelemetry] = useState<{
    label?: string;
    confidence?: number;
    bbox?: number[];
    dominantColor?: string;
    partnerColors?: string[];
  } | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [savedCloth, setSavedCloth] = useState<WardrobeItem | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiProcessing(true);
    setUploadError(null);
    setAiTelemetry(null);
    setCroppedImageUrl(null);
    setAiStage('Initializing YOLO11n & SAM 2.1 cluster...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', currentUser?.id || '00000000-0000-0000-0000-000000000001');
      formData.append('targetOccasion', occasion);
      formData.append('targetGender', 'Unisex');

      setAiStage('YOLO11n detecting clothing bounding box & SAM 2 segmenting transparent mask...');

      const res = await fetch('/api/ai/process', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.item) {
        setSavedCloth(data.item);
        setImageUrl(data.item.imageUrl);
        setName(data.item.name);
        setCategory(data.item.category);
        setColor(data.item.color);
        setColorHex(data.item.colorHex);
        setSeason(data.item.season);
        setOccasion(data.item.occasion);
        setStyle(data.item.style);

        if (data.ai) {
          const croppedUrl = data.ai.segmentation?.cropped_image_base64 || data.ai.segmentation?.cropped_image_url;
          if (croppedUrl) {
            setCroppedImageUrl(croppedUrl);
          }
          setAiTelemetry({
            label: data.ai.detection?.label,
            confidence: Math.round((data.ai.detection?.confidence || 0.95) * 100),
            bbox: data.ai.detection?.bbox,
            dominantColor: data.ai.color_analysis?.dominant_color?.name,
            partnerColors: data.ai.color_analysis?.suggested_partner_colors?.map((p: { color: string }) => p.color),
          });
        }

        // Add to local context immediately
        addWardrobeItem(data.item);
        setAiStage('Completed! Garment and SAM 2 cutout saved to Supabase Storage.');
      } else {
        setUploadError(data.error || 'Failed to process garment with AI pipeline');
      }
    } catch {
      setUploadError('Network error executing YOLO and SAM2 processing');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const sampleImages = [
    { label: 'White Oxford', url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80', cat: 'Tops', col: 'White', hex: '#FFFFFF' },
    { label: 'Indigo Denim', url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80', cat: 'Bottoms', col: 'Indigo', hex: '#1D2D50' },
    { label: 'Camel Coat', url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=600&q=80', cat: 'Outerwear', col: 'Camel', hex: '#C68B59' },
    { label: 'White Low-Tops', url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80', cat: 'Shoes', col: 'White', hex: '#F8F9FA' },
  ];

  const handleSimulateAiVision = (sUrl: string) => {
    setImageUrl(sUrl);
    setCroppedImageUrl(null);
    setIsAiProcessing(true);
    setAiTelemetry(null);
    setAiStage('Simulating YOLO11n + SAM 2.1 inference on preset...');

    setTimeout(() => {
      setIsAiProcessing(false);
      const match = sampleImages.find((s) => s.url === sUrl);
      if (match) {
        setName(match.label);
        setCategory(match.cat as ClothingCategory);
        setColor(match.col);
        setColorHex(match.hex);
        setAiTelemetry({
          label: match.label,
          confidence: 98,
          bbox: [40, 50, 360, 350],
          dominantColor: match.col,
          partnerColors: ['Navy Blue', 'Charcoal', 'Beige', 'Black'],
        });
      }
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!savedCloth) {
      const newItem: WardrobeItem = {
        id: `item-${Date.now()}`,
        name: name.trim(),
        category,
        color,
        colorHex,
        season,
        occasion,
        style,
        brand: brand.trim() || 'Studio Atelier',
        imageUrl:
          croppedImageUrl ||
          imageUrl ||
          'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
        wearCount: 0,
        tags: [category, occasion, season, style],
        aiStatus: 'processed',
      };
      addWardrobeItem(newItem);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add Clothing Item</h2>
              <p className="text-[11px] text-neutral-400">Computer Vision extraction &amp; attribute tagging</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="mt-4 p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-2">
            Click to auto-simulate Computer Vision detection:
          </span>
          <div className="grid grid-cols-4 gap-2">
            {sampleImages.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => handleSimulateAiVision(s.url)}
                className={`p-1.5 rounded-xl border text-left transition-all ${
                  imageUrl === s.url
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt={s.label} className="w-full aspect-square object-cover rounded-lg mb-1" />
                <span className="text-[10px] font-medium block truncate">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {isAiProcessing && (
          <div className="mt-3 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-3 animate-pulse">
            <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="font-semibold">{aiStage || 'Running AI Vision Pipeline...'}</p>
              <p className="text-[10px] text-indigo-400/80">YOLO11n + SAM 2.1 + Pillow K-Means + MobileNetV3</p>
            </div>
          </div>
        )}

        {aiTelemetry && (
          <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-400">
              <div className="flex items-center gap-1.5 font-bold">
                <Check className="w-4 h-4" />
                <span>YOLO11 &amp; SAM 2 Segmentation Complete ({aiTelemetry.confidence}% Confidence)</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Processed
              </span>
            </div>

            {/* Side-by-side segmentation preview */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-center relative overflow-hidden">
                <span className="text-[10px] font-mono text-neutral-400 block mb-1">1. YOLO11 Bounding Box</span>
                <div className="relative w-full h-28 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Raw Input" className="w-full h-full object-contain rounded-lg" />
                  <div className="absolute inset-1 border-2 border-dashed border-amber-400/80 rounded pointer-events-none flex items-start justify-start p-1">
                    <span className="text-[8px] font-mono bg-amber-400 text-neutral-950 font-bold px-1 rounded shadow">
                      YOLO: {aiTelemetry.label || 'apparel'} {aiTelemetry.confidence}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950 border border-emerald-500/40 text-center relative overflow-hidden">
                <span className="text-[10px] font-mono text-emerald-300 font-bold block mb-1">2. SAM 2.1 Cutout Mask</span>
                <div className="w-full h-28 flex items-center justify-center rounded-lg bg-[repeating-conic-gradient(#262626_0%_25%,#171717_0%_50%)] bg-[length:12px_12px] p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={croppedImageUrl || imageUrl}
                    alt="SAM2 Cutout"
                    className="w-full h-full object-contain rounded"
                  />
                </div>
              </div>
            </div>

            {aiTelemetry.partnerColors && aiTelemetry.partnerColors.length > 0 && (
              <div className="pt-1 border-t border-emerald-500/20">
                <span className="text-[10px] font-mono text-emerald-300 block mb-1">
                  Color Matrix Partner Colors:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {aiTelemetry.partnerColors.map((pc, idx) => (
                    <span
                      key={`${pc}-${idx}`}
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/30 text-emerald-200"
                    >
                      {pc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">Garment Name</label>
            <input
              type="text"
              placeholder="e.g. Vintage Denim Trucker Jacket"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ClothingCategory)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Tops">Tops</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Outerwear">Outerwear</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as WardrobeItem['occasion'])}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Casual">Casual</option>
                <option value="Smart Casual">Smart Casual</option>
                <option value="Formal">Formal</option>
                <option value="Sport">Sport</option>
                <option value="Party">Party</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as WardrobeItem['season'])}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="All-Season">All-Season</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Autumn">Autumn</option>
                <option value="Winter">Winter</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as WardrobeItem['style'])}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Minimal">Minimal</option>
                <option value="Old Money">Old Money</option>
                <option value="Streetwear">Streetwear</option>
                <option value="Classic">Classic</option>
                <option value="Athleisure">Athleisure</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
              Garment Image (Upload to Supabase Storage or Paste URL)
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-950 border border-dashed border-neutral-700 hover:border-amber-400 rounded-xl cursor-pointer text-xs text-neutral-300 transition-all hover:text-white">
                  <UploadCloud className="w-4 h-4 text-amber-400" />
                  <span>{isAiProcessing ? 'Processing with YOLO & SAM2...' : 'Upload Image (YOLO + SAM2)'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isAiProcessing}
                  />
                </label>
                {imageUrl && (
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <input
                type="url"
                placeholder="Or paste direct image URL (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
              />
              {uploadError && (
                <p className="text-[11px] text-red-400">{uploadError}</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Save to Closet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
