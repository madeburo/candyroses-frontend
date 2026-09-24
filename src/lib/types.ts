export interface ImageRef {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceMax: number;
  hasPriceRange: boolean;
  compareAtPrice: number | null;
  discountPercent: number | null;
  currency: string;
  isNew: boolean;
  isBestseller: boolean;
  isOnSale: boolean;
  inStock: boolean;
  category: { name: string; slug: string } | null;
  image: ImageRef | null;
  hoverImage: ImageRef | null;
  colors: { name: string; slug: string; hex: string | null }[];
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sort?: string;
}

export interface OptionValue {
  id: string;
  value: string;
  slug: string;
  colorHex: string | null;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  description: string | null;
  material: string | null;
  careInstructions: string | null;
  brand: string | null;
  gender: string | null;
  season: string | null;
  currency: string;
  price: number;
  priceMax: number;
  compareAtPrice: number | null;
  isNew: boolean;
  isBestseller: boolean;
  isOnSale: boolean;
  inStock: boolean;
  category: { id: string; name: string; slug: string } | null;
  breadcrumbs: { id: string; name: string; slug: string }[];
  seo: { title: string | null; description: string | null; keywords: string | null };
  images: (ImageRef & { id: string; variantId: string | null; isPrimary: boolean })[];
  options: { attributeId: string; code: string; name: string; type: string; unit: string | null; values: OptionValue[] }[];
  variants: {
    id: string;
    sku: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
    inStock: boolean;
    available: number;
    lowStock: boolean;
    options: Record<string, string>;
  }[];
  characteristics: { name: string; values: string[] }[];
  publishedAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  showInMenu: boolean;
  showOnHome: boolean;
  sortOrder: number;
  children: Category[];
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: "MANUAL" | "AUTO_NEW" | "AUTO_SALE" | "AUTO_BESTSELLERS";
  imageUrl: string | null;
  showInMenu: boolean;
  showOnHome: boolean;
  sortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface Facets {
  attributes: { id: string; code: string; name: string; type: string; unit: string | null; values: { id: string; value: string; slug: string; colorHex: string | null; count: number }[] }[];
  price: { min: number; max: number };
  saleCount?: number;
  total: number;
}

export interface StoreSettings {
  storeName: string;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  email: string | null;
  address: string | null;
  currency: string;
  shippingPrice: number;
  freeShippingFrom: number | null;
  workingHours: string | null;
  announcement: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
}

export interface ShippingMethod {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: "PICKUP" | "COURIER" | "NATIONWIDE" | "CARRIER";
  requiresAddress: boolean;
  estimatedDays: string | null;
  price: number;
  freeFromAmount: number | null;
}

export interface PaymentMethod {
  code: string;
  title: string;
  description: string;
  online: boolean;
}

export interface QuoteLine {
  variantId: string;
  productId: string | null;
  productName: string;
  productSlug: string | null;
  sku: string;
  variantTitle: string;
  options: Record<string, string>;
  size: string | null;
  color: string | null;
  imageUrl: string | null;
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
  lineTotal: number;
  available: number;
  issue: null | { code: "UNAVAILABLE" | "INSUFFICIENT_STOCK"; message: string; available?: number };
}

export interface CartQuote {
  lines: QuoteLine[];
  currency: string;
  itemsCount: number;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  taxRate: number | null;
  total: number;
  promotion: { code: string; name: string; type: string; discount: number; freeShipping: boolean } | null;
  promoError: { code: string; message: string } | null;
  shipping: { code: string; name: string; price: number; basePrice: number; isFree: boolean; freeFrom: number | null; estimatedDays: string | null } | null;
  shippingError: { code: string; message: string } | null;
  freeShippingRemaining: number | null;
  hasIssues: boolean;
}

export interface PublicOrder {
  id: string;
  number: number;
  accessToken: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentExpiresAt: string | null;
  currency: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string | null;
  shippingMethodName: string;
  shippingMethodCode: string;
  shippingCity: string | null;
  shippingRegion: string | null;
  shippingAddress1: string | null;
  shippingAddress2: string | null;
  shippingPostalCode: string | null;
  trackingNumber: string | null;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  promoCode: string | null;
  customerComment: string | null;
  itemsCount: number;
  createdAt: string;
  items: { id: string; productName: string; productSlug: string | null; sku: string; variantName: string | null; size: string | null; color: string | null; unitPrice: number; quantity: number; totalPrice: number; imageUrl: string | null }[];
  history: { status: string; at: string }[];
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  marketingOptIn: boolean;
  registeredAt: string | null;
}
