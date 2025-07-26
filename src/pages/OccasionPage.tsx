import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ProductFilters from "@/components/ProductFilters";
import ProductSearch from "@/components/ProductSearch";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from 'react-router-dom';
import frameCollection from "@/assets/frame-collection.jpg";

interface Occasion {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

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
}

const OccasionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchOccasionAndProducts();
    }
  }, [slug]);

  const fetchOccasionAndProducts = async () => {
    try {
      // Fetch occasion
      const { data: occasionData, error: occasionError } = await supabase
        .from('occasions')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (occasionError) throw occasionError;
      setOccasion(occasionData);

      // Fetch products for this occasion
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_occasions!inner(occasion_id)
        `)
        .eq('product_occasions.occasion_id', occasionData.id)
        .eq('is_active', true)
        .order('popularity_score', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
      setFilteredProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching occasion data:', error);
      toast.error('Failed to load occasion');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleFilter = (filters: any) => {
    let filtered = [...products];

    if (filters.materials.length > 0) {
      filtered = filtered.filter(product =>
        filters.materials.includes(product.material)
      );
    }

    if (filters.styles.length > 0) {
      filtered = filtered.filter(product =>
        filters.styles.includes(product.style)
      );
    }

    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
      filtered = filtered.filter(product =>
        product.base_price >= filters.priceRange.min &&
        product.base_price <= filters.priceRange.max
      );
    }

    if (filters.sortBy === 'price_asc') {
      filtered.sort((a, b) => a.base_price - b.base_price);
    } else if (filters.sortBy === 'price_desc') {
      filtered.sort((a, b) => b.base_price - a.base_price);
    } else if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => b.average_rating - a.average_rating);
    }

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4" />
            <div className="h-4 bg-muted rounded w-2/3 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!occasion) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Occasion Not Found</h1>
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Occasion Hero */}
        <section className="relative py-20 bg-gradient-to-r from-background to-muted">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {occasion.name} Frames
              </h1>
              {occasion.description && (
                <p className="text-xl text-muted-foreground mb-6">
                  {occasion.description}
                </p>
              )}
              <p className="text-muted-foreground">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            {/* Search and Filters */}
            <div className="mb-8 space-y-6">
              <ProductSearch searchQuery="" onSearchChange={handleSearch} />
              <ProductFilters filters={{categories: [], occasions: [], materials: [], priceRange: [500, 5000], inStock: false, minRating: 0}} onFiltersChange={handleFilter} />
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found for this occasion</p>
                <Button variant="outline" onClick={() => {
                  setFilteredProducts(products);
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-hover transition-smooth overflow-hidden">
                    <div className="relative aspect-square overflow-hidden">
                      <Link to={`/product/${product.id}`}>
                        <img
                          src={product.image_url || frameCollection}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                        />
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-smooth">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-smooth">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary">
                          {product.style}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-xs">
                          {product.material}
                        </Badge>
                        <span className="text-2xl font-bold text-foreground">
                          ${product.base_price}
                        </span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-6 pt-0">
                      <div className="flex gap-2 w-full">
                        <Button variant="elegant" className="flex-1">
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </Button>
                        <Button variant="premium" className="flex-1">
                          Customize
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OccasionPage;
