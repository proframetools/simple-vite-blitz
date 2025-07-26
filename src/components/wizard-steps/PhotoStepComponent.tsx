import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Camera, Upload, Crop, RotateCw, Palette, Zap, AlertTriangle } from 'lucide-react';
import PhotoUpload from '../PhotoUpload';
import EnhancedPhotoEditor from '../EnhancedPhotoEditor';
import { WizardData } from '../CustomFrameWizard';

interface PhotoStepComponentProps {
  wizardData: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
}

const PhotoStepComponent: React.FC<PhotoStepComponentProps> = ({
  wizardData,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [photoAnalysis, setPhotoAnalysis] = useState<any>(null);

  const handlePhotoUploaded = (photoData: any) => {
    onUpdate({ photo: photoData });
    
    // Perform photo analysis
    analyzePhoto(photoData);
    
    // Switch to edit tab
    setActiveTab('edit');
    
    toast.success('Photo uploaded successfully! You can now edit and preview it.');
  };

  const analyzePhoto = (photoData: any) => {
    // Simulate AI photo analysis
    const analysis = {
      colorPalette: ['#8B4513', '#CD853F', '#F4A460', '#DEB887'],
      suggestedFrameStyles: ['Classic', 'Modern', 'Rustic'],
      photoType: detectPhotoType(photoData),
      qualityScore: calculateQualityScore(photoData),
      recommendations: generateRecommendations(photoData)
    };
    
    setPhotoAnalysis(analysis);
  };

  const detectPhotoType = (photoData: any) => {
    // Simple detection based on dimensions
    const { width, height } = photoData;
    const aspectRatio = width / height;
    
    if (aspectRatio > 1.3) return 'Landscape';
    if (aspectRatio < 0.8) return 'Portrait';
    return 'Square';
  };

  const calculateQualityScore = (photoData: any) => {
    const { width, height } = photoData;
    const totalPixels = width * height;
    
    if (totalPixels >= 3000 * 4000) return 95; // High quality
    if (totalPixels >= 2000 * 3000) return 85; // Good quality
    if (totalPixels >= 1200 * 1800) return 75; // Acceptable
    return 60; // Low quality
  };

  const generateRecommendations = (photoData: any) => {
    const recommendations = [];
    
    if (photoData.width < 1200 || photoData.height < 1800) {
      recommendations.push({
        type: 'warning',
        message: 'Consider a smaller frame size for optimal print quality',
        icon: AlertTriangle
      });
    }
    
    recommendations.push({
      type: 'tip',
      message: 'Try cropping to remove distracting elements',
      icon: Crop
    });
    
    return recommendations;
  };

  const handlePhotoEdited = (editedPhotoData: any) => {
    onUpdate({ 
      photo: editedPhotoData,
      photoPosition: editedPhotoData.position 
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Upload & Edit Your Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="edit" disabled={!wizardData.photo}>
                <Crop className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="analysis" disabled={!photoAnalysis}>
                <Zap className="h-4 w-4" />
                Smart Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <PhotoUpload
                onPhotoUploaded={handlePhotoUploaded}
                maxFiles={1}
                acceptMultiple={false}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Quality Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use high-resolution images (300 DPI)</li>
                      <li>• Minimum 1200x1800 pixels recommended</li>
                      <li>• JPEG or PNG formats accepted</li>
                      <li>• Maximum file size: 50MB</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">What Works Best</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Clear, well-lit photos</li>
                      <li>• Avoid heavily compressed images</li>
                      <li>• Portrait orientation for vertical frames</li>
                      <li>• Leave space around important subjects</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="edit" className="space-y-4">
              {wizardData.photo && (
                <EnhancedPhotoEditor
                  photo={wizardData.photo}
                  onPhotoEdited={handlePhotoEdited}
                />
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {photoAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Photo Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Quality Score</span>
                          <Badge variant={photoAnalysis.qualityScore >= 80 ? 'default' : 'secondary'}>
                            {photoAnalysis.qualityScore}/100
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Photo Type: {photoAnalysis.photoType}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Extracted Colors</h4>
                        <div className="flex gap-2">
                          {photoAnalysis.colorPalette.map((color: string, index: number) => (
                            <div
                              key={index}
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Suggested Frame Styles</h4>
                        <div className="flex gap-2">
                          {photoAnalysis.suggestedFrameStyles.map((style: string) => (
                            <Badge key={style} variant="outline">
                              {style}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Smart Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {photoAnalysis.recommendations.map((rec: any, index: number) => {
                        const Icon = rec.icon;
                        return (
                          <div
                            key={index}
                            className={`flex items-start gap-3 p-3 rounded-lg ${
                              rec.type === 'warning' 
                                ? 'bg-yellow-50 border border-yellow-200' 
                                : 'bg-blue-50 border border-blue-200'
                            }`}
                          >
                            <Icon className={`h-4 w-4 mt-0.5 ${
                              rec.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                            }`} />
                            <p className="text-sm">{rec.message}</p>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoStepComponent;