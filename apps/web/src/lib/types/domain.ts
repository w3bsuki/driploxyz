// Canonical domain UI-facing types and mappers
import type { Database } from '@repo/database';
import type { Product } from '@repo/ui/types';

type DbProduct = Database['public']['Tables']['products']['Row'];
type DbOrder = Database['public']['Tables']['orders']['Row'];
type DbOrderItem = Database['public']['Tables']['order_items']['Row'];

interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string;
  sort_order?: number;
}

export type ProductUI = Omit<Product, 'sellerAvatar'> & {
  firstImage: string | null;
  first_image: string | null;
  sellerUsername: string;
  seller_username: string;
  seller_name: string;
  // Keep UI alias fields nullable for convenience, but base Product.sellerAvatar remains optional
  sellerAvatar?: string;
  seller_avatar: string | null;
  seller_rating: number;
  favoritedAt: string | null;
  favorited_at: string | null;
  createdAt: string;
  created_at: string | null;
  updated_at: string | null;
  product_images: ProductImage[];
  images: string[];
  seller_account_type: 'new_seller' | 'pro' | 'brand' | null;
  seller_subscription_tier: 'free' | 'basic' | 'pro' | 'brand' | null;
};

const DEFAULT_SELLER_BADGES = {
  is_pro: false,
  is_brand: false,
  is_verified: false
};

function normalizeImages(imagesSource: unknown): string[] {
  if (!imagesSource) return [];
  if (Array.isArray(imagesSource)) {
    return imagesSource
      .map((img): string | null => {
        if (!img) return null;
        if (typeof img === 'string') return img;
        if (typeof img === 'object') {
          const record = img as Record<string, unknown>;
          if (typeof record.image_url === 'string') return record.image_url;
          if (typeof record.url === 'string') return record.url;
          if (typeof record.src === 'string') return record.src;
        }
        return null;
      })
      .filter((url): url is string => Boolean(url));
  }
  return [];
}

function normalizeProductImages(value: unknown): ProductImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index): ProductImage | null => {
      if (!entry || typeof entry !== 'object') return null;
      const record = entry as Record<string, unknown>;
      const imageUrl = typeof record.image_url === 'string'
        ? record.image_url
        : typeof record.url === 'string'
          ? record.url
          : typeof record.src === 'string'
            ? record.src
            : null;
      if (!imageUrl) return null;
      const normalized: ProductImage = {
        id: record.id ? String(record.id) : `${index}-${imageUrl}`,
        image_url: imageUrl
      };
      if (typeof record.alt_text === 'string' && record.alt_text.length > 0) {
        normalized.alt_text = record.alt_text;
      }
      if (typeof record.sort_order === 'number' && Number.isFinite(record.sort_order)) {
        normalized.sort_order = record.sort_order;
      }
      return normalized;
    })
    .filter((img): img is ProductImage => Boolean(img));
}

