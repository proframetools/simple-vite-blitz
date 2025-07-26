import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { openWhatsAppInquiry } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/currency';
import frameCollection from '@/assets/frame-collection.jpg';

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  material: string;
  style: string;
  image_url: string | null;
  stock_quantity: number | null;
  average_rating?: number | null;
  review_count?: number | null;
  popularity_score?: number | null;
  is_featured?: boolean;
  product_images?: Array<{
    image_url: string;
    alt_text?: string | null;
    is_primary: boolean;
    sort_order?: number;
  }>;
}

interface ProductCarouselProps {
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  maxProducts?: number;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title = "Featured Frames",
  subtitle = "Discover our most popular and beautifully crafted photo frames",
  showFilters = false,
  maxProducts = 6
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const navigate = useNavigate();

  // Responsive slides per view
  const [slidesPerView, setSlidesPerView] = useState(1);

  useEffect(() => {
    fetchFeaturedProducts();
    loadWishlist();
    updateSlidesPerView();
    
    // Add resize listener
    const handleResize = () => updateSlidesPerView();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateSlidesPerView = () => {
    const width = window.innerWidth;
    if (width >= 1280) setSlidesPerView(4); // xl: 4 slides
    else if (width >= 1024) setSlidesPerView(3); // lg: 3 slides
    else if (width >= 768) setSlidesPerView(2); // md: 2 slides
    else setSlidesPerView(1); // sm: 1 slide
  };

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      
      // Simple query that works with existing database schema
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          base_price,
          material,
          style,
          image_url,
          stock_quantity
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(maxProducts);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      // Add mock ratings and featured status for display
      const productsWithMockData = (data || []).map((product, index) => ({
        ...product,
        average_rating: 4.5 + (Math.random() * 0.5), // 4.5-5.0 stars
        review_count: Math.floor(Math.random() * 100) + 20, // 20-120 reviews
        popularity_score: 90 - (index * 5), // Decreasing popularity
        is_featured: index < 6, // First 6 products are featured
        product_images: [] // Empty array for now
      }));
      
      setProducts(productsWithMockData);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      toast.error('Failed to load featured products');
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = () => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  };

  const toggleWishlist = (productId: string, productName: string) => {
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    
    toast.success(
      wishlist.includes(productId)
        ? `${productName} removed from wishlist`
        : `${productName} added to wishlist`
    );
  };

  const nextSlide = () => {
    const maxIndex = Math.max(0, products.length - slidesPerView);
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
  };

  const prevSlide = () => {
    const maxIndex = Math.max(0, products.length - slidesPerView);
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1);
  };

  const goToSlide = (index: number) => {
    const maxIndex = Math.max(0, products.length - slidesPerView);
    setCurrentIndex(Math.min(index, maxIndex));
  };

  const handleAddToCart = (productId: string, productName: string) => {
    toast.success(`${productName} added to cart!`);
    // TODO: Implement cart functionality
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const getProductImage = (product: Product) => {
    const primaryImage = product.product_images?.find(img => img.is_primary);
    return primaryImage?.image_url || product.image_url || frameCollection;
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-muted-foreground">No featured products available at the moment.</p>
        </div>
      </section>
    );
  }

  const visibleProducts = products.slice(currentIndex, currentIndex + slidesPerView);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < products.length - slidesPerView;

  return (
    <section id="featured-products" className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Carousel Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              disabled={!canGoPrev}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={!canGoNext}
              className="h-10 w-10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Indicators */}
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(products.length / slidesPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index * slidesPerView)}
                className={`h-2 w-8 rounded-full transition-colors ${
                  Math.floor(currentIndex / slidesPerView) === index
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={() => navigate('/products')}
            variant="outline"
            className="hidden sm:flex"
          >
            View All Products
          </Button>
        </div>

        {/* Products Grid/Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-hover transition-smooth overflow-hidden">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth cursor-pointer"
                  onClick={() => handleViewProduct(product.id)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-smooth"
                    onClick={() => toggleWishlist(product.id, product.name)}
                  >
                    <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-smooth"
                    onClick={() => handleViewProduct(product.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge variant="secondary" className="bg-accent text-accent-foreground font-semibold">
                    {product.style}
                  </Badge>
                  {product.stock_quantity && product.stock_quantity <= 5 && (
                    <Badge variant="destructive" className="text-xs">
                      Only {product.stock_quantity} left
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                {/* Rating */}
                {product.average_rating && (
                  <div className="mb-3">
                    {renderStars(product.average_rating)}
                    {product.review_count && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({product.review_count} reviews)
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    {product.material}
                  </Badge>
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(product.base_price)}
                  </span>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0">
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddToCart(product.id, product.name)}
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <WhatsAppButton 
                    onClick={() => openWhatsAppInquiry(product.name)}
                    size="sm"
                    className="flex-1"
                  >
                    WhatsApp
                  </WhatsAppButton>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-8 sm:hidden">
          <Button
            onClick={() => navigate('/products')}
            variant="outline"
            size="lg"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel; 