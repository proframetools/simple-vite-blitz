import React, { useState, useEffect } from 'react';
import { FloatingWhatsAppButton } from '@/components/ui/whatsapp-button';
import WhatsAppContactCard from '@/components/WhatsAppContactCard';
import { Button } from '@/components/ui/button';
import { X, MessageCircle } from 'lucide-react';
import { openWhatsAppInquiry } from '@/lib/whatsapp';

interface GlobalWhatsAppWidgetProps {
  showFloatingButton?: boolean;
  showContactCard?: boolean;
  position?: 'bottom-right' | 'bottom-left';
}

export const GlobalWhatsAppWidget: React.FC<GlobalWhatsAppWidgetProps> = ({
  showFloatingButton = true,
  showContactCard = false,
  position = 'bottom-right'
}) => {
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show widget after a short delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleFloatingButtonClick = () => {
    if (showContactCard) {
      setIsCardOpen(!isCardOpen);
    } else {
      openWhatsAppInquiry();
    }
  };

  if (!isVisible) return null;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Contact Card Popup */}
      {isCardOpen && showContactCard && (
        <div className="mb-4 w-80 animate-in slide-in-from-bottom-2">
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-md"
              onClick={() => setIsCardOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
            <WhatsAppContactCard 
              variant="compact"
              showBusinessHours={false}
              showLocation={false}
            />
          </div>
        </div>
      )}

      {/* Floating Button */}
      {showFloatingButton && (
        <div className="relative">
          <FloatingWhatsAppButton 
            onClick={handleFloatingButtonClick}
            className={`
              ${isCardOpen ? 'bg-gray-500 hover:bg-gray-600' : ''}
              transition-all duration-300
            `}
          />
          
          {/* Notification Badge */}
          {!isCardOpen && (
            <div className="absolute -top-1 -right-1 animate-pulse">
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
            </div>
          )}
        </div>
      )}

      {/* Alternative: Always show contact card */}
      {showContactCard && !showFloatingButton && (
        <WhatsAppContactCard 
          variant="compact"
          className="w-80"
        />
      )}
    </div>
  );
};

export default GlobalWhatsAppWidget; 