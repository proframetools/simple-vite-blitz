import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/currency';
import frameCollection from '@/assets/frame-collection.jpg';

interface Product {
  id: string;
  name: string;
  base_price: number;
  material: string;
  style: string;
  image_url: string | null;
  average_rating: number | null;
  review_count: number | null;
  product_images?: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

interface ProductCarouselSimpleProps {
  title: string;
  limit?: number;
  category?: string;
  showControls?: boolean;
}

export const ProductCarouselSimple: React.FC<ProductCarouselSimpleProps> = ({
  title,
  limit = 4,
  category,
  showControls = true
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [category, limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          base_price,
          material,
          style,
          image_url
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (category) {
        // Add category filtering if needed - ensure proper type casting
        query = query.eq('material', category as 'wood' | 'metal' | 'acrylic' | 'composite');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Add mock ratings for display
      const productsWithMockData = (data || []).map(product => ({
        ...product,
        average_rating: 4.0 + (Math.random() * 1.0), // 4.0-5.0 stars
        review_count: Math.floor(Math.random() * 50) + 10, // 10-60 reviews
        product_images: [] // Empty array for now
      }));
      
      setProducts(productsWithMockData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex(prev => prev >= products.length - 1 ? 0 : prev + 1);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => prev <= 0 ? products.length - 1 : prev - 1);
  };

  const getProductImage = (product: Product) => {
    const primaryImage = product.product_images?.find(img => img.is_primary);
    return primaryImage?.image_url || product.image_url || frameCollection;
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-48"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        {showControls && products.length > 4 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.slice(currentIndex, currentIndex + 4).map((product) => (
          <Card 
            key={product.id} 
            className="group hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleProductClick(product.id)}
          >
            <div className="relative aspect-square overflow-hidden rounded-t-lg">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <Badge 
                variant="secondary" 
                className="absolute top-2 left-2 text-xs"
              >
                {product.style}
              </Badge>
            </div>
            
            <CardContent className="p-3">
              <h4 className="font-medium text-sm line-clamp-1 mb-1">
                {product.name}
              </h4>
              
              {product.average_rating && (
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.average_rating!)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.review_count})
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {product.material}
                </span>
                <span className="font-bold text-sm">
                  {formatPrice(product.base_price)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductCarouselSimple; 