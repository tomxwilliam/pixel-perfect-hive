import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Send, Zap, Phone, Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import emailjs from '@emailjs/browser';
const Contact = () => {
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
      // Initialize EmailJS (replace with your public key)
      emailjs.init("YOUR_PUBLIC_KEY"); // User needs to replace this

      // Send email using EmailJS
      await emailjs.send("YOUR_SERVICE_ID",
      // User needs to replace this
      "YOUR_TEMPLATE_ID",
      // User needs to replace this
      {
        to_email: "Thomas.jackk@gmail.com",
        from_name: `${formData.firstName} ${formData.lastName}`,
        from_email: formData.email,
        phone: formData.phoneNumber,
        category: formData.category,
        subject: formData.subject,
        message: formData.message
      });
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
      console.error('EmailJS error:', error);
      toast({
        title: "Error sending message",
        description: "Please try again or email us directly at Thomas.jackk@gmail.com",
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
  return <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30 px-4 py-2">
            📬 Let's Build Something Together
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Have a question, pitch, or just want to say hi? Drop us a message — we'll get back faster than a swarm of bees.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-300">Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                        First Name
                      </label>
                      <Input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" placeholder="First name" />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      <Input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" placeholder="Last name" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" placeholder="your@email.com" />
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <Input id="phoneNumber" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" placeholder="+44 123 456 7890" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                      Service Category
                    </label>
                    <Select value={formData.category} onValueChange={handleSelectChange}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-500">
                        <SelectValue placeholder="Select a service category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600 z-50">
                        <SelectItem value="game-development" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          🎮 Game Development
                        </SelectItem>
                        <SelectItem value="app-development" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          📱 App Development
                        </SelectItem>
                        <SelectItem value="web-development" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          🌐 Web Development
                        </SelectItem>
                        <SelectItem value="consulting" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          💡 Technical Consulting
                        </SelectItem>
                        <SelectItem value="maintenance" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          🔧 Maintenance & Support
                        </SelectItem>
                        <SelectItem value="other" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                          ❓ Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <Input id="subject" name="subject" type="text" required value={formData.subject} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" placeholder="What's this about?" />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <Textarea id="message" name="message" required rows={6} value={formData.message} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" placeholder="Tell us about your project, question, or just say hi!" />
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50" size="lg">
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
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Mail className="h-6 w-6 text-blue-400 mr-3" />
                    <h3 className="text-xl font-bold text-blue-300">Email Directly</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Prefer to email directly? We love hearing from you!
                  </p>
                  <a href="mailto:hello@404codelab.com" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    hello@404codelab.com
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <MapPin className="h-6 w-6 text-purple-400 mr-3" />
                    <h3 className="text-xl font-bold text-purple-300">Location</h3>
                  </div>
                  <p className="text-gray-300 mb-2">📍 Based in Scotland</p>
                  <p className="text-gray-300">🌍 Working worldwide</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Zap className="h-6 w-6 text-green-400 mr-3" />
                    <h3 className="text-xl font-bold text-green-300">Quick Response</h3>
                  </div>
                  <p className="text-stone-950">
                    We typically respond within 24 hours. For urgent projects, we're often faster 
                    than your morning coffee! ☕
                  </p>
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