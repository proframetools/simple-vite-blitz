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
      
      console.log('FramePreview: Starting image load for URL:', photoUrl);
      
      const img = new Image();
      
      // Set up a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error('FramePreview: Image loading timeout');
        setImageError('Image loading timeout');
        setDebugInfo('Loading timeout - image took too long to load');
        setImageLoaded(false);
      }, 30000); // 30 second timeout
      
      img.onload = () => {
        clearTimeout(timeoutId);
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
      
      img.onerror = (errorEvent) => {
        clearTimeout(timeoutId);
        
        console.error('FramePreview: Image load error for URL:', photoUrl);
        console.error('FramePreview: Error event:', errorEvent);
        
        // Test URL accessibility with fetch to get more detailed error info
        fetch(photoUrl, { method: 'HEAD', mode: 'no-cors' })
          .then(() => {
            console.error('FramePreview: Image accessible but failed to load as image:', photoUrl);
            setImageError('Image format may not be supported or CORS issue');
            setDebugInfo('Image accessible but format not supported or CORS blocked');
          })
          .catch((fetchError) => {
            console.error('FramePreview: Image not accessible:', photoUrl, fetchError);
            setImageError('Image URL not accessible');
            setDebugInfo(`Network error: ${fetchError.message || 'URL not accessible'}`);
          });
        
        setImageLoaded(false);
        console.error('FramePreview: Image load error details:', {
          url: photoUrl,
          errorType: errorEvent instanceof Event ? errorEvent.type : 'unknown',
          errorMessage: errorEvent instanceof ErrorEvent ? errorEvent.message : 'Image load failed'
        });
      };
      
      // Set crossOrigin to handle CORS issues with Supabase storage
      img.crossOrigin = 'anonymous';
      
      // Add a small delay to ensure the image is properly loaded
      setTimeout(() => {
        img.src = photoUrl;
      }, 100);
      
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
    if (!canvas || !ctx) {
      console.error('FramePreview: Canvas or context not available');
      return;
    }

    console.log('FramePreview: Drawing canvas', { 
      imageLoaded, 
      frameColor, 
      frameWidth, 
      canvasWidth, 
      canvasHeight,
      photoUrl: photoUrl ? 'URL provided' : 'No URL'
    });

    // Clear canvas and add background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add a background to make sure canvas is visible
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add a test pattern to verify canvas is working
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

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
        
        // Add more detailed error info
        ctx.font = '10px Arial';
        ctx.fillText(imageError, 
          photoArea.x + photoArea.width / 2, 
          photoArea.y + photoArea.height / 2 + 25
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
              className="border border-border rounded-lg cursor-move mx-auto block"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                display: 'block',
                backgroundColor: '#f8f9fa'
              }}
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
                <div>Canvas size: {canvasWidth}x{canvasHeight}</div>
                <div>Frame color: {frameColor}</div>
                <div>Frame width: {frameWidth}</div>
                <div>Photo URL: {photoUrl ? 'Provided' : 'None'}</div>
                <div>Image loaded: {imageLoaded ? 'Yes' : 'No'}</div>
                {imageError && <div>Error: {imageError}</div>}
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
              
                          {/* Test button for debugging */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('FramePreview: Test button clicked');
                console.log('Current state:', {
                  photoUrl,
                  imageLoaded,
                  imageError,
                  photoPosition,
                  canvasWidth,
                  canvasHeight
                });
                
                // Test with a sample image
                const testImg = new Image();
                testImg.onload = () => {
                  console.log('FramePreview: Test image loaded successfully');
                  imageRef.current = testImg;
                  setImageLoaded(true);
                  setImageError(null);
                  setDebugInfo('Test image loaded successfully');
                };
                testImg.onerror = () => {
                  console.log('FramePreview: Test image failed to load');
                  setImageError('Test image failed to load');
                };
                testImg.crossOrigin = 'anonymous';
                testImg.src = 'https://picsum.photos/400/300';
              }}
            >
              Test Image
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