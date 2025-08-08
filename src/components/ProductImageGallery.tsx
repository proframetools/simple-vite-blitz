
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
}

interface ProductImageGalleryProps {
  productId: string;
  primaryImage: string;
}

const ProductImageGallery = ({ productId, primaryImage }: ProductImageGalleryProps) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductImages();
  }, [productId]);

  const fetchProductImages = async () => {
    try {
      // Try to load active preview images from Supabase
      const { data, error } = await supabase
        .from('preview_images')
        .select('id, image_url, alt_text, sort_order, created_at')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching preview images:', error);
      }

      if (data && data.length > 0) {
        const mapped: ProductImage[] = data.map((d: any, idx: number) => ({
          id: d.id,
          image_url: d.image_url,
          alt_text: d.alt_text ?? 'Frame preview',
          sort_order: d.sort_order ?? idx,
        }));
        setImages(mapped);
      } else {
        // Fallback to primary image and local material textures
        setImages([
          { id: 'primary', image_url: primaryImage, alt_text: 'Product image', sort_order: 0 },
          { id: 'mat-black', image_url: '/materials/black_wood_thick_1x1.png', alt_text: 'Black wood texture preview', sort_order: 1 },
          { id: 'mat-brown', image_url: '/materials/brown_wood_thick_1x1.png', alt_text: 'Brown wood texture preview', sort_order: 2 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching product images:', error);
      // Fallback to primary image and local material textures
      setImages([
        { id: 'primary', image_url: primaryImage, alt_text: 'Product image', sort_order: 0 },
        { id: 'mat-black', image_url: '/materials/black_wood_thick_1x1.png', alt_text: 'Black wood texture preview', sort_order: 1 },
        { id: 'mat-brown', image_url: '/materials/brown_wood_thick_1x1.png', alt_text: 'Brown wood texture preview', sort_order: 2 },
      ]);
    } finally {
      setSelectedImageIndex(0);
      setLoading(false);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return <div className="aspect-square bg-muted rounded-lg animate-pulse" />;
  }

  const currentImage = images[selectedImageIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img
          src={currentImage.image_url}
          alt={currentImage.alt_text || 'Product image'}
          className="w-full h-full object-cover"
        />
        
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={previousImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                index === selectedImageIndex ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || 'Product thumbnail'}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
