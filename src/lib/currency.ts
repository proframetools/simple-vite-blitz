// Currency utilities for Indian market
// Handles INR formatting, conversions, and price calculations

// Indian Rupee formatting function
export const formatIndianCurrency = (amount: number): string => {
  // Format as ₹X,XXX using Indian number formatting
  const formatted = amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  // Remove 'INR' and replace with ₹ symbol for cleaner display
  return formatted.replace('INR', '').replace(/^\s*/, '₹').trim();
};

// Alternative simple formatting for when you just want ₹X,XXX
export const formatPrice = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format price with decimals when needed
export const formatPriceWithDecimals = (amount: number): string => {
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace('INR', '').replace(/^\s*/, '₹').trim();
};

// Convert USD prices to INR (for migration from existing $ prices)
// Current exchange rate approximation: 1 USD = 83 INR
export const convertUSDToINR = (usdAmount: number): number => {
  const exchangeRate = 83; // Update this rate as needed
  return Math.round(usdAmount * exchangeRate);
};

// Price range constants for Indian market
export const PRICE_RANGES = {
  MIN: 500,
  MAX: 5000,
  DEFAULT_MIN: 500,
  DEFAULT_MAX: 5000,
  RANGES: [
    { label: 'Under ₹1,000', min: 0, max: 1000 },
    { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
    { label: '₹2,000 - ₹3,000', min: 2000, max: 3000 },
    { label: '₹3,000 - ₹4,000', min: 3000, max: 4000 },
    { label: '₹4,000+', min: 4000, max: 10000 },
  ]
};

// Standard frame sizes with Indian pricing
export const STANDARD_SIZES_INR = [
  { size: '5" x 7"', basePrice: 500 },
  { size: '8" x 10"', basePrice: 750 },
  { size: '11" x 14"', basePrice: 1200 },
  { size: '16" x 20"', basePrice: 2000 },
  { size: '18" x 24"', basePrice: 2800 },
  { size: '24" x 36"', basePrice: 4200 },
];

// Material pricing adjustments in INR
export const MATERIAL_PRICING_INR = {
  wood: { multiplier: 1.0, label: 'Wood (Standard)' },
  metal: { multiplier: 1.2, label: 'Metal (+20%)' },
  acrylic: { multiplier: 1.15, label: 'Acrylic (+15%)' },
  composite: { multiplier: 1.3, label: 'Composite (+30%)' }
};

// Color pricing adjustments in INR
export const COLOR_PRICING_INR = {
  natural: { adjustment: 0, label: 'Natural' },
  stained: { adjustment: 200, label: 'Stained (+₹200)' },
  painted: { adjustment: 300, label: 'Painted (+₹300)' },
  metallic: { adjustment: 500, label: 'Metallic (+₹500)' }
};

// Calculate total price with all factors
export const calculateTotalPrice = (
  basePrice: number,
  size?: { price_multiplier: number },
  material?: { multiplier: number },
  colorAdjustment: number = 0,
  customSizeMultiplier: number = 1,
  isCustomSize: boolean = false
): number => {
  let total = basePrice;
  
  // Apply size multiplier
  if (size) {
    total *= size.price_multiplier;
  }
  
  // Apply material multiplier
  if (material) {
    total *= material.multiplier;
  }
  
  // Apply color adjustment
  total += colorAdjustment;
  
  // Apply custom size premium (typically 20% extra)
  if (isCustomSize) {
    total *= (customSizeMultiplier * 1.2);
  }
  
  return Math.round(total);
};

// Format price range string
export const formatPriceRange = (min: number, max: number): string => {
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

// Parse price string back to number (for form inputs)
export const parsePriceString = (priceString: string): number => {
  return parseInt(priceString.replace(/[₹,]/g, '')) || 0;
};

// Validate price is within acceptable range
export const validatePrice = (price: number): boolean => {
  return price >= PRICE_RANGES.MIN && price <= PRICE_RANGES.MAX;
};

// Get price category for a given amount
export const getPriceCategory = (price: number): string => {
  const range = PRICE_RANGES.RANGES.find(r => price >= r.min && price <= r.max);
  return range?.label || 'Custom Range';
};

// Format discount percentage
export const formatDiscount = (originalPrice: number, discountedPrice: number): string => {
  const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  return `${discount}% OFF`;
};

// Tax calculation (GST for India)
export const calculateGST = (price: number, gstRate: number = 18): number => {
  return Math.round((price * gstRate) / 100);
};

// Price with GST
export const getPriceWithGST = (price: number, gstRate: number = 18): number => {
  return price + calculateGST(price, gstRate);
}; 