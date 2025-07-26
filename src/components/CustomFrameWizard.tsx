import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Check, Camera, Palette, Ruler, Eye, ShoppingCart } from 'lucide-react';

// Import WhatsApp utilities
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { openWhatsAppWithOrder, generateOrderMessage, openWhatsApp, type FrameOrder } from '@/lib/whatsapp';
import { formatIndianCurrency } from '@/lib/currency';
import { handlePhotoShareWorkflow } from '@/lib/whatsapp-photo';

// Import step components
import PhotoStepComponent from './wizard-steps/PhotoStepComponent';
import SizeStepComponent from './wizard-steps/SizeStepComponent';
import FrameStepComponent from './wizard-steps/FrameStepComponent';
import StyleStepComponent from './wizard-steps/StyleStepComponent';
import ReviewStepComponent from './wizard-steps/ReviewStepComponent';

// Import FramePreview for always-visible preview
import FramePreview from './FramePreview';

interface Product {
  id: string;
  name: string;
  base_price: number;
  material: string;
  style: string;
  image_url: string | null;
}

interface CustomizationData {
  product_id: string;
  photo_id?: string;
  size_id?: string;
  color_id?: string;
  thickness_id?: string;
  matting_id?: string;
  custom_width_inches?: number;
  custom_height_inches?: number;
  photo_position?: { x: number; y: number; scale: number; rotation: number };
  total_price: number;
  glass_type?: string;
}

interface CustomFrameWizardProps {
  product: Product;
  onAddToCart: (customization: CustomizationData) => void;
  onClose?: () => void;
}

interface PhotoData {
  id: string;
  url: string;
  fileName: string;
  width: number;
  height: number;
  dpi?: number;
}

interface SizeData {
  id: string;
  display_name: string;
  width_inches: number;
  height_inches: number;
  price_multiplier: number;
}

interface ColorData {
  id: string;
  name: string;
  hex_code: string;
  price_adjustment: number;
}

interface ThicknessData {
  id: string;
  name: string;
  width_inches: number;
  price_multiplier: number;
}

interface MattingData {
  id: string;
  name: string;
  color_hex: string;
  thickness_inches: number;
  is_double_mat: boolean;
  price_adjustment: number;
}

export interface WizardData {
  photo?: PhotoData;
  photoPosition?: { x: number; y: number; scale: number; rotation: number };
  size?: SizeData;
  customDimensions?: { width: number; height: number };
  color?: ColorData;
  thickness?: ThicknessData;
  matting?: MattingData;
  glassType?: string;
  totalPrice: number;
}

const STEPS = [
  { id: 'photo', title: 'Photo', icon: Camera, description: 'Upload your photo' },
  { id: 'size', title: 'Size', icon: Ruler, description: 'Choose dimensions' },
  { id: 'frame', title: 'Frame', icon: Palette, description: 'Select style & color' },
  { id: 'style', title: 'Style', icon: Eye, description: 'Matting & finishing' },
  { id: 'review', title: 'Review', icon: ShoppingCart, description: 'Final preview' },
];

