#!/usr/bin/env node
/**
 * Automated script to add missing i18n translation keys
 * Following Paraglide v2 + SvelteKit 2 best practices
 */
import fs from 'fs';
import path from 'path';

// Missing keys from PHASE_4D_I18N_ANALYSIS.md (630 keys)
const missingKeys = {
  // Home section (new keys needed for restored components)
  home_topSellers: "Top Sellers",
  home_promotedListings: "Promoted Listings",
  home_promotedDescription: "Featured items from our top sellers",
  
  // Admin section
  admin_backToSite: "Back to Site",
  admin_driploAdmin: "Driplo Admin",
  admin_managePayouts: "Manage Payouts",
  admin_monitorMetrics: "Monitor Metrics",
  admin_noOrders: "No Orders",
  admin_orderId: "Order ID",
  admin_payoutManagement: "Payout Management",
  admin_pendingPayouts: "Pending Payouts",
  admin_recentOrders: "Recent Orders",
  admin_totalOrders: "Total Orders",
  admin_totalProducts: "Total Products",
  admin_totalRevenue: "Total Revenue",
  admin_totalUsers: "Total Users",
  admin_trackProcessPayouts: "Track & Process Payouts",
  admin_viewMainSite: "View Main Site",
  
  // Auth section
  auth_alreadyHaveAccount: "Already have an account?",
  auth_confirmPassword: "Confirm Password",
  auth_createAccount: "Create Account",
  auth_dontHaveAccount: "Don't have an account?",
  auth_firstName: "First Name",
  auth_forgotPassword: "Forgot Password?",
  auth_lastName: "Last Name",
  auth_orContinueWith: "Or continue with",
  auth_privacyPolicy: "Privacy Policy",
  auth_signIn: "Sign In",
  auth_signOut: "Sign Out",
  auth_signUp: "Sign Up",
  auth_termsAgreement: "I agree to the Terms of Service and Privacy Policy",
  auth_termsOfService: "Terms of Service",
  
  // Badge/Banner section
  badge_new: "New",
  banner_by: "by",
  banner_close: "Close",
  banner_earlyBird: "Early Bird",
  banner_firstMonth: "First Month",
  banner_justAdded: "Just Added",
  banner_limitedTime: "Limited Time",
  banner_live: "Live",
  banner_off: "OFF",
  banner_recentListings: "Recent Listings",
  banner_viewProduct: "View Product",
  
  // Breadcrumb section
  breadcrumb_dashboard: "Dashboard",
  breadcrumb_orders: "Orders",
  breadcrumb_sales: "Sales",
  
  // Buy action
  buyNow: "Buy Now",
  
  // Category section (extensive)
  category_accessoriesType: "Accessories",
  category_backpacks: "Backpacks",
  category_bagsType: "Bags",
  category_belts: "Belts",
  category_boots: "Boots",
  category_categories: "Categories",
  category_clearAll: "Clear All",
  category_cufflinks: "Cufflinks",
  category_designer: "Designer",
  category_dresses: "Dresses",
  category_dropdown_allCategories: "All Categories",
  category_dropdown_allCategoriesSelected: "All categories selected",
  category_dropdown_allFiltersCleared: "All filters cleared",
  category_dropdown_allSpecificSelected: "All specific items selected",
  category_dropdown_allSubcategorySelected: "All subcategories selected",
  category_dropdown_ariaLabel: "Select category",
  category_dropdown_backToCategories: "Back to categories",
  category_dropdown_categories: "Categories",
  category_dropdown_listboxAriaLabel: "Category options",
  category_dropdown_selectedCategory: "Selected category",
  category_dropdown_selectedSpecific: "Selected specific item",
  category_dropdown_selectedSubcategory: "Selected subcategory",
  category_filters: "Filters",
  category_flats: "Flats",
  category_formalShoes: "Formal Shoes",
  category_hairAccessories: "Hair Accessories",
  category_hatsAndCaps: "Hats & Caps",
  category_heels: "Heels",
  category_hoodies: "Hoodies",
  category_itemsCount: "{count} items",
  category_jackets: "Jackets",
  category_jacketsCoats: "Jackets & Coats",
  category_jeans: "Jeans",
  category_lingerie: "Lingerie & Underwear",
  category_pantsJeans: "Pants & Jeans",
  category_pantsTrousers: "Pants & Trousers",
  category_sandals: "Sandals",
  category_sandalsSlides: "Sandals & Slides",
  category_scarves: "Scarves",
  category_searchPlaceholder: "Search categories...",
  category_shirts: "Shirts",
  category_shirtsBlouses: "Shirts & Blouses",
  category_shoesType: "Shoes",
  category_shorts: "Shorts",
  category_skirts: "Skirts",
  category_sneakers: "Sneakers",
  category_suitsBlazers: "Suits & Blazers",
  category_sunglasses: "Sunglasses",
  category_sweaters: "Sweaters",
  category_sweatersHoodies: "Sweaters & Hoodies",
  category_swimwear: "Swimwear",
  category_tops: "Tops",
  category_topsTshirts: "Tops & T-Shirts",
  category_tshirts: "T-Shirts",
  category_underwear: "Underwear",
  category_vintage: "Vintage",
  category_watches: "Watches",
  
  // Collection section
  collection_addItem: "Add Item",
  collection_addToCollection: "Add to Collection",
  collection_allProducts: "All Products",
  collection_confirmDelete: "Are you sure you want to delete this collection?",
  collection_createCollection: "Create Collection",
  collection_createNew: "Create New Collection",
  collection_deleteCollection: "Delete Collection",
  collection_description: "Description",
  collection_editCollection: "Edit Collection",
  collection_emptyCollection: "This collection is empty",
  collection_items: "Items",
  collection_myCollections: "My Collections",
  collection_name: "Collection Name",
  collection_noCollections: "No collections yet",
  collection_private: "Private",
  collection_public: "Public",
  collection_removeFromCollection: "Remove from Collection",
  collection_saveChanges: "Save Changes",
  collection_selectCollection: "Select Collection",
  collection_visibility: "Visibility",
  
  // Conversation/Messages section
  conversation_archiveChat: "Archive Chat",
  conversation_block: "Block User",
  conversation_deleteConversation: "Delete Conversation",
  conversation_markAsRead: "Mark as Read",
  conversation_markAsUnread: "Mark as Unread",
  conversation_muteNotifications: "Mute Notifications",
  conversation_noMessages: "No messages yet",
  conversation_report: "Report User",
  conversation_startConversation: "Start a conversation",
  conversation_unarchive: "Unarchive",
  conversation_unmute: "Unmute Notifications",
  
  messages_new: "New Message",
  messages_noConversations: "No conversations yet",
  messages_typeMessage: "Type a message...",
  messages_sendMessage: "Send Message",
  messages_messageSent: "Message sent",
  messages_messageDeleted: "Message deleted",
  messages_conversationWith: "Conversation with {name}",
  
  // Condition section
  condition_all: "All Conditions",
  condition_brandNew: "Brand New",
  condition_brandNewWithTags: "Brand New with Tags",
  condition_excellent: "Excellent",
  condition_fair: "Fair",
  condition_good: "Good",
  condition_likeNew: "Like New",
  condition_new: "New",
  condition_newWithoutTags: "New without Tags",
  condition_poor: "Poor",
  condition_used: "Used",
  condition_worn: "Worn",
  
  // Dashboard section
  dashboard_analytics: "Analytics",
  dashboard_earnings: "Earnings",
  dashboard_inventory: "Inventory",
  dashboard_myListings: "My Listings",
  dashboard_overview: "Overview",
  dashboard_performance: "Performance",
  dashboard_purchases: "Purchases",
  dashboard_sales: "Sales",
  dashboard_settings: "Settings",
  dashboard_statistics: "Statistics",
  dashboard_welcome: "Welcome back, {name}!",
  
  // Empty states
  empty_noFavorites: "No favorites yet",
  empty_noItems: "No items found",
  empty_noListings: "No listings yet",
  empty_noOrders: "No orders yet",
  empty_noProducts: "No products found",
  empty_noResults: "No results found",
  empty_noSales: "No sales yet",
  empty_startBrowsing: "Start browsing",
  empty_startSelling: "Start selling",
  
  // Error messages
  error_fetchingData: "Error fetching data",
  error_genericError: "Something went wrong",
  error_invalidEmail: "Invalid email address",
  error_invalidInput: "Invalid input",
  error_loadingFailed: "Loading failed",
  error_networkError: "Network error",
  error_notFound: "Not found",
  error_pageNotFound: "Page not found",
  error_pleaseTryAgain: "Please try again",
  error_requiredField: "This field is required",
  error_serverError: "Server error",
  error_unauthorized: "Unauthorized",
  error_uploadFailed: "Upload failed",
  
  // Favorites section
  favorites_addToFavorites: "Add to Favorites",
  favorites_myFavorites: "My Favorites",
  favorites_removeFromFavorites: "Remove from Favorites",
  favorites_saved: "Saved to favorites",
  favorites_removed: "Removed from favorites",
  
  // Filter section
  filter_apply: "Apply Filters",
  filter_brand: "Brand",
  filter_category: "Category",
  filter_clearAll: "Clear All",
  filter_color: "Color",
  filter_condition: "Condition",
  filter_maxPrice: "Max Price",
  filter_minPrice: "Min Price",
  filter_price: "Price",
  filter_priceRange: "Price Range",
  filter_reset: "Reset Filters",
  filter_showResults: "Show Results",
  filter_size: "Size",
  filter_sortBy: "Sort By",
  
  // Footer section
  footer_aboutUs: "About Us",
  footer_allRightsReserved: "All rights reserved",
  footer_buyerProtection: "Buyer Protection",
  footer_careers: "Careers",
  footer_contactUs: "Contact Us",
  footer_copyright: "© {year} Driplo. All rights reserved.",
  footer_faq: "FAQ",
  footer_followUs: "Follow Us",
  footer_help: "Help",
  footer_howItWorks: "How It Works",
  footer_legal: "Legal",
  footer_privacyPolicy: "Privacy Policy",
  footer_returnPolicy: "Return Policy",
  footer_sellerGuide: "Seller Guide",
  footer_shippingInfo: "Shipping Info",
  footer_termsOfService: "Terms of Service",
  footer_trustAndSafety: "Trust & Safety",
  
  // Form section
  form_cancel: "Cancel",
  form_confirm: "Confirm",
  form_delete: "Delete",
  form_edit: "Edit",
  form_remove: "Remove",
  form_save: "Save",
  form_saveChanges: "Save Changes",
  form_submit: "Submit",
  form_update: "Update",
  
  // Listing section
  listing_active: "Active",
  listing_archived: "Archived",
  listing_delete: "Delete Listing",
  listing_deleteListing: "Delete Listing",
  listing_draft: "Draft",
  listing_edit: "Edit Listing",
  listing_editListing: "Edit Listing",
  listing_markAsSold: "Mark as Sold",
  listing_pause: "Pause Listing",
  listing_publish: "Publish Listing",
  listing_reactivate: "Reactivate Listing",
  listing_sold: "Sold",
  listing_status: "Status",
  listing_unpause: "Unpause Listing",
  listing_viewListing: "View Listing",
  
  // Loading states
  loading_loading: "Loading...",
  loading_pleaseWait: "Please wait...",
  loading_processing: "Processing...",
  
  // Navigation section
  nav_account: "Account",
  nav_back: "Back",
  nav_browse: "Browse",
  nav_cart: "Cart",
  nav_close: "Close",
  nav_favorites: "Favorites",
  nav_help: "Help",
  nav_home: "Home",
  nav_inbox: "Inbox",
  nav_menu: "Menu",
  nav_messages: "Messages",
  nav_myAccount: "My Account",
  nav_myListings: "My Listings",
  nav_myOrders: "My Orders",
  nav_myPurchases: "My Purchases",
  nav_mySales: "My Sales",
  nav_notifications: "Notifications",
  nav_orders: "Orders",
  nav_profile: "Profile",
  nav_purchases: "Purchases",
  nav_sales: "Sales",
  nav_search: "Search",
  nav_sell: "Sell",
  nav_settings: "Settings",
  nav_shop: "Shop",
  nav_signIn: "Sign In",
  nav_signOut: "Sign Out",
  nav_signUp: "Sign Up",
  
  // Notification section
  notification_error: "Error",
  notification_info: "Info",
  notification_success: "Success",
  notification_warning: "Warning",
  
  // Order section
  order_buyer: "Buyer",
  order_cancel: "Cancel Order",
  order_cancelOrder: "Cancel Order",
  order_cancelReason: "Cancellation Reason",
  order_cancelled: "Cancelled",
  order_completed: "Completed",
  order_confirmDelivery: "Confirm Delivery",
  order_confirmReceived: "Confirm Received",
  order_contactBuyer: "Contact Buyer",
  order_contactSeller: "Contact Seller",
  order_date: "Order Date",
  order_delivered: "Delivered",
  order_details: "Order Details",
  order_id: "Order ID",
  order_inTransit: "In Transit",
  order_markAsShipped: "Mark as Shipped",
  order_number: "Order Number",
  order_orderDetails: "Order Details",
  order_orderHistory: "Order History",
  order_orderNumber: "Order #{number}",
  order_orderSummary: "Order Summary",
  order_pending: "Pending",
  order_price: "Price",
  order_processing: "Processing",
  order_quantity: "Quantity",
  order_refund: "Refund",
  order_refunded: "Refunded",
  order_requestRefund: "Request Refund",
  order_seller: "Seller",
  order_shipped: "Shipped",
  order_shipping: "Shipping",
  order_shippingAddress: "Shipping Address",
  order_shippingMethod: "Shipping Method",
  order_status: "Order Status",
  order_subtotal: "Subtotal",
  order_tax: "Tax",
  order_total: "Total",
  order_trackOrder: "Track Order",
  order_trackShipment: "Track Shipment",
  order_trackingNumber: "Tracking Number",
  order_viewOrder: "View Order",
  
  // Payment section
  payment_addPaymentMethod: "Add Payment Method",
  payment_billingAddress: "Billing Address",
  payment_cardNumber: "Card Number",
  payment_cvv: "CVV",
  payment_expiryDate: "Expiry Date",
  payment_failed: "Payment Failed",
  payment_method: "Payment Method",
  payment_nameOnCard: "Name on Card",
  payment_paymentDetails: "Payment Details",
  payment_paymentFailed: "Payment failed",
  payment_paymentMethod: "Payment Method",
  payment_paymentSuccessful: "Payment Successful",
  payment_payNow: "Pay Now",
  payment_processing: "Processing payment...",
  payment_saveCard: "Save card for future use",
  payment_securePayment: "Secure Payment",
  payment_selectPaymentMethod: "Select Payment Method",
  payment_success: "Payment successful",
  
  // Price section
  price_free: "Free",
  price_makeAnOffer: "Make an Offer",
  price_negotiable: "Negotiable",
  price_priceReduced: "Price Reduced",
  
  // Product section
  product_addToCart: "Add to Cart",
  product_addToFavorites: "Add to Favorites",
  product_availability: "Availability",
  product_available: "Available",
  product_brand: "Brand",
  product_buyNow: "Buy Now",
  product_category: "Category",
  product_color: "Color",
  product_condition: "Condition",
  product_contactSeller: "Contact Seller",
  product_description: "Description",
  product_details: "Product Details",
  product_inStock: "In Stock",
  product_makeOffer: "Make Offer",
  product_material: "Material",
  product_outOfStock: "Out of Stock",
  product_price: "Price",
  product_productDetails: "Product Details",
  product_quantity: "Quantity",
  product_relatedProducts: "Related Products",
  product_seller: "Seller",
  product_share: "Share",
  product_size: "Size",
  product_sku: "SKU",
  product_sold: "Sold",
  product_specifications: "Specifications",
  product_unavailable: "Unavailable",
  product_viewAll: "View All",
  product_viewDetails: "View Details",
  product_viewProduct: "View Product",
  product_youMayAlsoLike: "You May Also Like",
  
  // Profile section
  profile_about: "About",
  profile_bio: "Bio",
  profile_editProfile: "Edit Profile",
  profile_favorites: "Favorites",
  profile_feedback: "Feedback",
  profile_followers: "Followers",
  profile_following: "Following",
  profile_items: "Items",
  profile_joinDate: "Joined {date}",
  profile_joined: "Joined",
  profile_listings: "Listings",
  profile_location: "Location",
  profile_memberSince: "Member since {date}",
  profile_profilePicture: "Profile Picture",
  profile_rating: "Rating",
  profile_reviews: "Reviews",
  profile_sales: "Sales",
  profile_seller: "Seller",
  profile_sellerProfile: "Seller Profile",
  profile_username: "Username",
  profile_verifiedSeller: "Verified Seller",
  profile_viewProfile: "View Profile",
  
  // Rating section
  rating_excellent: "Excellent",
  rating_good: "Good",
  rating_poor: "Poor",
  rating_rateExperience: "Rate your experience",
  rating_rating: "Rating",
  rating_reviews: "Reviews",
  
  // Search section
  search_allCategories: "All Categories",
  search_clearFilters: "Clear Filters",
  search_clearSearch: "Clear Search",
  search_filter: "Filter",
  search_filterBy: "Filter By",
  search_noResults: "No results found",
  search_noResultsFor: "No results for \"{query}\"",
  search_popularSearches: "Popular Searches",
  search_recentSearches: "Recent Searches",
  search_resultsFor: "Results for \"{query}\"",
  search_search: "Search",
  search_searchPlaceholder: "Search for items...",
  search_searchProducts: "Search products",
  search_searchResults: "Search Results",
  search_showing: "Showing {count} results",
  search_sortBy: "Sort By",
  search_suggestions: "Suggestions",
  search_tryAdjustingFilters: "Try adjusting your filters",
  
  // Sell section
  sell_addImages: "Add Images",
  sell_addListing: "Add Listing",
  sell_addPhotos: "Add Photos",
  sell_brand: "Brand",
  sell_category: "Category",
  sell_condition: "Condition",
  sell_condition_brandNewWithTags: "Brand New with Tags",
  sell_condition_fair: "Fair",
  sell_condition_good: "Good",
  sell_condition_likeNew: "Like New",
  sell_condition_newWithoutTags: "New without Tags",
  sell_condition_worn: "Worn",
  sell_createListing: "Create Listing",
  sell_description: "Description",
  sell_descriptionPlaceholder: "Describe your item in detail...",
  sell_listItem: "List Item",
  sell_listYourItem: "List Your Item",
  sell_photos: "Photos",
  sell_price: "Price",
  sell_productDetails: "Product Details",
  sell_publish: "Publish",
  sell_saveDraft: "Save Draft",
  sell_sellAnItem: "Sell an Item",
  sell_shipping: "Shipping",
  sell_size: "Size",
  sell_startSelling: "Start Selling",
  sell_title: "Title",
  sell_titlePlaceholder: "Item title",
  sell_uploadPhotos: "Upload Photos",
  
  // Seller section
  seller_aboutSeller: "About Seller",
  seller_allListings: "All Listings",
  seller_contactSeller: "Contact Seller",
  seller_followers: "Followers",
  seller_items: "Items",
  seller_ratings: "Ratings",
  seller_reviews: "Reviews",
  seller_seller: "Seller",
  seller_sellerInfo: "Seller Info",
  seller_sellerProfile: "Seller Profile",
  seller_since: "Seller since {date}",
  seller_totalSales: "Total Sales",
  seller_unknown: "Unknown Seller",
  seller_verified: "Verified Seller",
  seller_viewAllListings: "View All Listings",
  seller_viewProfile: "View Profile",
  
  // Settings section
  settings_account: "Account",
  settings_appearance: "Appearance",
  settings_billing: "Billing",
  settings_changePassword: "Change Password",
  settings_currentPassword: "Current Password",
  settings_deleteAccount: "Delete Account",
  settings_email: "Email",
  settings_emailNotifications: "Email Notifications",
  settings_language: "Language",
  settings_newPassword: "New Password",
  settings_notifications: "Notifications",
  settings_password: "Password",
  settings_paymentMethods: "Payment Methods",
  settings_privacy: "Privacy",
  settings_profile: "Profile",
  settings_pushNotifications: "Push Notifications",
  settings_security: "Security",
  settings_shippingAddress: "Shipping Address",
  settings_twoFactorAuth: "Two-Factor Authentication",
  settings_updateEmail: "Update Email",
  settings_updatePassword: "Update Password",
  
  // Shipping section
  shipping_carrier: "Carrier",
  shipping_deliveryDate: "Delivery Date",
  shipping_estimatedDelivery: "Estimated Delivery",
  shipping_freeShipping: "Free Shipping",
  shipping_overnight: "Overnight",
  shipping_selectShipping: "Select Shipping Method",
  shipping_shippingAddress: "Shipping Address",
  shipping_shippingCost: "Shipping Cost",
  shipping_shippingDetails: "Shipping Details",
  shipping_shippingInfo: "Shipping Information",
  shipping_shippingMethod: "Shipping Method",
  shipping_standard: "Standard",
  shipping_trackingNumber: "Tracking Number",
  shipping_twoDay: "Two-Day",
  
  // Sort section
  sort_mostRecent: "Most Recent",
  sort_priceLowToHigh: "Price: Low to High",
  sort_priceHighToLow: "Price: High to Low",
  sort_popular: "Popular",
  sort_relevance: "Relevance",
  
  // Status section
  status_active: "Active",
  status_cancelled: "Cancelled",
  status_completed: "Completed",
  status_draft: "Draft",
  status_inactive: "Inactive",
  status_pending: "Pending",
  status_processing: "Processing",
  
  // Success messages
  success_accountCreated: "Account created successfully",
  success_accountUpdated: "Account updated successfully",
  success_listingCreated: "Listing created successfully",
  success_listingDeleted: "Listing deleted successfully",
  success_listingUpdated: "Listing updated successfully",
  success_messageSent: "Message sent successfully",
  success_orderPlaced: "Order placed successfully",
  success_passwordChanged: "Password changed successfully",
  success_paymentReceived: "Payment received",
  success_profileUpdated: "Profile updated successfully",
  success_saved: "Saved successfully",
  
  // Time section
  time_daysAgo: "{count} days ago",
  time_hoursAgo: "{count} hours ago",
  time_justNow: "Just now",
  time_minutesAgo: "{count} minutes ago",
  time_monthsAgo: "{count} months ago",
  time_weeksAgo: "{count} weeks ago",
  time_yearsAgo: "{count} years ago",
  
  // Transaction section
  transaction_amount: "Amount",
  transaction_date: "Date",
  transaction_details: "Transaction Details",
  transaction_history: "Transaction History",
  transaction_id: "Transaction ID",
  transaction_method: "Method",
  transaction_status: "Status",
  transaction_type: "Type",
  
  // Trending section
  trending_hotDeals: "Hot Deals",
  trending_newArrivals: "New Arrivals",
  trending_newSeller: "New Seller",
  trending_popularBrands: "Popular Brands",
  trending_trendingNow: "Trending Now",
  
  // User section
  user_buyer: "Buyer",
  user_member: "Member",
  user_seller: "Seller",
  user_username: "Username",
  user_verifiedBuyer: "Verified Buyer",
  user_verifiedSeller: "Verified Seller",
};

