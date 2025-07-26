
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Sun, Droplets, Sparkles } from "lucide-react";

const CareInstructions = () => {
  const careSteps = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Regular Cleaning",
      description: "Dust weekly with a soft, dry cloth",
      details: [
        "Use a microfiber cloth for best results",
        "Avoid paper towels which can scratch",
        "Work in gentle circular motions"
      ]
    },
    {
      icon: <Sun className="h-6 w-6" />,
      title: "Light Protection",
      description: "Keep away from direct sunlight",
      details: [
        "UV rays can fade photos and artwork",
        "Use UV-protective glass when possible",
        "Rotate artwork periodically"
      ]
    },
    {
      icon: <Droplets className="h-6 w-6" />,
      title: "Humidity Control",
      description: "Maintain stable humidity levels",
      details: [
        "Ideal range: 45-55% humidity",
        "Avoid bathrooms and damp areas",
        "Use dehumidifiers if necessary"
      ]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Damage Prevention",
      description: "Handle with care during moves",
      details: [
        "Support from the bottom when lifting",
        "Wrap in soft cloth for transport",
        "Check hanging hardware regularly"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Care Instructions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Keep your frames looking beautiful for years to come
          </p>
        </div>

        {/* Care Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {careSteps.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="text-accent">{step.icon}</div>
                  <CardTitle>{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="text-sm text-muted-foreground">
                      • {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Material-Specific Care */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Wood Frame Care
                <Badge variant="outline">Natural</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Daily Care</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Dust with soft, dry cloth</li>
                    <li>• Avoid water and harsh chemicals</li>
                    <li>• Check for loose joints</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Deep Cleaning</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use wood-specific cleaner sparingly</li>
                    <li>• Follow wood grain direction</li>
                    <li>• Apply wood conditioner annually</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Metal Frame Care
                <Badge variant="outline">Durable</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Daily Care</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Wipe with damp cloth</li>
                    <li>• Dry immediately to prevent spots</li>
                    <li>• Check for oxidation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Deep Cleaning</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use metal cleaner for stubborn spots</li>
                    <li>• Polish with soft cloth</li>
                    <li>• Apply protective coating if needed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Glass and Matting Care */}
        <Card>
          <CardHeader>
            <CardTitle>Glass & Matting Care</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Glass Cleaning</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use glass cleaner or vinegar solution</li>
                  <li>• Spray on cloth, not directly on glass</li>
                  <li>• Clean in circular motions</li>
                  <li>• Avoid getting moisture on matting</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Matting Maintenance</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Never use water on matting</li>
                  <li>• Remove dust with soft brush</li>
                  <li>• Replace if severely stained</li>
                  <li>• Consider archival matting for valuable pieces</li>
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

export default CareInstructions;