function slugify(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function deriveCurrency(countryCode: string | null | undefined, fallback: string | null | undefined): string {
  if (typeof fallback === 'string' && fallback.trim().length > 0) {
    return fallback;
  }
  if (!countryCode) return 'USD';
  const code = countryCode.toUpperCase();
  const map: Record<string, string> = {
    US: 'USD',
    GB: 'GBP',
    DE: 'EUR',
    FR: 'EUR',
    ES: 'EUR',
    IT: 'EUR',
    NL: 'EUR',
    EU: 'EUR',
    CA: 'CAD',
    AU: 'AUD',
    JP: 'JPY',
    KR: 'KRW',
    CN: 'CNY',
    IN: 'INR',
    BR: 'BRL',
    MX: 'MXN'
  };
  return map[code] ?? 'USD';
}

function coerceString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function coerceNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

const DEFAULT_TIMESTAMP = '1970-01-01T00:00:00.000Z';

function coerceStringOrNull(value: unknown): string | null {
  const coerced = coerceString(value).trim();
  return coerced.length > 0 ? coerced : null;
}

function coerceNumberOrNull(value: unknown): number | null {
  const coerced = coerceNumber(value, Number.NaN);
  return Number.isFinite(coerced) ? coerced : null;
}

function ensureId(value: unknown, fallback: string): string {
  const coerced = coerceString(value);
  return coerced || fallback;
}

function buildProductRow(row: Partial<DbProduct>, args: {
  id: string;
  sellerId: string;
  price: number;
  title: string;
  categoryId: string;
  description: string;
  condition: DbProduct['condition'];
  slug: string;
  favoriteCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  brand: string | null;
  size: string | null;
  countryCode: string | null;
  status: string | null;
  isBoosted: boolean | null;
  isFeatured: boolean | null;
  isSold: boolean | null;
  location: string | null;
  tags: string[] | null;
  shippingCost: number | null;
  region: string | null;
  material: string | null;
  color: string | null;
  commissionRate: number | null;
  netEarnings: number | null;
  platformFee: number | null;
  slugLocked: boolean | null;
  boostedUntil: string | null;
  autoArchiveAfterDays: number | null;
  brandCollectionId: string | null;
  customSubcategory: string | null;
  dripStatus: string | null;
  dripQualityScore: number | null;
  dripAdminNotes: string | null;
  dripReviewedBy: string | null;
  dripApprovedAt: string | null;
  dripRejectedAt: string | null;
  dripRejectionReason: string | null;
  dripNominatedAt: string | null;
  dripNominatedBy: string | null;
  searchVector: unknown | null;
  archivedAt: string | null;
}): DbProduct {
  return {
    archived_at: row.archived_at ?? args.archivedAt,
    auto_archive_after_days: row.auto_archive_after_days ?? args.autoArchiveAfterDays,
    boost_history_id: row.boost_history_id ?? null,
    boost_priority: row.boost_priority ?? null,
    boost_type: row.boost_type ?? null,
    boosted_until: row.boosted_until ?? args.boostedUntil,
    brand: row.brand ?? args.brand,
    brand_collection_id: row.brand_collection_id ?? args.brandCollectionId,
    category_id: row.category_id ?? args.categoryId,
    color: row.color ?? args.color,
    commission_rate: row.commission_rate ?? args.commissionRate,
    condition: row.condition ?? args.condition,
    country_code: row.country_code ?? args.countryCode,
    created_at: row.created_at ?? args.createdAt,
    custom_subcategory: row.custom_subcategory ?? args.customSubcategory,
    description: row.description ?? args.description,
    drip_admin_notes: row.drip_admin_notes ?? args.dripAdminNotes,
    drip_approved_at: row.drip_approved_at ?? args.dripApprovedAt,
    drip_nominated_at: row.drip_nominated_at ?? args.dripNominatedAt,
    drip_nominated_by: row.drip_nominated_by ?? args.dripNominatedBy,
    drip_quality_score: row.drip_quality_score ?? args.dripQualityScore,
    drip_rejected_at: row.drip_rejected_at ?? args.dripRejectedAt,
    drip_rejection_reason: row.drip_rejection_reason ?? args.dripRejectionReason,
    drip_reviewed_by: row.drip_reviewed_by ?? args.dripReviewedBy,
    drip_status: row.drip_status ?? args.dripStatus,
    favorite_count: row.favorite_count ?? args.favoriteCount,
    id: row.id ? String(row.id) : args.id,
    is_active: row.is_active ?? null,
    is_boosted: row.is_boosted ?? args.isBoosted,
    is_drip_candidate: row.is_drip_candidate ?? null,
    is_featured: row.is_featured ?? args.isFeatured,
    is_sold: row.is_sold ?? args.isSold,
    location: row.location ?? args.location,
    material: row.material ?? args.material,
    net_earnings: row.net_earnings ?? args.netEarnings,
    platform_fee: row.platform_fee ?? args.platformFee,
    price: row.price ?? args.price,
    region: row.region ?? args.region,
    search_vector: row.search_vector ?? args.searchVector,
    seller_id: row.seller_id ?? args.sellerId,
    shipping_cost: row.shipping_cost ?? args.shippingCost,
    size: row.size ?? args.size,
    slug: row.slug ?? args.slug,
    slug_locked: row.slug_locked ?? args.slugLocked,
    sold_at: row.sold_at ?? null,
    status: row.status ?? args.status,
    tags: Array.isArray(row.tags) ? row.tags.map(tag => String(tag)) : args.tags,
    title: row.title ?? args.title,
    updated_at: row.updated_at ?? args.updatedAt ?? args.createdAt,
    view_count: row.view_count ?? null
  };
}

export function mapProduct(row: Partial<DbProduct> & Record<string, any>): ProductUI {
  const productImagesRaw = row.product_images ?? row.productImages ?? row.images_data;
  const product_images = normalizeProductImages(productImagesRaw);
  const imageCandidates = normalizeImages(row.images ?? product_images);
  const images = imageCandidates.length > 0 ? imageCandidates : product_images.map((img) => img.image_url);

  const firstImage = typeof row.first_image === 'string' && row.first_image.length > 0
    ? row.first_image
    : typeof row.firstImage === 'string' && row.firstImage.length > 0
      ? row.firstImage
      : images[0] ?? null;

  const sellerNode = row.seller ?? row.profiles ?? row.seller_profile ?? row.sellerProfile ?? row.profile ?? null;
  const sellerBadgesRaw = (row.seller_badges ?? sellerNode?.badges ?? row.sellerBadges) || null;
  const sellerBadges = {
    ...DEFAULT_SELLER_BADGES,
    ...(sellerBadgesRaw && typeof sellerBadgesRaw === 'object'
      ? {
          is_pro: Boolean((sellerBadgesRaw as Record<string, unknown>).is_pro),
          is_brand: Boolean((sellerBadgesRaw as Record<string, unknown>).is_brand),
          is_verified: Boolean((sellerBadgesRaw as Record<string, unknown>).is_verified)
        }
      : {})
  };

  const sellerAccountTypeRaw = row.seller_account_type ?? row.sellerAccountType ?? sellerNode?.account_type ?? null;
  const sellerAccountType = (() => {
    if (!sellerAccountTypeRaw) return 'new_seller' as const;
    const normalized = String(sellerAccountTypeRaw).toLowerCase();
    if (normalized === 'brand') return 'brand' as const;
    if (normalized === 'pro' || normalized === 'premium') return 'pro' as const;
    return 'new_seller' as const;
  })();

  const sellerSubscriptionTierRaw = row.seller_subscription_tier ?? row.sellerSubscriptionTier ?? sellerNode?.subscription_tier ?? null;
  const sellerSubscriptionTier = (() => {
    if (!sellerSubscriptionTierRaw) return 'free' as const;
    const normalized = String(sellerSubscriptionTierRaw).toLowerCase();
    if (normalized === 'basic') return 'basic' as const;
    if (normalized === 'pro' || normalized === 'premium') return 'pro' as const;
    if (normalized === 'brand') return 'brand' as const;
    return 'free' as const;
  })();

  const sellerId = ensureId(row.seller_id ?? row.sellerId ?? sellerNode?.id, 'unknown-seller');
  const sellerUsername = coerceString(
    row.seller_username ?? row.sellerUsername ?? row.seller_name ?? row.sellerName ?? sellerNode?.username,
    'seller'
  );
  const sellerName = coerceString(
    row.seller_name ?? row.sellerName ?? sellerNode?.full_name ?? sellerNode?.username,
    sellerUsername
  );
  const sellerRating = coerceNumber(row.seller_rating ?? row.sellerRating ?? sellerNode?.rating, 0);
  const sellerAvatar = coerceStringOrNull(
    row.seller_avatar ?? row.sellerAvatar ?? sellerNode?.avatar_url ?? sellerNode?.avatar
  );

  const category = row.category ?? row.categories ?? null;
  const categoryId = ensureId(row.category_id ?? row.categoryId ?? category?.id, 'unknown-category');
  const categoryName = coerceStringOrNull(row.category_name ?? category?.name ?? row.main_category_name ?? null);
  const mainCategory = coerceStringOrNull(row.main_category_name ?? category?.main_category_name);
  const subCategory = coerceStringOrNull(row.subcategory_name ?? category?.subcategory_name);
  const specificCategory = coerceStringOrNull(row.specific_category_name ?? category?.specific_category_name);

  const title = coerceString(row.title, 'Untitled Product');
  const slug = coerceString(row.slug, slugify(title || row.slug || '')) || slugify(title) || `product-${sellerId}`;
  const price = coerceNumber(row.price ?? row.price_amount, 0);
  const description = coerceString(row.description, 'No description provided.');
  const condition = (() => {
    const value = row.condition;
    const allowed: DbProduct['condition'][] = [
      'brand_new_with_tags',
      'new_without_tags',
      'like_new',
      'good',
      'worn',
      'fair'
    ];
    if (typeof value === 'string' && allowed.includes(value as DbProduct['condition'])) {
      return value as DbProduct['condition'];
    }
    return 'good';
  })();

  const size = coerceStringOrNull(row.size);
  const countryCode = coerceStringOrNull(row.country_code ?? row.countryCode);
  const favoriteCount = coerceNumber(row.favorite_count ?? row.favoriteCount, 0);
  const createdAtRaw = row.created_at ?? row.createdAt;
  const updatedAtRaw = row.updated_at ?? row.updatedAt;
  const createdAt = typeof createdAtRaw === 'string' && createdAtRaw.length > 0 ? createdAtRaw : DEFAULT_TIMESTAMP;
  const updatedAt = typeof updatedAtRaw === 'string' && updatedAtRaw.length > 0 ? updatedAtRaw : null;
  const favoritedAt = coerceStringOrNull(row.favorited_at ?? row.favoritedAt);

  const currency = deriveCurrency(row.country_code ?? row.countryCode, row.currency);
  const availableSizesSource = row.available_sizes ?? row.availableSizes ?? row.sizes;
  const availableSizes = Array.isArray(availableSizesSource)
    ? availableSizesSource.map((entry) => coerceString(entry)).filter(Boolean)
    : [];

  const isBoosted = typeof row.is_boosted === 'boolean' ? row.is_boosted : null;
  const isFeatured = typeof row.is_featured === 'boolean' ? row.is_featured : null;
  const isSold = typeof row.is_sold === 'boolean' ? row.is_sold : null;
  const isPromoted = typeof row.is_promoted === 'boolean'
    ? row.is_promoted
    : typeof row.is_featured === 'boolean'
      ? row.is_featured
      : false;

  const location = coerceStringOrNull(row.location ?? row.city ?? sellerNode?.location);
  const status = coerceStringOrNull(row.status);
  const tagsSource = row.tags ?? row.product_tags;
  const tags = Array.isArray(tagsSource) ? tagsSource.map((tag) => coerceString(tag)).filter(Boolean) : null;
  const shippingCost = coerceNumberOrNull(row.shipping_cost ?? row.shippingCost);
  const region = coerceStringOrNull(row.region);
  const material = coerceStringOrNull(row.material);
  const color = coerceStringOrNull(row.color);
  const commissionRate = coerceNumberOrNull(row.commission_rate ?? row.commissionRate);
  const netEarnings = coerceNumberOrNull(row.net_earnings ?? row.netEarnings);
  const platformFee = coerceNumberOrNull(row.platform_fee ?? row.platformFee);
  const slugLocked = typeof (row.slug_locked ?? row.slugLocked) === 'boolean' ? (row.slug_locked ?? row.slugLocked) : null;
  const boostedUntil = coerceStringOrNull(row.boosted_until ?? row.boostedUntil);
  const autoArchiveAfterDays = coerceNumberOrNull(row.auto_archive_after_days ?? row.autoArchiveAfterDays);
  const brandCollectionId = coerceStringOrNull(row.brand_collection_id ?? row.brandCollectionId);
  const customSubcategory = coerceStringOrNull(row.custom_subcategory ?? row.customSubcategory);
  const dripStatus = coerceStringOrNull(row.drip_status ?? row.dripStatus);
  const dripQualityScore = coerceNumberOrNull(row.drip_quality_score ?? row.dripQualityScore);
  const dripAdminNotes = coerceStringOrNull(row.drip_admin_notes ?? row.dripAdminNotes);
  const dripReviewedBy = coerceStringOrNull(row.drip_reviewed_by ?? row.dripReviewedBy);
  const dripApprovedAt = coerceStringOrNull(row.drip_approved_at ?? row.dripApprovedAt);
  const dripRejectedAt = coerceStringOrNull(row.drip_rejected_at ?? row.dripRejectedAt);
  const dripRejectionReason = coerceStringOrNull(row.drip_rejection_reason ?? row.dripRejectionReason);
  const dripNominatedAt = coerceStringOrNull(row.drip_nominated_at ?? row.dripNominatedAt);
  const dripNominatedBy = coerceStringOrNull(row.drip_nominated_by ?? row.dripNominatedBy);
  const searchVector = (row.search_vector ?? row.searchVector ?? null) as unknown | null;
  const archivedAt = coerceStringOrNull(row.archived_at ?? row.archivedAt);

  const productRow = buildProductRow(row, {
    id: ensureId(row.id ?? row.product_id ?? row.productId, slug),
    sellerId,
    price,
    title,
    categoryId,
    description,
    condition,
    slug,
    favoriteCount,
    createdAt,
    updatedAt,
    brand: coerceStringOrNull(row.brand),
    size,
    countryCode,
    status,
    isBoosted,
    isFeatured,
    isSold,
    location,
    tags,
    shippingCost,
    region,
    material,
    color,
    commissionRate,
    netEarnings,
    platformFee,
    slugLocked,
    boostedUntil,
    autoArchiveAfterDays,
    brandCollectionId,
    customSubcategory,
    dripStatus,
    dripQualityScore,
    dripAdminNotes,
    dripReviewedBy,
    dripApprovedAt,
    dripRejectedAt,
    dripRejectionReason,
    dripNominatedAt,
    dripNominatedBy,
    searchVector,
    archivedAt
  });

  const productCore: Product = {
    ...productRow,
    images,
    product_images,
    slug,
    currency,
    availableSizes,
    sellerName,
    sellerRating,
    sellerAvatar: sellerAvatar ?? undefined,
    sellerAccountType,
    category_name: categoryName ?? undefined,
    main_category_name: mainCategory ?? undefined,
    subcategory_name: subCategory ?? undefined,
    specific_category_name: specificCategory ?? undefined,
    seller_badges: sellerBadges,
    seller_subscription_tier: sellerSubscriptionTier,
    sellerId,
    createdAt,
    is_promoted: isPromoted
  };

  const product: ProductUI = {
    ...productCore,
    firstImage,
    first_image: firstImage,
    sellerUsername,
    seller_username: sellerUsername,
    sellerName,
    seller_name: sellerName,
    sellerAvatar: sellerAvatar ?? undefined,
    seller_avatar: sellerAvatar,
    seller_rating: sellerRating,
    sellerAccountType,
    seller_account_type: sellerAccountType,
    seller_subscription_tier: sellerSubscriptionTier,
    favoritedAt,
    favorited_at: favoritedAt,
    createdAt,
    created_at: productRow.created_at ?? createdAt,
    updated_at: updatedAt,
    product_images,
    images,
    currency,
    availableSizes,
    favorite_count: productRow.favorite_count ?? favoriteCount,
    is_boosted: isBoosted,
    is_promoted: isPromoted,
    is_featured: isFeatured,
    is_sold: isSold
  };

  return product;
}

export interface ProfileUI {
  id: string;
  username: string;
  avatarUrl?: string | null;
  fullName?: string | null;
}

export function mapProfile(row: Record<string, any>): ProfileUI {
  return {
    id: String(row.id || ''),
    username: String(row.username || row.user_name || 'user'),
    avatarUrl: row.avatar_url ?? row.avatar ?? null,
    fullName: row.full_name ?? row.name ?? null
  };
}

export interface OrderItemUI extends Record<string, unknown> {
  id: string;
  product_id: string;
  price: number;
  quantity: number;
  size: string | null;
  created_at: string | null;
  product?: ProductUI | null;
}

export interface OrderUI extends Record<string, unknown> {
  id: string;
  status: DbOrder['status'] | 'pending';
  totalAmount: number;
  total_amount: number;
  currency: string | null;
  sellerId: string;
  seller_id: string;
  buyerId: string;
  buyer_id: string;
  seller: ProfileUI | null;
  buyer: ProfileUI | null;
  createdAt: string | null;
  created_at: string | null;
  updatedAt: string | null;
  updated_at: string | null;
  deliveredAt: string | null;
  delivered_at: string | null;
  shippedAt: string | null;
  shipped_at: string | null;
  trackingNumber: string | null;
  tracking_number: string | null;
  shippingAddress: Record<string, unknown> | null;
  shipping_address: Record<string, unknown> | null;
  isBundle: boolean;
  is_bundle: boolean;
  itemsCount: number;
  items_count: number;
  bundle_discount: number | null;
  buyer_rated: boolean;
  seller_rated: boolean;
  product: ProductUI | null;
  order_items: OrderItemUI[];
}

function parseJson<T>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return null;
}

