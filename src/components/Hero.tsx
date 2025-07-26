import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-frames.jpg";

export const Hero = () => {
  const navigate = useNavigate();

  const handleStartCustomizing = () => {
    // First try to scroll to featured products, then fall back to main products
    const featuredSection = document.getElementById('featured-products');
    const productsSection = document.getElementById('products');
    
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth' });
    } else if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewProducts = () => {
    navigate('/products');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/80 z-10" />
      
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      <div className="relative z-20 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-accent text-accent" />
            ))}
            <span className="ml-2 text-muted-foreground">Trusted by 10,000+ customers</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Custom Photo Frames
            <br />
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Crafted with Love
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your precious memories into stunning wall art with our handcrafted, 
            customizable photo frames. Quality materials, expert craftsmanship, endless possibilities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="xl" className="group" onClick={handleStartCustomizing}>
              Start Customizing
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
                      <Button variant="elegant" size="xl" onClick={handleViewProducts}>
            View Products
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-accent rounded-full" />
              Free Design Consultation
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-accent rounded-full" />
              30-Day Money Back Guarantee
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-accent rounded-full" />
              Fast & Secure Shipping
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};