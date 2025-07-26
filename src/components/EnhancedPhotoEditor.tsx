import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crop, 
  RotateCw, 
  Sun, 
  Moon, 
  Palette, 
  Maximize, 
  Minimize, 
  Move, 
  RotateCcw,
  Undo,
  Download,
  Eye
} from 'lucide-react';

interface EnhancedPhotoEditorProps {
  photo: any;
  onPhotoEdited: (editedPhoto: any) => void;
}

interface EditState {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
  scale: number;
  position: { x: number; y: number };
  crop: { x: number; y: number; width: number; height: number };
}

const EnhancedPhotoEditor: React.FC<EnhancedPhotoEditorProps> = ({
  photo,
  onPhotoEdited
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const [editState, setEditState] = useState<EditState>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    rotation: 0,
    scale: 1,
    position: { x: 0, y: 0 },
    crop: { x: 0, y: 0, width: 100, height: 100 }
  });
  const [activeTab, setActiveTab] = useState('adjust');
  const [isDragging, setIsDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (photo?.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        originalImageRef.current = img;
        redrawCanvas();
      };
      img.src = photo.url;
    }
  }, [photo]);

  useEffect(() => {
    redrawCanvas();
  }, [editState]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = originalImageRef.current;
    
    if (!canvas || !ctx || !img) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    
    // Move to center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation
    ctx.rotate((editState.rotation * Math.PI) / 180);
    
    // Apply scale
    ctx.scale(editState.scale, editState.scale);
    
    // Apply position offset
    ctx.translate(editState.position.x, editState.position.y);
    
    // Apply filters
    ctx.filter = `
      brightness(${100 + editState.brightness}%) 
      contrast(${100 + editState.contrast}%) 
      saturate(${100 + editState.saturation}%)
    `;
    
    // Draw image
    const aspectRatio = img.width / img.height;
    let drawWidth = 400;
    let drawHeight = 400 / aspectRatio;
    
    if (drawHeight > 300) {
      drawHeight = 300;
      drawWidth = 300 * aspectRatio;
    }
    
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    
    ctx.restore();

    // Draw crop overlay if in crop mode
    if (activeTab === 'crop') {
      drawCropOverlay(ctx, canvas.width, canvas.height);
    }
  };

  const drawCropOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const cropX = (editState.crop.x / 100) * width;
    const cropY = (editState.crop.y / 100) * height;
    const cropWidth = (editState.crop.width / 100) * width;
    const cropHeight = (editState.crop.height / 100) * height;

    // Darken outside crop area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);
    
    // Clear crop area
    ctx.clearRect(cropX, cropY, cropWidth, cropHeight);
    
    // Draw crop border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
    
    // Draw crop handles
    const handleSize = 8;
    ctx.fillStyle = '#fff';
    
    // Corner handles
    ctx.fillRect(cropX - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropX + cropWidth - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropX - handleSize/2, cropY + cropHeight - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropX + cropWidth - handleSize/2, cropY + cropHeight - handleSize/2, handleSize, handleSize);
  };

  const handleEditChange = (property: keyof EditState, value: any) => {
    setEditState(prev => ({ ...prev, [property]: value }));
  };

  const resetEdits = () => {
    setEditState({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      rotation: 0,
      scale: 1,
      position: { x: 0, y: 0 },
      crop: { x: 0, y: 0, width: 100, height: 100 }
    });
  };

  const applyEdits = () => {
    // Create edited photo data
    const editedPhoto = {
      ...photo,
      edits: editState,
      position: editState.position
    };
    
    onPhotoEdited(editedPhoto);
  };

  const presetAdjustments = [
    { name: 'Auto Enhance', brightness: 10, contrast: 15, saturation: 10 },
    { name: 'Vibrant', brightness: 5, contrast: 20, saturation: 25 },
    { name: 'Soft', brightness: 15, contrast: -10, saturation: -5 },
    { name: 'B&W', brightness: 0, contrast: 10, saturation: -100 },
  ];

  const applyPreset = (preset: any) => {
    setEditState(prev => ({
      ...prev,
      brightness: preset.brightness,
      contrast: preset.contrast,
      saturation: preset.saturation
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Photo Editor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </Button>
              <Button variant="outline" size="sm" onClick={resetEdits}>
                <Undo className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas Preview */}
            <div className="lg:col-span-2">
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto mx-auto border border-border rounded"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {!previewMode && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="adjust">
                      <Sun className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="transform">
                      <RotateCw className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="crop">
                      <Crop className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="adjust" className="space-y-4">
                    {/* Presets */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Quick Presets</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {presetAdjustments.map((preset) => (
                          <Button
                            key={preset.name}
                            variant="outline"
                            size="sm"
                            onClick={() => applyPreset(preset)}
                          >
                            {preset.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Manual Adjustments */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Brightness</label>
                          <span className="text-sm text-muted-foreground">
                            {editState.brightness > 0 ? '+' : ''}{editState.brightness}
                          </span>
                        </div>
                        <Slider
                          value={[editState.brightness]}
                          onValueChange={([value]) => handleEditChange('brightness', value)}
                          min={-50}
                          max={50}
                          step={1}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Contrast</label>
                          <span className="text-sm text-muted-foreground">
                            {editState.contrast > 0 ? '+' : ''}{editState.contrast}
                          </span>
                        </div>
                        <Slider
                          value={[editState.contrast]}
                          onValueChange={([value]) => handleEditChange('contrast', value)}
                          min={-50}
                          max={50}
                          step={1}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Saturation</label>
                          <span className="text-sm text-muted-foreground">
                            {editState.saturation > 0 ? '+' : ''}{editState.saturation}
                          </span>
                        </div>
                        <Slider
                          value={[editState.saturation]}
                          onValueChange={([value]) => handleEditChange('saturation', value)}
                          min={-100}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="transform" className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Rotation</label>
                        <span className="text-sm text-muted-foreground">
                          {editState.rotation}°
                        </span>
                      </div>
                      <Slider
                        value={[editState.rotation]}
                        onValueChange={([value]) => handleEditChange('rotation', value)}
                        min={-180}
                        max={180}
                        step={1}
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChange('rotation', editState.rotation - 90)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChange('rotation', editState.rotation + 90)}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Scale</label>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(editState.scale * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[editState.scale]}
                        onValueChange={([value]) => handleEditChange('scale', value)}
                        min={0.1}
                        max={3}
                        step={0.1}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="crop" className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Crop Area</h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Drag the crop area on the preview to adjust
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChange('crop', { x: 0, y: 0, width: 100, height: 100 })}
                        >
                          Full Image
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChange('crop', { x: 10, y: 10, width: 80, height: 80 })}
                        >
                          Center Crop
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {/* Apply Button */}
              <div className="pt-4 border-t">
                <Button onClick={applyEdits} className="w-full">
                  Apply Changes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPhotoEditor;