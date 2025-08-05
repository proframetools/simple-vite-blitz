import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';

interface ProductVariant {
  id: string;
  product_id: string;
  aspect_ratio_id: string;
  orientation_id: string;
  size_id: string;
  thickness_id: string;
  color_id: string;
  matting_id?: string;
  price_override?: number;
  stock_quantity: number;
  sku?: string;
  is_active: boolean;
  // Joined data
  aspect_ratio_name?: string;
  orientation_name?: string;
  size_name?: string;
  thickness_name?: string;
  color_name?: string;
  matting_name?: string;
  product_name?: string;
}

interface VariantFormData {
  product_id: string;
  aspect_ratio_id: string;
  orientation_id: string;
  size_id: string;
  thickness_id: string;
  color_id: string;
  matting_id?: string;
  price_override?: number;
  stock_quantity: number;
  is_active: boolean;
}

const VariantManager = () => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [aspectRatios, setAspectRatios] = useState<any[]>([]);
  const [orientations, setOrientations] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [thicknesses, setThicknesses] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [mattingOptions, setMattingOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<VariantFormData>({
    product_id: '',
    aspect_ratio_id: '',
    orientation_id: '',
    size_id: '',
    thickness_id: '',
    color_id: '',
    price_override: undefined,
    stock_quantity: 0,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadVariants();
    }
  }, [selectedProduct]);

  const loadData = async () => {
    try {
      // Load existing data that's already in the type system
      const [
        productsRes,
        sizesRes,
        thicknessRes,
        colorsRes,
        mattingRes
      ] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true),
        supabase.from('frame_sizes').select('*').eq('is_active', true),
        supabase.from('frame_thickness').select('*').eq('is_active', true),
        supabase.from('frame_colors').select('*').eq('is_active', true),
        supabase.from('matting_options').select('*').eq('is_active', true)
      ]);

      setProducts(productsRes.data || []);
      setSizes(sizesRes.data || []);
      setThicknesses(thicknessRes.data || []);
      setColors(colorsRes.data || []);
      setMattingOptions(mattingRes.data || []);

      // Load new variant system tables
      const [aspectRatiosRes, orientationsRes] = await Promise.all([
        supabase.from('aspect_ratios').select('*').eq('is_active', true),
        supabase.from('frame_orientations').select('*').eq('is_active', true)
      ]);

      setAspectRatios(aspectRatiosRes.data || []);
      setOrientations(orientationsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load variant options');
    } finally {
      setLoading(false);
    }
  };

  const loadVariants = async () => {
    if (!selectedProduct) return;
    
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          product:products(name),
          aspect_ratio:aspect_ratios(name, display_name),
          orientation:frame_orientations(name, display_name),
          size:frame_sizes(name, display_name),
          color:frame_colors(name, display_name),
          thickness:frame_thickness(name, display_name),
          matting:matting_options(name, display_name)
        `)
        .eq('product_id', selectedProduct)
        .eq('is_active', true);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedVariants: ProductVariant[] = (data || []).map(variant => ({
        ...variant,
        aspect_ratio_name: variant.aspect_ratio?.name,
        orientation_name: variant.orientation?.name,
        size_name: variant.size?.display_name,
        color_name: variant.color?.display_name,
        thickness_name: variant.thickness?.display_name,
        matting_name: variant.matting?.display_name,
        product_name: variant.product?.name,
        price_override: variant.price_adjustment
      }));
      
      setVariants(transformedVariants);
    } catch (error) {
      console.error('Error loading variants:', error);
      toast.error("Failed to load product variants");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate SKU
      const product = products.find(p => p.id === formData.product_id);
      const aspectRatio = aspectRatios.find(ar => ar.id === formData.aspect_ratio_id);
      const color = colors.find(c => c.id === formData.color_id);
      const thickness = thicknesses.find(t => t.id === formData.thickness_id);
      
      const sku = `${product?.name?.substring(0, 3).toUpperCase()}-${aspectRatio?.name}-${color?.name?.substring(0, 3).toUpperCase()}-${thickness?.name?.substring(0, 3).toUpperCase()}`.replace(/\s+/g, '');

      // Create the variant
      const variantData = {
        product_id: formData.product_id,
        aspect_ratio_id: formData.aspect_ratio_id,
        orientation_id: formData.orientation_id,
        size_id: formData.size_id,
        color_id: formData.color_id,
        thickness_id: formData.thickness_id,
        matting_id: formData.matting_id || null,
        sku: sku,
        price_adjustment: formData.price_override || 0,
        stock_quantity: formData.stock_quantity,
        is_active: formData.is_active
      };

      if (editingVariant) {
        const { error } = await supabase
          .from('product_variants')
          .update(variantData)
          .eq('id', editingVariant.id);
        
        if (error) throw error;
        toast.success('Variant updated successfully');
      } else {
        const { error } = await supabase
          .from('product_variants')
          .insert(variantData);
        
        if (error) throw error;
        toast.success('Variant created successfully');
      }

      setIsDialogOpen(false);
      setEditingVariant(null);
      resetForm();
      loadVariants();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      product_id: variant.product_id,
      aspect_ratio_id: variant.aspect_ratio_id,
      orientation_id: variant.orientation_id,
      size_id: variant.size_id,
      thickness_id: variant.thickness_id,
      color_id: variant.color_id,
      matting_id: variant.matting_id,
      price_override: variant.price_override,
      stock_quantity: variant.stock_quantity,
      is_active: variant.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
      
      toast.success('Variant deleted successfully');
      loadVariants();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: selectedProduct,
      aspect_ratio_id: '',
      orientation_id: '',
      size_id: '',
      thickness_id: '',
      color_id: '',
      price_override: undefined,
      stock_quantity: 0,
      is_active: true
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Product Variants</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedProduct} onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Variant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingVariant ? 'Edit Variant' : 'Create New Variant'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aspect_ratio_id">Aspect Ratio</Label>
                    <Select value={formData.aspect_ratio_id} onValueChange={(value) => setFormData({...formData, aspect_ratio_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select aspect ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        {aspectRatios.map(ratio => (
                          <SelectItem key={ratio.id} value={ratio.id}>{ratio.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="orientation_id">Orientation</Label>
                    <Select value={formData.orientation_id} onValueChange={(value) => setFormData({...formData, orientation_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        {orientations.map(orientation => (
                          <SelectItem key={orientation.id} value={orientation.id}>{orientation.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="size_id">Size</Label>
                    <Select value={formData.size_id} onValueChange={(value) => setFormData({...formData, size_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map(size => (
                          <SelectItem key={size.id} value={size.id}>{size.display_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="thickness_id">Thickness</Label>
                    <Select value={formData.thickness_id} onValueChange={(value) => setFormData({...formData, thickness_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select thickness" />
                      </SelectTrigger>
                      <SelectContent>
                        {thicknesses.map(thickness => (
                          <SelectItem key={thickness.id} value={thickness.id}>{thickness.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="color_id">Color</Label>
                    <Select value={formData.color_id} onValueChange={(value) => setFormData({...formData, color_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map(color => (
                          <SelectItem key={color.id} value={color.id}>{color.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="matting_id">Matting (Optional)</Label>
                    <Select value={formData.matting_id || ''} onValueChange={(value) => setFormData({...formData, matting_id: value || undefined})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select matting" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Matting</SelectItem>
                        {mattingOptions.map(matting => (
                          <SelectItem key={matting.id} value={matting.id}>{matting.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price_override">Price Override</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price_override || ''}
                      onChange={(e) => setFormData({...formData, price_override: e.target.value ? Number(e.target.value) : undefined})}
                      placeholder="Optional price override"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({...formData, stock_quantity: Number(e.target.value)})}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={formData.is_active} 
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingVariant ? 'Update' : 'Create'} Variant
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Product</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a product to manage variants" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Variants Table */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Variants ({variants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Ratio</TableHead>
                    <TableHead>Orientation</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Thickness</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map(variant => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                      <TableCell>{variant.aspect_ratio_name}</TableCell>
                      <TableCell>{variant.orientation_name}</TableCell>
                      <TableCell>{variant.size_name}</TableCell>
                      <TableCell>{variant.color_name}</TableCell>
                      <TableCell>{variant.thickness_name}</TableCell>
                      <TableCell>{variant.stock_quantity}</TableCell>
                      <TableCell>
                        <Badge variant={variant.is_active ? 'default' : 'secondary'}>
                          {variant.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(variant)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(variant.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default VariantManager;