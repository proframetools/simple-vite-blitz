import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, X } from 'lucide-react';
import { formatPrice, PRICE_RANGES } from '@/lib/currency';

interface FilterState {
  categories: string[];
  occasions: string[];
  materials: string[];
  priceRange: [number, number];
  inStock: boolean;
  minRating: number;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [occasions, setOccasions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_RANGES.DEFAULT_MIN, PRICE_RANGES.DEFAULT_MAX]);

  useEffect(() => {
    fetchFilterData();
  }, []);

  const fetchFilterData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      // Fetch occasions
      const { data: occasionsData } = await supabase
        .from('occasions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      // Get unique materials from products
      const { data: productsData } = await supabase
        .from('products')
        .select('material')
        .eq('is_active', true);

      // Get price range
      const { data: priceData } = await supabase
        .from('products')
        .select('base_price')
        .eq('is_active', true)
        .order('base_price');

      if (categoriesData) setCategories(categoriesData);
      if (occasionsData) setOccasions(occasionsData);
      
      if (productsData) {
        const uniqueMaterials = [...new Set(productsData.map(p => p.material))];
        setMaterials(uniqueMaterials);
      }

      if (priceData && priceData.length > 0) {
        const minPrice = Math.floor(Number(priceData[0].base_price));
        const maxPrice = Math.ceil(Number(priceData[priceData.length - 1].base_price));
        setPriceRange([minPrice, maxPrice]);
      }
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'categories' | 'occasions' | 'materials', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      occasions: [],
      materials: [],
      priceRange: [PRICE_RANGES.DEFAULT_MIN, PRICE_RANGES.DEFAULT_MAX],
      inStock: false,
      minRating: 0,
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || 
    filters.occasions.length > 0 || 
    filters.materials.length > 0 || 
    filters.inStock || 
    filters.minRating > 0 ||
    filters.priceRange[0] !== priceRange[0] || 
    filters.priceRange[1] !== PRICE_RANGES.DEFAULT_MAX;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Categories */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-lg">
          <span className="font-medium text-foreground">Categories</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={() => toggleArrayFilter('categories', category.id)}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {category.name}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Occasions */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-lg">
          <span className="font-medium text-foreground">Occasions</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {occasions.map((occasion) => (
            <div key={occasion.id} className="flex items-center space-x-2">
              <Checkbox
                id={`occasion-${occasion.id}`}
                checked={filters.occasions.includes(occasion.id)}
                onCheckedChange={() => toggleArrayFilter('occasions', occasion.id)}
              />
              <label
                htmlFor={`occasion-${occasion.id}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {occasion.name}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Materials */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-lg">
          <span className="font-medium text-foreground">Materials</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {materials.map((material) => (
            <div key={material} className="flex items-center space-x-2">
              <Checkbox
                id={`material-${material}`}
                checked={filters.materials.includes(material)}
                onCheckedChange={() => toggleArrayFilter('materials', material)}
              />
              <label
                htmlFor={`material-${material}`}
                className="text-sm text-foreground cursor-pointer capitalize"
              >
                {material}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-lg">
          <span className="font-medium text-foreground">Price Range</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
            max={priceRange[1]}
            min={priceRange[0]}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Additional Filters */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock}
            onCheckedChange={(checked) => updateFilter('inStock', checked)}
          />
          <label htmlFor="in-stock" className="text-sm text-foreground cursor-pointer">
            In Stock Only
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Minimum Rating</label>
          <Slider
            value={[filters.minRating]}
            onValueChange={(value) => updateFilter('minRating', value[0])}
            max={5}
            min={0}
            step={0.5}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">
            {filters.minRating} stars and above
          </div>
        </div>
      </div>
    </div>
  );
}