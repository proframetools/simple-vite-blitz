import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FrameColor } from '@/lib/types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const FrameColorManager: React.FC = () => {
  const [colors, setColors] = useState<FrameColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<FrameColor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    hex_code: '#000000',
    price_adjustment: '',
  });

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    try {
      const { data, error } = await supabase
        .from('frame_colors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setColors(data || []);
    } catch (error) {
      console.error('Error loading colors:', error);
      toast.error('Failed to load colors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const colorData = {
        name: formData.name,
        display_name: formData.display_name,
        hex_code: formData.hex_code,
        price_adjustment: formData.price_adjustment ? parseFloat(formData.price_adjustment) : null,
      };

      if (editingColor) {
        const { error } = await supabase
          .from('frame_colors')
          .update(colorData)
          .eq('id', editingColor.id);

        if (error) throw error;
        toast.success('Color updated successfully');
      } else {
        const { error } = await supabase
          .from('frame_colors')
          .insert([colorData]);

        if (error) throw error;
        toast.success('Color created successfully');
      }

      setDialogOpen(false);
      setEditingColor(null);
      setFormData({ name: '', display_name: '', hex_code: '#000000', price_adjustment: '' });
      loadColors();
    } catch (error) {
      console.error('Error saving color:', error);
      toast.error('Failed to save color');
    }
  };

  const handleEdit = (color: FrameColor) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      display_name: color.display_name,
      hex_code: color.hex_code || '#000000',
      price_adjustment: color.price_adjustment?.toString() || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (colorId: string) => {
    if (!confirm('Are you sure you want to delete this color?')) return;

    try {
      const { error } = await supabase
        .from('frame_colors')
        .delete()
        .eq('id', colorId);

      if (error) throw error;
      toast.success('Color deleted successfully');
      loadColors();
    } catch (error) {
      console.error('Error deleting color:', error);
      toast.error('Failed to delete color');
    }
  };

  const toggleActiveStatus = async (color: FrameColor) => {
    try {
      const { error } = await supabase
        .from('frame_colors')
        .update({ is_active: !color.is_active })
        .eq('id', color.id);

      if (error) throw error;
      toast.success(`Color ${color.is_active ? 'deactivated' : 'activated'} successfully`);
      loadColors();
    } catch (error) {
      console.error('Error updating color status:', error);
      toast.error('Failed to update color status');
    }
  };

  const filteredColors = colors.filter(color =>
    color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    color.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Frame Color Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingColor(null);
                setFormData({ name: '', display_name: '', hex_code: '#000000', price_adjustment: '' });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Color
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingColor ? 'Edit Color' : 'Add New Color'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Internal Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="internal_name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="Beautiful Color Name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hex_code">Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="hex_code"
                      value={formData.hex_code}
                      onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                      className="w-16 h-10 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={formData.hex_code}
                      onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                      placeholder="#000000"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_adjustment">Price Adjustment</Label>
                  <Input
                    id="price_adjustment"
                    type="number"
                    step="0.01"
                    value={formData.price_adjustment}
                    onChange={(e) => setFormData({ ...formData, price_adjustment: e.target.value })}
                    placeholder="0.00 (optional)"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingColor ? 'Update' : 'Create'} Color
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Frame Colors</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search colors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Hex Code</TableHead>
                  <TableHead>Price Adjustment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColors.map((color) => (
                  <TableRow key={color.id}>
                    <TableCell>
                      <div
                        className="w-8 h-8 rounded border border-border"
                        style={{ backgroundColor: color.hex_code || '#000000' }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{color.name}</TableCell>
                    <TableCell>{color.display_name}</TableCell>
                    <TableCell className="font-mono">{color.hex_code}</TableCell>
                    <TableCell>
                      {color.price_adjustment 
                        ? `₹${color.price_adjustment.toLocaleString('en-IN')}`
                        : '₹0'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={color.is_active ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleActiveStatus(color)}
                      >
                        {color.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(color)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(color.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default FrameColorManager;