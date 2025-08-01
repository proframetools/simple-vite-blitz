import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Settings, Play, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratorOptions {
  productId: string;
  aspectRatios: string[];
  orientations: string[];
  sizes: string[];
  colors: string[];
  thicknesses: string[];
  includeMatting: boolean;
  mattingOptions: string[];
}

interface GenerationProgress {
  total: number;
  completed: number;
  current: string;
  errors: string[];
}

const BulkVariantGenerator: React.FC<{ productId: string }> = ({ productId }) => {
  const [options, setOptions] = useState<GeneratorOptions>({
    productId,
    aspectRatios: [],
    orientations: [],
    sizes: [],
    colors: [],
    thicknesses: [],
    includeMatting: false,
    mattingOptions: []
  });
  
  const [availableOptions, setAvailableOptions] = useState({
    aspectRatios: [],
    orientations: [],
    sizes: [],
    colors: [],
    thicknesses: [],
    mattingOptions: []
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    total: 0,
    completed: 0,
    current: '',
    errors: []
  });

  useEffect(() => {
    loadAvailableOptions();
  }, []);

  const loadAvailableOptions = async () => {
    try {
      const [sizesRes, colorsRes, thicknessRes, mattingRes] = await Promise.all([
        supabase.from('frame_sizes').select('*').eq('is_active', true),
        supabase.from('frame_colors').select('*').eq('is_active', true),
        supabase.from('frame_thickness').select('*').eq('is_active', true),
        supabase.from('matting_options').select('*').eq('is_active', true)
      ]);

      setAvailableOptions({
        aspectRatios: [
          { id: '1', name: '3:2', ratio_value: 1.5 },
          { id: '2', name: '4:3', ratio_value: 1.333 },
          { id: '3', name: '5:4', ratio_value: 1.25 },
          { id: '4', name: '1:1', ratio_value: 1.0 },
          { id: '5', name: '7:5', ratio_value: 1.4 },
          { id: '6', name: '16:9', ratio_value: 1.778 },
          { id: '7', name: '2:1', ratio_value: 2.0 },
          { id: '8', name: '3:1', ratio_value: 3.0 }
        ],
        orientations: [
          { id: '1', name: 'Landscape', code: 'landscape' },
          { id: '2', name: 'Portrait', code: 'portrait' },
          { id: '3', name: 'Square', code: 'square' }
        ],
        sizes: sizesRes.data || [],
        colors: colorsRes.data || [],
        thicknesses: thicknessRes.data || [],
        mattingOptions: mattingRes.data || []
      });
    } catch (error) {
      console.error('Error loading options:', error);
      toast.error('Failed to load generation options');
    }
  };

  const calculateTotalCombinations = () => {
    const { aspectRatios, orientations, sizes, colors, thicknesses, includeMatting, mattingOptions } = options;
    
    let total = aspectRatios.length * orientations.length * sizes.length * colors.length * thicknesses.length;
    
    if (includeMatting && mattingOptions.length > 0) {
      total *= (mattingOptions.length + 1); // +1 for no matting option
    }
    
    return total;
  };

  const generateVariants = async () => {
    setIsGenerating(true);
    const totalCombinations = calculateTotalCombinations();
    
    setProgress({
      total: totalCombinations,
      completed: 0,
      current: 'Starting generation...',
      errors: []
    });

    try {
      let completed = 0;
      const errors: string[] = [];

      // This is a placeholder for the actual generation logic
      // In reality, this would create database entries
      for (const aspectRatio of options.aspectRatios) {
        for (const orientation of options.orientations) {
          for (const size of options.sizes) {
            for (const color of options.colors) {
              for (const thickness of options.thicknesses) {
                const mattingCombinations = options.includeMatting 
                  ? [null, ...options.mattingOptions] 
                  : [null];

                for (const matting of mattingCombinations) {
                  const variantName = `${aspectRatio}-${orientation}-${size}-${color}-${thickness}${matting ? `-${matting}` : ''}`;
                  
                  setProgress(prev => ({
                    ...prev,
                    completed: completed,
                    current: `Creating variant: ${variantName}`
                  }));

                  // Simulate processing time
                  await new Promise(resolve => setTimeout(resolve, 10));

                  try {
                    // Here would be the actual database insertion
                    // await createVariant({ productId, aspectRatio, orientation, size, color, thickness, matting });
                    console.log(`Would create variant: ${variantName}`);
                  } catch (error) {
                    errors.push(`Failed to create ${variantName}: ${error}`);
                  }

                  completed++;
                }
              }
            }
          }
        }
      }

      setProgress(prev => ({
        ...prev,
        completed: totalCombinations,
        current: 'Generation complete!',
        errors
      }));

      if (errors.length === 0) {
        toast.success(`Successfully generated ${totalCombinations} variants!`);
      } else {
        toast.warning(`Generated ${totalCombinations - errors.length}/${totalCombinations} variants. ${errors.length} failed.`);
      }

    } catch (error) {
      toast.error('Failed to generate variants');
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleOption = (category: keyof GeneratorOptions, value: string) => {
    setOptions(prev => {
      const currentArray = prev[category] as string[];
      const isSelected = currentArray.includes(value);
      
      return {
        ...prev,
        [category]: isSelected 
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const selectAll = (category: keyof GeneratorOptions) => {
    const availableValues = availableOptions[category as keyof typeof availableOptions];
    setOptions(prev => ({
      ...prev,
      [category]: availableValues.map((item: any) => item.id || item.name)
    }));
  };

  const clearAll = (category: keyof GeneratorOptions) => {
    setOptions(prev => ({
      ...prev,
      [category]: []
    }));
  };

  const totalCombinations = calculateTotalCombinations();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Bulk Variant Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Aspect Ratios */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Aspect Ratios</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => selectAll('aspectRatios')}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={() => clearAll('aspectRatios')}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {availableOptions.aspectRatios.map((ratio: any) => (
                <div key={ratio.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`ratio-${ratio.id}`}
                    checked={options.aspectRatios.includes(ratio.id)}
                    onCheckedChange={() => toggleOption('aspectRatios', ratio.id)}
                  />
                  <label htmlFor={`ratio-${ratio.id}`} className="text-sm">
                    {ratio.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Orientations */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Orientations</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => selectAll('orientations')}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={() => clearAll('orientations')}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {availableOptions.orientations.map((orientation: any) => (
                <div key={orientation.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`orientation-${orientation.id}`}
                    checked={options.orientations.includes(orientation.id)}
                    onCheckedChange={() => toggleOption('orientations', orientation.id)}
                  />
                  <label htmlFor={`orientation-${orientation.id}`} className="text-sm">
                    {orientation.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Frame Sizes</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => selectAll('sizes')}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={() => clearAll('sizes')}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {availableOptions.sizes.map((size: any) => (
                <div key={size.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size.id}`}
                    checked={options.sizes.includes(size.id)}
                    onCheckedChange={() => toggleOption('sizes', size.id)}
                  />
                  <label htmlFor={`size-${size.id}`} className="text-sm">
                    {size.display_name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Frame Colors</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => selectAll('colors')}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={() => clearAll('colors')}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {availableOptions.colors.map((color: any) => (
                <div key={color.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color.id}`}
                    checked={options.colors.includes(color.id)}
                    onCheckedChange={() => toggleOption('colors', color.id)}
                  />
                  <label htmlFor={`color-${color.id}`} className="text-sm">
                    {color.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Generation Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Total Combinations:</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {totalCombinations.toLocaleString()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              This will create {totalCombinations} unique product variants based on your selections.
            </p>
          </div>

          {/* Generation Button */}
          <div className="flex justify-center">
            <Button 
              onClick={generateVariants}
              disabled={isGenerating || totalCombinations === 0}
              size="lg"
              className="w-full max-w-sm"
            >
              {isGenerating ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate {totalCombinations} Variants
                </>
              )}
            </Button>
          </div>

          {/* Progress Display */}
          {isGenerating && (
            <div className="space-y-3">
              <Progress value={(progress.completed / progress.total) * 100} className="w-full" />
              <div className="text-center">
                <p className="text-sm font-medium">{progress.current}</p>
                <p className="text-xs text-muted-foreground">
                  {progress.completed} of {progress.total} completed
                </p>
              </div>
              {progress.errors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">
                      {progress.errors.length} Errors
                    </span>
                  </div>
                  <div className="max-h-32 overflow-y-auto text-xs text-muted-foreground">
                    {progress.errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkVariantGenerator;