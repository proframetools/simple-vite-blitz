
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, Clock, Shield } from "lucide-react";

const Shipping = () => {
  const shippingOptions = [
    {
      name: "Standard Shipping",
      time: "5-7 business days",
      cost: "$9.99",
      description: "Reliable delivery with tracking"
    },
    {
      name: "Express Shipping",
      time: "2-3 business days",
      cost: "$19.99",
      description: "Faster delivery with priority handling"
    },
    {
      name: "Overnight Shipping",
      time: "1 business day",
      cost: "$39.99",
      description: "Next-day delivery for urgent orders"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Shipping Information
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fast, secure shipping to protect your custom frames
          </p>
        </div>

        {/* Shipping Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {shippingOptions.map((option, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <Truck className="h-8 w-8 mx-auto mb-2 text-accent" />
                <CardTitle>{option.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-2">{option.cost}</div>
                <Badge variant="secondary" className="mb-4">{option.time}</Badge>
                <p className="text-muted-foreground">{option.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Shipping Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <Package className="h-6 w-6 text-accent" />
              <CardTitle>Packaging & Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Every frame is carefully packaged with premium materials to ensure safe delivery:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Protective foam corners and backing</li>
                <li>• Bubble wrap for glass protection</li>
                <li>• Sturdy cardboard outer packaging</li>
                <li>• Fragile handling stickers</li>
                <li>• Insurance included on all orders</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-6 w-6 text-accent" />
              <CardTitle>Processing Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Processing times vary by product type:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Standard frames: 1-2 business days</li>
                <li>• Custom frames: 3-5 business days</li>
                <li>• Bulk orders (10+): 5-7 business days</li>
                <li>• Rush orders: Available upon request</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardHeader>
            <Shield className="h-6 w-6 text-accent" />
            <CardTitle>Shipping Guarantee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We guarantee safe delivery of your frames. If your order arrives damaged, we'll replace it free of charge.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Free Shipping</h4>
                <p className="text-muted-foreground">Orders over $75 qualify for free standard shipping within the continental US.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">International Shipping</h4>
                <p className="text-muted-foreground">We ship worldwide. International rates and delivery times vary by destination.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Shipping;
