import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCw, Move, ZoomIn, ZoomOut, AlertCircle, CheckCircle } from 'lucide-react';

interface FramePreviewProps {
  photoUrl?: string;
  frameColor: string;
  frameWidth: number;
  mattingColor?: string;
  mattingThickness?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  onPositionChange?: (position: { x: number; y: number; scale: number; rotation: number }) => void;
}

interface PhotoPosition {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const FramePreview: React.FC<FramePreviewProps> = ({
  photoUrl,
  frameColor = '#8B4513',
  frameWidth = 20,
  mattingColor,
  mattingThickness = 0,
  canvasWidth = 400,
  canvasHeight = 500,
  onPositionChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [photoPosition, setPhotoPosition] = useState<PhotoPosition>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Load image when photoUrl changes
  useEffect(() => {
    console.log('FramePreview: photoUrl changed to:', photoUrl);
    setDebugInfo(`Loading image: ${photoUrl ? 'URL provided' : 'No URL'}`);
    
    if (photoUrl) {
      setImageError(null);
      setImageLoaded(false);
      
      // Validate URL format
      try {
        new URL(photoUrl);
        console.log('FramePreview: URL format is valid');
      } catch (urlError) {
        console.error('FramePreview: Invalid URL format:', photoUrl);
        setImageError('Invalid image URL format');
        setDebugInfo(`Invalid URL: ${photoUrl}`);
        return;
      }
      
      // Test if URL is accessible
      fetch(photoUrl, { method: 'HEAD', mode: 'no-cors' })
        .then(() => {
          console.log('FramePreview: URL is accessible');
          setDebugInfo(`URL accessible, loading image...`);
        })
        .catch((fetchError) => {
          console.warn('FramePreview: URL accessibility check failed:', fetchError);
          setDebugInfo(`URL check failed, trying to load anyway...`);
        });
      
      const img = new Image();
      
      // Try with CORS first, then fallback without CORS
      const loadWithCORS = () => {
        console.log('FramePreview: Attempting to load with CORS');
        img.crossOrigin = 'anonymous';
        img.src = photoUrl;
      };
      
      const loadWithoutCORS = () => {
        console.log('FramePreview: Attempting to load without CORS');
        img.crossOrigin = '';
        img.src = photoUrl;
      };
      
      img.onload = () => {
        console.log('FramePreview: Image loaded successfully', img.width, 'x', img.height);
        imageRef.current = img;
        setImageLoaded(true);
        setImageError(null);
        setDebugInfo(`Image loaded: ${img.width}x${img.height}`);
        
        // Auto-fit image to frame
        const canvas = canvasRef.current;
        if (canvas) {
          const frameArea = {
            width: canvas.width - (frameWidth + mattingThickness) * 2,
            height: canvas.height - (frameWidth + mattingThickness) * 2
          };
          
          const scaleX = frameArea.width / img.width;
          const scaleY = frameArea.height / img.height;
          const scale = Math.min(scaleX, scaleY, 1); // Don't upscale beyond original size
          
          console.log('FramePreview: Auto-fitting image with scale:', scale);
          setPhotoPosition(prev => ({
            ...prev,
            scale
          }));
        }
      };
      
      img.onerror = (error) => {
        console.error('FramePreview: Failed to load image with CORS, trying without CORS:', photoUrl, error);
        
        // If CORS failed, try without CORS
        if (img.crossOrigin === 'anonymous') {
          loadWithoutCORS();
        } else {
          setImageLoaded(false);
          setImageError(`Failed to load image: ${photoUrl}`);
          setDebugInfo(`Error loading image: ${error}`);
        }
      };
      
      // Start with CORS
      loadWithCORS();
      
    } else {
      imageRef.current = null;
      setImageLoaded(false);
      setImageError(null);
      setDebugInfo('No photo URL provided');
    }
  }, [photoUrl, frameWidth, mattingThickness]);

  // Draw the frame preview
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    console.log('FramePreview: Drawing canvas', { imageLoaded, frameColor, frameWidth });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate dimensions
    const totalFrameWidth = frameWidth + mattingThickness;
    const photoArea = {
      x: totalFrameWidth,
      y: totalFrameWidth,
      width: canvas.width - totalFrameWidth * 2,
      height: canvas.height - totalFrameWidth * 2
    };

    // Draw photo if loaded
    if (imageLoaded && imageRef.current) {
      console.log('FramePreview: Drawing image with position:', photoPosition);
      ctx.save();
      
      // Clip to photo area
      ctx.beginPath();
      ctx.rect(photoArea.x, photoArea.y, photoArea.width, photoArea.height);
      ctx.clip();
      
      // Transform for photo positioning
      const centerX = photoArea.x + photoArea.width / 2;
      const centerY = photoArea.y + photoArea.height / 2;
      
      ctx.translate(centerX + photoPosition.x, centerY + photoPosition.y);
      ctx.rotate((photoPosition.rotation * Math.PI) / 180);
      ctx.scale(photoPosition.scale, photoPosition.scale);
      
      const img = imageRef.current;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      ctx.restore();
    }

    // Draw matting if present
    if (mattingColor && mattingThickness > 0) {
      ctx.fillStyle = mattingColor;
      
      // Outer matting rectangle
      ctx.fillRect(frameWidth, frameWidth, 
        canvas.width - frameWidth * 2, 
        canvas.height - frameWidth * 2
      );
      
      // Cut out inner rectangle for photo
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(photoArea.x, photoArea.y, photoArea.width, photoArea.height);
      ctx.restore();
    }

    // Draw frame
    ctx.fillStyle = frameColor;
    
    // Outer frame
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Cut out inner area (matting or photo area)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const innerArea = mattingColor ? 
      { x: frameWidth, y: frameWidth, width: canvas.width - frameWidth * 2, height: canvas.height - frameWidth * 2 } :
      photoArea;
    ctx.fillRect(innerArea.x, innerArea.y, innerArea.width, innerArea.height);
    ctx.restore();

    // Draw placeholder if no photo
    if (!imageLoaded) {
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(photoArea.x, photoArea.y, photoArea.width, photoArea.height);
      
      // Draw border for photo area
      ctx.strokeStyle = '#e9ecef';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(photoArea.x, photoArea.y, photoArea.width, photoArea.height);
      ctx.setLineDash([]);
      
      // Draw text
      ctx.fillStyle = '#6c757d';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(photoUrl ? 'Loading photo...' : 'Upload a photo', 
        photoArea.x + photoArea.width / 2, 
        photoArea.y + photoArea.height / 2 - 10
      );
      
      if (imageError) {
        ctx.fillStyle = '#dc3545';
        ctx.font = '12px Arial';
        ctx.fillText('Error loading image', 
          photoArea.x + photoArea.width / 2, 
          photoArea.y + photoArea.height / 2 + 10
        );
      }
    }
  }, [imageLoaded, photoPosition, frameColor, frameWidth, mattingColor, mattingThickness, photoUrl, imageError]);

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageLoaded) return;
    
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - photoPosition.x,
        y: e.clientY - rect.top - photoPosition.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;
    
    const newPosition = { ...photoPosition, x: newX, y: newY };
    setPhotoPosition(newPosition);
    onPositionChange?.(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Control handlers
  const handleScaleChange = (value: number[]) => {
    const newPosition = { ...photoPosition, scale: value[0] };
    setPhotoPosition(newPosition);
    onPositionChange?.(newPosition);
  };

  const handleRotationChange = (value: number[]) => {
    const newPosition = { ...photoPosition, rotation: value[0] };
    setPhotoPosition(newPosition);
    onPositionChange?.(newPosition);
  };

  const resetPosition = () => {
    const newPosition = { x: 0, y: 0, scale: 1, rotation: 0 };
    setPhotoPosition(newPosition);
    onPositionChange?.(newPosition);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="border border-border rounded-lg cursor-move mx-auto"
              style={{ maxWidth: '100%', height: 'auto' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            
            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 mt-2 text-sm">
              {imageLoaded ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Photo loaded successfully</span>
                </>
              ) : imageError ? (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">Failed to load photo</span>
                </>
              ) : photoUrl ? (
                <>
                  <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-blue-600">Loading photo...</span>
                </>
              ) : (
                <span className="text-muted-foreground">Upload a photo to see preview</span>
              )}
            </div>
            
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && debugInfo && (
              <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted rounded">
                Debug: {debugInfo}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {imageLoaded && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h4 className="font-medium">Photo Controls</h4>
            
            {/* Scale Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Size</label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(photoPosition.scale * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4" />
                <Slider
                  value={[photoPosition.scale]}
                  onValueChange={handleScaleChange}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>

            {/* Rotation Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Rotation</label>
                <span className="text-sm text-muted-foreground">
                  {photoPosition.rotation}°
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                <Slider
                  value={[photoPosition.rotation]}
                  onValueChange={handleRotationChange}
                  min={-180}
                  max={180}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetPosition}
                className="flex-1"
              >
                <Move className="h-4 w-4 mr-2" />
                Reset Position
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Drag the photo to reposition, or use the controls above
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FramePreview;