export function mapOrder(row: Record<string, any>): OrderUI {
  const status = (row.status ?? 'pending') as DbOrder['status'] | 'pending';
  const totalAmount = coerceNumber(row.total_amount ?? row.totalAmount);
  const sellerId = coerceString(row.seller_id ?? row.sellerId);
  const buyerId = coerceString(row.buyer_id ?? row.buyerId);
  const createdAt = (row.created_at ?? row.createdAt ?? null) as string | null;
  const deliveredAt = (row.delivered_at ?? row.deliveredAt ?? null) as string | null;
  const shippedAt = (row.shipped_at ?? row.shippedAt ?? null) as string | null;
  const updatedAt = (row.updated_at ?? row.updatedAt ?? null) as string | null;
  const trackingNumber = (row.tracking_number ?? row.trackingNumber ?? null) as string | null;
  const shippingAddress = parseJson<Record<string, unknown>>(row.shipping_address ?? row.shippingAddress);

  const productSource = row.product ?? row.products ?? null;
  const product = productSource ? mapProduct(productSource) : null;

  const orderItemsRaw = row.order_items ?? row.orderItems ?? [];
  const order_items: OrderItemUI[] = Array.isArray(orderItemsRaw)
    ? orderItemsRaw.map((item: Partial<DbOrderItem> & Record<string, any>): OrderItemUI => {
        const itemProductSource = item.product ?? item.products ?? null;
        return {
          id: coerceString(item.id),
          product_id: coerceString(item.product_id ?? item.productId ?? product?.id ?? ''),
          price: coerceNumber(item.price),
          quantity: coerceNumber(item.quantity, 1),
          size: (item.size ?? null) as string | null,
          created_at: (item.created_at ?? null) as string | null,
          product: itemProductSource ? mapProduct(itemProductSource) : product
        };
      })
    : [];

  const buyerProfile = row.buyer ? mapProfile(row.buyer) : row.buyer_profile ? mapProfile(row.buyer_profile) : null;
  const sellerProfile = row.seller ? mapProfile(row.seller) : row.seller_profile ? mapProfile(row.seller_profile) : null;

  const itemsCount = coerceNumber(row.items_count ?? row.itemsCount ?? (order_items.length || (product ? 1 : 0)));
  const isBundle = Boolean(row.is_bundle ?? row.isBundle ?? itemsCount > 1);

  return {
    id: coerceString(row.id),
    status,
    totalAmount,
    total_amount: totalAmount,
    currency: (row.currency ?? product?.currency ?? null) as string | null,
    sellerId,
    seller_id: sellerId,
    buyerId,
    buyer_id: buyerId,
    seller: sellerProfile,
    buyer: buyerProfile,
    createdAt,
    created_at: createdAt,
    updatedAt,
    updated_at: updatedAt,
    deliveredAt,
    delivered_at: deliveredAt,
    shippedAt,
    shipped_at: shippedAt,
    trackingNumber,
    tracking_number: trackingNumber,
    shippingAddress,
    shipping_address: shippingAddress,
    isBundle,
    is_bundle: isBundle,
    itemsCount,
    items_count: itemsCount,
    bundle_discount: (row.bundle_discount ?? null) as number | null,
    buyer_rated: Boolean(row.buyer_rated),
    seller_rated: Boolean(row.seller_rated),
    product,
    order_items
  };
}
