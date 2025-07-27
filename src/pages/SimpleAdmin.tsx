import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SimpleAdmin = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Panel Working!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            The admin panel routing is working correctly. You can now access:
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <a href="/admin/login">Admin Login</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/admin/dashboard">Admin Dashboard</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleAdmin;