import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Users, ShoppingCart, Settings, LogOut, Image, Palette, Ruler, Frame } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    products: 0,
    variants: 0,
    orders: 0,
    customers: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
      return;
    }

    // For now, allow any authenticated user to access admin
    // This will be properly secured once admin roles are implemented
    setUser(session.user);
  };

  const loadStats = async () => {
    try {
      const [
        { count: productsCount },
        { count: ordersCount },
        { count: customersCount }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('uploaded_photos').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        products: productsCount || 0,
        variants: 0, // Will be populated once types are updated
        orders: ordersCount || 0,
        customers: customersCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const navigationItems = [
    { 
      title: 'Products', 
      description: 'Manage products and categories',
      icon: Package,
      path: '/admin/products',
      count: stats.products
    },
    { 
      title: 'Product Variants', 
      description: 'Manage product variants and combinations',
      icon: Frame,
      path: '/admin/variants',
      count: stats.variants
    },
    { 
      title: 'Frame Colors', 
      description: 'Manage frame color options',
      icon: Palette,
      path: '/admin/frame-colors'
    },
    { 
      title: 'Frame Sizes', 
      description: 'Manage frame size configurations',
      icon: Ruler,
      path: '/admin/frame-sizes'
    },
    { 
      title: 'Preview Images', 
      description: 'Manage frame preview assets',
      icon: Image,
      path: '/admin/preview-images'
    },
    { 
      title: 'Orders', 
      description: 'View and manage customer orders',
      icon: ShoppingCart,
      path: '/admin/orders',
      count: stats.orders
    },
    { 
      title: 'Customers', 
      description: 'Manage customer data and photos',
      icon: Users,
      path: '/admin/customers',
      count: stats.customers
    },
    { 
      title: 'Settings', 
      description: 'System configuration and settings',
      icon: Settings,
      path: '/admin/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Product Variants</CardTitle>
              <Frame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.variants}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.customers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationItems.map((item) => (
            <Card key={item.path} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <item.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                  {item.count !== undefined && (
                    <Badge variant="secondary">{item.count}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <Button 
                  onClick={() => navigate(item.path)}
                  className="w-full"
                  variant="outline"
                >
                  Manage
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;