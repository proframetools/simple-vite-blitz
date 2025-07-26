import { useState, useEffect } from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ProductFilters from "@/components/ProductFilters";
import ProductSearch from "@/components/ProductSearch";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ShoppingCart, Eye, Star, Filter, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from 'react-router-dom';
import { formatPrice } from "@/lib/currency";
import { openWhatsAppInquiry } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import frameCollection from "@/assets/frame-collection.jpg";

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  material: string;
  style: string;
  image_url: string | null;
  average_rating: number;
  review_count: number;
  stock_quantity: number | null;
  popularity_score: number | null;
  created_at?: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('popularity');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    sortProducts(sortBy);
  }, [sortBy, products]);

  const fetchProducts = async () => {
    try {
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('popularity_score', { ascending: false });

      if (error) throw error;
      setProducts(productsData || []);
      setFilteredProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (sortValue: string) => {
    const sorted = [...filteredProducts];
    
    switch (sortValue) {
      case 'price-low':
        sorted.sort((a, b) => a.base_price - b.base_price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.base_price - a.base_price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'popularity':
      default:
        sorted.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
        break;
    }
    
    setFilteredProducts(sorted);
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.style.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  interface FilterState {
    categories: string[];
    occasions: string[];
    materials: string[];
    priceRange: [number, number];
    inStock: boolean;
    minRating: number;
  }

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    occasions: [],
    materials: [],
    priceRange: [0, 10000],
    inStock: false,
    minRating: 0,
  });

  const handleFilter = (newFilters: FilterState) => {
    setFilters(newFilters);
    let filtered = [...products];

    if (newFilters.materials.length > 0) {
      filtered = filtered.filter(product => 
        newFilters.materials.includes(product.material)
      );
    }

    if (newFilters.priceRange[0] > 0 || newFilters.priceRange[1] < 10000) {
      filtered = filtered.filter(product => 
        product.base_price >= newFilters.priceRange[0] &&
        product.base_price <= newFilters.priceRange[1]
      );
    }

    if (newFilters.minRating > 0) {
      filtered = filtered.filter(product => 
        (product.average_rating || 0) >= newFilters.minRating
      );
    }

    if (newFilters.inStock) {
      filtered = filtered.filter(product => 
        product.stock_quantity && product.stock_quantity > 0
      );
    }

    setFilteredProducts(filtered);
    sortProducts(sortBy);
  };

  const handleQuickOrder = (product: Product) => {
    const message = `Hi! I'm interested in the "${product.name}" frame. Could you help me with more details and pricing?`;
    openWhatsAppInquiry(message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-background to-muted">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Our Frame Collection
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Discover perfect frames for every style and occasion
              </p>
              <p className="text-muted-foreground">
                {products.length} beautiful frames to choose from
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-80 shrink-0">
              <div className="bg-card rounded-lg shadow-card p-6 sticky top-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Filters</h3>
                <ProductFilters filters={filters} onFiltersChange={handleFilter} />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <ProductSearch searchQuery="" onSearchChange={handleSearch} />
                </div>
                
                {/* Mobile Filter Button */}
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetTitle>Filters</SheetTitle>
                      <div className="mt-6">
                        <ProductFilters filters={filters} onFiltersChange={handleFilter} />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
                  <p className="text-muted-foreground/70 mt-2">Try adjusting your filters or search term.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="group hover:shadow-hover transition-shadow duration-300 border-border">
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={product.image_url || frameCollection}
                            alt={product.name}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-background/90 hover:bg-background">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                          {product.stock_quantity !== null && product.stock_quantity < 10 && (
                            <Badge className="absolute top-3 left-3 bg-red-500">
                              Only {product.stock_quantity} left
                            </Badge>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {product.material}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {product.style}
                            </Badge>
                          </div>
                          
                          {product.average_rating > 0 && (
                            <div className="flex items-center gap-1 mb-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(product.average_rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-muted-foreground/30'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                ({product.review_count || 0})
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-primary">
                              {formatPrice(product.base_price)}
                            </span>
                            <span className="text-sm text-muted-foreground">Starting price</span>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="p-4 pt-0 flex gap-2">
                        <Link to={`/product/${product.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <Button 
                          onClick={() => handleQuickOrder(product)}
                          className="flex-1"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Quick Order
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </section>
      </main>
      
      <Footer />
      <WhatsAppButton onClick={() => openWhatsAppInquiry("Hi! I'm interested in learning more about your custom frames.")} />
    </div>
  );
};

export default Products; 