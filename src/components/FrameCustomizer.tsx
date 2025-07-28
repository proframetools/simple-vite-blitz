import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/currency';
import PhotoUpload from './PhotoUpload';
import FramePreview from './FramePreview';
import { ShoppingCart, Heart, Star, Zap } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  base_price: number;
  material: string;
  style: string;
  image_url: string | null;
}

interface FrameSize {
  id: string;
  display_name: string;
  width_inches: number;
  height_inches: number;
  price_multiplier: number;
}

interface FrameColor {
  id: string;
  name: string;
  hex_code: string;
  price_adjustment: number;
}

interface FrameThickness {
  id: string;
  name: string;
  width_inches: number;
  price_multiplier: number;
}

interface MattingOption {
  id: string;
  name: string;
  color_hex: string;
  thickness_inches: number;
  is_double_mat: boolean;
  price_adjustment: number;
}

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
}

interface CustomizationOptions {
  product_id: string;
  size_id?: string;
  color_id?: string;
  thickness_id?: string;
  matting_id?: string;
  photo_id?: string;
  custom_width_inches?: number | null;
  custom_height_inches?: number | null;
  photo_position?: { x: number; y: number; scale: number; rotation: number } | null;
  total_price: number;
}

interface FrameCustomizerProps {
  product: Product;
  onAddToCart: (customization: CustomizationOptions) => void;
  onClose?: () => void;
}

const FrameCustomizer: React.FC<FrameCustomizerProps> = ({
  product,
  onAddToCart,
  onClose
}) => {
  // State for customization options
  const [selectedSize, setSelectedSize] = useState<FrameSize | null>(null);
  const [selectedColor, setSelectedColor] = useState<FrameColor | null>(null);
  const [selectedThickness, setSelectedThickness] = useState<FrameThickness | null>(null);
  const [selectedMatting, setSelectedMatting] = useState<MattingOption | null>(null);
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<{
    id: string;
    url: string;
    fileName: string;
    width: number;
    height: number;
    dpi?: number;
  } | null>(null);
  const [photoPosition, setPhotoPosition] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });
  
  // Available options
  const [sizes, setSizes] = useState<FrameSize[]>([]);
  const [colors, setColors] = useState<FrameColor[]>([]);
  const [thicknesses, setThicknesses] = useState<FrameThickness[]>([]);
  const [mattingOptions, setMattingOptions] = useState<MattingOption[]>([]);
  const [popularCombinations, setPopularCombinations] = useState<PopularCombination[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Load customization options
  useEffect(() => {
    fetchCustomizationOptions();
  }, [product.id]);

  const fetchCustomizationOptions = async () => {
    try {
      const [sizesData, colorsData, thicknessData, mattingData, popularData] = await Promise.all([
        supabase.from('frame_sizes').select('*').eq('is_active', true).order('price_multiplier'),
        supabase.from('frame_colors').select('*').eq('is_active', true).order('name'),
        supabase.from('frame_thickness').select('*').eq('is_active', true).order('price_multiplier'),
        supabase.from('matting_options').select('*').eq('is_active', true).order('price_adjustment'),
        supabase.from('popular_combinations').select('*').eq('is_active', true).eq('product_id', product.id).order('popularity_score', { ascending: false })
      ]);

      if (sizesData.data) setSizes(sizesData.data);
      if (colorsData.data) setColors(colorsData.data);
      if (thicknessData.data) setThicknesses(thicknessData.data);
      if (mattingData.data) setMattingOptions(mattingData.data);
      if (popularData.data) setPopularCombinations(popularData.data);

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

  // Calculate total price
  const calculatePrice = () => {
    let totalPrice = product.base_price;

    if (selectedSize) {
      totalPrice *= selectedSize.price_multiplier;
    }

    if (selectedColor) {
      totalPrice += selectedColor.price_adjustment;
    }

    if (selectedThickness) {
      totalPrice *= selectedThickness.price_multiplier;
    }

    if (selectedMatting) {
      totalPrice += selectedMatting.price_adjustment;
    }

    // Custom size pricing (add 20% for custom sizes)
    if (isCustomSize && customWidth && customHeight) {
      const customArea = parseFloat(customWidth) * parseFloat(customHeight);
      const standardArea = selectedSize ? selectedSize.width_inches * selectedSize.height_inches : 80; // 8x10 default
      const areaMultiplier = customArea / standardArea;
      totalPrice = totalPrice * areaMultiplier * 1.2; // 20% premium for custom size
    }

    return totalPrice;
  };

  // Apply popular combination
  const applyPopularCombination = async (combination: PopularCombination) => {
    try {
      const [sizeData, colorData, thicknessData, mattingData] = await Promise.all([
        supabase.from('frame_sizes').select('*').eq('id', combination.size_id).single(),
        supabase.from('frame_colors').select('*').eq('id', combination.color_id).single(),
        combination.thickness_id ? supabase.from('frame_thickness').select('*').eq('id', combination.thickness_id).single() : null,
        combination.matting_id ? supabase.from('matting_options').select('*').eq('id', combination.matting_id).single() : null
      ]);

      if (sizeData.data) setSelectedSize(sizeData.data);
      if (colorData.data) setSelectedColor(colorData.data);
      if (thicknessData?.data) setSelectedThickness(thicknessData.data);
      if (mattingData?.data) setSelectedMatting(mattingData.data);

      toast.success(`Applied "${combination.name}" combination`);
    } catch (error) {
      console.error('Error applying combination:', error);
      toast.error('Failed to apply combination');
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor || !selectedThickness) {
      toast.error('Please select all required options');
      return;
    }

    const customization = {
      product_id: product.id,
      size_id: selectedSize.id,
      color_id: selectedColor.id,
      thickness_id: selectedThickness.id,
      matting_id: selectedMatting?.id,
      photo_id: uploadedPhoto?.id,
      custom_width_inches: isCustomSize ? parseFloat(customWidth) : null,
      custom_height_inches: isCustomSize ? parseFloat(customHeight) : null,
      photo_position: uploadedPhoto ? photoPosition : null,
      total_price: calculatePrice()
    };

    onAddToCart(customization);
    toast.success('Custom frame added to cart!');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-12 bg-muted rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Popular Combinations */}
      {popularCombinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularCombinations.slice(0, 4).map((combo) => (
                <div
                  key={combo.id}
                  className="border border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => applyPopularCombination(combo)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{combo.name}</h4>
                    {combo.is_staff_pick && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Staff Pick
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {combo.description}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Apply Combination
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customization Options */}
        <div className="space-y-6">
          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>1. Upload Your Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                onPhotoUploaded={(photo) => {
                  console.log('FrameCustomizer: Received photo data:', photo);
                  setUploadedPhoto(photo);
                  toast.success('Photo uploaded! View it in the preview →');
                }}
                maxFiles={1}
                acceptMultiple={false}
              />
            </CardContent>
          </Card>

          {/* Frame Size */}
          <Card>
            <CardHeader>
              <CardTitle>2. Choose Frame Size</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant={!isCustomSize ? "default" : "outline"}
                  onClick={() => setIsCustomSize(false)}
                >
                  Standard Sizes
                </Button>
                <Button
                  variant={isCustomSize ? "default" : "outline"}
                  onClick={() => setIsCustomSize(true)}
                >
                  Custom Size
                </Button>
              </div>

              {!isCustomSize ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 border rounded-lg text-sm transition-colors ${
                        selectedSize?.id === size.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium">{size.display_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatPrice(product.base_price * size.price_multiplier)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customWidth">Width (inches)</Label>
                    <Input
                      id="customWidth"
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      placeholder="8"
                      min="1"
                      max="48"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customHeight">Height (inches)</Label>
                    <Input
                      id="customHeight"
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      placeholder="10"
                      min="1"
                      max="48"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Frame Color */}
          <Card>
            <CardHeader>
              <CardTitle>3. Select Frame Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    className={`p-3 border rounded-lg transition-colors ${
                      selectedColor?.id === color.id
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded mb-2"
                      style={{ backgroundColor: color.hex_code }}
                    />
                    <div className="text-xs font-medium">{color.name}</div>
                        {color.price_adjustment > 0 && (
                          <div className="text-xs text-primary">
                            +{formatPrice(color.price_adjustment)}
                          </div>
                        )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Frame Thickness */}
          <Card>
            <CardHeader>
              <CardTitle>4. Frame Thickness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {thicknesses.map((thickness) => (
                  <button
                    key={thickness.id}
                    onClick={() => setSelectedThickness(thickness)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedThickness?.id === thickness.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{thickness.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {thickness.price_multiplier !== 1 && 
                        `${thickness.price_multiplier}x base price`
                      }
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Matting Options */}
          <Card>
            <CardHeader>
              <CardTitle>5. Matting (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedMatting(null)}
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    !selectedMatting
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">No Matting</div>
                </button>
                {mattingOptions.map((matting) => (
                  <button
                    key={matting.id}
                    onClick={() => setSelectedMatting(matting)}
                    className={`w-full p-3 border rounded-lg text-left transition-colors ${
                      selectedMatting?.id === matting.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: matting.color_hex }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{matting.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {matting.is_double_mat ? 'Double Mat' : 'Single Mat'} • 
                          +{formatPrice(matting.price_adjustment)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel - Always Visible */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Preview</CardTitle>
                <div className="flex items-center gap-2">
                  {uploadedPhoto && (
                    <Badge variant="secondary" className="text-xs">
                      Photo Loaded
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    Real-time Updates
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FramePreview
                photoUrl={uploadedPhoto?.url}
                frameColor={selectedColor?.hex_code || '#8B4513'}
                frameWidth={selectedThickness?.width_inches ? Math.max(selectedThickness.width_inches * 0.8, 8) : 12}
                mattingColor={selectedMatting?.color_hex}
                mattingThickness={selectedMatting?.thickness_inches ? Math.max(selectedMatting.thickness_inches * 5, 5) : 0}
                canvasWidth={500}
                canvasHeight={600}
                onPositionChange={setPhotoPosition}
              />
              <div className="mt-4 text-center">
                {!uploadedPhoto ? (
                  <p className="text-sm text-muted-foreground">
                    Upload a photo to see it in your custom frame
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Use the controls above to adjust your photo position
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Photo Information */}
          {uploadedPhoto && (
            <Card>
              <CardHeader>
                <CardTitle>Photo Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Filename:</span>
                  <span className="font-medium">{uploadedPhoto.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span>{uploadedPhoto.width} × {uploadedPhoto.height} pixels</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quality:</span>
                  <Badge variant="outline" className="text-xs">
                    {uploadedPhoto.width >= 1200 && uploadedPhoto.height >= 1800 ? 'High Quality' : 'Standard Quality'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Frame ({product.name})</span>
                  <span>{formatPrice(product.base_price)}</span>
                </div>
                
                {selectedSize && (
                  <div className="flex justify-between">
                    <span>Size ({selectedSize.display_name})</span>
                    <span>{selectedSize.price_multiplier}x</span>
                  </div>
                )}
                
                {selectedColor && selectedColor.price_adjustment > 0 && (
                  <div className="flex justify-between">
                    <span>Color ({selectedColor.name})</span>
                    <span>+{formatPrice(selectedColor.price_adjustment)}</span>
                  </div>
                )}
                
                {selectedThickness && selectedThickness.price_multiplier !== 1 && (
                  <div className="flex justify-between">
                    <span>Thickness ({selectedThickness.name})</span>
                    <span>{selectedThickness.price_multiplier}x</span>
                  </div>
                )}
                
                {selectedMatting && (
                  <div className="flex justify-between">
                    <span>Matting ({selectedMatting.name})</span>
                    <span>+{formatPrice(selectedMatting.price_adjustment)}</span>
                  </div>
                )}

                {isCustomSize && customWidth && customHeight && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Custom Size Premium</span>
                    <span>+20%</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total Price</span>
                <span>{formatPrice(calculatePrice())}</span>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button onClick={handleAddToCart} className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FrameCustomizer;