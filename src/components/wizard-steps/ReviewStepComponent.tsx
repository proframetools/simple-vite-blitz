import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Eye, Share2, Download, Edit, Maximize } from 'lucide-react';
import FramePreview from '../FramePreview';
import { WizardData } from '../CustomFrameWizard';

interface ReviewStepComponentProps {
  product: any;
  wizardData: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
}

const ReviewStepComponent: React.FC<ReviewStepComponentProps> = ({
  product,
  wizardData,
  onUpdate
}) => {
  const [previewMode, setPreviewMode] = useState<'frame' | '3d' | 'room'>('frame');
  const [showFullscreen, setShowFullscreen] = useState(false);

  const getOrderSummary = () => {
    const items = [];
    
    // Base product
    items.push({
      name: product.name,
      description: 'Base frame',
      price: product.base_price
    });

    // Size
    if (wizardData.size) {
      items.push({
        name: `Size: ${wizardData.size.display_name}`,
        description: `${wizardData.size.width_inches}" × ${wizardData.size.height_inches}"`,
        price: 0,
        multiplier: wizardData.size.price_multiplier
      });
    } else if (wizardData.customDimensions) {
      items.push({
        name: 'Custom Size',
        description: `${wizardData.customDimensions.width}" × ${wizardData.customDimensions.height}"`,
        price: 0,
        note: '20% custom size premium included'
      });
    }

    // Color
    if (wizardData.color) {
      items.push({
        name: `Color: ${wizardData.color.name}`,
        description: 'Frame color',
        price: wizardData.color.price_adjustment
      });
    }

    // Thickness
    if (wizardData.thickness) {
      items.push({
        name: `Thickness: ${wizardData.thickness.name}`,
        description: `${wizardData.thickness.width_inches}" thick`,
        price: 0,
        multiplier: wizardData.thickness.price_multiplier
      });
    }

    // Matting
    if (wizardData.matting) {
      items.push({
        name: `Matting: ${wizardData.matting.name}`,
        description: wizardData.matting.is_double_mat ? 'Double mat' : 'Single mat',
        price: wizardData.matting.price_adjustment
      });
    }

    // Glass
    if (wizardData.glassType && wizardData.glassType !== 'standard') {
      const glassNames = {
        'anti-glare': 'Anti-Glare Glass',
        'uv-protection': 'UV Protection Glass',
        'museum': 'Museum Glass'
      };
      const glassPrices = {
        'anti-glare': 15,
        'uv-protection': 25,
        'museum': 50
      };
      
      items.push({
        name: glassNames[wizardData.glassType as keyof typeof glassNames],
        description: 'Protective glass upgrade',
        price: glassPrices[wizardData.glassType as keyof typeof glassPrices]
      });
    }

    return items;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Custom Frame Design',
          text: `Check out my custom frame design for ${product.name}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast here
    }
  };

  const handleDownloadPreview = () => {
    // This would generate and download a preview image
    // Implementation would depend on the specific preview component
    console.log('Download preview');
  };

  const orderSummary = getOrderSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Review Your Custom Frame
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPreview}>
                <Download className="h-4 w-4 mr-2" />
                Save Preview
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Preview</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={previewMode === 'frame' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('frame')}
                  >
                    Frame
                  </Button>
                  <Button
                    variant={previewMode === '3d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('3d')}
                  >
                    3D
                  </Button>
                  <Button
                    variant={previewMode === 'room' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('room')}
                  >
                    Room
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullscreen(!showFullscreen)}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {previewMode === 'frame' && (
                <FramePreview
                  photoUrl={wizardData.photo?.url}
                  frameColor={wizardData.color?.hex_code || '#8B4513'}
                  frameWidth={wizardData.thickness ? wizardData.thickness.width_inches * 4 : 20}
                  mattingColor={wizardData.matting?.color_hex}
                  mattingThickness={wizardData.matting ? wizardData.matting.thickness_inches * 4 : 0}
                  canvasWidth={showFullscreen ? 800 : 400}
                  canvasHeight={showFullscreen ? 600 : 500}
                  onPositionChange={(position) => onUpdate({ photoPosition: position })}
                />
              )}

              {previewMode === '3d' && (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Eye className="h-8 w-8 mx-auto mb-2" />
                    <p>3D Preview</p>
                    <p className="text-sm">Interactive 3D view coming soon</p>
                  </div>
                </div>
              )}

              {previewMode === 'room' && (
                <div className="aspect-video bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg p-8 relative overflow-hidden">
                  {/* Simulated room */}
                  <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] rounded-lg"></div>
                  
                  {/* Wall */}
                  <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-gray-100 to-gray-200"></div>
                  
                  {/* Frame on wall */}
                  <div 
                    className="absolute top-1/4 left-1/2 transform -translate-x-1/2 shadow-lg"
                    style={{
                      width: '120px',
                      height: '150px',
                      backgroundColor: wizardData.color?.hex_code || '#8B4513',
                      padding: '8px'
                    }}
                  >
                    {wizardData.matting && (
                      <div 
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: wizardData.matting.color_hex,
                          padding: '6px'
                        }}
                      >
                        <div className="w-full h-full bg-white">
                          {wizardData.photo && (
                            <img 
                              src={wizardData.photo.url} 
                              alt="Room preview" 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    )}
                    {!wizardData.matting && (
                      <div className="w-full h-full bg-white">
                        {wizardData.photo && (
                          <img 
                            src={wizardData.photo.url} 
                            alt="Room preview" 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-sm text-muted-foreground">Room visualization</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Info */}
          {wizardData.photo && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Photo Details</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Filename: {wizardData.photo.fileName}</p>
                  <p>Dimensions: {wizardData.photo.width} × {wizardData.photo.height} pixels</p>
                  <p>Quality: Suitable for printing</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderSummary.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                      {item.note && (
                        <div className="text-xs text-muted-foreground italic">{item.note}</div>
                      )}
                    </div>
                    <div className="text-right">
                      {item.price > 0 && <div>+${item.price}</div>}
                      {item.multiplier && item.multiplier !== 1 && (
                        <div className="text-sm text-muted-foreground">×{item.multiplier}</div>
                      )}
                    </div>
                  </div>
                  {index < orderSummary.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>${wizardData.totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Size</div>
                  <div className="text-muted-foreground">
                    {wizardData.size ? wizardData.size.display_name : 
                     wizardData.customDimensions ? `${wizardData.customDimensions.width}" × ${wizardData.customDimensions.height}"` :
                     'Not selected'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Material</div>
                  <div className="text-muted-foreground">{product.material}</div>
                </div>
                <div>
                  <div className="font-medium">Color</div>
                  <div className="text-muted-foreground">
                    {wizardData.color?.name || 'Not selected'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Thickness</div>
                  <div className="text-muted-foreground">
                    {wizardData.thickness?.name || 'Not selected'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Matting</div>
                  <div className="text-muted-foreground">
                    {wizardData.matting ? wizardData.matting.name : 'None'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Glass</div>
                  <div className="text-muted-foreground">
                    {wizardData.glassType === 'standard' ? 'Standard Glass' :
                     wizardData.glassType === 'anti-glare' ? 'Anti-Glare Glass' :
                     wizardData.glassType === 'uv-protection' ? 'UV Protection Glass' :
                     wizardData.glassType === 'museum' ? 'Museum Glass' :
                     'Standard Glass'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Assurance */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h4 className="font-medium">Quality Assurance</h4>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Photo quality verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Frame specifications confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Professional mounting included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Satisfaction guarantee</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReviewStepComponent;