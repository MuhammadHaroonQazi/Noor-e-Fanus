import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Truck,
} from 'lucide-react';
import { DEFAULT_BUSINESS_INFO, INITIAL_PRODUCTS, PRODUCT_CATEGORIES } from './data/productsData';
import {
  BusinessInfo,
  CatalogFilterState,
  CustomerInquiry,
  Product,
  SortOption,
  SpecialCollectionTab,
} from './types/lighting';
import {
  buildWhatsAppUrl,
  calculateDiscountPercent,
  filterAndSortProducts,
  formatPKR,
  matchesCategoryFilter,
  validateInquiryForm,
} from './utils/catalogLogic';
import { ActivePage, Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailView } from './components/ProductDetailView';
import { ProductVisualStudio } from './components/ProductVisualStudio';
import { Fanus3DShowcase } from './components/Fanus3DShowcase';
import { AdminDashboardModal } from './components/AdminDashboardModal';

const STORAGE_KEY_PRODUCTS = 'nef_showroom_products_v1';
const STORAGE_KEY_BUSINESS = 'nef_showroom_business_v1';
const STORAGE_KEY_INQUIRIES = 'nef_showroom_inquiries_v1';

const CATEGORY_FILTER_BUTTONS = [
  { label: 'All', value: 'All' },
  { label: 'Ceiling', value: 'Ceiling Fanus' },
  { label: 'Hanging', value: 'Hanging Fanus' },
  { label: 'Crystal', value: 'Crystal Lights' },
  { label: 'Modern', value: 'Modern Lights' },
  { label: 'Wall', value: 'Wall Lights' },
  { label: 'Bedroom', value: 'Bedroom Lights' },
  { label: 'Living Room', value: 'Living Room Lights' },
  { label: 'Dining Room', value: 'Dining Room Lights' },
  { label: 'Outdoor', value: 'Outdoor Lights' },
  { label: 'Decorative', value: 'Decorative Lights' },
];

export default function App() {
  // Persistent Products State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_PRODUCTS;
  });

  // Persistent Business Info State
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUSINESS);
      if (saved) {
        return { ...DEFAULT_BUSINESS_INFO, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_BUSINESS_INFO;
  });

  // Persistent Customer Inquiries State
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INQUIRIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUSINESS, JSON.stringify(businessInfo));
    } catch {
      // ignore
    }
  }, [businessInfo]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(inquiries));
    } catch {
      // ignore
    }
  }, [inquiries]);

  // Navigation & Selected Product State
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  // Home Special Highlights Tab ('bestSeller' | 'newArrival' | 'recentlyAdded' | 'specialOffers')
  const [homeSpotlightTab, setHomeSpotlightTab] = useState<
    'bestSeller' | 'newArrival' | 'recentlyAdded' | 'specialOffers'
  >('bestSeller');

  // Products Page Filter State
  const [filter, setFilter] = useState<CatalogFilterState>({
    searchQuery: '',
    category: 'All',
    minPrice: 0,
    maxPrice: 50000,
    sortBy: 'featured',
    specialTab: 'all',
  });

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState<CustomerInquiry | null>(null);

  // Derived Collections
  const featuredProducts = useMemo(
    () => products.filter((p) => p.featured).slice(0, 6),
    [products],
  );

  const homeSpotlightProducts = useMemo(() => {
    if (homeSpotlightTab === 'bestSeller') {
      return products.filter((p) => p.bestSeller).slice(0, 6);
    }
    if (homeSpotlightTab === 'newArrival') {
      return products.filter((p) => p.newArrival).slice(0, 6);
    }
    if (homeSpotlightTab === 'recentlyAdded') {
      return products.filter((p) => p.recentlyAdded).slice(0, 6);
    }
    return products
      .filter((p) => calculateDiscountPercent(p.price, p.oldPrice) > 0)
      .slice(0, 6);
  }, [products, homeSpotlightTab]);

  const filteredCatalogProducts = useMemo(
    () => filterAndSortProducts(products, filter, PRODUCT_CATEGORIES),
    [products, filter],
  );

  const maxCatalogPrice = useMemo(() => {
    const highest = products.reduce((max, p) => Math.max(max, p.price), 50000);
    return Math.ceil(highest / 5000) * 5000;
  }, [products]);

  // Handlers
  const handleViewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setActivePage('product-detail');
    window.scrollTo(0, 0);
  };

  const handleSelectCategory = (categoryName: string) => {
    setFilter((prev) => ({
      ...prev,
      category: categoryName,
      specialTab: 'all',
      maxPrice: maxCatalogPrice,
    }));
    setActivePage('products');
    window.scrollTo(0, 0);
  };

  const handleOpenSearchInCatalog = () => {
    setActivePage('products');
    window.scrollTo(0, 0);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleAskAboutProduct = (productLabel: string) => {
    setContactSubject(`Inquiry: ${productLabel}`);
    setContactMessage(
      `Assalam o Alaikum, I would like to know availability, delivery charges, and details for ${productLabel}.`,
    );
    setActivePage('contact');
    window.scrollTo(0, 0);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);

    const validation = validateInquiryForm({
      name: contactName,
      phone: contactPhone,
      subject: contactSubject,
      message: contactMessage,
    });

    if (!validation.valid) {
      setContactError(validation.error || 'Please check all required fields.');
      return;
    }

    const newInquiry: CustomerInquiry = {
      id: `inq-${Date.now()}`,
      name: contactName.trim(),
      phone: contactPhone.trim(),
      subject: contactSubject.trim(),
      message: contactMessage.trim(),
      createdAt: new Date().toLocaleString('en-PK', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    setInquiries((prev) => [newInquiry, ...prev]);
    setContactSubmitted(newInquiry);
    setContactName('');
    setContactPhone('');
    setContactSubject('');
    setContactMessage('');
  };

  const handleResetCatalog = () => {
    setProducts(INITIAL_PRODUCTS);
    setBusinessInfo(DEFAULT_BUSINESS_INFO);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_BUSINESS);
  };

  const floatingWhatsAppUrl = buildWhatsAppUrl(
    businessInfo.whatsapp,
    `Assalam o Alaikum ${businessInfo.name}, I am browsing your Fanus website and need assistance choosing a light.`,
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#181615]">
      {/* Sticky Top Navigation Bar */}
      <Navbar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          if (page === 'products') {
            setFilter((prev) => ({ ...prev, maxPrice: Math.max(prev.maxPrice, maxCatalogPrice) }));
          }
        }}
        onOpenSearch={handleOpenSearchInCatalog}
        onOpenAdmin={() => setAdminOpen(true)}
        businessInfo={businessInfo}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* ================================================================
            VIEW 1: HOME PAGE
        ================================================================ */}
        {activePage === 'home' && (
          <div>
            {/* HERO SECTION with Subtle Warm Lighting Glow & Interactive 3D Fanus Studio */}
            <section className="relative overflow-hidden bg-[#141210] text-[#FAF7F2] border-b border-[#C69C47]/30">
              {/* Warm Ambient Lamp Glow Backdrop */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-32 left-1/4 h-[480px] w-[480px] rounded-full bg-[#D4AF37]/15 blur-[130px]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-10 h-[380px] w-[380px] rounded-full bg-[#FFAE42]/10 blur-[110px]"
              />

              <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                  {/* Hero Copy Column (5 cols) */}
                  <div className="lg:col-span-5">
                    <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-[#D4AF37]">
                      <span>{businessInfo.name} · پاکستان کا معیاری فانوس شوروم</span>
                    </div>

                    <h1
                      className="mt-3 font-display text-4xl font-bold leading-[1.12] tracking-tight text-[#FAF7F2] sm:text-5xl lg:text-[3.35rem]"
                      style={{ textWrap: 'balance' }}
                    >
                      Beautiful Lighting for Beautiful Homes
                    </h1>

                    <p className="mt-5 text-base leading-relaxed text-[#E5DEC9]/90 sm:text-lg">
                      Explore our collection of stylish Fanus and decorative lighting products
                      designed to make your home brighter and more beautiful.
                    </p>

                    {/* Primary & Secondary Hero Buttons */}
                    <div className="mt-8 flex flex-wrap items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setFilter((prev) => ({
                            ...prev,
                            category: 'All',
                            searchQuery: '',
                            specialTab: 'all',
                            maxPrice: maxCatalogPrice,
                          }));
                          setActivePage('products');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#C69C47] px-6 py-3.5 text-sm font-semibold text-[#181615] transition-colors hover:bg-[#D4AF37] whitespace-nowrap shrink-0"
                      >
                        <span>Explore Products</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActivePage('contact');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#C69C47]/50 bg-[#1E1B18] px-6 py-3.5 text-sm font-semibold text-[#FAF7F2] transition-colors hover:border-[#D4AF37] hover:bg-[#282420] whitespace-nowrap shrink-0"
                      >
                        <span>Contact Us</span>
                      </button>
                    </div>

                    {/* Unboxed Trust Metadata Strip */}
                    <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-6 text-xs text-[#E5DEC9]/80">
                      <span>Transparent PKR Prices</span>
                      <span aria-hidden="true">·</span>
                      <span>Grade-A K9 Crystal &amp; Brass</span>
                      <span aria-hidden="true">·</span>
                      <span>Direct WhatsApp Ordering</span>
                    </div>
                  </div>

                  {/* Hero 3D Interactive Chandelier Showcase Column (7 cols) */}
                  <div className="lg:col-span-7">
                    <Fanus3DShowcase
                      initialArchetype="imperial-crystal"
                      initialFinish="champagne-gold"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* FEATURED FANUS SECTION (6 Product Cards as requested) */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="flex flex-col justify-between gap-4 border-b border-[#E5DEC9] pb-6 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-[#8C6618]">
                    Showroom Signature Selection · نمایاں فانوس
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-bold text-[#181615] sm:text-4xl">
                    Featured Fanus
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFilter((prev) => ({
                      ...prev,
                      category: 'All',
                      specialTab: 'all',
                      maxPrice: maxCatalogPrice,
                    }));
                    setActivePage('products');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-[#D5CBB8] bg-white px-4 py-2.5 text-xs font-semibold text-[#181615] transition-colors hover:border-[#181615] sm:self-auto whitespace-nowrap shrink-0"
                >
                  <span>View All {products.length} Products</span>
                  <ArrowRight className="h-4 w-4 text-[#8C6618]" />
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    whatsappNumber={businessInfo.whatsapp}
                    onViewDetails={handleViewProductDetails}
                  />
                ))}
              </div>
            </section>

            {/* PRODUCT CATEGORIES SECTION (10 Categories with Images & View Products Button) */}
            <section className="border-y border-[#E5DEC9] bg-[#F4EFE6] py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-[#8C6618]">
                      Browse by Room &amp; Style · اقسامِ فانوس
                    </p>
                    <h2 className="mt-1 font-display text-3xl font-bold text-[#181615] sm:text-4xl">
                      Product Categories
                    </h2>
                  </div>
                  <p className="max-w-md text-xs leading-relaxed text-[#5C554E]">
                    Select any lighting category below to filter our catalog for your drawing room,
                    bedroom, dining area, or porch elevation.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                  {PRODUCT_CATEGORIES.map((cat, idx) => {
                    const count = products.filter((p) => p.category === cat.name).length;
                    const angleCycle = (['front', 'warm', 'detail', 'room'] as const)[idx % 4];
                    return (
                      <div
                        key={cat.id}
                        className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#DFD6C5] bg-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div
                          onClick={() => handleSelectCategory(cat.name)}
                          className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[#171412]"
                        >
                          <ProductVisualStudio
                            imageSource={`studio:${cat.archetype3D}:${angleCycle}`}
                            productName={cat.name}
                            archetype={cat.archetype3D}
                            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                            <div>
                              <span className="block text-[11px] text-[#E5DEC9]/80" dir="rtl">
                                {cat.urduLabel}
                              </span>
                              <h3 className="font-display text-lg font-bold leading-snug text-white">
                                {cat.name}
                              </h3>
                            </div>
                            <span className="font-tabular text-[11px] text-[#F3D678]">
                              {count} items
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-4">
                          <p className="line-clamp-2 text-xs leading-relaxed text-[#5C554E]">
                            {cat.description}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleSelectCategory(cat.name)}
                            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#D5CBB8] bg-[#FAF7F2] px-3 py-2 text-xs font-semibold text-[#181615] transition-colors hover:border-[#181615] hover:bg-[#181615] hover:text-[#FAF7F2] whitespace-nowrap shrink-0"
                          >
                            <span>View Products</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* SPECIAL FEATURES SECTION: Best Sellers, New Arrivals, Recently Added, Special Offers */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="flex flex-col justify-between gap-4 border-b border-[#E5DEC9] pb-6 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-[#8C6618]">
                    Curated Showroom Collections
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-bold text-[#181615] sm:text-4xl">
                    Best Sellers, New Arrivals &amp; Special Offers
                  </h2>
                </div>

                {/* Interactive Segmented Collection Switcher */}
                <div className="inline-flex flex-wrap gap-1.5 rounded-xl border border-[#DFD6C5] bg-[#F4EFE6] p-1.5">
                  {(
                    [
                      { id: 'bestSeller', label: 'Best Sellers' },
                      { id: 'newArrival', label: 'New Arrivals' },
                      { id: 'recentlyAdded', label: 'Recently Added' },
                      { id: 'specialOffers', label: 'Special Offers' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setHomeSpotlightTab(tab.id)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        homeSpotlightTab === tab.id
                          ? 'bg-[#181615] text-[#FAF7F2] shadow-sm'
                          : 'text-[#5C554E] hover:text-[#181615]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {homeSpotlightProducts.map((product) => (
                  <ProductCard
                    key={`${homeSpotlightTab}-${product.id}`}
                    product={product}
                    whatsappNumber={businessInfo.whatsapp}
                    onViewDetails={handleViewProductDetails}
                  />
                ))}
              </div>
            </section>

            {/* ABOUT US PREVIEW SECTION */}
            <section className="border-t border-[#E5DEC9] bg-[#181615] py-16 text-[#FAF7F2]">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold tracking-wider text-[#D4AF37]">
                    About {businessInfo.name} · ہمارے بارے میں
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-[#FAF7F2] sm:text-4xl">
                    Stylish &amp; Quality Lighting Products for Pakistani Homes
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#E5DEC9]/85">
                    We provide a thoughtfully curated collection of Ceiling Fanus, Hanging Crystal
                    Chandeliers, Modern LED Rings, and Decorative Wall Lights with transparent PKR
                    pricing so you can furnish your home with confidence.
                  </p>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-xl border border-white/10 bg-[#221F1C] p-5">
                    <Award className="h-5 w-5 text-[#D4AF37]" />
                    <h3 className="mt-3 font-display text-lg font-bold text-white">
                      Quality Products
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#E5DEC9]/75">
                      Grade-A K9 optical crystal prisms, tarnish-resistant brass finishes, and
                      long-life LED drivers tested for local voltage conditions.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#221F1C] p-5">
                    <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                    <h3 className="mt-3 font-display text-lg font-bold text-white">
                      Modern Designs
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#E5DEC9]/75">
                      From grand royal drawing room chandeliers to sleek flush-mount ceiling Fanus
                      that clear standard ceiling fan blades.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#221F1C] p-5">
                    <Tag className="h-5 w-5 text-[#D4AF37]" />
                    <h3 className="mt-3 font-display text-lg font-bold text-white">
                      Affordable Prices
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#E5DEC9]/75">
                      Clear, upfront showroom pricing in Pakistani Rupees (PKR) across every
                      category with no hidden charges.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#221F1C] p-5">
                    <HeartHandshake className="h-5 w-5 text-[#D4AF37]" />
                    <h3 className="mt-3 font-display text-lg font-bold text-white">
                      Customer Service
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#E5DEC9]/75">
                      Direct WhatsApp and phone assistance to help you select the right Fanus
                      diameter and lumen output for your room size.
                    </p>
                  </div>

                  {businessInfo.homeDeliveryEnabled && (
                    <div className="rounded-xl border border-white/10 bg-[#221F1C] p-5">
                      <Truck className="h-5 w-5 text-[#D4AF37]" />
                      <h3 className="mt-3 font-display text-lg font-bold text-white">
                        Home Delivery
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#E5DEC9]/75">
                        Protective foam and wooden-crate dispatch to major cities across Pakistan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================
            VIEW 2: PRODUCTS CATALOG PAGE
        ================================================================ */}
        {activePage === 'products' && (
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Catalog Header */}
            <div className="border-b border-[#E5DEC9] pb-6">
              <p className="text-xs font-semibold tracking-wider text-[#8C6618]">
                Complete Showroom Catalog · تمام فانوس اور لائٹس
              </p>
              <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <h1 className="font-display text-3xl font-bold text-[#181615] sm:text-4xl">
                  Our Lighting Collection
                </h1>
                <p className="font-tabular text-xs font-medium text-[#5C554E]">
                  Showing {filteredCatalogProducts.length} of {products.length} products
                </p>
              </div>
            </div>

            {/* Search, Price Filter & Sort Bar */}
            <div className="mt-6 rounded-xl border border-[#E2D9C8] bg-white p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Search Input */}
                <div className="lg:col-span-5">
                  <label htmlFor="catalog-search-input" className="block text-xs font-semibold text-[#181615]">
                    Search Products
                  </label>
                  <div className="relative mt-1.5">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#787067]" />
                    <input
                      id="catalog-search-input"
                      ref={searchInputRef}
                      type="search"
                      value={filter.searchQuery}
                      onChange={(e) =>
                        setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))
                      }
                      placeholder="Search Fanus or lighting products..."
                      className="w-full rounded-lg border border-[#D5CBB8] bg-[#FAF7F2] py-2.5 pr-4 pl-10 text-xs text-[#181615] placeholder-[#787067] focus:border-[#C69C47] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Price Range Filter in PKR */}
                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="catalog-price-range" className="font-semibold text-[#181615]">
                      Max Price Filter (PKR)
                    </label>
                    <span className="font-tabular font-bold text-[#8C6618]">
                      Up to {formatPKR(filter.maxPrice)}
                    </span>
                  </div>
                  <input
                    id="catalog-price-range"
                    type="range"
                    min={3500}
                    max={maxCatalogPrice}
                    step={500}
                    value={filter.maxPrice}
                    onChange={(e) =>
                      setFilter((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
                    }
                    className="mt-3 h-2 w-full cursor-pointer accent-[#181615]"
                  />
                  <div className="mt-1 flex justify-between font-tabular text-[10px] text-[#787067]">
                    <span>PKR 3,500</span>
                    <span>{formatPKR(Math.round(maxCatalogPrice / 2))}</span>
                    <span>{formatPKR(maxCatalogPrice)}</span>
                  </div>
                </div>

                {/* Sort Selector */}
                <div className="lg:col-span-3">
                  <label htmlFor="catalog-sort-select" className="block text-xs font-semibold text-[#181615]">
                    Sort By
                  </label>
                  <select
                    id="catalog-sort-select"
                    value={filter.sortBy}
                    onChange={(e) =>
                      setFilter((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-[#D5CBB8] bg-[#FAF7F2] px-3 py-2.5 text-xs font-medium text-[#181615] focus:border-[#C69C47] focus:bg-white focus:outline-none"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              {/* Category Filter Buttons */}
              <div className="mt-4 border-t border-[#EFEAE0] pt-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#181615]">Filter by Category:</span>
                  {(filter.category !== 'All' ||
                    filter.searchQuery !== '' ||
                    filter.specialTab !== 'all' ||
                    filter.maxPrice < maxCatalogPrice) && (
                    <button
                      type="button"
                      onClick={() =>
                        setFilter({
                          searchQuery: '',
                          category: 'All',
                          minPrice: 0,
                          maxPrice: maxCatalogPrice,
                          sortBy: 'featured',
                          specialTab: 'all',
                        })
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C6618] hover:underline"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset All Filters</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_FILTER_BUTTONS.map((btn) => {
                    const active =
                      filter.category === btn.value ||
                      filter.category.toLowerCase() === btn.label.toLowerCase();
                    return (
                      <button
                        key={btn.value}
                        type="button"
                        onClick={() => setFilter((prev) => ({ ...prev, category: btn.value }))}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#181615] text-[#FAF7F2] font-semibold'
                            : 'bg-[#FAF7F2] text-[#4A443E] border border-[#E2D9C8] hover:border-[#181615]'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Collection Filter Pills (All / Best Sellers / New Arrivals / Special Offers) */}
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-medium text-[#6E655C]">Collection Filter:</span>
                {(
                  [
                    { id: 'all', label: 'All Products' },
                    { id: 'featured', label: 'Featured' },
                    { id: 'bestSeller', label: 'Best Sellers' },
                    { id: 'newArrival', label: 'New Arrivals' },
                    { id: 'recentlyAdded', label: 'Recently Added' },
                    { id: 'specialOffers', label: 'Discounted Offers' },
                  ] as { id: SpecialCollectionTab; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter((prev) => ({ ...prev, specialTab: tab.id }))}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                      filter.specialTab === tab.id
                        ? 'bg-[#C69C47]/25 text-[#181615] font-semibold border border-[#C69C47]'
                        : 'text-[#6E655C] hover:bg-[#FAF7F2] hover:text-[#181615]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtered Product Grid */}
            {filteredCatalogProducts.length === 0 ? (
              <div className="mt-8 rounded-xl border border-[#E5DEC9] bg-white p-12 text-center">
                <h2 className="font-display text-2xl font-bold text-[#181615]">
                  No Fanus products match your current filter
                </h2>
                <p className="mt-2 text-xs text-[#6E655C]">
                  Try increasing the maximum PKR price range or clearing your search term.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setFilter({
                      searchQuery: '',
                      category: 'All',
                      minPrice: 0,
                      maxPrice: maxCatalogPrice,
                      sortBy: 'featured',
                      specialTab: 'all',
                    })
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#181615] px-5 py-2.5 text-xs font-semibold text-[#FAF7F2]"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>Show All Products</span>
                </button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCatalogProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    whatsappNumber={businessInfo.whatsapp}
                    onViewDetails={handleViewProductDetails}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            VIEW 3: CATEGORIES DIRECTORY PAGE
        ================================================================ */}
        {activePage === 'categories' && (
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="border-b border-[#E5DEC9] pb-6">
              <p className="text-xs font-semibold tracking-wider text-[#8C6618]">
                Showroom Departments · تمام کیٹیگریز
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold text-[#181615] sm:text-4xl">
                Browse Fanus &amp; Lighting by Category
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#5C554E]">
                Choose a category below to explore specialized lighting fixtures and PKR prices for
                every room in your house.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PRODUCT_CATEGORIES.map((cat, idx) => {
                const catProducts = products.filter((p) =>
                  matchesCategoryFilter(p, cat.name, PRODUCT_CATEGORIES),
                );
                const minCatPrice =
                  catProducts.length > 0
                    ? Math.min(...catProducts.map((p) => p.price))
                    : 4500;
                const angleCycle = (['front', 'warm', 'detail', 'room'] as const)[idx % 4];

                return (
                  <div
                    key={cat.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#E5DEC9] bg-white transition-all hover:shadow-lg"
                  >
                    <div
                      onClick={() => handleSelectCategory(cat.name)}
                      className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[#171412]"
                    >
                      <ProductVisualStudio
                        imageSource={`studio:${cat.archetype3D}:${angleCycle}`}
                        productName={cat.name}
                        archetype={cat.archetype3D}
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                        <div>
                          <span className="text-xs text-[#F3D678]" dir="rtl">
                            {cat.urduLabel}
                          </span>
                          <h2 className="font-display text-2xl font-bold text-white">
                            {cat.name}
                          </h2>
                        </div>
                        <span className="font-tabular text-xs text-[#E5DEC9]">
                          {catProducts.length} Products
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <p className="text-xs leading-relaxed text-[#575049]">
                          {cat.description}
                        </p>
                        <p className="mt-3 font-tabular text-xs font-semibold text-[#181615]">
                          Starting from {formatPKR(minCatPrice)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCategory(cat.name)}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#181615] px-4 py-2.5 text-xs font-semibold text-[#FAF7F2] transition-colors hover:bg-[#2E2823]"
                      >
                        <span>View {cat.name}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#D4AF37]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================
            VIEW 4: PRODUCT DETAIL PAGE (PDP)
        ================================================================ */}
        {activePage === 'product-detail' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            relatedProducts={products.filter(
              (p) => p.category === selectedProduct.category && p.id !== selectedProduct.id,
            )}
            businessInfo={businessInfo}
            onBack={() => setActivePage('products')}
            onSelectProduct={handleViewProductDetails}
            onAskAboutProduct={handleAskAboutProduct}
          />
        )}

        {/* ================================================================
            VIEW 5: ABOUT US PAGE
        ================================================================ */}
        {activePage === 'about' && (
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
              <div className="lg:col-span-6">
                <p className="text-xs font-semibold tracking-wider text-[#8C6618]">
                  About {businessInfo.name} · تعارف
                </p>
                <h1 className="mt-2 font-display text-4xl font-bold text-[#181615] sm:text-5xl">
                  Bringing Warm Elegance &amp; Quality Fanus Lighting to Your Home
                </h1>
                <p className="mt-4 text-base leading-relaxed text-[#4A443E]">
                  At <strong>{businessInfo.name}</strong>, we specialize in decorative house
                  lighting products—commonly known as <strong>Fanus (فانوس)</strong> across
                  Pakistan. Whether you are furnishing a new house, renovating your drawing room, or
                  selecting warm ambient lights for your bedroom, our catalog lets you compare
                  designs, dimensions, and exact prices in Pakistani Rupees (PKR).
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#5C554E]">
                  Every fixture in our showroom is selected for visual elegance, durable materials,
                  and practical compatibility with standard Pakistani ceiling heights and wiring.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePage('products')}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#181615] px-5 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-[#2E2823]"
                  >
                    <span>Browse Lighting Collection</span>
                    <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePage('contact')}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#C69C47] bg-white px-5 py-3 text-xs font-semibold text-[#181615] hover:bg-[#FAF7F2]"
                  >
                    <span>Contact Showroom</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <Fanus3DShowcase
                  initialArchetype="golden-rings"
                  initialFinish="champagne-gold"
                  compact={true}
                  productTitle="Interactive 3D Preview — Inspect Our Brushed Brass & Crystal Craftsmanship"
                />
              </div>
            </div>

            {/* Core Pillars Grid */}
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-[#E5DEC9] bg-white p-6">
                <Award className="h-6 w-6 text-[#8C6618]" />
                <h2 className="mt-3 font-display text-2xl font-bold text-[#181615]">
                  Quality Products
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#575049]">
                  We focus on precision-faceted K9 crystals, heavy-gauge brass and aluminum frames,
                  and reliable multi-tone LED drivers that deliver consistent illumination.
                </p>
              </div>

              <div className="rounded-xl border border-[#E5DEC9] bg-white p-6">
                <Sparkles className="h-6 w-6 text-[#8C6618]" />
                <h2 className="mt-3 font-display text-2xl font-bold text-[#181615]">
                  Modern Designs
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#575049]">
                  Our collection spans contemporary geometric LED rings, royal multi-tiered crystal
                  chandeliers, cascading bedroom globes, and architectural wall sconces.
                </p>
              </div>

              <div className="rounded-xl border border-[#E5DEC9] bg-white p-6">
                <Tag className="h-6 w-6 text-[#8C6618]" />
                <h2 className="mt-3 font-display text-2xl font-bold text-[#181615]">
                  Affordable Prices
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#575049]">
                  All prices are clearly listed in Pakistani Rupees (PKR) right on the product
                  cards so you can plan your home lighting budget effortlessly.
                </p>
              </div>

              <div className="rounded-xl border border-[#E5DEC9] bg-white p-6">
                <HeartHandshake className="h-6 w-6 text-[#8C6618]" />
                <h2 className="mt-3 font-display text-2xl font-bold text-[#181615]">
                  Customer Service
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#575049]">
                  Have a question about ceiling height, fan clearance, or bulb replacement? Reach
                  our team directly via WhatsApp or phone for personalized guidance.
                </p>
              </div>

              {businessInfo.homeDeliveryEnabled && (
                <div className="rounded-xl border border-[#E5DEC9] bg-white p-6">
                  <Truck className="h-6 w-6 text-[#8C6618]" />
                  <h2 className="mt-3 font-display text-2xl font-bold text-[#181615]">
                    Home Delivery
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-[#575049]">
                    {businessInfo.deliveryNote}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-[#E5DEC9] bg-white p-6">
                <ShieldCheck className="h-6 w-6 text-[#8C6618]" />
                <h2 className="mt-3 font-display text-2xl font-bold text-[#181615]">
                  Easy WhatsApp Ordering
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#575049]">
                  No complicated checkout forms required. Click &ldquo;Order on WhatsApp&rdquo; on
                  any product to send us the exact product name and PKR price for instant
                  confirmation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            VIEW 6: CONTACT PAGE
        ================================================================ */}
        {activePage === 'contact' && (
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="border-b border-[#E5DEC9] pb-6">
              <p className="text-xs font-semibold tracking-wider text-[#8C6618]">
                Get in Touch · رابطہ کریں
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold text-[#181615] sm:text-4xl">
                Contact {businessInfo.name} Showroom
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#5C554E]">
                Order directly on WhatsApp, call our showroom, or send us an inquiry using the form
                below.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Showroom Contact Details & Google Maps Section */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-xl border border-[#E5DEC9] bg-white p-6 space-y-4">
                  <h2 className="font-display text-2xl font-bold text-[#181615]">
                    {businessInfo.name} ({businessInfo.urduName})
                  </h2>

                  <div className="space-y-3.5 text-xs text-[#4A443E]">
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 shrink-0 text-[#8C6618] mt-0.5" />
                      <div>
                        <span className="block font-semibold text-[#181615]">Phone Number</span>
                        <a
                          href={`tel:${businessInfo.phone.replace(/\s+/g, '')}`}
                          className="font-tabular text-sm font-medium text-[#181615] hover:text-[#8C6618]"
                        >
                          {businessInfo.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-4 w-4 shrink-0 text-[#8C6618] mt-0.5" />
                      <div>
                        <span className="block font-semibold text-[#181615]">WhatsApp Ordering</span>
                        <a
                          href={floatingWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-tabular text-sm font-medium text-[#1F6E43] hover:underline"
                        >
                          +{businessInfo.whatsapp} (Click to Chat)
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 shrink-0 text-[#8C6618] mt-0.5" />
                      <div>
                        <span className="block font-semibold text-[#181615]">Email</span>
                        <a
                          href={`mailto:${businessInfo.email}`}
                          className="text-[#181615] hover:underline"
                        >
                          {businessInfo.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 shrink-0 text-[#8C6618] mt-0.5" />
                      <div>
                        <span className="block font-semibold text-[#181615]">Showroom Address</span>
                        <span>
                          {businessInfo.address}, {businessInfo.city}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 shrink-0 text-[#8C6618] mt-0.5" />
                      <div>
                        <span className="block font-semibold text-[#181615]">Opening Hours</span>
                        <span>{businessInfo.openingHours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-3">
                    <a
                      href={floatingWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#181615] px-4 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-[#2E2823]"
                    >
                      <MessageCircle className="h-4 w-4 text-[#D4AF37]" />
                      <span>WhatsApp Us</span>
                    </a>
                    <a
                      href={`tel:${businessInfo.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D5CBB8] bg-[#FAF7F2] px-4 py-3 text-xs font-semibold text-[#181615] hover:border-[#181615]"
                    >
                      <Phone className="h-4 w-4 text-[#8C6618]" />
                      <span>Call Showroom</span>
                    </a>
                  </div>
                </div>

                {/* Google Maps Section */}
                <div className="overflow-hidden rounded-xl border border-[#E5DEC9] bg-white">
                  <div className="border-b border-[#EFEAE0] px-5 py-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#181615]">
                      Showroom Location Map — {businessInfo.city}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${businessInfo.address} ${businessInfo.city}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#8C6618] hover:underline"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                  <div className="relative h-56 w-full bg-[#EAE3D5]">
                    <iframe
                      title={`${businessInfo.name} Showroom Map`}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        businessInfo.mapEmbedQuery,
                      )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      className="h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Customer Inquiry Contact Form */}
              <div className="lg:col-span-7">
                <div className="rounded-xl border border-[#E5DEC9] bg-white p-6 sm:p-8">
                  <h2 className="font-display text-2xl font-bold text-[#181615]">
                    Send an Inquiry
                  </h2>
                  <p className="mt-1 text-xs text-[#6E655C]">
                    Ask about a specific Fanus model, custom chandelier size, or bulk home lighting
                    package.
                  </p>

                  {contactError && (
                    <div
                      role="alert"
                      className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-800"
                    >
                      {contactError}
                    </div>
                  )}

                  {contactSubmitted && (
                    <div className="mt-4 rounded-xl border border-[#1F6E43]/30 bg-[#1F6E43]/10 p-4 text-xs text-[#181615]">
                      <div className="flex items-center gap-2 font-semibold text-[#1F6E43]">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          JazakAllah! Your inquiry regarding &ldquo;{contactSubmitted.subject}&rdquo;
                          has been received.
                        </span>
                      </div>
                      <p className="mt-1.5 text-[#4A443E]">
                        Our showroom representative will contact you shortly on{' '}
                        <strong className="font-tabular">{contactSubmitted.phone}</strong>. You can
                        also send this inquiry directly to our WhatsApp for an immediate reply:
                      </p>
                      <div className="mt-3">
                        <a
                          href={buildWhatsAppUrl(
                            businessInfo.whatsapp,
                            `Assalam o Alaikum, my name is ${contactSubmitted.name} (${contactSubmitted.phone}). Subject: ${contactSubmitted.subject}. ${contactSubmitted.message}`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#181615] px-4 py-2 text-xs font-semibold text-[#FAF7F2]"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-[#D4AF37]" />
                          <span>Also Send via WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit} className="mt-6 space-y-4" noValidate>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-xs font-semibold text-[#181615]"
                        >
                          Name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          placeholder="Your Full Name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-[#D5CBB8] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#181615] focus:border-[#C69C47] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-phone"
                          className="block text-xs font-semibold text-[#181615]"
                        >
                          Phone Number *
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          required
                          placeholder="0300 1234567"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="font-tabular mt-1.5 w-full rounded-lg border border-[#D5CBB8] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#181615] focus:border-[#C69C47] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-xs font-semibold text-[#181615]"
                      >
                        Product / Subject *
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        required
                        placeholder="e.g. Luxury Crystal Fanus (PKR 15,000)"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-[#D5CBB8] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#181615] focus:border-[#C69C47] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-xs font-semibold text-[#181615]"
                      >
                        Message *
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        required
                        placeholder="Write your question about availability, room size, or delivery city..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-[#D5CBB8] bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-[#181615] focus:border-[#C69C47] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#181615] px-6 py-3.5 text-sm font-semibold text-[#FAF7F2] transition-colors hover:bg-[#2E2823]"
                    >
                      <Send className="h-4 w-4 text-[#D4AF37]" />
                      <span>Send Inquiry</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================================================================
          PREMIUM DARK CHARCOAL & CHAMPAGNE GOLD FOOTER
      ================================================================ */}
      <footer className="border-t border-[#C69C47]/30 bg-[#141210] text-[#E5DEC9]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Col 1: Brand Identity */}
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#221F1C] text-[#D4AF37] border border-[#C69C47]/40">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="font-display text-2xl font-bold text-white">
                  {businessInfo.name}
                </span>
                <span className="text-sm text-[#D4AF37]" dir="rtl">
                  {businessInfo.urduName}
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#E5DEC9]/75">
                Pakistan&rsquo;s premier showroom for Ceiling Fanus, Hanging Crystal Chandeliers,
                Modern LED Rings, and Decorative Wall Lights with transparent PKR pricing.
              </p>
              <p className="mt-3 font-tabular text-xs text-[#D4AF37]">
                {businessInfo.address}, {businessInfo.city}
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h3 className="font-display text-lg font-bold text-white">Quick Links</h3>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('products');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    Products
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('categories');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    Categories
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('about');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Customer Help & Admin Access */}
            <div>
              <h3 className="font-display text-lg font-bold text-white">Customer Help</h3>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <a
                    href={floatingWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    WhatsApp Order Desk (+{businessInfo.whatsapp})
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${businessInfo.phone.replace(/\s+/g, '')}`}
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    Call Showroom ({businessInfo.phone})
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('contact');
                      window.scrollTo(0, 0);
                    }}
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    Contact Us
                  </button>
                </li>
                <li className="pt-1">
                  <button
                    type="button"
                    onClick={() => setAdminOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[#D4AF37] hover:underline font-medium"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>Admin: Edit Products &amp; PKR Prices</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Social Media & Showroom Hours */}
            <div>
              <h3 className="font-display text-lg font-bold text-white">Connect With Us</h3>
              <p className="mt-3 text-xs text-[#E5DEC9]/75">{businessInfo.openingHours}</p>

              <div className="mt-4 flex items-center gap-2.5">
                <a
                  href={businessInfo.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#221F1C] text-xs font-bold text-white transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                >
                  FB
                </a>
                <a
                  href={businessInfo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#221F1C] text-xs font-bold text-white transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                >
                  IG
                </a>
                <a
                  href={businessInfo.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#221F1C] text-xs font-bold text-white transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                >
                  TT
                </a>
                <a
                  href={floatingWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C69C47]/40 bg-[#C69C47] text-xs font-bold text-[#181615] transition-colors hover:bg-[#D4AF37]"
                >
                  WA
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E5DEC9]/65">
            <p>© 2026 {businessInfo.name}. All Rights Reserved.</p>
            <p>Prices shown in Pakistani Rupees (PKR).</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button (Mobile & Desktop) */}
      <a
        href={floatingWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order or Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#181615] px-4 py-3 text-xs font-semibold text-[#FAF7F2] shadow-xl transition-transform duration-200 hover:scale-105"
      >
        <MessageCircle className="h-4 w-4 text-[#D4AF37]" />
        <span>WhatsApp Order</span>
      </a>

      {/* Admin / Product & Price Management Modal */}
      <AdminDashboardModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        products={products}
        onUpdateProducts={setProducts}
        onResetDefaultCatalog={handleResetCatalog}
        businessInfo={businessInfo}
        onUpdateBusinessInfo={setBusinessInfo}
        inquiries={inquiries}
      />
    </div>
  );
}
