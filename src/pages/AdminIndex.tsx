import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminIndex = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we should redirect automatically
    const shouldRedirect = new URLSearchParams(window.location.search).get('redirect') === 'auto';
    if (shouldRedirect) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>FrameCraft Admin Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Welcome to the FrameCraft admin panel. Please choose an option:
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate("/admin/login")}
              className="w-full"
            >
              Admin Login
            </Button>
            <Button 
              onClick={() => navigate("/admin/dashboard")}
              variant="outline"
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => navigate("/admin/simple")}
              variant="outline"
              className="w-full"
            >
              Simple Admin Test
            </Button>
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIndex;