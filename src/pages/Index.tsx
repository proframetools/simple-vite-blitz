import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import ProductCarousel from "@/components/ProductCarousel";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import GlobalWhatsAppWidget from "@/components/GlobalWhatsAppWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ProductCarousel 
          title="Featured Frames"
          subtitle="Discover our most popular and beautifully crafted photo frames, perfect for your precious memories"
          maxProducts={8}
        />
        <Features />
      </main>
      <Footer />
      <GlobalWhatsAppWidget 
        showFloatingButton={true}
        showContactCard={true}
        position="bottom-right"
      />
    </div>
  );
};

export default Index;
