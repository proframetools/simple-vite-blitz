import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PreviewImage } from '@/lib/types';
import { Plus, Edit, Trash2, Search, Upload } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const PreviewImageManager: React.FC = () => {
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<PreviewImage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aspectRatios, setAspectRatios] = useState<any[]>([]);
  const [orientations, setOrientations] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [thickness, setThickness] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    aspect_ratio_id: '',
    orientation_id: '',
    color_id: '',
    thickness_id: '',
    image_url: '',
    alt_text: '',
  });

  useEffect(() => {
    loadImages();
    loadOptions();
  }, []);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from('preview_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [aspectRatiosRes, orientationsRes, colorsRes, thicknessRes] = await Promise.all([
        supabase.from('aspect_ratios').select('*').eq('is_active', true),
        supabase.from('frame_orientations').select('*').eq('is_active', true),
        supabase.from('frame_colors').select('*').eq('is_active', true),
        supabase.from('frame_thickness').select('*').eq('is_active', true),
      ]);

      setAspectRatios(aspectRatiosRes.data || []);
      setOrientations(orientationsRes.data || []);
      setColors(colorsRes.data || []);
      setThickness(thicknessRes.data || []);
    } catch (error) {
      console.error('Error loading options:', error);
      toast.error('Failed to load form options');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const imageData = {
        aspect_ratio_id: formData.aspect_ratio_id,
        orientation_id: formData.orientation_id,
        color_id: formData.color_id,
        thickness_id: formData.thickness_id,
        image_url: formData.image_url,
        alt_text: formData.alt_text || null,
      };

      if (editingImage) {
        const { error } = await supabase
          .from('preview_images')
          .update(imageData)
          .eq('id', editingImage.id);

        if (error) throw error;
        toast.success('Preview image updated successfully');
      } else {
        const { error } = await supabase
          .from('preview_images')
          .insert([imageData]);

        if (error) throw error;
        toast.success('Preview image created successfully');
      }

      setDialogOpen(false);
      setEditingImage(null);
      resetForm();
      loadImages();
    } catch (error) {
      console.error('Error saving preview image:', error);
      toast.error('Failed to save preview image');
    }
  };

  const resetForm = () => {
    setFormData({
      aspect_ratio_id: '',
      orientation_id: '',
      color_id: '',
      thickness_id: '',
      image_url: '',
      alt_text: '',
    });
  };

  const handleEdit = (image: PreviewImage) => {
    setEditingImage(image);
    setFormData({
      aspect_ratio_id: image.aspect_ratio_id,
      orientation_id: image.orientation_id,
      color_id: image.color_id,
      thickness_id: image.thickness_id,
      image_url: image.image_url,
      alt_text: image.alt_text || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this preview image?')) return;

    try {
      const { error } = await supabase
        .from('preview_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      toast.success('Preview image deleted successfully');
      loadImages();
    } catch (error) {
      console.error('Error deleting preview image:', error);
      toast.error('Failed to delete preview image');
    }
  };

  const toggleActiveStatus = async (image: PreviewImage) => {
    try {
      const { error } = await supabase
        .from('preview_images')
        .update({ is_active: !image.is_active })
        .eq('id', image.id);

      if (error) throw error;
      toast.success(`Preview image ${image.is_active ? 'deactivated' : 'activated'} successfully`);
      loadImages();
    } catch (error) {
      console.error('Error updating preview image status:', error);
      toast.error('Failed to update preview image status');
    }
  };

  const filteredImages = images.filter(image =>
    image.alt_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    image.image_url.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold">Preview Image Management</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingImage(null);
                resetForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Preview Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingImage ? 'Edit Preview Image' : 'Add New Preview Image'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aspect_ratio_id">Aspect Ratio</Label>
                  <Select
                    value={formData.aspect_ratio_id}
                    onValueChange={(value) => setFormData({ ...formData, aspect_ratio_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select aspect ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map((ratio) => (
                        <SelectItem key={ratio.id} value={ratio.id}>
                          {ratio.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orientation_id">Orientation</Label>
                  <Select
                    value={formData.orientation_id}
                    onValueChange={(value) => setFormData({ ...formData, orientation_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      {orientations.map((orientation) => (
                        <SelectItem key={orientation.id} value={orientation.id}>
                          {orientation.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color_id">Frame Color</Label>
                  <Select
                    value={formData.color_id}
                    onValueChange={(value) => setFormData({ ...formData, color_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          {color.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thickness_id">Frame Thickness</Label>
                  <Select
                    value={formData.thickness_id}
                    onValueChange={(value) => setFormData({ ...formData, thickness_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select thickness" />
                    </SelectTrigger>
                    <SelectContent>
                      {thickness.map((thick) => (
                        <SelectItem key={thick.id} value={thick.id}>
                          {thick.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alt_text">Alt Text</Label>
                  <Input
                    id="alt_text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                    placeholder="Description for accessibility"
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
                    {editingImage ? 'Update' : 'Create'} Image
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview Images</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
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
                  <TableHead>Alt Text</TableHead>
                  <TableHead>Configuration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImages.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell>
                      <img
                        src={image.image_url}
                        alt={image.alt_text || 'Preview'}
                        className="w-16 h-16 object-cover rounded border border-border"
                      />
                    </TableCell>
                    <TableCell>{image.alt_text || 'No alt text'}</TableCell>
                    <TableCell className="text-xs">
                      <div className="space-y-1">
                        <div>Aspect: {image.aspect_ratio_id.slice(0, 8)}...</div>
                        <div>Orient: {image.orientation_id.slice(0, 8)}...</div>
                        <div>Color: {image.color_id.slice(0, 8)}...</div>
                        <div>Thick: {image.thickness_id.slice(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={image.is_active ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleActiveStatus(image)}
                      >
                        {image.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(image.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(image)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(image.id)}
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

export default PreviewImageManager;