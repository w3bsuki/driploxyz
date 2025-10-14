import type { Database } from '@repo/database';

export function validateProductTitle(title: string): string | null {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.length < 3) {
    return 'Title must be at least 3 characters';
  }
  if (title.length > 100) {
    return 'Title must be less than 100 characters';
  }
  return null;
}

export function validateProductDescription(description: string): string | null {
  if (!description || description.trim().length === 0) {
    return 'Description is required';
  }
  if (description.length < 10) {
    return 'Description must be at least 10 characters';
  }
  if (description.length > 2000) {
    return 'Description must be less than 2000 characters';
  }
  return null;
}

export function validateProductPrice(price: string): string | null {
  if (!price || price.trim().length === 0) {
    return 'Price is required';
  }
  
  const priceNum = parseFloat(price);
  if (isNaN(priceNum)) {
    return 'Price must be a valid number';
  }
  if (priceNum <= 0) {
    return 'Price must be greater than 0';
  }
  if (priceNum > 999999) {
    return 'Price must be less than 999,999';
  }
  return null;
}

export function validateProductCategory(categoryId: string): string | null {
  if (!categoryId || categoryId.trim().length === 0) {
    return 'Category is required';
  }
  return null;
}

export function validateProductCondition(condition: Database['public']['Enums']['product_condition']): string | null {
  if (!condition) {
    return 'Condition is required';
  }
  const validConditions: Database['public']['Enums']['product_condition'][] = [
    'brand_new_with_tags',
    'new_without_tags',
    'like_new',
    'good',
    'worn',
    'fair',
  ];
  if (!validConditions.includes(condition)) {
    return 'Invalid condition';
  }
  return null;
}

export function validateMessageContent(content: string): string | null {
  if (!content || content.trim().length === 0) {
    return 'Message cannot be empty';
  }
  if (content.length > 1000) {
    return 'Message must be less than 1000 characters';
  }
  return null;
}

export function validateImageUri(uri: string): string | null {
  if (!uri || uri.trim().length === 0) {
    return 'Image is required';
  }
  if (!uri.startsWith('file://') && !uri.startsWith('content://') && !uri.startsWith('http')) {
    return 'Invalid image URI';
  }
  return null;
}
