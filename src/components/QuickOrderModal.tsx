import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/currency';
import { ShoppingCart, Star, Zap, Clock } from 'lucide-react';

interface PopularCombination {
  id: string;
  name: string;
  description: string;
  product_id: string;
  size_id: string;
  color_id: string;
  thickness_id?: string;
  matting_id?: string;
  is_staff_pick: boolean;
  popularity_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (combination: any) => void;
}

const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [combinations, setCombinations] = useState<PopularCombination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPopularCombinations();
    }
  }, [isOpen]);

  const fetchPopularCombinations = async () => {
    try {
      // Since popular_combinations table doesn't exist, create mock data
      const mockCombinations: PopularCombination[] = [
        {
          id: '1',
          name: 'Classic Black Frame',
          description: 'Our most popular combination',
          product_id: 'product-1',
          size_id: 'size-1',
          color_id: 'color-1',
          thickness_id: 'thickness-1',
          matting_id: null,
          is_staff_pick: true,
          popularity_score: 95,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setCombinations(mockCombinations);
    } catch (error) {
      console.error('Error fetching popular combinations:', error);
      toast.error('Failed to load quick order options');
    } finally {
      setLoading(false);
    }
  };

  const calculateCombinationPrice = () => {
    return 99.99; // Mock price
  };

  const handleQuickOrder = (combo: PopularCombination) => {
    const orderData = {
      product_id: combo.product_id,
      size_id: combo.size_id,
      color_id: combo.color_id,
      thickness_id: combo.thickness_id,
      matting_id: combo.matting_id,
      quantity: 1,
      total_price: calculateCombinationPrice()
    };

    onAddToCart(orderData);
    toast.success(`Added "${combo.name}" to cart!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Order - Popular Combinations
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Express Checkout Notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Express Checkout</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Skip the customization - these popular combinations are ready to order with 3 simple steps!
              </p>
            </div>

            {/* Staff Picks */}
            {combinations.some(c => c.is_staff_pick) && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Staff Picks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {combinations
                    .filter(combo => combo.is_staff_pick)
                    .slice(0, 4)
                    .map((combo) => (
                      <Card key={combo.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-lg">{combo.name}</h4>
                            <p className="text-sm text-muted-foreground">Custom Frame</p>
                          </div>
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Staff Pick
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4">
                            {combo.description}
                          </p>

                          {/* Combination Details */}
                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex items-center justify-between">
                              <span>Size:</span>
                              <span className="font-medium">8" x 10"</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Color:</span>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border bg-black" />
                                <span className="font-medium">Black</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Thickness:</span>
                              <span className="font-medium">Standard</span>
                            </div>
                          </div>

                          {/* Price and Order */}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div>
                              <span className="text-2xl font-bold text-primary">
                                {formatPrice(calculateCombinationPrice())}
                              </span>
                            </div>
                            <Button
                              onClick={() => handleQuickOrder(combo)}
                              className="flex items-center gap-2"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Quick Order
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Most Popular */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Most Popular</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {combinations
                  .filter(combo => !combo.is_staff_pick)
                  .slice(0, 4)
                  .map((combo) => (
                    <Card key={combo.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-lg">{combo.name}</h4>
                            <p className="text-sm text-muted-foreground">Custom Frame</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            #{combo.popularity_score}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          {combo.description}
                        </p>

                        {/* Combination Details */}
                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center justify-between">
                            <span>Size:</span>
                            <span className="font-medium">8" x 10"</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Color:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded border bg-black" />
                              <span className="font-medium">Black</span>
                            </div>
                          </div>
                        </div>

                        {/* Price and Order */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div>
                            <span className="text-2xl font-bold text-primary">
                              {formatPrice(calculateCombinationPrice())}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleQuickOrder(combo)}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Quick Order
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickOrderModal;