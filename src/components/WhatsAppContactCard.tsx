import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsAppButton } from '@/components/ui/whatsapp-button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Phone, MessageCircle } from 'lucide-react';
import { openWhatsAppInquiry, generateBusinessHoursMessage } from '@/lib/whatsapp';

interface WhatsAppContactCardProps {
  className?: string;
  showBusinessHours?: boolean;
  showLocation?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export const WhatsAppContactCard: React.FC<WhatsAppContactCardProps> = ({
  className = "",
  showBusinessHours = true,
  showLocation = true,
  variant = 'default'
}) => {
  const businessInfo = {
    name: "FrameCraft",
    phone: "+91-98765-43210",
    address: "Mumbai, Maharashtra, India",
    hours: "Mon-Sat: 9:00 AM - 7:00 PM IST",
    closedDays: "Sundays & Public Holidays"
  };

  if (variant === 'compact') {
    return (
      <Card className={`border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {businessInfo.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {businessInfo.phone}
              </p>
            </div>
            <WhatsAppButton
              onClick={() => openWhatsAppInquiry()}
              size="sm"
            >
              Contact
            </WhatsAppButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-green-200 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-800 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          Get Instant Support on WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Business Contact */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-600" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {businessInfo.name}
            </span>
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              Verified Business
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
            {businessInfo.phone}
          </p>
        </div>

        {/* Business Hours */}
        {showBusinessHours && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Business Hours
              </span>
            </div>
            <div className="ml-6 text-sm text-gray-600 dark:text-gray-400">
              <p>{businessInfo.hours}</p>
              <p className="text-xs mt-1">
                Closed: {businessInfo.closedDays}
              </p>
            </div>
          </div>
        )}

        {/* Location */}
        {showLocation && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Location
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
              {businessInfo.address}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <WhatsAppButton
            onClick={() => openWhatsAppInquiry()}
            className="flex-1"
            size="sm"
          >
            💬 Quick Inquiry
          </WhatsAppButton>
          <WhatsAppButton
            onClick={() => {
              const message = generateBusinessHoursMessage();
              const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            📍 Business Info
          </WhatsAppButton>
        </div>

        {/* Help Text */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Get instant quotes, upload photos, and track your order progress
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppContactCard; 