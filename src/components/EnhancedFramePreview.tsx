import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { FrameAssetManager, PhotoDimensions } from '@/utils/frameAssetManager';

interface EnhancedFramePreviewProps {
  photoUrl?: string;
  frameColor: string;
  frameMaterial: string;
  frameThickness: string;
  mattingColor?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  onPositionChange?: (position: PhotoPosition) => void;
}

interface PhotoPosition {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface LoadedAssets {
  frameImage?: HTMLImageElement;
  photoImage?: HTMLImageElement;
}

const EnhancedFramePreview: React.FC<EnhancedFramePreviewProps> = ({
  photoUrl,
  frameColor = 'black',
  frameMaterial = 'wood',
  frameThickness = 'thin',
  mattingColor,
  canvasWidth = 400,
  canvasHeight = 300,
  onPositionChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoPosition, setPhotoPosition] = useState<PhotoPosition>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [loadedAssets, setLoadedAssets] = useState<LoadedAssets>({});
  const [isLoading, setIsLoading] = useState(false);
  const [photoDimensions, setPhotoDimensions] = useState<PhotoDimensions | null>(null);
  const [frameNeedsRotation, setFrameNeedsRotation] = useState(false);
  const [optimalAspectRatio, setOptimalAspectRatio] = useState<string>('4x3');

  // Load photo and detect orientation
  useEffect(() => {
    if (!photoUrl) return;

    setIsLoading(true);
    const img = new Image();
    
    img.onload = () => {
      const dimensions: PhotoDimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };
      
      setPhotoDimensions(dimensions);
      setLoadedAssets(prev => ({ ...prev, photoImage: img }));
      
      // Detect optimal frame configuration
      const frameConfig = FrameAssetManager.getOptimalFrameConfig(
        dimensions,
        {
          colorName: frameColor,
          materialType: frameMaterial,
          thickness: frameThickness
        }
      );
      
      setFrameNeedsRotation(frameConfig.needsRotation);
      setOptimalAspectRatio(frameConfig.aspectRatio);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      console.error('Failed to load photo:', photoUrl);
      setIsLoading(false);
    };
    
    img.src = photoUrl;
  }, [photoUrl, frameColor, frameMaterial, frameThickness]);

