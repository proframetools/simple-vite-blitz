import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminDashboard from './AdminDashboard';
import ProductManager from './ProductManager';
import VariantManager from '@/components/admin/VariantManager';
import FrameColorManager from './FrameColorManager';
import FrameSizeManager from './FrameSizeManager';
import PreviewImageManager from './PreviewImageManager';
import OrderManager from './OrderManager';

const AdminRouter = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      // For now, allow any authenticated user to access admin
      // This will be properly secured once admin roles are implemented
      setUser(session.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Route the admin pages based on the current path
  const renderAdminPage = () => {
    const path = location.pathname;

    switch (path) {
      case '/admin/products':
        return <ProductManager />;
      case '/admin/variants':
        return <VariantManager />;
      case '/admin/frame-colors':
        return <FrameColorManager />;
      case '/admin/frame-sizes':
        return <FrameSizeManager />;
      case '/admin/preview-images':
        return <PreviewImageManager />;
      case '/admin/orders':
        return <OrderManager />;
      case '/admin/dashboard':
      default:
        return <AdminDashboard />;
    }
  };

  return <>{renderAdminPage()}</>;
};

export default AdminRouter;