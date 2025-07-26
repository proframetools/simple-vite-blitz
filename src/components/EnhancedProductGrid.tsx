import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Star, Heart, ShoppingCart, Eye, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import ProductFilters from './ProductFilters';
import ProductSearch from './ProductSearch';
import frameCollection from '@/assets/frame-collection.jpg';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { openWhatsAppInquiry } from '@/lib/whatsapp';
import { formatPrice, PRICE_RANGES } from '@/lib/currency';

interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  material: string;
  style: string;
  image_url: string | null;
  stock_quantity: number | null;
  average_rating: number | null;
  review_count: number | null;
  popularity_score: number | null;
  created_at?: string;
  product_images?: Array<{
    image_url: string;
    alt_text: string | null;
    is_primary: boolean;
    sort_order: number;
  }>;
}

interface FilterState {
  categories: string[];
  occasions: string[];
  materials: string[];
  priceRange: [number, number];
  inStock: boolean;
  minRating: number;
}

type SortOption = 'popularity' | 'price_low' | 'price_high' | 'newest' | 'rating' | 'name';

export default function EnhancedProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    occasions: [],
    materials: [],
    priceRange: [PRICE_RANGES.DEFAULT_MIN, PRICE_RANGES.DEFAULT_MAX],
    inStock: false,
    minRating: 0,
  });

  useEffect(() => {
    fetchProducts();
    loadWishlist();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, filters, searchQuery, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Simple query that works with existing database schema
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
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

  const toggleWishlist = useCallback((productId: string, productName: string) => {
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
  }, [wishlist]);

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.material.toLowerCase().includes(query) ||
        product.style.toLowerCase().includes(query)
      );
    }

    // Apply material filter
    if (filters.materials.length > 0) {
      filtered = filtered.filter(product =>
        filters.materials.includes(product.material)
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product =>
      product.base_price >= filters.priceRange[0] &&
      product.base_price <= filters.priceRange[1]
    );

    // Apply stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product =>
        product.stock_quantity && product.stock_quantity > 0
      );
    }

    // Apply rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(product =>
        product.average_rating && product.average_rating >= filters.minRating
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.popularity_score || 0) - (a.popularity_score || 0);
        case 'price_low':
          return a.base_price - b.base_price;
        case 'price_high':
          return b.base_price - a.base_price;
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    setFilteredProducts(filtered);
  }, [products, filters, searchQuery, sortBy]);

  const handleAddToCart = (productId: string, productName: string) => {
    toast.success(`${productName} added to cart!`);
    // TODO: Implement cart functionality
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

  const getProductImage = (product: Product) => {
    // Use primary image if available, otherwise use product.image_url or fallback
    const primaryImage = product.product_images?.find(img => img.is_primary);
    return primaryImage?.image_url || product.image_url || frameCollection;
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Frame Collection
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover our curated selection of premium photo frames, each designed 
            to perfectly complement your cherished memories.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <ProductSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetTitle>Filters</SheetTitle>
                <div className="mt-6">
                  <ProductFilters filters={filters} onFiltersChange={setFilters} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-6">
              <ProductFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-hover transition-smooth overflow-hidden">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
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
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
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
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {product.material}
                        </Badge>
                      </div>
                      <span className="text-2xl font-bold text-foreground">
                        {formatPrice(product.base_price)}
                      </span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-6 pt-0">
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="elegant" 
                        className="flex-1"
                        onClick={() => handleAddToCart(product.id, product.name)}
                        disabled={product.stock_quantity === 0}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                      <Button variant="premium" className="flex-1">
                        Customize
                      </Button>
                    </div>
                    <div className="mt-3 w-full">
                      <WhatsAppButton 
                        onClick={() => openWhatsAppInquiry(product.name)}
                        size="sm"
                        className="w-full"
                      >
                        Quick WhatsApp Inquiry
                      </WhatsAppButton>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground mb-4">
                  No products found matching your criteria.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                                      setFilters({
                    categories: [],
                    occasions: [],
                    materials: [],
                    priceRange: [PRICE_RANGES.DEFAULT_MIN, PRICE_RANGES.DEFAULT_MAX],
                    inStock: false,
                    minRating: 0,
                  });
                    setSearchQuery('');
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}