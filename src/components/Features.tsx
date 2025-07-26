import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Ruler, 
  Shield, 
  Truck, 
  Award, 
  Users,
  Sparkles,
  Clock
} from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Unlimited Customization",
    description: "Choose from dozens of materials, colors, and finishes to create the perfect frame for your space.",
    badge: "Popular"
  },
  {
    icon: Ruler,
    title: "Any Size, Any Shape",
    description: "From tiny 4x6 memories to large gallery walls - we craft frames in any dimension you need.",
    badge: "Flexible"
  },
  {
    icon: Shield,
    title: "Premium Quality",
    description: "Museum-quality materials and UV-protective glass ensure your memories are preserved for generations.",
    badge: "Premium"
  },
  {
    icon: Truck,
    title: "Fast & Safe Shipping",
    description: "Carefully packaged and shipped within 5-7 business days with full insurance coverage.",
    badge: "Reliable"
  },
  {
    icon: Award,
    title: "Expert Craftsmanship",
    description: "Each frame is handcrafted by skilled artisans with over 20 years of experience in custom framing.",
    badge: "Quality"
  },
  {
    icon: Users,
    title: "Personal Consultation",
    description: "Work one-on-one with our design experts to create the perfect frame for your unique vision.",
    badge: "Service"
  },
  {
    icon: Sparkles,
    title: "Unique Finishes",
    description: "Exclusive textures, distressing, and specialty finishes that you won't find anywhere else.",
    badge: "Exclusive"
  },
  {
    icon: Clock,
    title: "30-Day Guarantee",
    description: "Not completely satisfied? Return your frame within 30 days for a full refund, no questions asked.",
    badge: "Guaranteed"
  }
];

export const Features = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose FrameCraft?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're not just selling frames - we're helping you create lasting memories 
            with unmatched quality, service, and attention to detail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-hover transition-smooth border-0 bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center group-hover:shadow-glow transition-smooth">
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-semibold"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
                  </div>
      </div>
    </section>
  );
};