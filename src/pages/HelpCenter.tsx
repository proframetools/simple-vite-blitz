
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageCircle, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";

const HelpCenter = () => {
  const faqs = [
    {
      question: "How do I choose the right frame size?",
      answer: "Our frame sizes are designed to accommodate standard photo sizes with proper matting. For custom sizes, use our size calculator or contact our support team for personalized recommendations."
    },
    {
      question: "What materials do you offer?",
      answer: "We offer premium wood frames in oak, pine, and walnut, as well as metal frames in silver, black, and gold finishes. All materials are carefully selected for durability and aesthetic appeal."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 5-7 business days. Express shipping (2-3 business days) and overnight options are available. Custom frames may require additional processing time."
    },
    {
      question: "Can I return or exchange my frame?",
      answer: "Yes! We offer a 30-day return policy for unused frames in original packaging. Custom frames with uploaded photos may have different return conditions."
    },
    {
      question: "Do you offer bulk discounts?",
      answer: "Yes, we offer volume discounts for orders of 10+ frames. Contact our sales team for custom pricing and dedicated support for bulk orders."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to your questions or get in touch with our support team
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search for help..." 
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-accent" />
              <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Chat with our support team in real-time
              </p>
              <Button variant="outline">Start Chat</Button>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Phone className="h-8 w-8 mx-auto mb-2 text-accent" />
              <CardTitle>Phone Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Call us at (555) 123-4567
              </p>
              <Button variant="outline">Call Now</Button>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Mail className="h-8 w-8 mx-auto mb-2 text-accent" />
              <CardTitle>Email Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Send us an email
              </p>
              <Button variant="outline">Send Email</Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
