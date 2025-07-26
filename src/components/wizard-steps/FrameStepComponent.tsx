import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Palette, Layers, Star, Zap } from 'lucide-react';
import { WizardData } from '../CustomFrameWizard';

interface FrameStepComponentProps {
  product: any;
  wizardData: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onPriceUpdate: (price: number) => void;
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

interface PopularCombination {
  id: string;
  name: string;
  description: string;
  color_id: string;
  thickness_id: string;
  is_staff_pick: boolean;
  popularity_score: number;
}

const FrameStepComponent: React.FC<FrameStepComponentProps> = ({
  product,
  wizardData,
  onUpdate,
  onPriceUpdate
}) => {
  const [colors, setColors] = useState<FrameColor[]>([]);
  const [thicknesses, setThicknesses] = useState<FrameThickness[]>([]);
  const [popularCombinations, setPopularCombinations] = useState<PopularCombination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchFrameOptions();
  }, [product.id]);

  useEffect(() => {
    calculatePrice();
  }, [wizardData.color, wizardData.thickness]);

  const fetchFrameOptions = async () => {
    try {
      const [colorsData, thicknessData, popularData] = await Promise.all([
        supabase.from('frame_colors').select('*').eq('is_active', true).order('name'),
        supabase.from('frame_thickness').select('*').eq('is_active', true).order('price_multiplier'),
        supabase.from('popular_combinations').select('*').eq('is_active', true).eq('product_id', product.id).order('popularity_score', { ascending: false })
      ]);

      if (colorsData.data) setColors(colorsData.data);
      if (thicknessData.data) setThicknesses(thicknessData.data);
      if (popularData.data) setPopularCombinations(popularData.data);

      // Set default selections
      if (colorsData.data?.length && !wizardData.color) {
        onUpdate({ color: colorsData.data[0] });
      }
      if (thicknessData.data?.length && !wizardData.thickness) {
        onUpdate({ thickness: thicknessData.data[0] });
      }
    } catch (error) {
      console.error('Error fetching frame options:', error);
      toast.error('Failed to load frame options');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    let price = product.base_price;

    // Apply size multiplier
    if (wizardData.size) {
      price *= wizardData.size.price_multiplier;
    } else if (wizardData.customDimensions) {
      const customArea = wizardData.customDimensions.width * wizardData.customDimensions.height;
      const standardArea = 80;
      const areaMultiplier = customArea / standardArea;
      price = price * areaMultiplier * 1.2;
    }

    // Apply color adjustment
    if (wizardData.color) {
      price += wizardData.color.price_adjustment;
    }

    // Apply thickness multiplier
    if (wizardData.thickness) {
      price *= wizardData.thickness.price_multiplier;
    }

    onPriceUpdate(price);
  };

  const applyPopularCombination = async (combination: PopularCombination) => {
    try {
      const [colorData, thicknessData] = await Promise.all([
        supabase.from('frame_colors').select('*').eq('id', combination.color_id).single(),
        supabase.from('frame_thickness').select('*').eq('id', combination.thickness_id).single()
      ]);

      if (colorData.data && thicknessData.data) {
        onUpdate({
          color: colorData.data,
          thickness: thicknessData.data
        });
        toast.success(`Applied "${combination.name}" combination`);
      }
    } catch (error) {
      console.error('Error applying combination:', error);
      toast.error('Failed to apply combination');
    }
  };

  const getColorCategories = () => {
    const categories = new Set(['all']);
    colors.forEach(color => {
      // Simple categorization based on color name or hex
      const name = color.name.toLowerCase();
      if (name.includes('black') || name.includes('dark')) categories.add('dark');
      else if (name.includes('white') || name.includes('light')) categories.add('light');
      else if (name.includes('gold') || name.includes('bronze')) categories.add('metallic');
      else if (name.includes('wood') || name.includes('oak') || name.includes('walnut')) categories.add('wood');
      else categories.add('colored');
    });
    return Array.from(categories);
  };

  const getFilteredColors = () => {
    if (selectedCategory === 'all') return colors;
    
    return colors.filter(color => {
      const name = color.name.toLowerCase();
      switch (selectedCategory) {
        case 'dark':
          return name.includes('black') || name.includes('dark');
        case 'light':
          return name.includes('white') || name.includes('light');
        case 'metallic':
          return name.includes('gold') || name.includes('bronze') || name.includes('silver');
        case 'wood':
          return name.includes('wood') || name.includes('oak') || name.includes('walnut') || name.includes('cherry');
        case 'colored':
          return !name.includes('black') && !name.includes('white') && !name.includes('gold') && !name.includes('wood');
        default:
          return true;
      }
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
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
      {/* Popular Combinations */}
      {popularCombinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Style Combinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularCombinations.slice(0, 4).map((combo) => (
                <div
                  key={combo.id}
                  className="border border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors hover:shadow-md"
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
                    Apply Style
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Frame Style & Color
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colors">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="colors">Frame Colors</TabsTrigger>
              <TabsTrigger value="thickness">Frame Thickness</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-6">
              {/* Color Categories */}
              <div className="flex flex-wrap gap-2">
                {getColorCategories().map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Color Grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {getFilteredColors().map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onUpdate({ color })}
                    className={`p-3 border rounded-lg transition-all hover:shadow-md ${
                      wizardData.color?.id === color.id
                        ? 'border-primary ring-2 ring-primary/20 shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded mb-2 border border-border"
                      style={{ backgroundColor: color.hex_code }}
                    />
                    <div className="text-xs font-medium text-center">{color.name}</div>
                    {color.price_adjustment > 0 && (
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        +${color.price_adjustment}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="thickness" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {thicknesses.map((thickness) => (
                  <button
                    key={thickness.id}
                    onClick={() => onUpdate({ thickness })}
                    className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                      wizardData.thickness?.id === thickness.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{thickness.name}</div>
                      <Layers className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {thickness.width_inches}" thick
                    </div>
                    <div className="text-xs">
                      {thickness.price_multiplier !== 1 && (
                        <span className="text-muted-foreground">
                          {thickness.price_multiplier}x base price
                        </span>
                      )}
                    </div>
                    
                    {/* Visual thickness indicator */}
                    <div className="mt-3 flex items-center">
                      <div 
                        className="bg-current rounded"
                        style={{ 
                          width: '60px',
                          height: `${Math.max(2, thickness.width_inches * 4)}px`
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Frame Preview */}
      {wizardData.color && wizardData.thickness && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div 
                className="relative rounded shadow-lg"
                style={{
                  width: '200px',
                  height: '250px',
                  backgroundColor: wizardData.color.hex_code,
                  padding: `${Math.max(8, wizardData.thickness.width_inches * 4)}px`
                }}
              >
                <div className="w-full h-full bg-white rounded-sm flex items-center justify-center">
                  {wizardData.photo ? (
                    <img 
                      src={wizardData.photo.url} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-sm"
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">Your Photo</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              <p>{wizardData.color.name} • {wizardData.thickness.name}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FrameStepComponent;