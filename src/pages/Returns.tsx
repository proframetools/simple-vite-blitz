
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Package2, Clock, CheckCircle } from "lucide-react";

const Returns = () => {
  const returnSteps = [
    {
      step: 1,
      title: "Initiate Return",
      description: "Contact our support team or use our online return portal"
    },
    {
      step: 2,
      title: "Package Item",
      description: "Carefully package the frame in original packaging"
    },
    {
      step: 3,
      title: "Ship Back",
      description: "Use the prepaid return label we provide"
    },
    {
      step: 4,
      title: "Process Refund",
      description: "Refund processed within 3-5 business days"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Returns & Exchanges
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We stand behind our quality. Easy returns within 30 days.
          </p>
        </div>

        {/* Return Policy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
              <CardTitle>30-Day Window</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Return or exchange within 30 days of delivery
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Package2 className="h-8 w-8 mx-auto mb-2 text-accent" />
              <CardTitle>Original Condition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Items must be unused and in original packaging
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <RotateCcw className="h-8 w-8 mx-auto mb-2 text-accent" />
              <CardTitle>Free Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We provide prepaid return labels for all returns
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Return Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Return an Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {returnSteps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button size="lg">Start Return Process</Button>
            </div>
          </CardContent>
        </Card>

        {/* Return Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle>What Can Be Returned</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Standard frames in original condition</li>
                <li>• Unused matting and accessories</li>
                <li>• Damaged items (we'll replace free)</li>
                <li>• Wrong size orders (our error)</li>
                <li>• Defective products</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Return Restrictions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Custom frames with uploaded photos</li>
                <li>• Personalized or engraved items</li>
                <li>• Items damaged by customer</li>
                <li>• Returns after 30 days</li>
                <li>• Items without original packaging</li>
              </ul>
              <Badge variant="outline" className="mt-4">
                Special cases may apply - contact support
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Exchange Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Exchanges</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Need a different size or color? We make exchanges easy:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Size Exchanges</h4>
                <p className="text-sm text-muted-foreground">
                  Exchange for a different size with no additional shipping costs if the price difference is minimal.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Color/Style Exchanges</h4>
                <p className="text-sm text-muted-foreground">
                  Switch to a different color or style within the same product line at no extra charge.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Returns;
