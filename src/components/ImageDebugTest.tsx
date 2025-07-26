import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ImageDebugTestProps {
  photoUrl?: string;
}

const ImageDebugTest: React.FC<ImageDebugTestProps> = ({ photoUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    if (!photoUrl) {
      setImageLoaded(false);
      setImageError(null);
      setDebugInfo('No photo URL provided');
      return;
    }

    console.log('ImageDebugTest: Loading image from URL:', photoUrl);
    setDebugInfo(`Loading: ${photoUrl}`);

    const img = new Image();
    
    img.onload = () => {
      console.log('ImageDebugTest: Image loaded successfully', img.width, 'x', img.height);
      setImageLoaded(true);
      setImageError(null);
      setDebugInfo(`Loaded: ${img.width}x${img.height}`);
      
      // Draw the image on canvas
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw image centered
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height, 1);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;
        
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        console.log('ImageDebugTest: Drew image with scale:', scale, 'at position:', x, y);
      }
    };
    
    img.onerror = () => {
      console.error('ImageDebugTest: Failed to load image');
      setImageLoaded(false);
      setImageError('Failed to load image');
      setDebugInfo('Load failed');
    };
    
    img.src = photoUrl;
  }, [photoUrl]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Debug Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>Photo URL:</strong> {photoUrl || 'None'}
          </div>
          <div>
            <strong>Status:</strong> {imageLoaded ? 'Loaded' : imageError ? 'Error' : 'Loading...'}
          </div>
          <div>
            <strong>Debug Info:</strong> {debugInfo}
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="border border-gray-300 rounded"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageDebugTest;