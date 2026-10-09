# AI Wardrobe Suggestor
### Software Requirements Specification (SRS)
**Project Blueprint for Codex / Antigravity**

---

## 1. Project Overview

AI Wardrobe Suggestor is an AI-powered wardrobe digitization, outfit recommendation, and virtual try-on platform. Users upload clothing, AI extracts attributes, stores metadata, and recommends outfits based on color compatibility, occasion, season, style, and user preferences.

---

## 2. Repository Structure

The project is divided into four branches:

- **main** — Stable integration branch containing merged code, CI/CD, documentation, deployment configs, Docker, API specs, release tags.
- **AI** — Computer vision, recommendation engine, embeddings, virtual try-on, model training/inference, ranking engine, color matrix, prompt pipelines.
- **DB** — Database schema, migrations, ORM models, indexing, vector database integration, backup scripts, seed data.
- **Frontend** — React/Next.js UI, authentication, wardrobe management, recommendation pages, virtual try-on interface, dashboards.

---

## 3. Core Modules

- Authentication
- User Profile
- Wardrobe Management
- AI Attribute Detection
- Recommendation Engine
- Virtual Try-On
- Outfit Builder
- Saved Outfits
- Outfit History
- Accessories
- Search & Filters
- Notifications
- Analytics
- Admin Panel

---

## 4. AI Requirements

- Image preprocessing
- Background removal
- Segmentation
- Clothing detection
- Category classification
- Dominant color extraction
- Pattern detection
- Occasion tagging
- Embedding generation
- Outfit ranking
- Virtual try-on using only wardrobe items
- Accessory toggle
- Confidence scoring

---

## 5. Database Requirements

**Tables:**
Users, WardrobeItems, ClothingAttributes, OutfitRecommendations, SavedOutfits, OutfitHistory, UserPreferences, Accessories, RecommendationRules, ColorCompatibilityMatrix, OccasionRules, VirtualTryOnSessions.

**Stack:** PostgreSQL + pgvector + Redis

---

## 6. Frontend Requirements

- Responsive dashboard
- Upload workflow
- Wardrobe gallery
- AI recommendation cards
- Outfit builder
- Virtual try-on preview
- Profile
- Analytics
- Admin pages

---

## 7. APIs

REST endpoints:

| Method | Endpoint |
|--------|----------|
| POST | `/auth/*` |
| POST | `/wardrobe/upload` |
| GET | `/wardrobe` |
| PUT | `/wardrobe/{id}` |
| DELETE | `/wardrobe/{id}` |
| POST | `/recommend` |
| POST | `/virtual-tryon` |
| GET | `/saved-outfits` |
| POST | `/saved-outfits` |
| GET | `/analytics` |

---

## 8. Technology Stack

- **Frontend:** Next.js, React, Tailwind, TypeScript
- **Backend:** FastAPI (AI), Node.js/Express
- **AI:** YOLO, SAM2, FashionCLIP, OpenCV, BLIP-2, Stable Diffusion/FLUX, PyTorch
- **Database:** PostgreSQL, pgvector, Redis
- **Storage:** S3/Cloudinary

---

## 9. Development Workflow

Feature branches → Pull Requests → Code Review → Merge into respective branch → Integration testing → Merge into main → CI/CD deployment.

---

## 10. Non-functional Requirements

- Secure JWT authentication
- HTTPS
- Scalable architecture
- < 2 sec recommendation response time
- Modular services
- Logging
- Monitoring
- Automated tests
- Backups

---

## 11. Future Roadmap

- Weather-aware suggestions
- Calendar integration
- Shopping recommendations
- Travel packing assistant
- Sustainability insights
- Family wardrobes

---

## 12. Deliverables

Codex/Antigravity should generate:

1. Complete folder structure
2. Backend APIs
3. AI pipelines
4. Database schema/migrations
5. Frontend UI
6. Docker setup
7. CI/CD
8. Unit/integration tests
9. Documentation
10. Production-ready deployment
