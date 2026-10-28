import React, { useState } from 'react';
import {
  ArrowLeft,
  Box,
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { BusinessInfo, Product } from '../types/lighting';
import {
  buildWhatsAppDetailInquiryMessage,
  buildWhatsAppUrl,
  calculateDiscountPercent,
  formatPKR,
} from '../utils/catalogLogic';
import { ProductVisualStudio } from './ProductVisualStudio';
import { Fanus3DShowcase } from './Fanus3DShowcase';
import { ProductCard } from './ProductCard';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  businessInfo: BusinessInfo;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onAskAboutProduct: (productName: string) => void;
}

const ANGLE_LABELS = [
  'Showroom Front View',
  '2700K Warm Evening Glow',
  'Crystal & Finish Macro',
  'Architectural Room Scale',
];

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  relatedProducts,
  businessInfo,
  onBack,
  onSelectProduct,
  onAskAboutProduct,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'gallery' | '3d'>('gallery');
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Champagne Gold');

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [
          `studio:${product.archetype3D}:front`,
          `studio:${product.archetype3D}:warm`,
          `studio:${product.archetype3D}:detail`,
          `studio:${product.archetype3D}:room`,
        ];

  const discountPercent = calculateDiscountPercent(product.price, product.oldPrice);

  const whatsappOrderUrl = buildWhatsAppUrl(
    businessInfo.whatsapp,
    buildWhatsAppDetailInquiryMessage(product.name, product.price, selectedSize, selectedColor),
  );

  const handlePrevImage = () => {
    setIsZoomed(false);
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setIsZoomed(false);
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb & Back Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DFD3] pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-[#D5CBB8] bg-white px-4 py-2 text-xs font-semibold text-[#181615] transition-colors hover:border-[#181615] whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Lighting Collection</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#6E655C]">
          <span>Catalog</span>
          <span aria-hidden="true">/</span>
          <span>{product.category}</span>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-[#181615]">{product.name}</span>
        </div>
      </div>

      {/* Main Split-Column Product Showroom Layout */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Column (7 cols): Multi-Image Gallery + Interactive 3D Fanus Toggle */}
        <div className="lg:col-span-7">
          {/* Mode Switcher: Studio Photography Gallery vs Interactive 3D Chandelier Studio */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="inline-flex rounded-lg border border-[#E2D9C8] bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode('gallery')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'gallery'
                    ? 'bg-[#181615] text-[#FAF7F2]'
                    : 'text-[#5C554E] hover:text-[#181615]'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Photo Gallery ({galleryImages.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === '3d'
                    ? 'bg-[#181615] text-[#D4AF37]'
                    : 'text-[#5C554E] hover:text-[#181615]'
                }`}
              >
                <Box className="h-3.5 w-3.5" />
                <span>Interactive 3D View</span>
              </button>
            </div>

            {viewMode === 'gallery' && (
              <button
                type="button"
                onClick={() => setIsZoomed((z) => !z)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2D9C8] bg-white px-3 py-1.5 text-xs font-medium text-[#181615] hover:border-[#C69C47] whitespace-nowrap shrink-0"
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="h-3.5 w-3.5 text-[#8C6618]" />
                    <span>Reset Zoom</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="h-3.5 w-3.5 text-[#8C6618]" />
                    <span>Zoom Photo</span>
                  </>
                )}
              </button>
            )}
          </div>

          {viewMode === '3d' ? (
            <Fanus3DShowcase
              initialArchetype={product.archetype3D}
              initialFinish={product.defaultFinish}
              compact={true}
              productTitle={`${product.name} — 3D Lighting & Finish Preview`}
            />
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-[#E2D9C8] bg-[#171412]">
              <div className="aspect-[4/3] w-full">
                <ProductVisualStudio
                  imageSource={galleryImages[activeImageIndex]}
                  productName={product.name}
                  archetype={product.archetype3D}
                  category={product.category}
                  zoomScale={isZoomed ? 1.45 : 1}
                  className="h-full w-full"
                />
              </div>

              {/* Previous / Next Gallery Controls */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous product image"
                    className="absolute top-1/2 left-3 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#181615]/85 text-white transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next product image"
                    className="absolute top-1/2 right-3 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#181615]/85 text-white transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Current Angle Caption */}
              <div className="flex items-center justify-between bg-[#181615] px-4 py-2.5 text-xs text-[#E5DEC9]">
                <span>
                  View {activeImageIndex + 1} of {galleryImages.length}:{' '}
                  <strong className="font-medium text-white">
                    {ANGLE_LABELS[activeImageIndex] || `Gallery View ${activeImageIndex + 1}`}
                  </strong>
                </span>
                <span>SKU: {product.sku}</span>
              </div>
            </div>
          )}

          {/* Thumbnail Strip */}
          <div className="mt-3 grid grid-cols-4 gap-3">
            {galleryImages.map((imgSrc, idx) => (
              <button
                key={`${product.id}-thumb-${idx}`}
                type="button"
                onClick={() => {
                  setViewMode('gallery');
                  setIsZoomed(false);
                  setActiveImageIndex(idx);
                }}
                aria-label={`Select gallery image ${idx + 1}: ${ANGLE_LABELS[idx] || ''}`}
                className={`group relative overflow-hidden rounded-lg border-2 text-left transition-all ${
                  viewMode === 'gallery' && activeImageIndex === idx
                    ? 'border-[#C69C47] ring-2 ring-[#C69C47]/30'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <div className="aspect-[4/3] w-full">
                  <ProductVisualStudio
                    imageSource={imgSrc}
                    productName={`${product.name} thumbnail ${idx + 1}`}
                    archetype={product.archetype3D}
                    className="h-full w-full"
                  />
                </div>
                <span className="block truncate bg-[#181615] px-2 py-1 text-[10px] text-[#E5DEC9]">
                  {ANGLE_LABELS[idx] || `Angle ${idx + 1}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Contiguous Purchase & Specification Module */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-[#E5DEC9] bg-white p-6 sm:p-8">
            {/* Unboxed Metadata Kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E655C]">
              <span className="font-semibold text-[#8C6618]">{product.category}</span>
              <span aria-hidden="true">·</span>
              <span>SKU: {product.sku}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-medium text-[#1F6E43]">
                <Check className="h-3.5 w-3.5" />
                {product.availability}
              </span>
            </div>

            {/* Product Title & Urdu Name */}
            <div className="mt-2 flex items-baseline justify-between gap-4">
              <h1 className="font-display text-3xl font-bold text-[#181615] sm:text-4xl">
                {product.name}
              </h1>
              {product.urduName && (
                <span className="text-base font-medium text-[#787067] shrink-0" dir="rtl">
                  {product.urduName}
                </span>
              )}
            </div>

            {/* Price in PKR */}
            <div className="mt-4 border-y border-[#EFEAE0] py-4">
              <span className="block text-xs text-[#6E655C]">Showroom Price (Inclusive of Bulbs/LED)</span>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <span className="font-tabular text-3xl font-bold text-[#181615]">
                  {formatPKR(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <>
                    <span className="font-tabular text-base text-[#8C8379] line-through">
                      {formatPKR(product.oldPrice)}
                    </span>
                    <span className="text-xs font-semibold text-[#8C6618]">
                      ({discountPercent}% Off)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Detailed Description */}
            <p className="mt-4 text-sm leading-relaxed text-[#4A443E]">
              {product.description}
            </p>

            {/* Available Sizes Selector */}
            {product.sizes.length > 0 && (
              <div className="mt-5">
                <label className="block text-xs font-semibold text-[#181615]">
                  Available Sizes: <span className="font-normal text-[#6E655C]">{selectedSize}</span>
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        selectedSize === size
                          ? 'border-[#181615] bg-[#181615] text-[#FAF7F2]'
                          : 'border-[#D5CBB8] bg-[#FAF7F2] text-[#3D3833] hover:border-[#181615]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Available Colors / Finishes Selector */}
            {product.colors.length > 0 && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-[#181615]">
                  Finish / Color: <span className="font-normal text-[#6E655C]">{selectedColor}</span>
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        selectedColor === color
                          ? 'border-[#C69C47] bg-[#C69C47]/15 text-[#181615] font-semibold'
                          : 'border-[#D5CBB8] bg-[#FAF7F2] text-[#3D3833] hover:border-[#C69C47]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Order & Inquiry Action Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#181615] px-5 py-3.5 text-sm font-semibold text-[#FAF7F2] transition-colors hover:bg-[#2E2823]"
              >
                <MessageCircle className="h-4 w-4 text-[#D4AF37]" />
                <span>Order on WhatsApp</span>
              </a>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${businessInfo.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D5CBB8] bg-[#FAF7F2] px-4 py-3 text-xs font-semibold text-[#181615] transition-colors hover:border-[#181615]"
                >
                  <Phone className="h-4 w-4 text-[#8C6618]" />
                  <span>Call Us</span>
                </a>

                <button
                  type="button"
                  onClick={() => onAskAboutProduct(`${product.name} (${selectedSize}, ${selectedColor})`)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#C69C47] bg-white px-4 py-3 text-xs font-semibold text-[#181615] transition-colors hover:bg-[#FAF7F2]"
                >
                  <HelpCircle className="h-4 w-4 text-[#8C6618]" />
                  <span>Ask About This Product</span>
                </button>
              </div>
            </div>

            {/* Pre-filled WhatsApp Preview Note */}
            <p className="mt-3 text-[11px] leading-normal text-[#787067]">
              Clicking &ldquo;Order on WhatsApp&rdquo; sends: <em>&ldquo;Assalam o Alaikum, I am interested in {product.name} ({selectedSize}, {selectedColor}). Price: {formatPKR(product.price)}...&rdquo;</em>
            </p>

            {/* Technical Specifications Table */}
            <div className="mt-6 border-t border-[#EFEAE0] pt-5">
              <h2 className="font-display text-lg font-bold text-[#181615]">
                Technical Specifications
              </h2>
              <dl className="mt-3 divide-y divide-[#EFEAE0] text-xs">
                <div className="grid grid-cols-3 py-2.5">
                  <dt className="font-medium text-[#6E655C]">Light Type</dt>
                  <dd className="col-span-2 text-[#181615]">{product.lightType}</dd>
                </div>
                <div className="grid grid-cols-3 py-2.5">
                  <dt className="font-medium text-[#6E655C]">Material</dt>
                  <dd className="col-span-2 text-[#181615]">{product.material}</dd>
                </div>
                <div className="grid grid-cols-3 py-2.5">
                  <dt className="font-medium text-[#6E655C]">Bulb / LED Info</dt>
                  <dd className="col-span-2 text-[#181615]">{product.bulbInfo}</dd>
                </div>
                <div className="grid grid-cols-3 py-2.5">
                  <dt className="font-medium text-[#6E655C]">Dimensions</dt>
                  <dd className="col-span-2 font-tabular text-[#181615]">{product.dimensions}</dd>
                </div>
                <div className="grid grid-cols-3 py-2.5">
                  <dt className="font-medium text-[#6E655C]">Installation</dt>
                  <dd className="col-span-2 text-[#181615]">{product.installationInfo}</dd>
                </div>
                <div className="grid grid-cols-3 py-2.5">
                  <dt className="font-medium text-[#6E655C]">Availability</dt>
                  <dd className="col-span-2 font-semibold text-[#1F6E43]">{product.availability}</dd>
                </div>
              </dl>
            </div>

            {/* Delivery & Packaging Assurance */}
            <div className="mt-5 flex flex-col gap-2 rounded-lg bg-[#FAF7F2] p-3.5 text-xs text-[#4A443E] border border-[#E5DEC9]">
              <div className="flex items-center gap-2 font-semibold text-[#181615]">
                <ShieldCheck className="h-4 w-4 text-[#8C6618]" />
                <span>100% Breakage-Insured Wooden Crate Packaging</span>
              </div>
              {businessInfo.homeDeliveryEnabled && (
                <div className="flex items-start gap-2 text-[#5C554E]">
                  <Truck className="h-4 w-4 shrink-0 text-[#8C6618] mt-0.5" />
                  <span>{businessInfo.deliveryNote}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Fanus Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-[#E6DFD3] pt-12">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-[#8C6618]">Similar Lighting Designs</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-[#181615]">
                More in {product.category}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.slice(0, 3).map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                whatsappNumber={businessInfo.whatsapp}
                onViewDetails={(p) => {
                  onSelectProduct(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