const CustomFrameWizard: React.FC<CustomFrameWizardProps> = ({
  product,
  onAddToCart,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    totalPrice: product.base_price
  });
  const [loading, setLoading] = useState(false);
  const [stepValidation, setStepValidation] = useState({
    photo: false,
    size: false,
    frame: false,
    style: false,
    review: false
  });

  // Save progress to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`frameWizard_${product.id}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setWizardData(parsed);
        // Validate loaded data
        validateCurrentStep(parsed);
      } catch (error) {
        console.error('Error loading saved wizard data:', error);
      }
    }
  }, [product.id]);

  useEffect(() => {
    localStorage.setItem(`frameWizard_${product.id}`, JSON.stringify(wizardData));
    validateCurrentStep(wizardData);
  }, [wizardData, product.id]);

  const validateCurrentStep = (data: WizardData) => {
    const validation = {
      photo: !!data.photo,
      size: !!(data.size || (data.customDimensions?.width && data.customDimensions?.height)),
      frame: !!(data.color && data.thickness),
      style: true, // Style step is optional
      review: !!(data.photo && (data.size || data.customDimensions) && data.color && data.thickness)
    };
    setStepValidation(validation);
  };

  const updateWizardData = (stepData: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...stepData }));
  };

  const calculateTotalPrice = (data: WizardData): number => {
    let price = product.base_price;

    if (data.size) {
      price *= data.size.price_multiplier || 1;
    }

    if (data.color) {
      price += data.color.price_adjustment || 0;
    }

    if (data.thickness) {
      price *= data.thickness.price_multiplier || 1;
    }

    if (data.matting) {
      price += data.matting.price_adjustment || 0;
    }

    // Custom size premium
    if (data.customDimensions && !data.size) {
      const customArea = data.customDimensions.width * data.customDimensions.height;
      const standardArea = 80; // 8x10 default
      const areaMultiplier = customArea / standardArea;
      price = price * areaMultiplier * 1.2; // 20% premium
    }

    return price;
  };

  const nextStep = () => {
    const currentStepKey = STEPS[currentStep].id as keyof typeof stepValidation;
    if (!stepValidation[currentStepKey] && currentStep < STEPS.length - 1) {
      toast.error(`Please complete the ${STEPS[currentStep].title} step`);
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    // Only allow going to completed steps or the next step
    const targetStepKey = STEPS[stepIndex].id as keyof typeof stepValidation;
    if (stepIndex <= currentStep || stepValidation[targetStepKey]) {
      setCurrentStep(stepIndex);
    }
  };

  const handleAddToCart = () => {
    if (!stepValidation.review) {
      toast.error('Please complete all required steps');
      return;
    }

    const customization = {
      product_id: product.id,
      photo_id: wizardData.photo?.id,
      size_id: wizardData.size?.id,
      color_id: wizardData.color?.id,
      thickness_id: wizardData.thickness?.id,
      matting_id: wizardData.matting?.id,
      custom_width_inches: wizardData.customDimensions?.width,
      custom_height_inches: wizardData.customDimensions?.height,
      photo_position: wizardData.photoPosition,
      total_price: wizardData.totalPrice,
      glass_type: wizardData.glassType
    };

    onAddToCart(customization);
    
    // Clear saved data
    localStorage.removeItem(`frameWizard_${product.id}`);
    
    toast.success('Custom frame added to cart!');
  };

  const handleWhatsAppOrder = async () => {
    if (!stepValidation.review) {
      toast.error('Please complete all required steps');
      return;
    }

    const frameOrder: FrameOrder = {
      frameName: product.name,
      size: wizardData.size ? {
        display_name: wizardData.size.display_name,
        width_inches: wizardData.size.width_inches,
        height_inches: wizardData.size.height_inches
      } : undefined,
      customDimensions: wizardData.customDimensions ? {
        width: wizardData.customDimensions.width,
        height: wizardData.customDimensions.height,
        unit: 'inches' as const
      } : undefined,
      material: product.material,
      color: wizardData.color ? {
        name: wizardData.color.name
      } : undefined,
      thickness: wizardData.thickness ? {
        name: wizardData.thickness.name
      } : undefined,
      matting: wizardData.matting ? {
        name: wizardData.matting.name
      } : undefined,
      totalPrice: wizardData.totalPrice,
      hasPhoto: !!wizardData.photo
    };

    const orderMessage = generateOrderMessage(frameOrder);

    if (wizardData.photo) {
      // For photo sharing, we need to create a File object from the photo URL
      try {
        const response = await fetch(wizardData.photo.url);
        const blob = await response.blob();
        const file = new File([blob], wizardData.photo.fileName, { type: blob.type });
        await handlePhotoShareWorkflow(file, orderMessage);
      } catch (error) {
        console.error('Error preparing photo for sharing:', error);
        toast.error('Failed to prepare photo. Opening WhatsApp without photo.');
        openWhatsApp(orderMessage);
      }
    } else {
      openWhatsApp(orderMessage);
    }
  };

  const renderStepContent = () => {
    const stepId = STEPS[currentStep].id;

    switch (stepId) {
      case 'photo':
        return (
          <PhotoStepComponent
            wizardData={wizardData}
            onUpdate={updateWizardData}
          />
        );
      case 'size':
        return (
          <SizeStepComponent
            product={product}
            wizardData={wizardData}
            onUpdate={updateWizardData}
            onPriceUpdate={(price) => updateWizardData({ totalPrice: price })}
          />
        );
      case 'frame':
        return (
          <FrameStepComponent
            product={product}
            wizardData={wizardData}
            onUpdate={updateWizardData}
            onPriceUpdate={(price) => updateWizardData({ totalPrice: price })}
          />
        );
      case 'style':
        return (
          <StyleStepComponent
            product={product}
            wizardData={wizardData}
            onUpdate={updateWizardData}
            onPriceUpdate={(price) => updateWizardData({ totalPrice: price })}
          />
        );
      case 'review':
        return (
          <ReviewStepComponent
            product={product}
            wizardData={wizardData}
            onUpdate={updateWizardData}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl">Custom Frame Designer</CardTitle>
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Step {currentStep + 1} of {STEPS.length}</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Step Navigator */}
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = stepValidation[step.id as keyof typeof stepValidation];
                const isAccessible = index <= currentStep || isCompleted;

                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => goToStep(index)}
                      disabled={!isAccessible}
                      className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : isCompleted
                          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          : isAccessible
                          ? 'hover:bg-muted'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="relative">
                        <Icon className="h-5 w-5" />
                        {isCompleted && (
                          <Check className="h-3 w-3 absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5" />
                        )}
                      </div>
                      <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                    </button>
                    {index < STEPS.length - 1 && (
                      <div className="hidden sm:block w-8 h-px bg-border mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content with Side-by-Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step Content */}
        <div className="min-h-[600px]">
          {renderStepContent()}
        </div>

        {/* Always Visible Preview Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
                {/* Debug info in development */}
                {process.env.NODE_ENV === 'development' && wizardData.photo && (
                  <Badge variant="outline" className="text-xs ml-2">
                    Photo: {wizardData.photo.url ? 'URL OK' : 'No URL'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Debug the photo data being passed */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-2 bg-muted rounded text-xs">
                  <div>Photo URL: {wizardData.photo?.url || 'None'}</div>
                  <div>Photo ID: {wizardData.photo?.id || 'None'}</div>
                  <div>Frame Color: {wizardData.color?.hex_code || '#8B4513'}</div>
                  <div>Frame Width: {wizardData.thickness ? wizardData.thickness.width_inches * 10 : 20}</div>
                </div>
              )}
              
              <FramePreview
                photoUrl={wizardData.photo?.url}
                frameColor={wizardData.color?.hex_code || '#8B4513'}
                frameWidth={wizardData.thickness ? wizardData.thickness.width_inches * 10 : 20}
                mattingColor={wizardData.matting?.color_hex}
                mattingThickness={wizardData.matting ? wizardData.matting.thickness_inches * 100 : 0}
                canvasWidth={400}
                canvasHeight={500}
                onPositionChange={(position) => updateWizardData({ photoPosition: position })}
              />
            </CardContent>
          </Card>

          {/* Current Selection Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Current Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Photo:</span>
                  <span>{wizardData.photo ? '✓ Uploaded' : 'Not uploaded'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>
                    {wizardData.size ? wizardData.size.display_name : 
                     wizardData.customDimensions ? `${wizardData.customDimensions.width}" × ${wizardData.customDimensions.height}"` :
                     'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color:</span>
                  <span className="flex items-center gap-2">
                    {wizardData.color ? (
                      <>
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: wizardData.color.hex_code }}
                        />
                        {wizardData.color.name}
                      </>
                    ) : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thickness:</span>
                  <span>{wizardData.thickness?.name || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Matting:</span>
                  <span className="flex items-center gap-2">
                    {wizardData.matting ? (
                      <>
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: wizardData.matting.color_hex }}
                        />
                        {wizardData.matting.name}
                      </>
                    ) : 'None'}
                  </span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Current Total</span>
                <span>{formatIndianCurrency(wizardData.totalPrice)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
              <p className="text-xl font-bold">{STEPS[currentStep].title}</p>
            </div>

            <div className="flex items-center gap-3">
              {currentStep === STEPS.length - 1 ? (
                <>
                  <WhatsAppButton
                    onClick={handleWhatsAppOrder}
                    disabled={!stepValidation.review}
                    size="lg"
                  >
                    Order via WhatsApp
                  </WhatsAppButton>
                  <Button
                    onClick={handleAddToCart}
                    disabled={!stepValidation.review}
                    className="flex items-center gap-2"
                    size="lg"
                    variant="outline"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </>
              ) : (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomFrameWizard;