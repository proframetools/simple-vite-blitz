import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Palette, Layers, Sparkles } from 'lucide-react';

interface MattingOption {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price_adjustment: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StyleStepComponentProps {
  wizardData: any;
  onUpdate: (data: any) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onPriceUpdate?: (price: number) => void;
}

const StyleStepComponent: React.FC<StyleStepComponentProps> = ({
  wizardData,
  onUpdate,
  onNext,
  onPrev
}) => {
  const [mattingOptions, setMattingOptions] = useState<MattingOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMattingOptions();
  }, []);

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

  const handleMattingSelection = (matting: MattingOption | null) => {
    onUpdate({ matting });
  };

  const handleNext = () => {
    onNext();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Style</h2>
        <p className="text-muted-foreground">
          Add the perfect finishing touches to your frame
        </p>
      </div>

      <Tabs defaultValue="matting" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="matting" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Matting Options
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Special Effects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matting" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Select Matting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* No Matting Option */}
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  !wizardData.matting ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleMattingSelection(null)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">No Matting</h4>
                    <Badge variant="outline">Standard</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Clean, minimal look without additional borders
                  </p>
                  <div className="text-lg font-bold text-primary">
                    No additional cost
                  </div>
                </CardContent>
              </Card>

              {/* Matting Options */}
              {mattingOptions.map((option) => (
                <Card 
                  key={option.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    wizardData.matting?.id === option.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleMattingSelection(option)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{option.display_name}</h4>
                      {option.price_adjustment > 0 && (
                        <Badge variant="secondary">
                          +${option.price_adjustment}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {option.description || 'Premium matting option'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Professional matting
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="effects" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Special Effects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">UV Protection</h4>
                    <Badge variant="secondary">+$15</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Protect your photos from fading with UV-resistant glass
                  </p>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Museum quality
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Anti-Glare</h4>
                    <Badge variant="secondary">+$10</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Reduce reflections for better viewing in any light
                  </p>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Enhanced viewing
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          Previous Step
        </Button>
        <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
          Continue to Review
        </Button>
      </div>
    </div>
  );
};

export default StyleStepComponent;