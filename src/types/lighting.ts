export type CategoryName =
  | 'Ceiling Fanus'
  | 'Hanging Fanus'
  | 'Crystal Lights'
  | 'Modern Lights'
  | 'Wall Lights'
  | 'Bedroom Lights'
  | 'Living Room Lights'
  | 'Dining Room Lights'
  | 'Outdoor Lights'
  | 'Decorative Lights';

export type Chandelier3DArchetype =
  | 'imperial-crystal'
  | 'golden-rings'
  | 'mughal-lantern'
  | 'cascade-cluster'
  | 'wall-sconce';

export type FinishPreset = 'champagne-gold' | 'antique-bronze' | 'polished-chrome';

export type LightTemperature = '2700K' | '4000K' | '6000K';

export interface Product {
  id: string;
  sku: string;
  name: string;
  urduName?: string;
  category: CategoryName;
  price: number; // Price in PKR
  oldPrice?: number; // Optional old price in PKR
  shortDescription: string;
  description: string;
  images: string[]; // Custom URLs or procedural studio view identifiers
  sizes: string[];
  colors: string[];
  material: string;
  lightType: string;
  bulbInfo: string;
  dimensions: string;
  installationInfo: string;
  availability: 'In Stock' | 'Made to Order' | 'Out of Stock';
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  recentlyAdded: boolean;
  archetype3D: Chandelier3DArchetype;
  defaultFinish: FinishPreset;
}

export interface CategoryInfo {
  id: string;
  name: CategoryName;
  shortFilterLabel: string;
  urduLabel: string;
  description: string;
  archetype3D: Chandelier3DArchetype;
  accentTone: string;
}

export interface BusinessInfo {
  name: string;
  urduName: string;
  tagline: string;
  phone: string;
  whatsapp: string; // E.164 digits without + e.g. 923001234567
  email: string;
  address: string;
  city: string;
  openingHours: string;
  homeDeliveryEnabled: boolean;
  deliveryNote: string;
  mapEmbedQuery: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
}

export interface CustomerInquiry {
  id: string;
  name: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export type SpecialCollectionTab =
  | 'all'
  | 'featured'
  | 'bestSeller'
  | 'newArrival'
  | 'recentlyAdded'
  | 'specialOffers';

export interface CatalogFilterState {
  searchQuery: string;
  category: string; // 'All' or CategoryName or shortFilterLabel
  minPrice: number;
  maxPrice: number;
  sortBy: SortOption;
  specialTab: SpecialCollectionTab;
}
