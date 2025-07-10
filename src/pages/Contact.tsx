
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Send, Zap, Phone } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare email data
      const emailData = {
        to: "Thomas.jackk@gmail.com",
        subject: formData.subject,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phoneNumber}</p>
          <p><strong>Subject:</strong> ${formData.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${formData.message.replace(/\n/g, '<br>')}</p>
        `
      };

      // TODO: Implement email sending via Supabase Edge Function
      console.log('Email data to send:', emailData);
      
      toast({
        title: "Message sent! 🚀",
        description: "We'll get back to you faster than a swarm of bees.",
      });
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again or email us directly.",
        variant: "destructive"
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
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
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                        placeholder="+44 123 456 7890"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      placeholder="What's this about?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      placeholder="Tell us about your project, question, or just say hi!"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
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
                  <a 
                    href="mailto:hello@404codelab.com" 
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
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
                  <p className="text-gray-300">
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
    </div>
  );
};

export default Contact;
