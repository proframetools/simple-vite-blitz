import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Filter, Search, Heart, ShoppingCart, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { openWhatsAppInquiry } from '@/lib/whatsapp';
import { formatPrice, PRICE_RANGES } from '@/lib/currency';
import { Database } from '@/integrations/supabase/types';

// Use database types
type Product = Database['public']['Tables']['products']['Row'];

interface EnhancedProductGridProps {
  category?: string;
  searchQuery?: string;
  priceRange?: string;
  sortBy?: string;
  itemsPerPage?: number;
  showFilters?: boolean;
}

const EnhancedProductGrid: React.FC<EnhancedProductGridProps> = ({
  category,
  searchQuery = '',
  priceRange,
  sortBy = 'name',
  itemsPerPage = 12,
  showFilters = true
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localCategory, setLocalCategory] = useState(category || '');
  const [localPriceRange, setLocalPriceRange] = useState(priceRange || '');
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, [localCategory, localSearchQuery, localPriceRange, localSortBy, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
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

  const handleProductClick = (product: Product) => {
    window.location.href = `/product/${product.id}`;
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    // For now, open WhatsApp inquiry
    openWhatsAppInquiry(
      `I'm interested in ordering the ${product.name}. Can you help me with customization options and pricing?`
    );
  };

  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        toast.success('Removed from favorites');
      } else {
        newFavorites.add(productId);
        toast.success('Added to favorites');
      }
      return newFavorites;
    });
  };

  const filteredProducts = products.filter(product => {
    // Search filter
    if (localSearchQuery && !product.name.toLowerCase().includes(localSearchQuery.toLowerCase()) &&
        !product.description?.toLowerCase().includes(localSearchQuery.toLowerCase()) &&
        !product.category?.toLowerCase().includes(localSearchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (localCategory && product.category !== localCategory) {
      return false;
    }

    // Price range filter
    if (localPriceRange) {
      const range = PRICE_RANGES.RANGES.find(r => r.label === localPriceRange);
      if (range && (product.base_price < range.min || (range.max && product.base_price > range.max))) {
        return false;
      }
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (localSortBy) {
      case 'price_low':
        return a.base_price - b.base_price;
      case 'price_high':
        return b.base_price - a.base_price;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={localCategory} onValueChange={setLocalCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={localPriceRange} onValueChange={setLocalPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Prices</SelectItem>
                {PRICE_RANGES.RANGES.map(range => (
                  <SelectItem key={range.label} value={range.label}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={localSortBy} onValueChange={setLocalSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
        </p>
        {filteredProducts.length !== products.length && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLocalSearchQuery('');
              setLocalCategory('');
              setLocalPriceRange('');
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedProducts.map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            <div className="relative aspect-square bg-muted overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
              
              {/* Favorite button */}
              <Button
                variant="ghost"
                size="sm"
                className={`absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white z-10 ${
                  favorites.has(product.id) ? 'text-red-500' : 'text-muted-foreground'
                }`}
                onClick={(e) => toggleFavorite(product.id, e)}
              >
                <Heart className={`h-4 w-4 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
              </Button>

              {/* Product badge */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-white/90">
                  Frame
                </Badge>
              </div>

              {/* Placeholder for product image */}
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-4xl font-bold text-primary/30">
                  {product.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(product.base_price)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Starting price</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={(e) => handleAddToCart(product, e)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Order Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product);
                    }}
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {paginatedProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground space-y-2">
            <Filter className="h-12 w-12 mx-auto" />
            <h3 className="text-lg font-medium">No products found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnhancedProductGrid;