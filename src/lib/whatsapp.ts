// WhatsApp utility functions for FrameCraft
// Handles message formatting, link generation, and order processing

// Business WhatsApp number (replace with actual number)
export const BUSINESS_WHATSAPP_NUMBER = "+919876543210"; // Replace with actual number

// Types for order data
export interface FrameOrder {
  frameName: string;
  size?: {
    display_name: string;
    width_inches: number;
    height_inches: number;
  };
  customDimensions?: {
    width: number;
    height: number;
    unit: 'inches' | 'cm';
  };
  orientation?: 'portrait' | 'landscape';
  material: string;
  color?: {
    name: string;
  };
  thickness?: {
    name: string;
  };
  matting?: {
    name: string;
  };
  totalPrice: number;
  hasPhoto: boolean;
  customerDetails?: {
    city?: string;
    state?: string;
  };
  specialInstructions?: string;
}

// Generate WhatsApp URL with pre-filled message
export const generateWhatsAppURL = (message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodedMessage}`;
};

// Import currency formatting from dedicated currency utility
import { formatIndianCurrency } from './currency';

// Generate order summary message for WhatsApp
export const generateOrderMessage = (order: FrameOrder): string => {
  const sizeText = order.size 
    ? `${order.size.display_name} (${order.size.width_inches}" × ${order.size.height_inches}")`
    : order.customDimensions
    ? `Custom: ${order.customDimensions.width} × ${order.customDimensions.height} ${order.customDimensions.unit}`
    : 'Standard size';

  const orientationText = order.orientation ? ` - ${order.orientation}` : '';
  
  let message = `Hi FrameCraft! I'm interested in ordering:

🖼️ *Frame Details:*
• Frame: ${order.frameName}
• Size: ${sizeText}${orientationText}
• Material: ${order.material}`;

  if (order.color) {
    message += `\n• Color: ${order.color.name}`;
  }

  if (order.thickness) {
    message += `\n• Thickness: ${order.thickness.name}`;
  }

  if (order.matting) {
    message += `\n• Matting: ${order.matting.name}`;
  }

  message += `\n\n💰 *Total Price: ${formatIndianCurrency(order.totalPrice)}*`;

  message += `\n\n📸 *Photo: ${order.hasPhoto ? 'Will attach separately' : 'No photo uploaded yet'}*`;

  if (order.specialInstructions) {
    message += `\n\n📝 *Special Instructions:*\n${order.specialInstructions}`;
  }

  if (order.customerDetails?.city || order.customerDetails?.state) {
    const location = [order.customerDetails.city, order.customerDetails.state].filter(Boolean).join(', ');
    message += `\n\n📍 *Delivery Location:* ${location}`;
  }

  message += `\n\nPlease confirm availability and delivery time. Thank you! 🙏`;

  return message;
};

// Generate quick inquiry message
export const generateQuickInquiryMessage = (productName?: string): string => {
  const baseMessage = `Hi FrameCraft! I'm interested in learning more about your custom photo frames.`;
  
  if (productName) {
    return `${baseMessage}\n\nI saw the "${productName}" and would like to know more about customization options and pricing.\n\nCould you please provide more details? Thank you! 🙏`;
  }
  
  return `${baseMessage}\n\nCould you please share more information about your products and pricing?\n\nThank you! 🙏`;
};

// Generate catalog inquiry message
export const generateCatalogInquiryMessage = (): string => {
  return `Hi FrameCraft! 👋

I'm looking for custom photo frames and would love to see your full catalog.

Could you please share:
• Available frame styles and materials
• Size options and pricing
• Customization possibilities
• Delivery information

Thank you! 🙏`;
};

// Generate business hours inquiry
export const generateBusinessHoursMessage = (): string => {
  return `Hi FrameCraft! 👋

I'd like to know your business hours and the best time to contact you for discussing my custom frame requirements.

Also, could you please share your location details if I want to visit your workshop?

Thank you! 🙏`;
};

// Open WhatsApp with pre-filled message
export const openWhatsApp = (message: string): void => {
  const url = generateWhatsAppURL(message);
  window.open(url, '_blank');
};

// Open WhatsApp with order details
export const openWhatsAppWithOrder = (order: FrameOrder): void => {
  const message = generateOrderMessage(order);
  openWhatsApp(message);
};

// Open WhatsApp with quick inquiry
export const openWhatsAppInquiry = (productName?: string): void => {
  const message = generateQuickInquiryMessage(productName);
  openWhatsApp(message);
};

// Utility to check if WhatsApp is available (mobile detection)
export const isWhatsAppAvailable = (): boolean => {
  // Simple mobile detection
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Generate sharing text for social media
export const generateShareText = (productName: string): string => {
  return `Check out this beautiful custom photo frame: ${productName} at FrameCraft! 🖼️✨`;
}; 