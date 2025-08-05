import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const CustomerManager: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Customer Management</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Customer management functionality is coming soon. This will include:
            </p>
            <ul className="list-disc list-inside mt-2 text-muted-foreground">
              <li>View customer profiles and uploaded photos</li>
              <li>Manage customer data and preferences</li>
              <li>Track customer order history</li>
              <li>Customer support tools</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CustomerManager;