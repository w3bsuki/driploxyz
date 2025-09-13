// Static collection data for search dropdown
export interface Collection {
  key: string;
  label: string;
  emoji: string;
  product_count?: number;
}

export const defaultCollections: Collection[] = [
  // Quick Shopping Collections
  { key: 'newest', label: 'Newest', emoji: '🆕' },
  { key: 'under25', label: 'Under 25 лв', emoji: '💰' },
  { key: 'price-low', label: 'Cheapest', emoji: '📉' },
  { key: 'premium', label: 'Premium', emoji: '⭐' },

  // Condition Collections
  { key: 'condition=brand_new_with_tags', label: 'New with Tags', emoji: '🏷️' },
  { key: 'condition=like_new', label: 'Like New', emoji: '✨' },
  { key: 'condition=good', label: 'Good', emoji: '👍' },

  // Trending Collections
  { key: 'trending', label: 'Trending', emoji: '🔥' },
  { key: 'popular', label: 'Popular', emoji: '📈' },
  { key: 'favorites', label: 'My Favorites', emoji: '❤️' },

  // Style Collections
  { key: 'category=clothing', label: 'All Clothing', emoji: '👕' },
  { key: 'category=shoes', label: 'All Shoes', emoji: '👟' },
  { key: 'category=bags', label: 'All Bags', emoji: '👜' },
  { key: 'category=accessories', label: 'All Accessories', emoji: '💍' }
];

// Context-specific collections
export function getCollectionsForContext(context: 'main' | 'search' | 'category', categorySlug?: string): Collection[] {
  switch (context) {
    case 'main':
      // For main page, show general collections
      return [
        { key: 'newest', label: 'Newest', emoji: '🆕' },
        { key: 'under25', label: 'Under 25 лв', emoji: '💰' },
        { key: 'trending', label: 'Trending', emoji: '🔥' },
        { key: 'condition=brand_new_with_tags', label: 'New with Tags', emoji: '🏷️' },
        { key: 'premium', label: 'Premium', emoji: '⭐' },
        { key: 'popular', label: 'Popular', emoji: '📈' }
      ];

    case 'search':
      // For search page, show all collections
      return defaultCollections;

    case 'category':
      // For category pages, show category-specific collections
      if (categorySlug) {
        const baseCollections = [
          { key: 'newest', label: 'Newest', emoji: '🆕' },
          { key: 'under25', label: 'Under 25 лв', emoji: '💰' },
          { key: 'condition=brand_new_with_tags', label: 'New with Tags', emoji: '🏷️' },
          { key: 'trending', label: 'Trending', emoji: '🔥' }
        ];

        // Add category-specific collections
        if (categorySlug.includes('women')) {
          baseCollections.push({ key: 'women-trending', label: 'Women Trending', emoji: '👗' });
        } else if (categorySlug.includes('men')) {
          baseCollections.push({ key: 'men-trending', label: 'Men Trending', emoji: '👔' });
        } else if (categorySlug.includes('kids')) {
          baseCollections.push({ key: 'kids-trending', label: 'Kids Trending', emoji: '👶' });
        }

        return baseCollections;
      }
      return defaultCollections.slice(0, 6);

    default:
      return defaultCollections;
  }
}