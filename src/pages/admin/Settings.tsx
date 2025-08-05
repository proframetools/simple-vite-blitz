import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const Settings: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">System Settings</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              System settings and configuration options are coming soon. This will include:
            </p>
            <ul className="list-disc list-inside mt-2 text-muted-foreground">
              <li>Site configuration and branding</li>
              <li>Email and notification settings</li>
              <li>Payment and shipping configuration</li>
              <li>User permissions and roles</li>
              <li>System maintenance tools</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Settings;