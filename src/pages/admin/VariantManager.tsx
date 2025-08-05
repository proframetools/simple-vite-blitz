import React from 'react';
import VariantManager from '@/components/admin/VariantManager';
import AdminLayout from '@/components/admin/AdminLayout';

const VariantManagerPage: React.FC = () => {
  return (
    <AdminLayout>
      <VariantManager />
    </AdminLayout>
  );
};

export default VariantManagerPage;