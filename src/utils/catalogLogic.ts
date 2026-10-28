import { CatalogFilterState, CategoryInfo, Product } from '../types/lighting';

/**
 * Formats a number as Pakistani Rupees: e.g. 8500 -> "PKR 8,500"
 */
export function formatPKR(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return 'PKR 0';
  return `PKR ${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Calculates discount percentage between oldPrice and current price.
 * Returns 0 if there is no valid discount.
 */
export function calculateDiscountPercent(price: number, oldPrice?: number): number {
  if (!oldPrice || oldPrice <= price || price <= 0) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/**
 * Builds the exact pre-filled WhatsApp order message requested by the user:
 * "Assalam o Alaikum, I am interested in [PRODUCT NAME]. Price: PKR [PRICE]. Please provide availability and details."
 */
export function buildWhatsAppOrderMessage(productName: string, price: number): string {
  const formattedNumber = Math.round(price).toLocaleString('en-US');
  return `Assalam o Alaikum, I am interested in ${productName}. Price: PKR ${formattedNumber}. Please provide availability and details.`;
}

/**
 * Builds the product inquiry WhatsApp message for the Product Detail Page:
 * "Hello, I am interested in the [PRODUCT NAME]. Please provide more details."
 */
export function buildWhatsAppDetailInquiryMessage(productName: string, price: number, selectedSize?: string, selectedColor?: string): string {
  const formattedNumber = Math.round(price).toLocaleString('en-US');
  const variantParts: string[] = [];
  if (selectedSize) variantParts.push(`Size: ${selectedSize}`);
  if (selectedColor) variantParts.push(`Finish: ${selectedColor}`);
  const variantSuffix = variantParts.length > 0 ? ` (${variantParts.join(', ')})` : '';
  return `Assalam o Alaikum, I am interested in ${productName}${variantSuffix}. Price: PKR ${formattedNumber}. Please provide availability and details.`;
}

/**
 * Builds a complete https://wa.me/ URL with sanitized phone and URL-encoded message.
 */
export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const digitsOnly = whatsappNumber.replace(/[^0-9]/g, '') || '923008459210';
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

/**
 * Checks whether a product matches a category filter string.
 * Supports 'All', full CategoryName ('Ceiling Fanus'), or shortFilterLabel ('Ceiling').
 */
export function matchesCategoryFilter(product: Product, categoryFilter: string, categories: CategoryInfo[]): boolean {
  const normalizedFilter = categoryFilter.trim().toLowerCase();
  if (!normalizedFilter || normalizedFilter === 'all') return true;

  if (product.category.toLowerCase() === normalizedFilter) return true;

  const matchedCat = categories.find(
    (c) =>
      c.name.toLowerCase() === normalizedFilter ||
      c.shortFilterLabel.toLowerCase() === normalizedFilter ||
      c.id.toLowerCase() === normalizedFilter,
  );
  if (matchedCat) {
    return product.category === matchedCat.name;
  }

  return product.category.toLowerCase().includes(normalizedFilter);
}

/**
 * Filters and sorts the product catalog according to search query, category,
 * PKR price bounds, special collection tab, and sort order.
 */
export function filterAndSortProducts(
  products: Product[],
  filter: CatalogFilterState,
  categories: CategoryInfo[],
): Product[] {
  const query = filter.searchQuery.trim().toLowerCase();

  const filtered = products.filter((product) => {
    // 1. Category check
    if (!matchesCategoryFilter(product, filter.category, categories)) {
      return false;
    }

    // 2. Price range check
    if (Number.isFinite(filter.minPrice) && product.price < filter.minPrice) {
      return false;
    }
    if (Number.isFinite(filter.maxPrice) && filter.maxPrice > 0 && product.price > filter.maxPrice) {
      return false;
    }

    // 3. Special collection tab check
    if (filter.specialTab === 'featured' && !product.featured) return false;
    if (filter.specialTab === 'bestSeller' && !product.bestSeller) return false;
    if (filter.specialTab === 'newArrival' && !product.newArrival) return false;
    if (filter.specialTab === 'recentlyAdded' && !product.recentlyAdded) return false;
    if (
      filter.specialTab === 'specialOffers' &&
      calculateDiscountPercent(product.price, product.oldPrice) <= 0
    ) {
      return false;
    }

    // 4. Search query check
    if (query.length > 0) {
      const searchableText = [
        product.name,
        product.urduName || '',
        product.category,
        product.shortDescription,
        product.description,
        product.sku,
        product.material,
        product.lightType,
      ]
        .join(' ')
        .toLowerCase();
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });

  // Sort results without mutating input array
  const sorted = [...filtered];
  switch (filter.sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      sorted.sort((a, b) => {
        const aScore = (a.newArrival ? 2 : 0) + (a.recentlyAdded ? 1 : 0);
        const bScore = (b.newArrival ? 2 : 0) + (b.recentlyAdded ? 1 : 0);
        return bScore - aScore;
      });
      break;
    case 'featured':
    default:
      sorted.sort((a, b) => {
        const aScore = (a.featured ? 4 : 0) + (a.bestSeller ? 2 : 0);
        const bScore = (b.featured ? 4 : 0) + (b.bestSeller ? 2 : 0);
        return bScore - aScore;
      });
      break;
  }

  return sorted;
}

/**
 * Validates customer contact inquiry fields.
 */
export function validateInquiryForm(input: {
  name: string;
  phone: string;
  subject: string;
  message: string;
}): { valid: boolean; error?: string } {
  if (!input.name || input.name.trim().length < 2) {
    return { valid: false, error: 'Please enter your full name.' };
  }
  if (!input.phone || input.phone.replace(/[^0-9+]/g, '').length < 7) {
    return { valid: false, error: 'Please enter a valid Pakistani phone or WhatsApp number.' };
  }
  if (!input.subject || input.subject.trim().length < 2) {
    return { valid: false, error: 'Please specify a product or subject.' };
  }
  if (!input.message || input.message.trim().length < 5) {
    return { valid: false, error: 'Please enter a short message or inquiry details.' };
  }
  return { valid: true };
}
