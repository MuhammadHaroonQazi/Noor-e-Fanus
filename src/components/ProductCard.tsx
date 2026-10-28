import React from 'react';
import { Eye, MessageCircle } from 'lucide-react';
import { Product } from '../types/lighting';
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  calculateDiscountPercent,
  formatPKR,
} from '../utils/catalogLogic';
import { ProductVisualStudio } from './ProductVisualStudio';

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  whatsappNumber,
  onViewDetails,
}) => {
  const discountPercent = calculateDiscountPercent(product.price, product.oldPrice);
  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    buildWhatsAppOrderMessage(product.name, product.price),
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#E5DEC9] bg-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Product Image Area (65%-75% visual lead) */}
      <div
        onClick={() => onViewDetails(product)}
        className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[#171412]"
      >
        <ProductVisualStudio
          imageSource={product.images[0] || `studio:${product.archetype3D}:front`}
          productName={product.name}
          archetype={product.archetype3D}
          category={product.category}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />

        {/* Single subtle unboxed top-left status text overlay */}
        {discountPercent > 0 ? (
          <div className="absolute top-3 left-3 bg-[#181615]/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#F3D678]">
            Save {discountPercent}%
          </div>
        ) : product.newArrival ? (
          <div className="absolute top-3 left-3 bg-[#181615]/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#FAF7F2]">
            New Arrival
          </div>
        ) : null}
      </div>

      {/* Product Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs text-[#6E655C]">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.availability}</span>
          </div>

          {/* Product Name */}
          <h3 className="mt-1.5 font-display text-xl font-bold text-[#181615] group-hover:text-[#8C6618] transition-colors">
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              className="text-left focus:outline-none"
            >
              {product.name}
            </button>
          </h3>

          {/* Short Description */}
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#575049]">
            {product.shortDescription}
          </p>
        </div>

        {/* Price in PKR & Action Buttons */}
        <div className="mt-5 border-t border-[#EFEAE0] pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="block text-[11px] text-[#787067]">Showroom Price</span>
              <div className="flex items-baseline gap-2">
                <span className="font-tabular text-lg font-bold text-[#181615]">
                  {formatPKR(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="font-tabular text-xs text-[#8C8379] line-through">
                    {formatPKR(product.oldPrice)}
                  </span>
                )}
              </div>
            </div>
            {product.urduName && (
              <span className="text-xs text-[#787067]" dir="rtl">
                {product.urduName}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              aria-label={`View Details for ${product.name}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D5CBB8] bg-[#FAF7F2] px-3 py-2.5 text-xs font-semibold text-[#181615] transition-colors hover:border-[#181615] hover:bg-[#EFE9DD] whitespace-nowrap shrink-0"
            >
              <Eye className="h-3.5 w-3.5 text-[#8C6618]" />
              <span>View Details</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Order ${product.name} on WhatsApp`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#181615] px-3 py-2.5 text-xs font-semibold text-[#FAF7F2] transition-colors hover:bg-[#2E2823] whitespace-nowrap shrink-0"
            >
              <MessageCircle className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
