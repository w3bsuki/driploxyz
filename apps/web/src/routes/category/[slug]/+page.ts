import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
  // This could fetch category-specific data from your API
  const categoryData = {
    women: {
      title: 'Women\'s Fashion',
      description: 'Discover amazing deals on women\'s clothing',
      featured: ['New Arrivals', 'Designer Picks', 'Under $50']
    },
    men: {
      title: 'Men\'s Fashion', 
      description: 'Shop the latest in men\'s style',
      featured: ['Streetwear', 'Business Casual', 'Athletic']
    },
    kids: {
      title: 'Kids & Baby',
      description: 'Adorable clothes for little ones',
      featured: ['School Essentials', 'Baby (0-2)', 'Toys & Games']
    },
    pets: {
      title: 'Pet Supplies',
      description: 'Everything for your furry friends',
      featured: ['Dog Apparel', 'Cat Accessories', 'Pet Toys']
    },
    home: {
      title: 'Home & Living',
      description: 'Decor and essentials for your space',
      featured: ['Decor', 'Bedding', 'Kitchen']
    },
    sports: {
      title: 'Sports & Outdoors',
      description: 'Gear up for your active lifestyle',
      featured: ['Running', 'Yoga', 'Team Sports']
    }
  };

  return {
    slug: params.slug,
    category: categoryData[params.slug as keyof typeof categoryData] || categoryData.women,
    searchParams: url.searchParams.toString()
  };
};