import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AdminTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            This is a test page to verify that admin routing is working correctly.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate("/admin/login")}
              className="w-full"
            >
              Go to Admin Login
            </Button>
            <Button 
              onClick={() => navigate("/admin/dashboard")}
              variant="outline"
              className="w-full"
            >
              Go to Admin Dashboard
            </Button>
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTest;