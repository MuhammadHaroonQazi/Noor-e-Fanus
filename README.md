# Noor-e-Fanus (نورِ فانوس) – Luxury Fanus & Home Lighting Showroom

A modern, responsive lighting showroom and product catalog built for a Pakistani decorative home lighting (**Fanus / فانوس**) business. Customers can browse chandeliers and lighting fixtures, inspect interactive **3D Fanus models**, compare transparent prices in **Pakistani Rupees (PKR)**, filter by room or style, and place orders directly via **WhatsApp**.

---

## ✨ Key Features

### 1. Interactive 3D Fanus Studio (Three.js / WebGL)
- **5 Procedural 3D Chandelier Designs**:
  - *Imperial Crystal* (Multi-tier K9 crystal chandelier)
  - *Golden Rings* (Modern geometric LED rings)
  - *Mughal Filigree* (Traditional pierced brass lantern)
  - *Cascade Globes* (Bedroom & staircase glass globe cluster)
  - *Wall Sconce* (Architectural brass and fluted crystal wall light)
- **Live Customization**:
  - Switch metal finishes (*Champagne Gold*, *Antique Bronze*, *Polished Chrome*).
  - Toggle LED color temperatures (*2700K Warm Gold*, *4000K Neutral*, *6000K Daylight*).
  - Inspect internal crystal layers using the **Inspect Layers (Exploded View)** slider.
  - 360° orbit controls with a collapsible bottom control dock.

### 2. Complete Lighting Catalog & Filtering
- **20 Pre-Loaded Sample Products** across **10 Categories**:
  - *Ceiling Fanus*, *Hanging Fanus*, *Crystal Lights*, *Modern Lights*, *Wall Lights*, *Bedroom Lights*, *Living Room Lights*, *Dining Room Lights*, *Outdoor Lights*, and *Decorative Lights*.
- **Real-Time Search & Filters**:
  - Search by product name, Urdu name, SKU, material, or light type.
  - Filter by category, collection (*Featured*, *Best Sellers*, *New Arrivals*, *Recently Added*, *Discounted Offers*), and maximum price in **PKR**.
  - Sort by *Featured*, *Price: Low to High*, *Price: High to Low*, and *Newest*.

### 3. Dedicated Product Detail Page (PDP)
- **Multi-Angle Studio Gallery**: Switch between *Showroom Front View*, *2700K Warm Evening Glow*, *Crystal & Finish Macro*, and *Architectural Room Scale*, with zoom and next/previous navigation.
- **Interactive 3D View Toggle**: Switch from the photo gallery directly to a 3D model of the selected product.
- **Full Technical Specifications**: Displays SKU, available sizes, finishes/colors, light type, material, bulb/LED details, dimensions, installation notes, and stock status.

### 4. Direct WhatsApp Ordering & Customer Inquiries
- Every product card and product detail page includes an **Order on WhatsApp** button that opens WhatsApp with a pre-filled message:
  > *"Assalam o Alaikum, I am interested in [PRODUCT NAME]. Price: PKR [PRICE]. Please provide availability and details."*
- Includes a floating WhatsApp button on desktop and mobile, direct **Call Us** links, and a validated **Contact & Inquiry Form** with Google Maps showroom integration.

### 5. Built-In Catalog & PKR Price Manager (Admin Dashboard)
- Click **Manage Catalog** in the top navigation bar or footer to:
  - Edit any product's **Price (PKR)** or **Old Price (PKR)** inline with instant storefront updates.
  - Add new Fanus products with custom photos (via file upload or image URL) and 3D model styles.
  - Toggle *Featured*, *Best Seller*, and *New Arrival* status badges.
  - Update business contact info (Showroom Name, WhatsApp number, Phone, Address, Opening Hours, and Home Delivery toggle).
  - View customer inquiries submitted through the Contact page.

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 (Luxury warm ivory `#FAF7F2`, deep charcoal `#181615`, and champagne gold `#C69C47` palette)
- **3D Rendering**: Three.js (`WebGLRenderer`, `RoomEnvironment` PBR reflections, `InstancedMesh` crystal prisms, `OrbitControls`)
- **Icons**: Lucide React
- **Typography**: *Cormorant Garamond* (Display headings), *Plus Jakarta Sans* (Body copy), and *JetBrains Mono* (Tabular PKR prices & SKUs)

---

## 📂 Project Structure

```text
├── index.html                          # SEO meta tags, OpenGraph, Google Fonts & JSON-LD Schema
├── metadata.json                       # Application metadata
├── package.json                        # Dependencies and scripts
└── src/
    ├── App.tsx                         # Main application views (Home, Products, Categories, About, Contact)
    ├── index.css                       # Global Tailwind v4 imports & typography rules
    ├── main.tsx                        # React DOM entry point
    ├── types/
    │   └── lighting.ts                 # TypeScript interfaces for Products, Categories, Filters & Business Info
    ├── data/
    │   └── productsData.ts             # Centralized, easy-to-edit file for Business Info, 10 Categories & 20 Products
    ├── utils/
    │   ├── catalogLogic.ts             # Pure functions for PKR formatting, WhatsApp URLs, filtering & validation
    │   └── catalogLogic.test.ts        # Node unit tests for catalog and WhatsApp logic
    └── components/
        ├── Navbar.tsx                  # Sticky responsive header & mobile navigation drawer
        ├── Fanus3DShowcase.tsx         # Interactive Three.js 3D chandelier visualizer & lighting studio
        ├── ProductVisualStudio.tsx     # Multi-angle studio visual renderer with custom image fallback
        ├── ProductCard.tsx             # Product card with PKR pricing, discount badge & WhatsApp ordering
        ├── ProductDetailView.tsx       # Full product detail page with gallery, 3D toggle & specifications
        └── AdminDashboardModal.tsx     # Real-time inventory, PKR pricing & showroom settings manager
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18 or newer recommended)
- **npm**

### Installation & Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server** (runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

3. **Run unit tests**:
   ```bash
   npx tsx --test src/utils/catalogLogic.test.ts
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📝 How to Customize Products, Prices & Contact Info

You can update your catalog and business details in **two ways**:

### Option A: Using the In-App Admin Dashboard (No Coding Required)
1. Click **Manage Catalog** in the top navigation bar (or **Admin: Edit Products & PKR Prices** in the footer).
2. Edit prices in PKR directly in the table, add new products, upload product photos, or switch to the **Showroom & WhatsApp Settings** tab to change your WhatsApp number, phone number, and address.
3. Changes are automatically saved in the browser's `localStorage`.

### Option B: Editing the Centralized Data File (`src/data/productsData.ts`)
Open `src/data/productsData.ts` to permanently update the default catalog deployed to all visitors:
- **`DEFAULT_BUSINESS_INFO`**: Update `name`, `urduName`, `phone`, `whatsapp` (in international format without `+`, e.g., `'923001234567'`), `email`, `address`, `city`, and `openingHours`.
- **`PRODUCT_CATEGORIES`**: Edit the 10 lighting categories and descriptions.
- **`INITIAL_PRODUCTS`**: Replace sample items with your real product names, PKR `price`, `oldPrice`, `images` (paste image URLs or paths like `'/images/my-fanus.jpg'`), `sizes`, `colors`, and `dimensions`.

---

## 🔍 SEO Keywords Targeted
- *Fanus lights Pakistan*
- *Fanus price in Pakistan*
- *Decorative lights Pakistan*
- *Home lighting Pakistan*
- *Ceiling Fanus*
- *Modern Fanus*
- *Luxury Fanus*

---

## 📄 License
All Rights Reserved © 2026 Noor-e-Fanus Lighting Showroom.
