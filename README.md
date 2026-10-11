# HomeHub Real Estate Marketplace - Stitch Assets Downloader

This project contains the automated downloader pipeline to fetch all UI screens, code, screenshots, and hosted assets from the Google Stitch project: **HomeHub Real Estate Marketplace** (`15947445027309588228`).

## 📋 Target Screens

1. **Exquisite Estate Details | HomeHub** (`0462983b327f42168e2578a871d90710`)
2. **HomeHub | The Future of Human-Led Real Estate** (`1df3b1dc66fd4129bd8c12ce88b1546c`)
3. **HomeHub | Digital Twin Property Experience** (`2268daab4ca247d78e3a8474f6cc0612`)
4. **HomeHub | Digital Twin Property Experience** (`3bdd5e927e714a688117ec30c036aeb6`)
5. **Browse Properties | HomeHub** (`7b4509a9cf5940b8b76d80b4b72e3e6a`)
6. **Three.js** (`8805e7697a644137adc84aa09cc2875b`)
7. **The Elite Advisors | HomeHub** (`9f59d53685ac4eb2b659d8aaf4d37aa6`)
8. **Design System** (`asset-stub-assets_34dcdb0db40c4912ae435e6bed38285d`)
9. **Design System** (`asset-stub-assets_9e38ab6f652e4ae590a78a72e3e95ea3`)
10. **HomeHub | Human-Centric AI Property Experience** (`c0ae5443050c43429e2d1021b6b742b1`)
11. **Browse Luxury Estates | HomeHub** (`c8a8fb2f4fdc4a78ad3f0bd5f88a742c`)
12. **Shader** (`cc3010195f6943728425e154e203009d`)
13. **HomeHub | Ultra-Modern Real Estate** (`d0aabec2ae344b8ca3031ff20d034335`)
14. **Meet the Team | HomeHub** (`e0253f23f0904ebe97162aa3d6c033d8`)
15. **Property Details | HomeHub** (`ee3ba798148a4b3e95eeb63741d70bae`)
16. **HomeHub | Future-Ready Real Estate** (`ee77525130b94edb81922ba75be6e0d1`)

---

## 🔑 How to Authenticate & Download

The Stitch API and hosted download URLs require authentication via a **Stitch API Key**.

### Step 1: Get your Stitch API Key
1. Go to [https://stitch.withgoogle.com/settings](https://stitch.withgoogle.com/settings).
2. Generate / copy your **Stitch API Key**.

### Step 2: Run the Downloader

You can run the downloader in one of two ways:

#### Option A: Pass Key Directly via Command
```bash
npm run download -- <YOUR_STITCH_API_KEY>
```

#### Option B: Use `.env` file
Create a `.env` file in the project root:
```env
STITCH_API_KEY="your_api_key_here"
```
And run:
```bash
npm run download
```

---

## 📂 Output Structure

All screens and assets will be saved to `./stitch_designs/`:
```text
stitch_designs/
├── exquisite_estate_details_0462983b/
│   ├── code.html          # Cleaned HTML with localized asset references
│   ├── screen.png         # Full resolution screenshot
│   └── assets/            # Downloaded images & stylesheets
├── homehub_the_future_of_human_led_1df3b1dc/
│   ├── code.html
│   ├── screen.png
│   └── assets/
...
└── design_system/
    └── DESIGN.md          # Design system tokens and specifications
```
