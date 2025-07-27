import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Settings,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Save
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

const AdminSettings = () => {
  const [businessInfo, setBusinessInfo] = useState({
    name: "FrameCraft",
    email: "contact@framecraft.com",
    phone: "+91-98765-43210",
    address: "123 Main Street, Mumbai, Maharashtra 400001",
    whatsapp: "+91-98765-43210",
    operatingHours: "Monday - Saturday: 9:00 AM - 7:00 PM",
    description: "Premium custom photo frames for every occasion",
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowNewOrders: true,
    autoEmailNotifications: true,
    currency: "INR",
    timezone: "Asia/Kolkata",
  });

  const handleSaveBusinessInfo = () => {
    // In a real app, this would save to the database
    console.log("Saving business info:", businessInfo);
    // Show success message
  };

  const handleSaveSystemSettings = () => {
    // In a real app, this would save to the database
    console.log("Saving system settings:", systemSettings);
    // Show success message
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your business information and system configuration</p>
        </div>

        <div className="space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Update your business details that appear on the website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                    placeholder="FrameCraft"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-email">Email Address</Label>
                  <Input
                    id="business-email"
                    type="email"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                    placeholder="contact@framecraft.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Phone Number</Label>
                  <Input
                    id="business-phone"
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                    placeholder="+91-98765-43210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-whatsapp">WhatsApp Number</Label>
                  <Input
                    id="business-whatsapp"
                    value={businessInfo.whatsapp}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, whatsapp: e.target.value })}
                    placeholder="+91-98765-43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-address">Business Address</Label>
                <Textarea
                  id="business-address"
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                  placeholder="Enter your business address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operating-hours">Operating Hours</Label>
                <Input
                  id="operating-hours"
                  value={businessInfo.operatingHours}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, operatingHours: e.target.value })}
                  placeholder="Monday - Saturday: 9:00 AM - 7:00 PM"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-description">Business Description</Label>
                <Textarea
                  id="business-description"
                  value={businessInfo.description}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, description: e.target.value })}
                  placeholder="Describe your business"
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveBusinessInfo} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Business Information
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system behavior and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable the website for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => 
                      setSystemSettings({ ...systemSettings, maintenanceMode: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow New Orders</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable new order placement
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.allowNewOrders}
                    onCheckedChange={(checked) => 
                      setSystemSettings({ ...systemSettings, allowNewOrders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send automatic email notifications for new orders
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.autoEmailNotifications}
                    onCheckedChange={(checked) => 
                      setSystemSettings({ ...systemSettings, autoEmailNotifications: checked })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={systemSettings.currency}
                    onChange={(e) => setSystemSettings({ ...systemSettings, currency: e.target.value })}
                    placeholder="INR"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={systemSettings.timezone}
                    onChange={(e) => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
                    placeholder="Asia/Kolkata"
                  />
                </div>
              </div>

              <Button onClick={handleSaveSystemSettings} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Test Email
                </Button>
                <Button variant="outline" className="justify-start">
                  <Phone className="mr-2 h-4 w-4" />
                  Test WhatsApp Integration
                </Button>
                <Button variant="outline" className="justify-start">
                  <MapPin className="mr-2 h-4 w-4" />
                  Update Google Maps
                </Button>
                <Button variant="outline" className="justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Set Business Hours
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;