import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Send, Zap, Phone, Loader2 } from "lucide-react";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Seo from "@/components/Seo";
import { usePageContent } from "@/hooks/usePageContent";
const Contact = () => {
  const { data: pageContent } = usePageContent('/contact');
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    category: "",
    subject: "",
    message: ""
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Send contact form data via Supabase edge function
      const { data, error } = await supabase.functions.invoke('send-contact-notification', {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          category: formData.category,
          subject: formData.subject,
          message: formData.message
        }
      });

      if (error) throw error;
      toast({
        title: "Message sent! 🚀",
        description: "We'll get back to you faster than a swarm of bees."
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        category: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Error sending message",
        description: "Please try again or email us directly at hello@404codelab.com",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      category: value
    });
  };
  return <div className="min-h-screen bg-background text-foreground">
      <Seo 
        title={pageContent?.meta_title || "Contact 404 Code Lab - Get In Touch"}
        description={pageContent?.meta_description || "Get in touch with 404 Code Lab for web development, mobile apps, or game development projects."}
        canonicalUrl={pageContent?.canonical_url || "https://404codelab.com/contact"}
      />
      <StaticNavigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-background via-primary/10 to-accent/20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-2">
            📬 Let's Build Something Together
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Get In Touch
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have a question, pitch, or just want to say hi? Drop us a message — we'll get back faster than a swarm of bees.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                        First Name
                      </label>
                      <Input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange} placeholder="First name" />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                        Last Name
                      </label>
                      <Input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange} placeholder="Last name" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="your@email.com" />
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} placeholder="+44 123 456 7890" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                      Service Category
                    </label>
                    <Select value={formData.category} onValueChange={handleSelectChange}>
                      <SelectTrigger type="button">
                        <SelectValue placeholder="Select a service category" />
                      </SelectTrigger>
                      <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
                        <SelectItem value="game-development">
                          🎮 Game Development
                        </SelectItem>
                        <SelectItem value="app-development">
                          📱 App Development
                        </SelectItem>
                        <SelectItem value="web-development">
                          🌐 Web Development
                        </SelectItem>
                        <SelectItem value="ai-integration">
                          🤖 AI Integration
                        </SelectItem>
                        <SelectItem value="consulting">
                          💡 Technical Consulting
                        </SelectItem>
                        <SelectItem value="maintenance">
                          🔧 Maintenance & Support
                        </SelectItem>
                        <SelectItem value="other">
                          ❓ Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <Input id="subject" name="subject" type="text" required value={formData.subject} onChange={handleChange} placeholder="What's this about?" />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message
                    </label>
                    <Textarea id="message" name="message" required rows={6} value={formData.message} onChange={handleChange} placeholder="Tell us about your project, question, or just say hi!" />
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50" size="lg">
                    {isLoading ? <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </> : <>
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <Card className="bg-card border-border">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Mail className="h-6 w-6 text-primary mr-3" />
                    <h3 className="text-xl font-bold text-primary">Email Directly</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Prefer to email directly? We love hearing from you!
                  </p>
                  <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80 transition-colors font-medium">
                    hello@404codelab.com
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <MapPin className="h-6 w-6 text-accent mr-3" />
                    <h3 className="text-xl font-bold text-accent">Location</h3>
                  </div>
                  <p className="text-muted-foreground mb-2">📍 Based in Scotland</p>
                  <p className="text-muted-foreground">🌍 Working worldwide</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500/10 to-primary/10 border-green-500/30">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Phone className="h-6 w-6 text-green-400 mr-3" />
                    <h3 className="text-xl font-bold text-green-300">WhatsApp Us</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Need instant support? Message us on WhatsApp for quick responses!
                  </p>
                  <p className="text-muted-foreground mb-6 font-medium">
                    📱 07496 295759
                  </p>
                  <Button 
                    onClick={() => window.open('https://wa.me/447496295759?text=Hi%20404CodeLabs!%20I%27m%20interested%20in%20your%20services.', '_blank')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white border-0"
                    size="lg"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Message on WhatsApp
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Contact;