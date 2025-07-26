import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, ShoppingCart, User, Search, Heart, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { openWhatsAppInquiry } from "@/lib/whatsapp";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(3); // TODO: Connect to cart state
  const navigate = useNavigate();

  const handleCustomFrames = () => {
    navigate('/products');
  };

  const navigation = [
    { name: 'Home', href: '/', isLink: true },
    { name: 'Products', href: '/products', isLink: true },
    { name: 'Custom Frames', href: '#customize', isLink: false, onClick: handleCustomFrames },
    { name: 'Materials', href: '#materials', isLink: false },
    { name: 'About', href: '#about', isLink: false },
    { name: 'Contact', href: '#contact', isLink: false }
  ];

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50 shadow-card">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              FrameCraft
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              item.isLink ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-foreground hover:text-accent transition-smooth relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className="text-foreground hover:text-accent transition-smooth relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                </button>
              )
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <WhatsAppButton 
              onClick={() => openWhatsAppInquiry()}
              size="sm"
              className="hidden xl:flex"
            >
              Quick Inquiry
            </WhatsAppButton>
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="hero" className="ml-4">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    FrameCraft
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <nav className="flex flex-col space-y-4">
                  {navigation.map((item) => (
                    item.isLink ? (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="text-lg text-foreground hover:text-accent transition-smooth py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <button
                        key={item.name}
                        onClick={() => {
                          item.onClick?.();
                          setIsMenuOpen(false);
                        }}
                        className="text-lg text-foreground hover:text-accent transition-smooth py-2 text-left"
                      >
                        {item.name}
                      </button>
                    )
                  ))}
                </nav>
                
                <div className="mt-8 space-y-4">
                  <WhatsAppButton 
                    onClick={() => openWhatsAppInquiry()}
                    className="w-full"
                    size="lg"
                  >
                    WhatsApp Inquiry
                  </WhatsAppButton>
                  <Button variant="elegant" size="lg" className="w-full">
                    <User className="h-5 w-5" />
                    Sign In
                  </Button>
                  <Button variant="hero" size="lg" className="w-full">
                    Get Started
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};