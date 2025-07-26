import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Camera, X, AlertTriangle } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoUploaded: (photoData: {
    id: string;
    url: string;
    fileName: string;
    width: number;
    height: number;
    dpi?: number;
  }) => void;
  maxFiles?: number;
  acceptMultiple?: boolean;
}

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  progress: number;
  uploaded: boolean;
  url?: string;
  width?: number;
  height?: number;
  dpi?: number;
  error?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotoUploaded,
  maxFiles = 5,
  acceptMultiple = true
}) => {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());

  const validateImageQuality = (file: File, width: number, height: number): { isValid: boolean; warnings: string[] } => {
    const warnings: string[] = [];
    const fileSizeMB = file.size / (1024 * 1024);
    
    // Calculate approximate DPI for common print sizes
    const minPixelsFor300DPI = {
      '4x6': { width: 1200, height: 1800 },
      '5x7': { width: 1500, height: 2100 },
      '8x10': { width: 2400, height: 3000 },
      '11x14': { width: 3300, height: 4200 }
    };

    // Check if image meets 300 DPI for common sizes
    const isGoodFor4x6 = width >= minPixelsFor300DPI['4x6'].width && height >= minPixelsFor300DPI['4x6'].height;
    const isGoodFor8x10 = width >= minPixelsFor300DPI['8x10'].width && height >= minPixelsFor300DPI['8x10'].height;

    if (!isGoodFor4x6) {
      warnings.push('Image resolution may be too low for quality printing (minimum 1200x1800 recommended)');
    } else if (!isGoodFor8x10) {
      warnings.push('Image suitable for smaller prints. For 8x10" or larger, higher resolution recommended');
    }

    if (fileSizeMB > 50) {
      warnings.push('File size exceeds 50MB limit');
      return { isValid: false, warnings };
    }

    return { isValid: true, warnings };
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadToSupabase = async (file: File, photoId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${sessionId}/${photoId}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('customer-photos')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('customer-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const savePhotoMetadata = async (photo: UploadedPhoto, url: string, dimensions: { width: number; height: number }) => {
    const { data, error } = await supabase
      .from('uploaded_photos')
      .insert({
        session_id: sessionId,
        file_name: photo.file.name,
        file_size: photo.file.size,
        file_type: photo.file.type,
        width_pixels: dimensions.width,
        height_pixels: dimensions.height,
        storage_path: url,
        is_processed: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const processFile = async (file: File) => {
    const photoId = crypto.randomUUID();
    const preview = URL.createObjectURL(file);
    
    const newPhoto: UploadedPhoto = {
      id: photoId,
      file,
      preview,
      uploading: false,
      progress: 0,
      uploaded: false
    };

    setPhotos(prev => [...prev, newPhoto]);

    try {
      // Get image dimensions
      const dimensions = await getImageDimensions(file);
      
      // Validate image quality
      const validation = validateImageQuality(file, dimensions.width, dimensions.height);
      
      if (!validation.isValid) {
        throw new Error(validation.warnings[0]);
      }

      // Show warnings but continue
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          toast.warning(warning);
        });
      }

      // Start upload
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, uploading: true, progress: 10 } : p
      ));

      // Upload to Supabase Storage
      const url = await uploadToSupabase(file, photoId);
      
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, progress: 70 } : p
      ));

      // Save metadata
      const photoData = await savePhotoMetadata(newPhoto, url, dimensions);
      
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { 
          ...p, 
          uploading: false, 
          uploaded: true, 
          progress: 100,
          url,
          width: dimensions.width,
          height: dimensions.height
        } : p
      ));

      // Create the photo data object that will be passed to parent
      const uploadedPhotoData = {
        id: photoData.id,
        url,
        fileName: file.name,
        width: dimensions.width,
        height: dimensions.height
      };

      console.log('PhotoUpload: Notifying parent with photo data:', uploadedPhotoData);

      // Notify parent component
      onPhotoUploaded(uploadedPhotoData);

      toast.success('Photo uploaded successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, uploading: false, error: errorMessage } : p
      ));
      
      toast.error(errorMessage);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = maxFiles - photos.length;
    const filesToProcess = acceptedFiles.slice(0, remainingSlots);
    
    if (acceptedFiles.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} more photos can be uploaded`);
    }

    filesToProcess.forEach(processFile);
  }, [photos.length, maxFiles]);

  const removePhoto = (photoId: string) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === photoId);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter(p => p.id !== photoId);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: acceptMultiple,
    maxSize: 52428800, // 50MB
    disabled: photos.length >= maxFiles
  });

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {photos.length < maxFiles && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Drop your photos here' : 'Drag & drop photos here'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse • JPEG, PNG up to 50MB
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    For best quality: 300 DPI or 1200x1800+ pixels
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Trigger camera input
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.capture = 'environment';
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) {
                          onDrop(Array.from(files));
                        }
                      };
                      input.click();
                    }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Photos */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="relative">
              <CardContent className="p-2">
                <div className="aspect-square relative bg-muted rounded overflow-hidden">
                  <img
                    src={photo.preview}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => removePhoto(photo.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* Upload progress */}
                  {photo.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="w-16 mx-auto mb-2">
                          <Progress value={photo.progress} className="h-1" />
                        </div>
                        <p className="text-xs">{photo.progress}%</p>
                      </div>
                    </div>
                  )}

                  {/* Error state */}
                  {photo.error && (
                    <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center text-white text-center p-2">
                      <div>
                        <AlertTriangle className="h-4 w-4 mx-auto mb-1" />
                        <p className="text-xs">{photo.error}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Photo info */}
                <div className="mt-2 text-xs text-muted-foreground">
                  <p className="truncate">{photo.file.name}</p>
                  {photo.width && photo.height && (
                    <p>{photo.width} × {photo.height}</p>
                  )}
                  <p>{(photo.file.size / (1024 * 1024)).toFixed(1)} MB</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;