import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive' | 'premium' | 'elegant' | 'hero';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  iconType?: 'message' | 'phone';
  disabled?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  onClick,
  variant = 'default',
  size = 'default',
  className,
  children,
  showIcon = true,
  iconType = 'message',
  disabled = false
}) => {
  const Icon = iconType === 'phone' ? Phone : MessageCircle;
  
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      className={cn(
        'bg-green-500 hover:bg-green-600 text-white transition-colors',
        'focus:ring-green-500 focus:ring-2 focus:ring-offset-2',
        className
      )}
    >
      {showIcon && <Icon className="h-4 w-4 mr-2" />}
      {children || 'Contact on WhatsApp'}
    </Button>
  );
};

// Floating WhatsApp button for sticky positioning
interface FloatingWhatsAppButtonProps {
  onClick: () => void;
  className?: string;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  onClick,
  className
}) => {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full',
        'bg-green-500 hover:bg-green-600 text-white',
        'shadow-lg hover:shadow-xl transition-all duration-300',
        'focus:ring-green-500 focus:ring-2 focus:ring-offset-2',
        'animate-pulse hover:animate-none',
        className
      )}
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};

// WhatsApp contact card
interface WhatsAppContactCardProps {
  businessName?: string;
  businessNumber?: string;
  description?: string;
  onContactClick: () => void;
  className?: string;
}

export const WhatsAppContactCard: React.FC<WhatsAppContactCardProps> = ({
  businessName = "FrameCraft",
  businessNumber = "+91-XXXXX-XXXXX",
  description = "Get instant support and place your order directly on WhatsApp",
  onContactClick,
  className
}) => {
  return (
    <div className={cn(
      'bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200',
      'dark:from-green-900/20 dark:to-green-800/20 dark:border-green-800',
      className
    )}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {businessName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {businessNumber}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <div className="flex-shrink-0">
          <WhatsAppButton
            onClick={onContactClick}
            size="sm"
            className="bg-green-500 hover:bg-green-600"
          >
            Contact Now
          </WhatsAppButton>
        </div>
      </div>
    </div>
  );
}; 