  // Load frame asset based on selections
  useEffect(() => {
    if (!photoDimensions) return;

    const loadFrameAsset = async () => {
      try {
        setIsLoading(true);
        const frameConfig = FrameAssetManager.getOptimalFrameConfig(
          photoDimensions,
          {
            colorName: frameColor,
            materialType: frameMaterial,
            thickness: frameThickness
          }
        );
        
        const frameImage = await FrameAssetManager.preloadFrameAsset({
          colorName: frameConfig.colorName,
          materialType: frameConfig.materialType,
          thickness: frameConfig.thickness,
          aspectRatio: frameConfig.aspectRatio
        });
        
        setLoadedAssets(prev => ({ ...prev, frameImage }));
      } catch (error) {
        console.error('Failed to load frame asset:', error);
        // Continue with canvas-based fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadFrameAsset();
  }, [photoDimensions, frameColor, frameMaterial, frameThickness]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Set canvas background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const frameWidth = 20; // Frame border width
    const photoAreaLeft = frameWidth;
    const photoAreaTop = frameWidth;
    const photoAreaWidth = canvasWidth - 2 * frameWidth;
    const photoAreaHeight = canvasHeight - 2 * frameWidth;

    if (loadedAssets.frameImage) {
      // Use PNG frame asset
      ctx.save();
      
      if (frameNeedsRotation) {
        // Rotate canvas for portrait photos
        ctx.translate(canvasWidth / 2, canvasHeight / 2);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-canvasHeight / 2, -canvasWidth / 2);
        ctx.drawImage(loadedAssets.frameImage, 0, 0, canvasHeight, canvasWidth);
      } else {
        ctx.drawImage(loadedAssets.frameImage, 0, 0, canvasWidth, canvasHeight);
      }
      
      ctx.restore();
    } else {
      // Fallback to canvas-drawn frame
      // Draw frame background
      ctx.fillStyle = frameColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw matting if specified
      if (mattingColor) {
        ctx.fillStyle = mattingColor;
        ctx.fillRect(frameWidth, frameWidth, canvasWidth - 2 * frameWidth, canvasHeight - 2 * frameWidth);
      }
      
      // Create photo opening
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(photoAreaLeft, photoAreaTop, photoAreaWidth, photoAreaHeight);
    }

    // Draw photo if loaded
    if (loadedAssets.photoImage) {
      ctx.save();
      
      // Set clipping region to photo area
      ctx.beginPath();
      ctx.rect(photoAreaLeft, photoAreaTop, photoAreaWidth, photoAreaHeight);
      ctx.clip();
      
      // Apply transformations
      const centerX = photoAreaLeft + photoAreaWidth / 2;
      const centerY = photoAreaTop + photoAreaHeight / 2;
      
      ctx.translate(centerX + photoPosition.x, centerY + photoPosition.y);
      ctx.scale(photoPosition.scale, photoPosition.scale);
      ctx.rotate((photoPosition.rotation * Math.PI) / 180);
      
      // Draw photo centered
      const photoWidth = loadedAssets.photoImage.naturalWidth;
      const photoHeight = loadedAssets.photoImage.naturalHeight;
      ctx.drawImage(
        loadedAssets.photoImage,
        -photoWidth / 2,
        -photoHeight / 2,
        photoWidth,
        photoHeight
      );
      
      ctx.restore();
    } else if (!isLoading) {
      // Draw placeholder
      ctx.fillStyle = '#6c757d';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Upload a photo to see preview',
        canvasWidth / 2,
        canvasHeight / 2
      );
    }

    // Loading indicator
    if (isLoading) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Loading...', canvasWidth / 2, canvasHeight / 2);
    }
  }, [
    loadedAssets,
    photoPosition,
    frameColor,
    frameMaterial,
    frameThickness,
    mattingColor,
    canvasWidth,
    canvasHeight,
    frameNeedsRotation,
    isLoading
  ]);

  // Mouse event handlers for photo dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const deltaX = e.clientX - rect.left - rect.width / 2;
    const deltaY = e.clientY - rect.top - rect.height / 2;

    const newPosition = {
      ...photoPosition,
      x: deltaX - rect.width / 2,
      y: deltaY - rect.height / 2
    };

    setPhotoPosition(newPosition);
    onPositionChange?.(newPosition);
  }, [isDragging, photoPosition, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Control handlers
  const handleScaleChange = useCallback((value: number[]) => {
    const newPosition = { ...photoPosition, scale: value[0] };
    setPhotoPosition(newPosition);
    onPositionChange?.(newPosition);
  }, [photoPosition, onPositionChange]);

  const handleRotationChange = useCallback((value: number[]) => {
    const newPosition = { ...photoPosition, rotation: value[0] };
    setPhotoPosition(newPosition);
    onPositionChange?.(newPosition);
  }, [photoPosition, onPositionChange]);

  const resetPosition = useCallback(() => {
    const defaultPosition = { x: 0, y: 0, scale: 1, rotation: 0 };
    setPhotoPosition(defaultPosition);
    onPositionChange?.(defaultPosition);
  }, [onPositionChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Enhanced Frame Preview
          {photoDimensions && (
            <div className="flex gap-2">
              <Badge variant="secondary">
                {optimalAspectRatio}
              </Badge>
              {frameNeedsRotation && (
                <Badge variant="outline">
                  Portrait Rotation
                </Badge>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="border border-border rounded cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Photo Controls */}
        {loadedAssets.photoImage && !isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scale Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    Scale
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(photoPosition.scale * 100)}%
                  </span>
                </div>
                <Slider
                  value={[photoPosition.scale]}
                  onValueChange={handleScaleChange}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Rotation Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Rotation
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(photoPosition.rotation)}°
                  </span>
                </div>
                <Slider
                  value={[photoPosition.rotation]}
                  onValueChange={handleRotationChange}
                  min={-180}
                  max={180}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={resetPosition}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Position
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-muted-foreground">
              <Move className="w-4 h-4 inline mr-1" />
              Drag the photo to reposition • Use sliders to scale and rotate
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedFramePreview;