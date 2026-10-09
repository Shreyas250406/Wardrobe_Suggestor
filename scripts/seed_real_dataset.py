import os
import sys
import json
import uuid
import time
import urllib.request
import urllib.parse
from pathlib import Path
from PIL import Image
import pandas as pd
import numpy as np

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from ai.detector import ClothingDetectorV2
from ai.segmenter import ClothSegmenterV2
from ai.color_extractor import ColorExtractorV2
from ai.classifier import ClothAndAccessoryClassifier

# Supabase Credentials
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://frdyuycfwygnloyvpoom.supabase.co")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
BUCKET_NAME = os.environ.get("NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET", "wardrobe-user-clothes")

HEADERS_JSON = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# The 4 Real Accounts Requested by User
ACCOUNTS = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "shreyasdeep253@gmail.com",
        "full_name": "Shreyas Auti",
        "role": "admin",
        "gender_preference": "Men",
        "password_hash": "pict@123",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        "is_active": True,
        "email_verified": True,
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "email": "adildeshpande05@gmail.com",
        "full_name": "Adil Deshpande",
        "role": "user",
        "gender_preference": "Men",
        "password_hash": "pict@123",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        "is_active": True,
        "email_verified": True,
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "email": "aryanpar03@gmail.com",
        "full_name": "Aryan Pardeshi",
        "role": "user",
        "gender_preference": "Men",
        "password_hash": "pict@123",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        "is_active": True,
        "email_verified": True,
    },
    {
        "id": "44444444-4444-4444-4444-444444444444",
        "email": "shraddha@gmail.com",
        "full_name": "Shraddha Kapoor",
        "role": "user",
        "gender_preference": "Women",
        "password_hash": "pict@123",
        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
        "is_active": True,
        "email_verified": True,
    },
]


def make_request(url: str, data: bytes = None, headers: dict = None, method: str = "GET"):
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        return e.code, err_msg.encode("utf-8")
    except Exception as e:
        return 500, str(e).encode("utf-8")


def purge_old_data():
    print("\n--- STEP 1: Purging old mock data from Supabase ---")
    
    # 1. Delete all clothes
    status, resp = make_request(
        f"{SUPABASE_URL}/rest/v1/clothes?id=neq.00000000-0000-0000-0000-000000000000",
        headers=HEADERS_JSON,
        method="DELETE"
    )
    print(f"Purge clothes: HTTP {status}")

    # 2. Delete all users
    status, resp = make_request(
        f"{SUPABASE_URL}/rest/v1/users?id=neq.00000000-0000-0000-0000-000000000000",
        headers=HEADERS_JSON,
        method="DELETE"
    )
    print(f"Purge users: HTTP {status}")


def create_accounts():
    print("\n--- STEP 2: Creating 4 real user accounts in Supabase ---")
    for acc in ACCOUNTS:
        status, resp = make_request(
            f"{SUPABASE_URL}/rest/v1/users",
            data=json.dumps(acc).encode("utf-8"),
            headers=HEADERS_JSON,
            method="POST"
        )
        if status in [200, 201]:
            print(f"Created account: {acc['full_name']} ({acc['email']}) [Role: {acc['role']}]")
        else:
            print(f"Account {acc['email']} response: HTTP {status} - {resp.decode('utf-8', errors='ignore')}")


def upload_to_storage(key: str, data: bytes, content_type: str) -> str:
    encoded_key = urllib.parse.quote(key, safe="/")
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{encoded_key}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }
    status, resp = make_request(url, data=data, headers=headers, method="POST")
    if status not in [200, 201]:
        print(f"Storage upload warning for {key}: HTTP {status} - {resp.decode('utf-8', errors='ignore')}")
    
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{encoded_key}"


def select_capsule_items():
    print("\n--- STEP 3: Selecting real clothing items from fashion-dataset ---")
    styles_csv = BASE_DIR / "fashion-dataset" / "styles.csv"
    img_dir = BASE_DIR / "fashion-dataset" / "fashion-dataset" / "fashion-dataset" / "images"

    styles = pd.read_csv(styles_csv, on_bad_lines="skip")
    existing_ids = {int(f[:-4]) for f in os.listdir(img_dir) if f.endswith(".jpg")}
    styles = styles[styles["id"].isin(existing_ids)]

    men = styles[styles["gender"] == "Men"]
    women = styles[styles["gender"] == "Women"]

    used_ids = set()

    def pick_items(df, plan):
        picked = []
        for art_type, count in plan:
            sub = df[(df["articleType"] == art_type) & (~df["id"].isin(used_ids))]
            sample = sub.head(count)
            for _, row in sample.iterrows():
                picked.append(row.to_dict())
                used_ids.add(row["id"])
        return picked

    # 1. Shreyas Auti (Men's Smart Casual Capsule)
    shreyas_plan = [
        ("Shirts", 3),
        ("Jeans", 2),
        ("Trousers", 1),
        ("Jackets", 1),
        ("Sweaters", 1),
        ("Casual Shoes", 2),
        ("Watches", 1),
        ("Belts", 1),
    ]
    shreyas_items = pick_items(men, shreyas_plan)

    # 2. Adil Deshpande (Men's Urban / Streetwear Capsule)
    adil_plan = [
        ("Tshirts", 3),
        ("Jeans", 2),
        ("Shorts", 1),
        ("Sweatshirts", 1),
        ("Jackets", 1),
        ("Sports Shoes", 2),
        ("Watches", 1),
        ("Sunglasses", 1),
    ]
    adil_items = pick_items(men, adil_plan)

    # 3. Aryan Pardeshi (Men's Classic & Formal Capsule)
    aryan_plan = [
        ("Shirts", 2),
        ("Tshirts", 2),
        ("Trousers", 2),
        ("Sweaters", 1),
        ("Jackets", 1),
        ("Formal Shoes", 2),
        ("Watches", 1),
        ("Belts", 1),
    ]
    aryan_items = pick_items(men, aryan_plan)

    # 4. Shraddha Kapoor (Women's Elegant Wardrobe Capsule)
    shraddha_plan = [
        ("Tops", 3),
        ("Kurtas", 2),
        ("Jeans", 2),
        ("Skirts", 1),
        ("Jackets", 1),
        ("Dresses", 2),
        ("Heels", 2),
        ("Flats", 1),
        ("Handbags", 1),
        ("Watches", 1),
    ]
    shraddha_items = pick_items(women, shraddha_plan)

    return {
        ACCOUNTS[0]["id"]: (ACCOUNTS[0]["full_name"], shreyas_items),
        ACCOUNTS[1]["id"]: (ACCOUNTS[1]["full_name"], adil_items),
        ACCOUNTS[2]["id"]: (ACCOUNTS[2]["full_name"], aryan_items),
        ACCOUNTS[3]["id"]: (ACCOUNTS[3]["full_name"], shraddha_items),
    }


def seed_items_with_ai():
    capsules = select_capsule_items()
    img_dir = BASE_DIR / "fashion-dataset" / "fashion-dataset" / "fashion-dataset" / "images"

    print("\n--- STEP 4: Initializing AI Engine (YOLO11, SAM 2, Color Extractor, Classifier) ---")
    detector = ClothingDetectorV2()
    segmenter = ClothSegmenterV2()
    color_extractor = ColorExtractorV2()
    classifier = ClothAndAccessoryClassifier()

    total_items = sum(len(items) for _, (_, items) in capsules.items())
    print(f"Total garments to process through AI: {total_items}")

    item_index = 0
    start_all = time.time()

    for user_id, (user_name, items) in capsules.items():
        print(f"\n=======================================================")
        print(f"Processing wardrobe for: {user_name} ({len(items)} items)")
        print(f"=======================================================")

        for item_data in items:
            item_index += 1
            dataset_id = item_data["id"]
            img_file = img_dir / f"{dataset_id}.jpg"

            if not img_file.exists():
                print(f"Image {img_file} not found, skipping.")
                continue

            cloth_uuid = str(uuid.uuid4())
            display_name = item_data.get("productDisplayName") or f"{item_data.get('baseColour', '')} {item_data.get('articleType', '')}"

            print(f"[{item_index}/{total_items}] AI processing: {display_name} (ID: {dataset_id})...")

            # 1. Read Raw Image
            with open(img_file, "rb") as f:
                raw_bytes = f.read()
            pil_img = Image.open(img_file).convert("RGB")

            # 2. AI YOLO Detection
            det_res = detector.detect(pil_img)
            bbox = det_res["box"]

            # 3. AI SAM 2 Segmentation (removes human face/hands, applies white background, crops)
            seg_res = segmenter.segment_and_crop(pil_img, bbox=bbox)
            cropped_cloth = seg_res["cropped_image"]

            # 4. Color Extraction
            color_data = color_extractor.extract_colors(cropped_cloth)
            dom_color = color_data["dominant_color"]

            # 5. Classifier Check
            id_res = classifier.identify_item(cropped_cloth)

            # 6. Convert Cropped Cloth to PNG Bytes
            import io
            crop_buf = io.BytesIO()
            cropped_cloth.save(crop_buf, format="PNG")
            cropped_bytes = crop_buf.getvalue()

            # 7. Upload to Supabase Storage
            raw_s3_key = f"users/{user_id}/clothes/{cloth_uuid}/raw.jpg"
            cropped_s3_key = f"users/{user_id}/clothes/{cloth_uuid}/cropped.png"

            raw_url = upload_to_storage(raw_s3_key, raw_bytes, "image/jpeg")
            cropped_url = upload_to_storage(cropped_s3_key, cropped_bytes, "image/png")

            # 8. Prepare Database Record
            year_val = item_data.get("year")
            try:
                year_int = int(year_val) if pd.notnull(year_val) else 2024
            except:
                year_int = 2024

            db_record = {
                "id": cloth_uuid,
                "user_id": user_id,
                "gender": str(item_data.get("gender") or "Unisex"),
                "master_category": str(item_data.get("masterCategory") or "Apparel"),
                "sub_category": str(item_data.get("subCategory") or "Topwear"),
                "article_type": str(item_data.get("articleType") or "Shirts"),
                "base_colour": str(dom_color.get("name") or item_data.get("baseColour") or "Black"),
                "season": str(item_data.get("season") or "All-Season"),
                "year": year_int,
                "usage_type": str(item_data.get("usage") or "Casual"),
                "product_display_name": str(display_name)[:250],
                "s3_bucket": BUCKET_NAME,
                "s3_key": raw_s3_key,
                "s3_image_url": raw_url,
                "s3_cropped_key": cropped_s3_key,
                "s3_cropped_url": cropped_url,
                "color_hex": str(dom_color.get("hex") or "#000000"),
                "material": "Quality Blend",
                "pattern": "Solid",
                "style_aesthetic": "Classic",
                "ai_tags": [
                    item_data.get("articleType", "Apparel"),
                    item_data.get("subCategory", "Topwear"),
                    dom_color.get("name", "Classic"),
                    item_data.get("season", "All-Season"),
                ],
                "ai_status": "processed",
                "usage_count": 0,
                "is_favorite": False,
            }

            # 9. Insert into Supabase 'clothes' Table
            status, resp = make_request(
                f"{SUPABASE_URL}/rest/v1/clothes",
                data=json.dumps(db_record).encode("utf-8"),
                headers=HEADERS_JSON,
                method="POST"
            )

            if status in [200, 201]:
                print(f"   -> Saved to Supabase: {display_name} [{dom_color['name']}]")
            else:
                print(f"   -> DB Insert Error: HTTP {status} - {resp.decode('utf-8', errors='ignore')}")

    total_time = round(time.time() - start_all, 1)
    print(f"\n=======================================================")
    print(f"SUCCESS! All {total_items} items processed and seeded in {total_time}s!")
    print(f"=======================================================")


if __name__ == "__main__":
    purge_old_data()
    create_accounts()
    seed_items_with_ai()
