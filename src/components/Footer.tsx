
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-accent">
              FrameCraft
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              Crafting beautiful, custom photo frames that transform your precious 
              memories into stunning works of art for over 20 years.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-accent">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/products" 
                  className="text-primary-foreground/80 hover:text-accent transition-smooth"
                >
                  Custom Frames
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="text-primary-foreground/80 hover:text-accent transition-smooth"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/size-guide" 
                  className="text-primary-foreground/80 hover:text-accent transition-smooth"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link 
                  to="/care-instructions" 
                  className="text-primary-foreground/80 hover:text-accent transition-smooth"
                >
                  Care Instructions
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-primary-foreground/80 hover:text-accent transition-smooth"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/help-center" 
                  className="text-primary-foreground/80 hover:text-accent transition-smooth"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-primary-foreground/80 hover:text-accent transition-smooth"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-primary-foreground/80 hover:text-accent transition-smooth"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link 
                  to="/size-guide" 
                  className="text-primary-foreground/80 hover:text-accent transition-smooth"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link 
                  to="/care-instructions" 
                  className="text-primary-foreground/80 hover:text-accent transition-smooth"
                >
                  Care Instructions
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-primary-foreground/80 hover:text-accent transition-smooth"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Connected</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                <span>hello@framecraft.com</span>
              </div>
              <div className="flex items-center space-x-3 text-primary-foreground/80">
                <MapPin className="h-4 w-4" />
                <span>123 Craft Ave, Art District</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-primary-foreground/80">
                Get design tips and exclusive offers
              </p>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter your email" 
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Button variant="premium" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-primary-foreground/80">
              <span>© {currentYear} FrameCraft. Made with</span>
              <Heart className="h-4 w-4 text-accent fill-accent" />
              <span>for your memories.</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                Terms of Service
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
