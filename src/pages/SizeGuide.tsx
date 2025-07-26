
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ruler, Image, Calculator, Eye } from "lucide-react";

const SizeGuide = () => {
  const standardSizes = [
    { name: "4\" x 6\"", description: "Perfect for prints and small photos", popular: true },
    { name: "5\" x 7\"", description: "Great for portraits and desk display", popular: true },
    { name: "8\" x 10\"", description: "Most popular size for wall display", popular: true },
    { name: "11\" x 14\"", description: "Ideal for larger prints and art", popular: false },
    { name: "16\" x 20\"", description: "Statement piece for focal walls", popular: false },
    { name: "18\" x 24\"", description: "Large format for galleries", popular: false }
  ];

  const mattingGuide = [
    { photoSize: "4\" x 6\"", recommendedFrame: "8\" x 10\"", matting: "2\" border" },
    { photoSize: "5\" x 7\"", recommendedFrame: "11\" x 14\"", matting: "3\" border" },
    { photoSize: "8\" x 10\"", recommendedFrame: "11\" x 14\"", matting: "1.5\" border" },
    { photoSize: "11\" x 14\"", recommendedFrame: "16\" x 20\"", matting: "2.5\" border" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Size Guide
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the perfect frame size for your photos and artwork
          </p>
        </div>

        {/* Size Calculator */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <Calculator className="h-8 w-8 mx-auto mb-2 text-accent" />
            <CardTitle>Size Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Photo Size</h3>
                <p className="text-sm text-muted-foreground mb-4">Enter your photo dimensions</p>
                <Button variant="outline">Upload Photo</Button>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Matting</h3>
                <p className="text-sm text-muted-foreground mb-4">Choose matting width</p>
                <Button variant="outline">Select Matting</Button>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Frame Size</h3>
                <p className="text-sm text-muted-foreground mb-4">Recommended frame size</p>
                <Button>Calculate</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Standard Sizes */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Standard Frame Sizes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {standardSizes.map((size, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{size.name}</CardTitle>
                    {size.popular && <Badge variant="secondary">Popular</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{size.description}</p>
                  <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Preview</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Matting Guide */}
        <Card className="mb-8">
          <CardHeader>
            <Ruler className="h-6 w-6 text-accent" />
            <CardTitle>Matting Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Matting adds visual space and enhances your artwork. Here are our recommended combinations:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Photo Size</th>
                    <th className="text-left py-2">Recommended Frame</th>
                    <th className="text-left py-2">Matting Width</th>
                  </tr>
                </thead>
                <tbody>
                  {mattingGuide.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{item.photoSize}</td>
                      <td className="py-2">{item.recommendedFrame}</td>
                      <td className="py-2">{item.matting}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Measuring Tips */}
        <Card>
          <CardHeader>
            <Eye className="h-6 w-6 text-accent" />
            <CardTitle>Measuring Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">For Photos</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Measure the actual photo, not the paper</li>
                  <li>• Include any white borders you want to show</li>
                  <li>• Standard photo sizes work with standard frames</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">For Artwork</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Measure the visible area you want framed</li>
                  <li>• Consider if you want borders to show</li>
                  <li>• Custom sizes available for unique pieces</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SizeGuide;
