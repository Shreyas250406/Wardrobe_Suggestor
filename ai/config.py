from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
AI_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "fashion-dataset"
IMAGES_DIR = DATASET_DIR / "images"
STYLES_CSV = DATASET_DIR / "styles.csv"
IMAGES_CSV = DATASET_DIR / "images.csv"
OUTPUT_DIR = AI_DIR / "outputs"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Pretrained model checkpoints
YOLO_MODEL_NAME = "yolo11n.pt"
SAM_MODEL_NAME = "sam2.1_t.pt"

# The 25 primary clothing & accessory types from the dataset
ARTICLE_TYPES = [
    # Topwear
    "Tshirts",
    "Shirts",
    "Tops",
    "Kurtas",
    # Bottomwear
    "Jeans",
    "Trousers",
    "Shorts",
    # Outerwear
    "Sweaters",
    "Jackets",
    "Sweatshirts",
    # Footwear
    "Casual Shoes",
    "Sports Shoes",
    "Formal Shoes",
    "Heels",
    "Flats",
    "Sandals",
    "Flip Flops",
    # Accessories
    "Watches",
    "Sunglasses",
    "Handbags",
    "Backpacks",
    "Wallets",
    "Belts",
    "Socks",
    # One-Piece
    "Dresses",
]

ARTICLE_TO_IDX = {name: idx for idx, name in enumerate(ARTICLE_TYPES)}
IDX_TO_ARTICLE = {idx: name for idx, name in enumerate(ARTICLE_TYPES)}

# Friendly display names and category hierarchy
ARTICLE_METADATA = {
    "Tshirts": {"category": "Tops", "display": "T-Shirt", "type": "clothing"},
    "Shirts": {"category": "Tops", "display": "Oxford / Button-Down Shirt", "type": "clothing"},
    "Tops": {"category": "Tops", "display": "Casual Blouse / Top", "type": "clothing"},
    "Kurtas": {"category": "Tops", "display": "Kurta / Ethnic Top", "type": "clothing"},
    "Jeans": {"category": "Bottoms", "display": "Denim Jeans", "type": "clothing"},
    "Trousers": {"category": "Bottoms", "display": "Tailored Trousers / Chinos", "type": "clothing"},
    "Shorts": {"category": "Bottoms", "display": "Casual Shorts", "type": "clothing"},
    "Sweaters": {"category": "Outerwear", "display": "Knit Sweater", "type": "clothing"},
    "Jackets": {"category": "Outerwear", "display": "Structured Jacket / Coat", "type": "clothing"},
    "Sweatshirts": {"category": "Outerwear", "display": "Hoodie / Sweatshirt", "type": "clothing"},
    "Casual Shoes": {"category": "Shoes", "display": "Casual Sneakers", "type": "footwear"},
    "Sports Shoes": {"category": "Shoes", "display": "Athletic / Running Shoes", "type": "footwear"},
    "Formal Shoes": {"category": "Shoes", "display": "Dress Loafers / Oxfords", "type": "footwear"},
    "Heels": {"category": "Shoes", "display": "Formal Heels / Pumps", "type": "footwear"},
    "Flats": {"category": "Shoes", "display": "Ballet Flats", "type": "footwear"},
    "Sandals": {"category": "Shoes", "display": "Open-Toe Sandals", "type": "footwear"},
    "Flip Flops": {"category": "Shoes", "display": "Casual Slides / Flip Flops", "type": "footwear"},
    "Watches": {"category": "Accessories", "display": "Wrist Watch", "type": "accessory"},
    "Sunglasses": {"category": "Accessories", "display": "Sunglasses / Eyewear", "type": "accessory"},
    "Handbags": {"category": "Accessories", "display": "Handbag / Tote", "type": "accessory"},
    "Backpacks": {"category": "Accessories", "display": "Everyday Backpack", "type": "accessory"},
    "Wallets": {"category": "Accessories", "display": "Leather Wallet", "type": "accessory"},
    "Belts": {"category": "Accessories", "display": "Leather Belt", "type": "accessory"},
    "Socks": {"category": "Accessories", "display": "Crew / Ankle Socks", "type": "accessory"},
    "Dresses": {"category": "One-Piece", "display": "Day / Evening Dress", "type": "clothing"},
}

# Anchor Color Mapping
COLOR_ANCHORS = {
    "Black": {"hex": "#18181B", "rgb": (24, 24, 27)},
    "White": {"hex": "#F9FAFB", "rgb": (249, 250, 251)},
    "Navy Blue": {"hex": "#1E3A8A", "rgb": (30, 58, 138)},
    "Blue": {"hex": "#3B82F6", "rgb": (59, 130, 246)},
    "Grey": {"hex": "#6B7280", "rgb": (107, 114, 128)},
    "Brown": {"hex": "#78350F", "rgb": (120, 53, 15)},
    "Beige": {"hex": "#D2B48C", "rgb": (210, 180, 140)},
    "Cream": {"hex": "#FFFDD0", "rgb": (255, 253, 208)},
    "Olive": {"hex": "#556B2F", "rgb": (85, 107, 47)},
    "Green": {"hex": "#16A34A", "rgb": (22, 163, 74)},
    "Red": {"hex": "#DC2626", "rgb": (220, 38, 38)},
    "Maroon": {"hex": "#800000", "rgb": (128, 0, 0)},
    "Pink": {"hex": "#EC4899", "rgb": (236, 72, 153)},
    "Purple": {"hex": "#9333EA", "rgb": (147, 51, 234)},
    "Yellow": {"hex": "#EAB308", "rgb": (234, 179, 8)},
    "Orange": {"hex": "#F97316", "rgb": (249, 115, 22)},
    "Silver": {"hex": "#E5E7EB", "rgb": (229, 231, 235)},
    "Gold": {"hex": "#D97706", "rgb": (217, 119, 6)},
    "Rust": {"hex": "#B45309", "rgb": (180, 83, 9)},
    "Khaki": {"hex": "#C3B091", "rgb": (195, 176, 145)},
    "Teal": {"hex": "#0D9488", "rgb": (13, 148, 136)},
    "Charcoal": {"hex": "#374151", "rgb": (55, 65, 81)},
}
