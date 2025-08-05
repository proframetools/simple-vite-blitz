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
import { FrameSize } from '@/lib/types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const FrameSizeManager: React.FC = () => {
  const [sizes, setSizes] = useState<FrameSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<FrameSize | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    width_inches: '',
    height_inches: '',
    price_multiplier: '',
  });

  useEffect(() => {
    loadSizes();
  }, []);

  const loadSizes = async () => {
    try {
      const { data, error } = await supabase
        .from('frame_sizes')
        .select('*')
        .order('width_inches', { ascending: true });

      if (error) throw error;
      setSizes(data || []);
    } catch (error) {
      console.error('Error loading sizes:', error);
      toast.error('Failed to load sizes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const sizeData = {
        name: formData.name,
        display_name: formData.display_name,
        width_inches: parseFloat(formData.width_inches),
        height_inches: parseFloat(formData.height_inches),
        price_multiplier: parseFloat(formData.price_multiplier),
      };

      if (editingSize) {
        const { error } = await supabase
          .from('frame_sizes')
          .update(sizeData)
          .eq('id', editingSize.id);

        if (error) throw error;
        toast.success('Size updated successfully');
      } else {
        const { error } = await supabase
          .from('frame_sizes')
          .insert([sizeData]);

        if (error) throw error;
        toast.success('Size created successfully');
      }

      setDialogOpen(false);
      setEditingSize(null);
      setFormData({ name: '', display_name: '', width_inches: '', height_inches: '', price_multiplier: '' });
      loadSizes();
    } catch (error) {
      console.error('Error saving size:', error);
      toast.error('Failed to save size');
    }
  };

  const handleEdit = (size: FrameSize) => {
    setEditingSize(size);
    setFormData({
      name: size.name,
      display_name: size.display_name,
      width_inches: size.width_inches.toString(),
      height_inches: size.height_inches.toString(),
      price_multiplier: size.price_multiplier.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (sizeId: string) => {
    if (!confirm('Are you sure you want to delete this size?')) return;

    try {
      const { error } = await supabase
        .from('frame_sizes')
        .delete()
        .eq('id', sizeId);

      if (error) throw error;
      toast.success('Size deleted successfully');
      loadSizes();
    } catch (error) {
      console.error('Error deleting size:', error);
      toast.error('Failed to delete size');
    }
  };

  const toggleActiveStatus = async (size: FrameSize) => {
    try {
      const { error } = await supabase
        .from('frame_sizes')
        .update({ is_active: !size.is_active })
        .eq('id', size.id);

      if (error) throw error;
      toast.success(`Size ${size.is_active ? 'deactivated' : 'activated'} successfully`);
      loadSizes();
    } catch (error) {
      console.error('Error updating size status:', error);
      toast.error('Failed to update size status');
    }
  };

  const filteredSizes = sizes.filter(size =>
    size.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    size.display_name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold">Frame Size Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingSize(null);
                setFormData({ name: '', display_name: '', width_inches: '', height_inches: '', price_multiplier: '' });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Size
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSize ? 'Edit Size' : 'Add New Size'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Internal Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="8x10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="8x10 inches"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width_inches">Width (inches)</Label>
                    <Input
                      id="width_inches"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.width_inches}
                      onChange={(e) => setFormData({ ...formData, width_inches: e.target.value })}
                      placeholder="8"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height_inches">Height (inches)</Label>
                    <Input
                      id="height_inches"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.height_inches}
                      onChange={(e) => setFormData({ ...formData, height_inches: e.target.value })}
                      placeholder="10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_multiplier">Price Multiplier</Label>
                  <Input
                    id="price_multiplier"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.price_multiplier}
                    onChange={(e) => setFormData({ ...formData, price_multiplier: e.target.value })}
                    placeholder="1.0"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Multiplies the base product price (1.0 = no change, 1.5 = 50% increase)
                  </p>
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
                    {editingSize ? 'Update' : 'Create'} Size
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Frame Sizes</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sizes..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Price Multiplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSizes.map((size) => (
                  <TableRow key={size.id}>
                    <TableCell className="font-medium">{size.name}</TableCell>
                    <TableCell>{size.display_name}</TableCell>
                    <TableCell>
                      {size.width_inches}" × {size.height_inches}"
                    </TableCell>
                    <TableCell>{size.price_multiplier}x</TableCell>
                    <TableCell>
                      <Badge
                        variant={size.is_active ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleActiveStatus(size)}
                      >
                        {size.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(size)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(size.id)}
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

export default FrameSizeManager;