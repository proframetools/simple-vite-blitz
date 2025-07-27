import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminIndex = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Temporarily redirect directly to dashboard for testing
    navigate("/admin/dashboard");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    </div>
  );
};

export default AdminIndex;