import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import GlobalWhatsAppWidget from "@/components/GlobalWhatsAppWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        
        {/* Admin Test Link */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel Test</h2>
            <div className="space-x-4">
              <Button asChild>
                <a href="/admin">Go to Admin</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/admin/login">Admin Login</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/admin/dashboard">Admin Dashboard</a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <GlobalWhatsAppWidget />
    </div>
  );
};

export default Index;
