import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, Shield, Sparkles, Crown } from 'lucide-react';
import { WizardData } from '../CustomFrameWizard';

interface StyleStepComponentProps {
  product: any;
  wizardData: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onPriceUpdate: (price: number) => void;
}

interface MattingOption {
  id: string;
  name: string;
  color_hex: string;
  thickness_inches: number;
  is_double_mat: boolean;
  price_adjustment: number;
}

const StyleStepComponent: React.FC<StyleStepComponentProps> = ({
  product,
  wizardData,
  onUpdate,
  onPriceUpdate
}) => {
  const [mattingOptions, setMattingOptions] = useState<MattingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGlassType, setSelectedGlassType] = useState<string>('standard');

  const glassOptions = [
    {
      id: 'standard',
      name: 'Standard Glass',
      description: 'Basic clear glass protection',
      priceAdjustment: 0,
      features: ['Basic protection', 'Clear visibility']
    },
    {
      id: 'anti-glare',
      name: 'Anti-Glare Glass',
      description: 'Reduces reflections and glare',
      priceAdjustment: 15,
      features: ['Reduced glare', 'Museum-quality', 'UV protection']
    },
    {
      id: 'uv-protection',
      name: 'UV Protection Glass',
      description: 'Protects against UV damage',
      priceAdjustment: 25,
      features: ['99% UV protection', 'Prevents fading', 'Crystal clear']
    },
    {
      id: 'museum',
      name: 'Museum Glass',
      description: 'Premium conservation glass',
      priceAdjustment: 50,
      features: ['Zero glare', '99% UV protection', 'Virtually invisible', 'Conservation grade']
    }
  ];

  useEffect(() => {
    fetchMattingOptions();
  }, []);

  useEffect(() => {
    calculatePrice();
  }, [wizardData.matting, selectedGlassType]);

  const fetchMattingOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('matting_options')
        .select('*')
        .eq('is_active', true)
        .order('price_adjustment');

      if (error) throw error;
      setMattingOptions(data || []);
    } catch (error) {
      console.error('Error fetching matting options:', error);
      toast.error('Failed to load matting options');
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

    // Apply matting adjustment
    if (wizardData.matting) {
      price += wizardData.matting.price_adjustment;
    }

    // Apply glass adjustment
    const glass = glassOptions.find(g => g.id === selectedGlassType);
    if (glass) {
      price += glass.priceAdjustment;
    }

    onPriceUpdate(price);
  };

  const handleGlassSelect = (glassType: string) => {
    setSelectedGlassType(glassType);
    onUpdate({ glassType });
  };

  const handleMattingSelect = (matting: MattingOption | null) => {
    onUpdate({ matting });
  };

  const getMattingCategories = () => {
    const singleMats = mattingOptions.filter(m => !m.is_double_mat);
    const doubleMats = mattingOptions.filter(m => m.is_double_mat);
    
    return { singleMats, doubleMats };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { singleMats, doubleMats } = getMattingCategories();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Matting & Finishing Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="matting">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="matting">Matting</TabsTrigger>
              <TabsTrigger value="glass">Glass Protection</TabsTrigger>
            </TabsList>

            <TabsContent value="matting" className="space-y-6">
              {/* No Matting Option */}
              <div>
                <h4 className="font-medium mb-3">No Matting</h4>
                <button
                  onClick={() => handleMattingSelect(null)}
                  className={`w-full p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                    !wizardData.matting
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">No Matting</div>
                  <div className="text-sm text-muted-foreground">
                    Direct photo-to-frame mounting
                  </div>
                </button>
              </div>

              {/* Single Matting */}
              {singleMats.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Single Matting</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {singleMats.map((matting) => (
                      <button
                        key={matting.id}
                        onClick={() => handleMattingSelect(matting)}
                        className={`p-3 border rounded-lg transition-all hover:shadow-md ${
                          wizardData.matting?.id === matting.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded border mb-2"
                          style={{ backgroundColor: matting.color_hex }}
                        />
                        <div className="text-sm font-medium text-center">{matting.name}</div>
                        <div className="text-xs text-muted-foreground text-center mt-1">
                          +${matting.price_adjustment}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Double Matting */}
              {doubleMats.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-medium">Double Matting</h4>
                    <Badge variant="secondary" className="text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doubleMats.map((matting) => (
                      <button
                        key={matting.id}
                        onClick={() => handleMattingSelect(matting)}
                        className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                          wizardData.matting?.id === matting.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: matting.color_hex }}
                          />
                          <div>
                            <div className="font-medium">{matting.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Double Mat • +${matting.price_adjustment}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Enhanced depth and visual appeal
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="glass" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {glassOptions.map((glass) => (
                  <button
                    key={glass.id}
                    onClick={() => handleGlassSelect(glass.id)}
                    className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                      selectedGlassType === glass.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {glass.name}
                          {glass.id === 'museum' && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                          {glass.id === 'uv-protection' && (
                            <Shield className="h-4 w-4 text-blue-500" />
                          )}
                          {glass.id === 'anti-glare' && (
                            <Sparkles className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {glass.description}
                        </div>
                      </div>
                      {glass.priceAdjustment > 0 && (
                        <div className="text-sm font-medium">
                          +${glass.priceAdjustment}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {glass.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Glass Comparison */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Glass Protection Guide</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Standard:</strong> Basic protection for everyday display</p>
                    <p><strong>Anti-Glare:</strong> Ideal for bright rooms with lots of windows</p>
                    <p><strong>UV Protection:</strong> Best for valuable photos that need preservation</p>
                    <p><strong>Museum Glass:</strong> Professional-grade for heirloom pieces</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Style Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Style Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="relative">
              {/* Frame */}
              <div 
                className="relative rounded shadow-lg"
                style={{
                  width: '240px',
                  height: '300px',
                  backgroundColor: wizardData.color?.hex_code || '#8B4513',
                  padding: `${wizardData.thickness ? Math.max(12, wizardData.thickness.width_inches * 6) : 12}px`
                }}
              >
                {/* Matting */}
                {wizardData.matting && (
                  <div 
                    className="relative rounded"
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: wizardData.matting.color_hex,
                      padding: `${Math.max(8, wizardData.matting.thickness_inches * 8)}px`
                    }}
                  >
                    {/* Photo area */}
                    <div className="w-full h-full bg-white rounded-sm flex items-center justify-center relative overflow-hidden">
                      {wizardData.photo ? (
                        <img 
                          src={wizardData.photo.url} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">Your Photo</span>
                      )}
                      
                      {/* Glass effect overlay */}
                      {selectedGlassType === 'anti-glare' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                      )}
                      {selectedGlassType === 'museum' && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none" />
                      )}
                    </div>
                  </div>
                )}
                
                {/* No matting - direct photo */}
                {!wizardData.matting && (
                  <div className="w-full h-full bg-white rounded-sm flex items-center justify-center relative overflow-hidden">
                    {wizardData.photo ? (
                      <img 
                        src={wizardData.photo.url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">Your Photo</span>
                    )}
                    
                    {/* Glass effect overlay */}
                    {selectedGlassType === 'anti-glare' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    )}
                    {selectedGlassType === 'museum' && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4 space-y-1">
            <p className="text-sm text-muted-foreground">
              {wizardData.matting ? `${wizardData.matting.name} matting` : 'No matting'} • {glassOptions.find(g => g.id === selectedGlassType)?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Final preview will be shown in the review step
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StyleStepComponent;