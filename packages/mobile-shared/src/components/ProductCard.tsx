import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import type { Database } from '@repo/database';

type Product = Database['public']['Tables']['products']['Row'] & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
    rating: number | null;
  };
  product_images: {
    image_url: string;
    display_order: number | null;
  }[];
};

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const mainImage = product.product_images?.[0]?.image_url;
  const price = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'BGN',
  }).format(product.price);

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
    >
      {mainImage && (
        <Image
          source={{ uri: mainImage }}
          className="w-full h-48"
          resizeMode="cover"
        />
      )}
      <View className="p-4">
        <Text className="text-lg font-semibold mb-2" numberOfLines={2}>
          {product.title}
        </Text>
        <Text className="text-xl font-bold text-indigo-600">{price}</Text>
        {product.profiles.username && (
          <Text className="text-sm text-gray-500 mt-1">
            {product.profiles.username}
          </Text>
        )}
      </View>
    </Pressable>
  );
}