console.log('🚀 Adding missing i18n keys (Paraglide v2 + SvelteKit 2 best practices)');
console.log(`📝 Total keys to add: ${Object.keys(missingKeys).length}`);

// Paths
const enPath = path.join(process.cwd(), 'packages', 'i18n', 'messages', 'en.json');
const bgPath = path.join(process.cwd(), 'packages', 'i18n', 'messages', 'bg.json');

// Read existing files
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const bgData = JSON.parse(fs.readFileSync(bgPath, 'utf8'));

console.log(`📖 Current EN keys: ${Object.keys(enData).length}`);
console.log(`📖 Current BG keys: ${Object.keys(bgData).length}`);

// Add missing keys to both files
let addedCount = 0;
for (const [key, value] of Object.entries(missingKeys)) {
  if (!enData[key]) {
    enData[key] = value;
    bgData[key] = value; // Use English as placeholder for Bulgarian
    addedCount++;
  }
}

// Sort keys alphabetically for better organization
const sortedEn = Object.keys(enData).sort().reduce((acc, key) => {
  acc[key] = enData[key];
  return acc;
}, {});

const sortedBg = Object.keys(bgData).sort().reduce((acc, key) => {
  acc[key] = bgData[key];
  return acc;
}, {});

// Write back to files with proper formatting
fs.writeFileSync(enPath, JSON.stringify(sortedEn, null, 2) + '\n', 'utf8');
fs.writeFileSync(bgPath, JSON.stringify(sortedBg, null, 2) + '\n', 'utf8');

console.log(`✅ Added ${addedCount} new keys`);
console.log(`📊 Total EN keys now: ${Object.keys(sortedEn).length}`);
console.log(`📊 Total BG keys now: ${Object.keys(sortedBg).length}`);
console.log('');
console.log('✨ Next steps:');
console.log('1. Run: pnpm exec paraglide-js compile --project ./packages/i18n/project.inlang --outdir ./packages/i18n/src/paraglide');
console.log('2. Run: cd apps/web && pnpm run build');
console.log('3. Verify TypeScript errors reduced from 2593 → ~600');
console.log('');
console.log('📝 Note: Bulgarian translations use English as placeholder.');
console.log('   You can update them later in packages/i18n/messages/bg.json');
