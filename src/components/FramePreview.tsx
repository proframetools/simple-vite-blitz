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

  // Calculate photo area (inside frame and matting)
  const photoAreaLeft = frameWidth + mattingThickness;
  const photoAreaTop = frameWidth + mattingThickness;
  const photoAreaWidth = canvasWidth - 2 * (frameWidth + mattingThickness);
  const photoAreaHeight = canvasHeight - 2 * (frameWidth + mattingThickness);
  
  // Debug logging for thickness calculations
  console.log('FramePreview: Frame calculations:', {
    frameWidth,
    mattingThickness,
    photoAreaLeft,
    photoAreaTop,
    photoAreaWidth,
    photoAreaHeight,
    canvasWidth,
    canvasHeight
  });

  // Load image when photoUrl changes
  useEffect(() => {
    console.log('FramePreview: photoUrl changed to:', photoUrl);
    setDebugInfo(`Loading image: ${photoUrl ? 'URL provided' : 'No URL'}`);
    
    if (photoUrl) {
      setImageError(null);
      setImageLoaded(false);
      
      console.log('FramePreview: Starting image load for URL:', photoUrl);
      
      const img = new Image();
      
      // Set up a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error('FramePreview: Image loading timeout');
        setImageError('Image loading timeout');
        setDebugInfo('Loading timeout - image took too long to load');
        setImageLoaded(false);
      }, 10000); // 10 second timeout
      
      img.onload = () => {
        clearTimeout(timeoutId);
        console.log('FramePreview: Image loaded successfully', img.width, 'x', img.height);
        imageRef.current = img;
        setImageLoaded(true);
        setImageError(null);
        setDebugInfo(`Image loaded: ${img.width}x${img.height}`);
        
        // Auto-fit image to available photo area with minimum scale
        if (photoAreaWidth > 0 && photoAreaHeight > 0) {
          const scaleX = photoAreaWidth / img.width;
          const scaleY = photoAreaHeight / img.height;
          const scale = Math.min(scaleX, scaleY, 1); // Cap at 1x to prevent enlargement
          
          // Ensure minimum scale for visibility (at least 30% of optimal)
          const minScale = Math.min(0.3, Math.max(scaleX, scaleY) * 0.5);
          const finalScale = Math.max(scale, minScale);
          
          const newPosition = {
            x: 0, // Center in the photo area
            y: 0,
            scale: finalScale,
            rotation: 0
          };
          console.log('FramePreview: Auto-fit photo:', {
            imageSize: { width: img.width, height: img.height },
            photoArea: { width: photoAreaWidth, height: photoAreaHeight },
            calculatedScale: scale,
            minScale: minScale,
            finalScale: finalScale,
            position: newPosition
          });
          setPhotoPosition(newPosition);
        }
      };
      
      img.onerror = (errorEvent) => {
        clearTimeout(timeoutId);
        setImageLoaded(false);
        
        console.error('FramePreview: Image load error for URL:', photoUrl);
        console.error('FramePreview: Error event details:', {
          url: photoUrl,
          errorType: errorEvent instanceof Event ? errorEvent.type : 'unknown',
          message: errorEvent instanceof ErrorEvent ? errorEvent.message : 'Image load failed'
        });
        
        // Check if it's a CORS or network issue
        if (photoUrl.includes('supabase')) {
          setImageError('Supabase storage access issue - check bucket permissions');
          setDebugInfo('Storage bucket may not be public or URL is incorrect');
        } else {
          setImageError('Failed to load image');
          setDebugInfo('Image URL may be invalid or inaccessible');
        }
      };
      
      // Simply set the source - Supabase storage URLs should work without CORS issues
      img.src = photoUrl;
      
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

    console.log('FramePreview: Drawing canvas', { imageLoaded, frameColor, frameWidth, mattingThickness });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // STEP 1: Draw frame base (foundation layer)
    ctx.fillStyle = frameColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // STEP 2: Draw frame opening (cut out inner area)
    if (mattingColor && mattingThickness > 0) {
      // Frame opening for matting area
      ctx.fillStyle = mattingColor;
      ctx.fillRect(frameWidth, frameWidth, canvasWidth - 2 * frameWidth, canvasHeight - 2 * frameWidth);
    } else {
      // Frame opening directly for photo area
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(photoAreaLeft, photoAreaTop, photoAreaWidth, photoAreaHeight);
    }

    // STEP 3: Draw matting layer (if specified)
    if (mattingColor && mattingThickness > 0) {
      // Draw matting opening for photo
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(photoAreaLeft, photoAreaTop, photoAreaWidth, photoAreaHeight);
    }

    // STEP 4: Draw photo background (white background for photo area)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(photoAreaLeft, photoAreaTop, photoAreaWidth, photoAreaHeight);

    // STEP 5: Draw photo content (if loaded)
    if (imageLoaded && imageRef.current) {
      console.log('FramePreview: Drawing image with position:', photoPosition);
      
      // Create clipping path for photo area
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoAreaLeft, photoAreaTop, photoAreaWidth, photoAreaHeight);
      ctx.clip();
      
      // Draw the photo with transformations (centered in photo area)
      const centerX = photoAreaLeft + photoAreaWidth / 2;
      const centerY = photoAreaTop + photoAreaHeight / 2;
      
      ctx.translate(centerX + photoPosition.x, centerY + photoPosition.y);
      ctx.rotate((photoPosition.rotation * Math.PI) / 180);
      ctx.scale(photoPosition.scale, photoPosition.scale);
      
      const img = imageRef.current;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      ctx.restore();
      console.log('FramePreview: Drew photo with position:', photoPosition);
    } else {
      // Draw placeholder text in photo area
      ctx.fillStyle = '#6c757d';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(photoUrl ? 'Loading photo...' : 'Upload a photo', 
        photoAreaLeft + photoAreaWidth / 2, 
        photoAreaTop + photoAreaHeight / 2 - 10
      );
      
      if (imageError) {
        ctx.fillStyle = '#dc3545';
        ctx.font = '12px Arial';
        ctx.fillText('Error loading image', 
          photoAreaLeft + photoAreaWidth / 2, 
          photoAreaTop + photoAreaHeight / 2 + 10
        );
      }
      
      // Draw dashed border for photo area
      ctx.strokeStyle = '#e9ecef';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(photoAreaLeft, photoAreaTop, photoAreaWidth, photoAreaHeight);
      ctx.setLineDash([]);
    }
    
  }, [imageLoaded, photoPosition, frameColor, frameWidth, mattingColor, mattingThickness, photoUrl, imageError, photoAreaLeft, photoAreaTop, photoAreaWidth, photoAreaHeight]);

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
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted rounded">
                <div>Debug: {debugInfo}</div>
                <div>Frame: {frameWidth}px, Matting: {mattingThickness}px</div>
                <div>Photo Area: {photoAreaWidth}x{photoAreaHeight}px</div>
                {imageLoaded && (
                  <div>Scale: {photoPosition.scale.toFixed(3)}, Position: ({photoPosition.x}, {photoPosition.y})</div>
                )}
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
                onClick={() => {
                  if (imageRef.current && photoAreaWidth > 0 && photoAreaHeight > 0) {
                    const img = imageRef.current;
                    const scaleX = photoAreaWidth / img.width;
                    const scaleY = photoAreaHeight / img.height;
                    const scale = Math.min(scaleX, scaleY, 1);
                    const minScale = Math.min(0.3, Math.max(scaleX, scaleY) * 0.5);
                    const finalScale = Math.max(scale, minScale);
                    
                    const newPosition = {
                      x: 0,
                      y: 0,
                      scale: finalScale,
                      rotation: 0
                    };
                    setPhotoPosition(newPosition);
                    onPositionChange?.(newPosition);
                  }
                }}
                className="flex-1"
              >
                Fit Photo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetPosition}
                className="flex-1"
              >
                <Move className="h-4 w-4 mr-2" />
                Reset
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