// WhatsApp photo attachment utilities
// Handles photo processing and sharing for WhatsApp orders

import { toast } from 'sonner';

// Convert file to base64 for sharing
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Compress image for WhatsApp sharing (max 5MB recommended)
export const compressImage = (file: File, maxSizeMB: number = 5): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions to keep under size limit
      let { width, height } = img;
      const maxDimension = 1920; // Max dimension for WhatsApp
      
      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with quality adjustment
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        },
        'image/jpeg',
        0.8 // Quality setting
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Create a downloadable image for manual WhatsApp sharing
export const createDownloadablePhoto = async (file: File, orderDetails: string): Promise<void> => {
  try {
    const compressedFile = await compressImage(file);
    
    // Create download link
    const url = URL.createObjectURL(compressedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = `framecraft-order-${Date.now()}.jpg`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    // Show instructions
    toast.success('Photo downloaded! Please attach it manually to your WhatsApp message.', {
      duration: 5000,
    });
    
    // Copy order details to clipboard
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(orderDetails);
      toast.info('Order details copied to clipboard!');
    }
    
  } catch (error) {
    console.error('Error creating downloadable photo:', error);
    toast.error('Failed to process photo for download');
  }
};

// Generate file info for order message
export const getPhotoInfo = (file: File): string => {
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  return `Photo: ${file.name} (${sizeInMB}MB)`;
};

// Validate photo for WhatsApp sharing
export const validatePhotoForWhatsApp = (file: File): { isValid: boolean; message?: string } => {
  const maxSize = 50 * 1024 * 1024; // 50MB limit
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: 'Please upload a valid image file (JPEG, PNG, or WebP)'
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: 'Photo size must be under 50MB for WhatsApp sharing'
    };
  }
  
  return { isValid: true };
};

// Create enhanced WhatsApp message with photo instructions
export const createWhatsAppMessageWithPhoto = (
  baseMessage: string,
  hasPhoto: boolean,
  photoInfo?: string
): string => {
  let message = baseMessage;
  
  if (hasPhoto && photoInfo) {
    message += `\n\n📸 *Photo Details:*\n${photoInfo}`;
    message += `\n\n📌 *Note:* I'll send the photo separately in WhatsApp after this message.`;
  } else if (hasPhoto) {
    message += `\n\n📸 *Photo:* I have a photo ready to share once we connect on WhatsApp.`;
  }
  
  message += `\n\n💬 Looking forward to hearing from you soon!`;
  
  return message;
};

// Handle photo sharing workflow
export const handlePhotoShareWorkflow = async (
  file: File | null,
  orderMessage: string,
  onSuccess?: () => void
): Promise<void> => {
  try {
    if (!file) {
      // No photo, just open WhatsApp with message
      const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(orderMessage)}`;
      window.open(whatsappUrl, '_blank');
      onSuccess?.();
      return;
    }
    
    // Validate photo
    const validation = validatePhotoForWhatsApp(file);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }
    
    // Get photo info
    const photoInfo = getPhotoInfo(file);
    
    // Create enhanced message with photo instructions
    const enhancedMessage = createWhatsAppMessageWithPhoto(orderMessage, true, photoInfo);
    
    // Open WhatsApp with message
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(enhancedMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    // Download photo for manual attachment
    await createDownloadablePhoto(file, enhancedMessage);
    
    // Show success message with instructions
    toast.success('WhatsApp opened! Please attach the downloaded photo to your message.', {
      duration: 8000,
    });
    
    onSuccess?.();
    
  } catch (error) {
    console.error('Error in photo share workflow:', error);
    toast.error('Failed to process photo for WhatsApp sharing');
  }
};

// Mobile-specific photo sharing (if supported)
export const canSharePhotosDirectly = (): boolean => {
  return (
    navigator.share !== undefined &&
    'files' in navigator &&
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
};

// Try to share photo directly on mobile (if supported)
export const sharePhotoDirectly = async (
  file: File,
  orderMessage: string
): Promise<boolean> => {
  if (!canSharePhotosDirectly()) {
    return false;
  }
  
  try {
    await navigator.share({
      title: 'FrameCraft Order Photo',
      text: orderMessage,
      files: [file]
    });
    
    toast.success('Photo shared successfully!');
    return true;
  } catch (error) {
    console.error('Direct photo sharing failed:', error);
    return false;
  }
}; 