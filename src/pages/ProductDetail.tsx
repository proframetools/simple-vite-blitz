
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, ShoppingCart, Star, ChevronLeft, Share2, Palette, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductReviews from "@/components/ProductReviews";
import RelatedProducts from "@/components/RelatedProducts";
import FrameCustomizer from "@/components/FrameCustomizer";
import QuickOrderModal from "@/components/QuickOrderModal";
import frameCollection from "@/assets/frame-collection.jpg";

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  material: string;
  style: string;
  image_url: string | null;
  stock_quantity: number;
  average_rating: number;
  review_count: number;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showQuickOrder, setShowQuickOrder] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      toast.success(`${product.name} added to cart!`);
      // TODO: Implement cart functionality
    }
  };

  const handleCustomAddToCart = (customization: any) => {
    console.log('Custom frame added to cart:', customization);
    // TODO: Implement custom cart functionality
    setShowCustomizer(false);
  };

  const handleQuickOrderCart = (orderData: any) => {
    console.log('Quick order added to cart:', orderData);
    // TODO: Implement quick order cart functionality
  };

  const handleAddToWishlist = () => {
    if (product) {
      toast.success(`${product.name} added to wishlist!`);
      // TODO: Implement wishlist functionality
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-muted rounded-lg" />
              <div>
                <div className="h-8 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3 mb-8" />
                <div className="h-12 bg-muted rounded" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
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
      <main className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            <ProductImageGallery productId={product.id} primaryImage={product.image_url || frameCollection} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.average_rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        {product.average_rating.toFixed(1)} ({product.review_count} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={handleAddToWishlist}>
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Badge variant="secondary">{product.style}</Badge>
                <Badge variant="outline">{product.material}</Badge>
                {product.stock_quantity < 10 && (
                  <Badge variant="destructive">Low Stock</Badge>
                )}
              </div>

              <div className="text-3xl font-bold text-foreground mb-6">
                ₹{product.base_price.toLocaleString('en-IN')}
              </div>

              <p className="text-muted-foreground mb-8 leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <select
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-border rounded-md bg-background"
                >
                  {[...Array(Math.min(10, product.stock_quantity))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {/* Express Order Options */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowQuickOrder(true)}
                    variant="default"
                    className="flex-1"
                    disabled={product.stock_quantity === 0}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Quick Order
                  </Button>
                  <Button 
                    onClick={() => setShowCustomizer(true)}
                    variant="outline"
                    className="flex-1"
                    disabled={product.stock_quantity === 0}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Customize Frame
                  </Button>
                </div>

                {/* Traditional Add to Cart */}
                <div className="flex gap-4">
                  <Button 
                    onClick={handleAddToCart}
                    variant="secondary"
                    className="flex-1"
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Basic Add to Cart
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {product.stock_quantity === 0 && (
                <p className="text-destructive text-sm">Out of stock</p>
              )}
            </div>

            <Separator />

            {/* Product Specifications */}
            <div>
              <h3 className="font-semibold mb-4">Product Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material:</span>
                  <span>{product.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Style:</span>
                  <span>{product.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span>{product.stock_quantity} available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        <RelatedProducts currentProductId={product.id} />
      </main>
      <Footer />

      {/* Frame Customizer Modal */}
      <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Your Frame</DialogTitle>
          </DialogHeader>
          {product && (
            <FrameCustomizer
              product={product}
              onAddToCart={handleCustomAddToCart}
              onClose={() => setShowCustomizer(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Order Modal */}
      <QuickOrderModal
        isOpen={showQuickOrder}
        onClose={() => setShowQuickOrder(false)}
        onAddToCart={handleQuickOrderCart}
      />
    </div>
  );
};

export default ProductDetail;
