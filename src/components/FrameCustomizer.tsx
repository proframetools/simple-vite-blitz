import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/currency';
import FramePreview from './FramePreview';
import { ShoppingCart, Heart, Star, Zap } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

// Use database types
type Product = Database['public']['Tables']['products']['Row'];
type FrameSize = Database['public']['Tables']['frame_sizes']['Row'];
type FrameColor = Database['public']['Tables']['frame_colors']['Row'];
type FrameThickness = Database['public']['Tables']['frame_thickness']['Row'];
type MattingOption = Database['public']['Tables']['matting_options']['Row'];

interface FrameCustomizerProps {
  product: Product;
  onPriceChange?: (price: number) => void;
  onSelectionChange?: (selections: {
    size: FrameSize | null;
    color: FrameColor | null;
    thickness: FrameThickness | null;
    matting: MattingOption | null;
  }) => void;
  onClose: () => void;
}

const FrameCustomizer: React.FC<FrameCustomizerProps> = ({ 
  product, 
  onPriceChange,
  onSelectionChange,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [sizes, setSizes] = useState<FrameSize[]>([]);
  const [colors, setColors] = useState<FrameColor[]>([]);
  const [thicknesses, setThicknesses] = useState<FrameThickness[]>([]);
  const [mattingOptions, setMattingOptions] = useState<MattingOption[]>([]);

  const [selectedSize, setSelectedSize] = useState<FrameSize | null>(null);
  const [selectedColor, setSelectedColor] = useState<FrameColor | null>(null);
  const [selectedThickness, setSelectedThickness] = useState<FrameThickness | null>(null);
  const [selectedMatting, setSelectedMatting] = useState<MattingOption | null>(null);

  const [showAllSizes, setShowAllSizes] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllThickness, setShowAllThickness] = useState(false);
  const [showAllMatting, setShowAllMatting] = useState(false);

  useEffect(() => {
    fetchCustomizationOptions();
  }, [product.id]);

  useEffect(() => {
    calculateTotalPrice();
    if (onSelectionChange) {
      onSelectionChange({
        size: selectedSize,
        color: selectedColor,
        thickness: selectedThickness,
        matting: selectedMatting
      });
    }
  }, [selectedSize, selectedColor, selectedThickness, selectedMatting, onSelectionChange]);

  const fetchCustomizationOptions = async () => {
    try {
      const [sizesData, colorsData, thicknessData, mattingData] = await Promise.all([
        supabase.from('frame_sizes').select('*').eq('is_active', true).order('price_multiplier'),
        supabase.from('frame_colors').select('*').eq('is_active', true).order('name'),
        supabase.from('frame_thickness').select('*').eq('is_active', true).order('price_adjustment'),
        supabase.from('matting_options').select('*').eq('is_active', true).order('price_adjustment')
      ]);

      if (sizesData.data) setSizes(sizesData.data);
      if (colorsData.data) setColors(colorsData.data);
      if (thicknessData.data) setThicknesses(thicknessData.data);
      if (mattingData.data) setMattingOptions(mattingData.data);

      // Set default selections
      if (sizesData.data?.length) setSelectedSize(sizesData.data[0]);
      if (colorsData.data?.length) setSelectedColor(colorsData.data[0]);
      if (thicknessData.data?.length) setSelectedThickness(thicknessData.data[0]);

    } catch (error) {
      console.error('Error fetching customization options:', error);
      toast.error('Failed to load customization options');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    let total = product.base_price;

    if (selectedSize) {
      total *= selectedSize.price_multiplier;
    }

    if (selectedColor) {
      total += selectedColor.price_adjustment || 0;
    }

    if (selectedThickness) {
      total += selectedThickness.price_adjustment || 0;
    }

    if (selectedMatting) {
      total += selectedMatting.price_adjustment || 0;
    }

    if (onPriceChange) {
      onPriceChange(total);
    }

    return total;
  };

  const handleSizeSelect = (size: FrameSize) => {
    setSelectedSize(size);
  };

  const handleColorSelect = (color: FrameColor) => {
    setSelectedColor(color);
  };

  const handleThicknessSelect = (thickness: FrameThickness) => {
    setSelectedThickness(thickness);
  };

  const handleMattingSelect = (matting: MattingOption | null) => {
    setSelectedMatting(matting);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(j => (
                    <Skeleton key={j} className="h-12" />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();

  return (
    <div className="space-y-6">
      {/* Frame Preview */}
      <FramePreview
        frameColor={selectedColor?.hex_code || '#000000'}
        frameWidth={selectedThickness?.thickness_mm || 20}
        mattingColor={selectedMatting ? '#FFFFFF' : undefined}
        mattingThickness={selectedMatting ? 20 : undefined}
        canvasWidth={selectedSize?.width_inches ? selectedSize.width_inches * 25.4 : 200}
        canvasHeight={selectedSize?.height_inches ? selectedSize.height_inches * 25.4 : 250}
      />

      {/* Size Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frame Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(showAllSizes ? sizes : sizes.slice(0, 6)).map((size) => (
              <Button
                key={size.id}
                variant={selectedSize?.id === size.id ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-start text-left"
                onClick={() => handleSizeSelect(size)}
              >
                <div className="font-medium">{size.display_name}</div>
                <div className="text-sm text-muted-foreground">
                  {size.width_inches}" × {size.height_inches}"
                </div>
                <div className="text-sm font-medium">
                  {formatPrice(product.base_price * size.price_multiplier)}
                </div>
              </Button>
            ))}
          </div>
          {sizes.length > 6 && (
            <Button
              variant="ghost"
              className="w-full mt-3"
              onClick={() => setShowAllSizes(!showAllSizes)}
            >
              {showAllSizes ? 'Show Less' : `Show ${sizes.length - 6} More Sizes`}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Color Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frame Color</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {(showAllColors ? colors : colors.slice(0, 8)).map((color) => (
              <Button
                key={color.id}
                variant="outline"
                className={`h-20 p-2 flex flex-col items-center justify-center relative ${
                  selectedColor?.id === color.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleColorSelect(color)}
              >
                {color.hex_code?.startsWith('/materials/') ? (
                  <img
                    src={color.hex_code}
                    alt={color.display_name}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 mb-1 object-cover"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-200 mb-1"
                    style={{ backgroundColor: color.hex_code || '#000000' }}
                  />
                )}
                <span className="text-xs font-medium text-center leading-tight">
                  {color.display_name}
                </span>
                {color.price_adjustment !== 0 && (
                  <span className="text-xs text-muted-foreground">
                    {color.price_adjustment > 0 ? '+' : ''}{formatPrice(color.price_adjustment)}
                  </span>
                )}
              </Button>
            ))}
          </div>
          {colors.length > 8 && (
            <Button
              variant="ghost"
              className="w-full mt-3"
              onClick={() => setShowAllColors(!showAllColors)}
            >
              {showAllColors ? 'Show Less' : `Show ${colors.length - 8} More Colors`}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Thickness Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frame Thickness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(showAllThickness ? thicknesses : thicknesses.slice(0, 6)).map((thickness) => (
              <Button
                key={thickness.id}
                variant={selectedThickness?.id === thickness.id ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-start text-left"
                onClick={() => handleThicknessSelect(thickness)}
              >
                <div className="font-medium">{thickness.display_name}</div>
                <div className="text-sm text-muted-foreground">
                  {thickness.thickness_mm}mm
                </div>
                {thickness.price_adjustment !== 0 && (
                  <div className="text-sm font-medium">
                    {thickness.price_adjustment > 0 ? '+' : ''}{formatPrice(thickness.price_adjustment)}
                  </div>
                )}
              </Button>
            ))}
          </div>
          {thicknesses.length > 6 && (
            <Button
              variant="ghost"
              className="w-full mt-3"
              onClick={() => setShowAllThickness(!showAllThickness)}
            >
              {showAllThickness ? 'Show Less' : `Show ${thicknesses.length - 6} More Options`}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Matting Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Matting (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant={!selectedMatting ? "default" : "outline"}
              className="w-full text-left justify-start"
              onClick={() => handleMattingSelect(null)}
            >
              No Matting
            </Button>
            {(showAllMatting ? mattingOptions : mattingOptions.slice(0, 4)).map((matting) => (
              <Button
                key={matting.id}
                variant={selectedMatting?.id === matting.id ? "default" : "outline"}
                className="w-full text-left justify-between"
                onClick={() => handleMattingSelect(matting)}
              >
                <div>
                  <div className="font-medium">{matting.display_name}</div>
                  {matting.description && (
                    <div className="text-sm text-muted-foreground">{matting.description}</div>
                  )}
                </div>
                {matting.price_adjustment !== 0 && (
                  <div className="text-sm font-medium">
                    {matting.price_adjustment > 0 ? '+' : ''}{formatPrice(matting.price_adjustment)}
                  </div>
                )}
              </Button>
            ))}
          </div>
          {mattingOptions.length > 4 && (
            <Button
              variant="ghost"
              className="w-full mt-3"
              onClick={() => setShowAllMatting(!showAllMatting)}
            >
              {showAllMatting ? 'Show Less' : `Show ${mattingOptions.length - 4} More Options`}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Price</span>
              <span>{formatPrice(product.base_price)}</span>
            </div>
            
            {selectedSize && selectedSize.price_multiplier !== 1 && (
              <div className="flex justify-between text-sm">
                <span>Size Adjustment ({selectedSize.display_name})</span>
                <span>×{selectedSize.price_multiplier}</span>
              </div>
            )}
            
            {selectedColor && selectedColor.price_adjustment !== 0 && (
              <div className="flex justify-between text-sm">
                <span>Color Adjustment ({selectedColor.display_name})</span>
                <span>{selectedColor.price_adjustment > 0 ? '+' : ''}{formatPrice(selectedColor.price_adjustment)}</span>
              </div>
            )}
            
            {selectedThickness && selectedThickness.price_adjustment !== 0 && (
              <div className="flex justify-between text-sm">
                <span>Thickness Adjustment ({selectedThickness.display_name})</span>
                <span>{selectedThickness.price_adjustment > 0 ? '+' : ''}{formatPrice(selectedThickness.price_adjustment)}</span>
              </div>
            )}
            
            {selectedMatting && selectedMatting.price_adjustment !== 0 && (
              <div className="flex justify-between text-sm">
                <span>Matting ({selectedMatting.display_name})</span>
                <span>{selectedMatting.price_adjustment > 0 ? '+' : ''}{formatPrice(selectedMatting.price_adjustment)}</span>
              </div>
            )}
            
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FrameCustomizer;