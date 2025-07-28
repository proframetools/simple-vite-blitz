import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/currency';
import { Ruler, Calculator, Zap, Home } from 'lucide-react';
import { WizardData } from '../CustomFrameWizard';

interface SizeStepComponentProps {
  product: any;
  wizardData: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onPriceUpdate: (price: number) => void;
}

interface FrameSize {
  id: string;
  display_name: string;
  width_inches: number;
  height_inches: number;
  price_multiplier: number;
}

const SizeStepComponent: React.FC<SizeStepComponentProps> = ({
  product,
  wizardData,
  onUpdate,
  onPriceUpdate
}) => {
  const [sizes, setSizes] = useState<FrameSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [selectedSizeType, setSelectedSizeType] = useState<'standard' | 'custom'>('standard');
  const [roomVisualization, setRoomVisualization] = useState(false);

  useEffect(() => {
    fetchSizes();
  }, []);

  useEffect(() => {
    calculatePrice();
  }, [wizardData.size, wizardData.customDimensions, selectedSizeType]);

  const fetchSizes = async () => {
    try {
      const { data, error } = await supabase
        .from('frame_sizes')
        .select('*')
        .eq('is_active', true)
        .order('price_multiplier');

      if (error) throw error;
      setSizes(data || []);
      
      // Set default selection
      if (data?.length && !wizardData.size) {
        onUpdate({ size: data[0] });
      }
    } catch (error) {
      console.error('Error fetching sizes:', error);
      toast.error('Failed to load size options');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    let price = product.base_price;

    if (selectedSizeType === 'standard' && wizardData.size) {
      price *= wizardData.size.price_multiplier;
    } else if (selectedSizeType === 'custom' && wizardData.customDimensions) {
      const customArea = wizardData.customDimensions.width * wizardData.customDimensions.height;
      const standardArea = 80; // 8x10 default
      const areaMultiplier = customArea / standardArea;
      price = price * areaMultiplier * 1.2; // 20% premium for custom size
    }

    onPriceUpdate(price);
  };

  const handleSizeSelect = (size: FrameSize) => {
    setSelectedSizeType('standard');
    onUpdate({ 
      size, 
      customDimensions: undefined 
    });
  };

  const handleCustomSize = () => {
    const width = parseFloat(customWidth);
    const height = parseFloat(customHeight);
    
    if (width && height && width > 0 && height > 0) {
      setSelectedSizeType('custom');
      onUpdate({ 
        customDimensions: { width, height },
        size: undefined
      });
    }
  };

  const getSizeRecommendation = () => {
    if (!wizardData.photo) return null;
    
    const { width, height } = wizardData.photo;
    const aspectRatio = width / height;
    
    // Find best matching standard size
    const bestMatch = sizes.reduce((prev, current) => {
      const prevRatio = prev.width_inches / prev.height_inches;
      const currentRatio = current.width_inches / current.height_inches;
      
      return Math.abs(aspectRatio - currentRatio) < Math.abs(aspectRatio - prevRatio) 
        ? current : prev;
    });
    
    return bestMatch;
  };

  const popularSizes = sizes.filter(size => 
    ['8" × 10"', '11" × 14"', '16" × 20"', '5" × 7"'].includes(size.display_name)
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Choose Frame Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedSizeType} onValueChange={(value) => setSelectedSizeType(value as 'standard' | 'custom')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard">Standard Sizes</TabsTrigger>
              <TabsTrigger value="custom">Custom Size</TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="space-y-6">
              {/* Photo-based Recommendation */}
              {wizardData.photo && getSizeRecommendation() && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium text-green-800">Recommended for Your Photo</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      Based on your photo's aspect ratio, we recommend:
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => handleSizeSelect(getSizeRecommendation()!)}
                      className="border-green-300 hover:bg-green-100"
                    >
                      {getSizeRecommendation()?.display_name} - {formatPrice(product.base_price * getSizeRecommendation()!.price_multiplier)}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Popular Sizes */}
              {popularSizes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Most Popular
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {popularSizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => handleSizeSelect(size)}
                        className={`p-4 border rounded-lg text-center transition-all hover:shadow-md ${
                          wizardData.size?.id === size.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-medium">{size.display_name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatPrice(product.base_price * size.price_multiplier)}
                        </div>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Popular
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Sizes */}
              <div>
                <h4 className="font-medium mb-3">All Standard Sizes</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => handleSizeSelect(size)}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        wizardData.size?.id === size.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium text-sm">{size.display_name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatPrice(product.base_price * size.price_multiplier)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="h-5 w-5" />
                    <h4 className="font-medium">Custom Dimensions</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customWidth">Width (inches)</Label>
                      <Input
                        id="customWidth"
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        onBlur={handleCustomSize}
                        placeholder="8"
                        min="1"
                        max="48"
                        step="0.25"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customHeight">Height (inches)</Label>
                      <Input
                        id="customHeight"
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        onBlur={handleCustomSize}
                        placeholder="10"
                        min="1"
                        max="48"
                        step="0.25"
                      />
                    </div>
                  </div>

                  {customWidth && customHeight && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>Custom Size:</strong> {customWidth}" × {customHeight}"
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Estimated Price: {formatPrice(wizardData.totalPrice)} (includes 20% custom size premium)
                      </p>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p>• Minimum size: 1" × 1"</p>
                    <p>• Maximum size: 48" × 48"</p>
                    <p>• Custom sizes include a 20% premium</p>
                    <p>• Increments of 0.25" available</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Size Visualization Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Size Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Preview in room context</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRoomVisualization(!roomVisualization)}
              >
                {roomVisualization ? 'Hide' : 'Show'} Room View
              </Button>
            </div>

            {roomVisualization && (
              <div className="relative bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg p-8 min-h-[200px]">
                {/* Simulated room background */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] rounded-lg"></div>
                
                {/* Frame representation */}
                <div className="relative mx-auto" style={{
                  width: wizardData.size ? `${Math.min(wizardData.size.width_inches * 8, 120)}px` : 
                         wizardData.customDimensions ? `${Math.min(wizardData.customDimensions.width * 8, 120)}px` : '80px',
                  height: wizardData.size ? `${Math.min(wizardData.size.height_inches * 8, 150)}px` : 
                          wizardData.customDimensions ? `${Math.min(wizardData.customDimensions.height * 8, 150)}px` : '100px'
                }}>
                  <div className="w-full h-full bg-amber-900 rounded border-4 border-amber-800 shadow-lg">
                    <div className="w-full h-full bg-white m-1 flex items-center justify-center text-xs text-muted-foreground">
                      Your Photo
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Frame size: {
                      wizardData.size ? wizardData.size.display_name :
                      wizardData.customDimensions ? `${wizardData.customDimensions.width}" × ${wizardData.customDimensions.height}"` :
                      'Select a size'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SizeStepComponent;