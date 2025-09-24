/**
 * Image Analysis Utility for Category Suggestions
 * This can be enhanced with AI models in the future
 */

export interface CategorySuggestion {
  gender?: string;
  type?: string;
  specific?: string;
  confidence: number;
  reason: string;
}

/**
 * Analyzes image metadata and basic characteristics
 * Returns category suggestions
 */
export async function analyzeImageForCategories(
  file: File,
  imageUrl: string
): Promise<CategorySuggestion[]> {
  const suggestions: CategorySuggestion[] = [];
  
  // Analyze filename for hints
  const filenameHints = analyzeFilename(file.name);
  if (filenameHints.length > 0) {
    suggestions.push(...filenameHints);
  }
  
  // Analyze image dimensions for aspect ratio hints
  const aspectHints = await analyzeAspectRatio(imageUrl);
  if (aspectHints) {
    suggestions.push(aspectHints);
  }
  
  // Future: Add color analysis
  // const colorHints = await analyzeColors(imageUrl);
  
  return suggestions;
}

/**
 * Analyzes filename for category keywords
 */
function analyzeFilename(filename: string): CategorySuggestion[] {
  const suggestions: CategorySuggestion[] = [];
  const lower = filename.toLowerCase();
  
  // Common clothing keywords mapping
  const keywordMap: Record<string, Partial<CategorySuggestion>> = {
    // Specific items
    'tshirt': { type: 'Clothing', specific: 'T-Shirts', confidence: 0.8 },
    't-shirt': { type: 'Clothing', specific: 'T-Shirts', confidence: 0.8 },
    'shirt': { type: 'Clothing', specific: 'Shirts', confidence: 0.7 },
    'jacket': { type: 'Clothing', specific: 'Jackets', confidence: 0.8 },
    'coat': { type: 'Clothing', specific: 'Jackets & Coats', confidence: 0.8 },
    'hoodie': { type: 'Clothing', specific: 'Hoodies', confidence: 0.9 },
    'sweater': { type: 'Clothing', specific: 'Sweaters', confidence: 0.8 },
    'jeans': { type: 'Clothing', specific: 'Jeans', confidence: 0.9 },
    'pants': { type: 'Clothing', specific: 'Pants & Trousers', confidence: 0.7 },
    'trousers': { type: 'Clothing', specific: 'Pants & Trousers', confidence: 0.8 },
    'dress': { type: 'Clothing', specific: 'Dresses', gender: 'Women', confidence: 0.9 },
    'skirt': { type: 'Clothing', specific: 'Skirts', gender: 'Women', confidence: 0.9 },
    'shorts': { type: 'Clothing', specific: 'Shorts', confidence: 0.8 },
    'suit': { type: 'Clothing', specific: 'Suits & Blazers', confidence: 0.7 },
    'blazer': { type: 'Clothing', specific: 'Suits & Blazers', confidence: 0.8 },
    
    // Shoes
    'sneaker': { type: 'Shoes', specific: 'Sneakers', confidence: 0.9 },
    'shoe': { type: 'Shoes', confidence: 0.6 },
    'boot': { type: 'Shoes', specific: 'Boots', confidence: 0.8 },
    'heel': { type: 'Shoes', specific: 'Heels', gender: 'Women', confidence: 0.9 },
    'sandal': { type: 'Shoes', specific: 'Sandals', confidence: 0.8 },
    'flat': { type: 'Shoes', specific: 'Flats', confidence: 0.7 },
    
    // Accessories
    'bag': { type: 'Bags', confidence: 0.7 },
    'handbag': { type: 'Bags', specific: 'Handbags', gender: 'Women', confidence: 0.8 },
    'backpack': { type: 'Bags', specific: 'Backpacks', confidence: 0.9 },
    'wallet': { type: 'Accessories', specific: 'Wallets', confidence: 0.9 },
    'belt': { type: 'Accessories', specific: 'Belts', confidence: 0.9 },
    'hat': { type: 'Accessories', specific: 'Hats & Caps', confidence: 0.8 },
    'cap': { type: 'Accessories', specific: 'Hats & Caps', confidence: 0.8 },
    'watch': { type: 'Accessories', specific: 'Watches', confidence: 0.9 },
    'sunglasses': { type: 'Accessories', specific: 'Sunglasses', confidence: 0.9 },
    'scarf': { type: 'Accessories', specific: 'Scarves', confidence: 0.8 },
    'jewelry': { type: 'Accessories', specific: 'Jewelry', confidence: 0.8 },
    'necklace': { type: 'Accessories', specific: 'Jewelry', confidence: 0.8 },
    'ring': { type: 'Accessories', specific: 'Jewelry', confidence: 0.8 },
    
    // Gender hints
    'men': { gender: 'Men', confidence: 0.7 },
    'mens': { gender: 'Men', confidence: 0.7 },
    'women': { gender: 'Women', confidence: 0.7 },
    'womens': { gender: 'Women', confidence: 0.7 },
    'ladies': { gender: 'Women', confidence: 0.7 },
    'kids': { gender: 'Kids', confidence: 0.8 },
    'baby': { gender: 'Kids', confidence: 0.8 },
    'unisex': { gender: 'Unisex', confidence: 0.7 },
  };
  
  // Check each keyword
  Object.entries(keywordMap).forEach(([keyword, suggestion]) => {
    if (lower.includes(keyword)) {
      suggestions.push({
        ...suggestion,
        confidence: suggestion.confidence || 0.5,
        reason: `Filename contains "${keyword}"`
      } as CategorySuggestion);
    }
  });
  
  return suggestions;
}

/**
 * Analyzes image aspect ratio for category hints
 */
async function analyzeAspectRatio(imageUrl: string): Promise<CategorySuggestion | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      
      // Portrait images often contain full body shots or dresses
      if (aspectRatio < 0.8) {
        resolve({
          type: 'Clothing',
          confidence: 0.3,
          reason: 'Portrait orientation suggests clothing'
        });
      }
      // Square images are common for product shots
      else if (aspectRatio > 0.9 && aspectRatio < 1.1) {
        resolve({
          confidence: 0.2,
          reason: 'Square format suggests product photo'
        });
      }
      // Wide images might be accessories or shoes
      else if (aspectRatio > 1.5) {
        resolve({
          confidence: 0.2,
          reason: 'Wide format might suggest accessories or footwear'
        });
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

/**
 * Merges and deduplicates suggestions, keeping highest confidence
 */
export function mergeSuggestions(suggestions: CategorySuggestion[]): CategorySuggestion {
  if (suggestions.length === 0) {
    return {
      confidence: 0,
      reason: 'No suggestions available'
    };
  }
  
  // Group by category type and pick highest confidence
  const merged: CategorySuggestion = {
    confidence: 0,
    reason: ''
  };
  
  let highestConfidence = 0;
  const reasons: string[] = [];
  
  suggestions.forEach(s => {
    if (s.confidence > highestConfidence) {
      highestConfidence = s.confidence;
      if (s.gender) merged.gender = s.gender;
      if (s.type) merged.type = s.type;
      if (s.specific) merged.specific = s.specific;
    }
    if (s.reason) reasons.push(s.reason);
  });
  
  merged.confidence = highestConfidence;
  merged.reason = reasons.join(', ');
  
  return merged;
}

/**
 * Future enhancement: Use AI service for better analysis
 */
export async function analyzeWithAI(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _imageUrl: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _apiKey?: string
): Promise<CategorySuggestion> {
  // Intentionally unused parameters for future implementation
  // This would call an AI service like OpenAI Vision, Google Vision, etc.
  // For now, return a placeholder
  return {
    confidence: 0,
    reason: 'AI analysis not yet implemented'
  };
}