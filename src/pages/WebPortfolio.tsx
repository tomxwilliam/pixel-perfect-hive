import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Globe, Zap, Code, Smartphone, TrendingUp, Eye, ArrowRight, Users, Palette, Rocket, HeadphonesIcon } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const WebPortfolio = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-background via-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-2">
            💻 Websites That Work
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent py-[8px]">
            Web Design Portfolio
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We don't just design sites — we design experiences. Clean UI, strong UX, fast performance, 
            and responsive across all devices.
          </p>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary">Performance First</h3>
                <p className="text-muted-foreground">
                  Every site we build loads in under 3 seconds. No bloated frameworks, 
                  just clean, optimized code that users and search engines love.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary">Mobile-First Design</h3>
                <p className="text-muted-foreground">
                  With 60% of traffic coming from mobile, we design for small screens first, 
                  then scale up to create perfect experiences on every device.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-accent/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-accent">Conversion Focused</h3>
                <p className="text-muted-foreground">
                  Beautiful designs that drive action. Every element is strategically placed 
                  to guide users toward your business goals.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Website Types */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-primary">Website Types We Create</h2>
            <p className="text-xl text-muted-foreground">
              From simple landing pages to complex web applications, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="font-bold mb-2 text-primary">Landing Pages</h3>
                <p className="text-muted-foreground text-sm">
                  High-converting single pages designed to capture leads and drive sales.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">🏢</div>
                <h3 className="font-bold mb-2 text-accent">Business Websites</h3>
                <p className="text-muted-foreground text-sm">
                  Professional corporate sites that establish credibility and attract clients.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">🛍️</div>
                <h3 className="font-bold mb-2 text-primary">E-commerce</h3>
                <p className="text-muted-foreground text-sm">
                  Online stores with smooth checkout flows and inventory management.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📝</div>
                <h3 className="font-bold mb-2 text-accent">Portfolios</h3>
                <p className="text-muted-foreground text-sm">
                  Stunning showcase websites for creatives and professionals.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="font-bold mb-2 text-primary">Web Applications</h3>
                <p className="text-muted-foreground text-sm">
                  Complex dashboards and tools with real-time data and user management.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="font-bold mb-2 text-accent">Progressive Web Apps</h3>
                <p className="text-muted-foreground text-sm">
                  App-like experiences that work across all platforms and devices.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Local Business Web Design Projects */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-primary">Our Portfolio</h2>
            <p className="text-xl text-muted-foreground">
              Recent website projects we've completed for local businesses across various industries.
            </p>
          </div>

          <div className="space-y-12">
            {/* SparkleClean */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary mb-2">SparkleClean</h3>
                        
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      A modern cleaning service website featuring an elegant gallery showcase, streamlined contact forms, and service booking system designed to convert visitors into customers.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-muted-foreground">
                        <Palette className="h-5 w-5 text-primary mr-3" />
                        <span>Modern gallery with before/after photos</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-5 w-5 text-accent mr-3" />
                        <span>Streamlined contact and booking forms</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Smartphone className="h-5 w-5 text-primary mr-3" />
                        <span>Mobile-optimized for on-the-go bookings</span>
                      </div>
                    </div>
                    
                    <a href="https://404codelab.com/sparkleclean/index.html" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({
                    variant: "default"
                  }), "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90")}>
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </a>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
                      <img src="/lovable-uploads/de1286a6-6683-4438-a78c-c5995a51478e.png" alt="SparkleClean Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FixRight Plumbing */}
            <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mr-4">
                        <Zap className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-accent mb-2">FixRight Plumbing</h3>
                        
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      Emergency plumbing service website with 24/7 booking system, boiler service scheduling, and instant quote calculator to help customers get immediate assistance.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-muted-foreground">
                        <Rocket className="h-5 w-5 text-accent mr-3" />
                        <span>24/7 emergency booking system</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Code className="h-5 w-5 text-accent/70 mr-3" />
                        <span>Instant quote calculator</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <HeadphonesIcon className="h-5 w-5 text-accent mr-3" />
                        <span>Live chat support integration</span>
                      </div>
                    </div>
                    
                    <a href="https://404codelab.com/fixright-plumbing/index.html" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({
                    variant: "default"
                  }), "bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90")}>
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </a>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl p-8">
                      <img src="/lovable-uploads/08b142ce-467d-4503-aa9d-28d4085bbf3b.png" alt="FixRight Plumbing Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shear Perfection */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mr-4">
                        <Palette className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-accent mb-2">Shear Perfection</h3>
                        
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      Hair & beauty salon website featuring online booking system, treatment galleries, and stylist profiles to showcase expertise and build client confidence.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-5 w-5 text-accent mr-3" />
                        <span>Online appointment booking</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Eye className="h-5 w-5 text-accent/70 mr-3" />
                        <span>Treatment gallery showcase</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <TrendingUp className="h-5 w-5 text-accent mr-3" />
                        <span>Stylist profiles and reviews</span>
                      </div>
                    </div>
                    
                    <a href="https://404codelab.com/shear-perfection/index.html" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({
                    variant: "default"
                  }), "bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90")}>
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </a>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl p-8">
                      <img src="/lovable-uploads/9bf1d85f-9e5f-4fb0-9ce8-f74db644a586.png" alt="Shear Perfection Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Padrino's Pizza */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary mb-2">Padrino's Pizza</h3>
                        
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      Takeaway pizza restaurant website with interactive menu builder, food gallery, and seamless online ordering system to boost delivery sales.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-muted-foreground">
                        <Code className="h-5 w-5 text-primary mr-3" />
                        <span>Interactive menu and pizza builder</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Eye className="h-5 w-5 text-accent mr-3" />
                        <span>Appetizing food gallery</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Rocket className="h-5 w-5 text-primary mr-3" />
                        <span>One-click ordering system</span>
                      </div>
                    </div>
                    
                    <a href="https://404codelab.com/padrinos-pizza/index.html" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({
                    variant: "default"
                  }), "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90")}>
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </a>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
                      <img src="/lovable-uploads/c4140cc5-49a7-448f-a499-fa51ef6ff6c9.png" alt="Padrino's Pizza Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sweet Crumbs */}
            <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mr-4">
                        <Palette className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-accent mb-2">Sweet Crumbs</h3>
                        
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      Custom cake shop website featuring flavor browsing, cake galleries, and personalized order forms to help customers create their dream celebrations.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-muted-foreground">
                        <Eye className="h-5 w-5 text-accent mr-3" />
                        <span>Interactive flavor and design galleries</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Code className="h-5 w-5 text-accent/70 mr-3" />
                        <span>Custom order form builder</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-5 w-5 text-accent mr-3" />
                        <span>Event consultation booking</span>
                      </div>
                    </div>
                    
                    <a href="https://404codelab.com/sweet-crumbs/index.html" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({
                    variant: "default"
                  }), "bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90")}>
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </a>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl p-8">
                      <img src="/lovable-uploads/1e963e0b-cd28-4c9f-a4ee-0efb51b7c7fa.png" alt="Sweet Crumbs Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Happy Paws */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mr-4">
                        <Users className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-accent mb-2">Happy Paws</h3>
                        
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      Dog grooming & daycare website with service galleries, staff profiles, and online booking to help pet owners find trusted care for their furry friends.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-muted-foreground">
                        <Eye className="h-5 w-5 text-accent mr-3" />
                        <span>Before/after grooming galleries</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-5 w-5 text-accent/70 mr-3" />
                        <span>Staff profiles and credentials</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Rocket className="h-5 w-5 text-accent mr-3" />
                        <span>Online booking and scheduling</span>
                      </div>
                    </div>
                    
                    <a href="https://404codelab.com/happy-paws/index.html" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({
                    variant: "default"
                  }), "bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90")}>
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </a>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl p-8">
                      <img src="/lovable-uploads/5deb9273-b749-4781-803a-ac052ba93374.png" alt="Happy Paws Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crafted Joinery */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                        <Code className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary mb-2">Crafted Joinery</h3>
                        
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      Bespoke joinery portfolio website showcasing handcrafted furniture, project galleries, and consultation booking to attract high-value custom work clients.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-muted-foreground">
                        <Eye className="h-5 w-5 text-primary mr-3" />
                        <span>High-quality project photo galleries</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Palette className="h-5 w-5 text-accent mr-3" />
                        <span>Material and finish showcases</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-5 w-5 text-primary mr-3" />
                        <span>Consultation booking system</span>
                      </div>
                    </div>
                    
                    <a href="https://404codelab.com/crafted-joinery/index.html" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({
                    variant: "default"
                  }), "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90")}>
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </a>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
                      <img src="/lovable-uploads/ae042420-8758-4f7f-89c6-368216ad3dd5.png" alt="Crafted Joinery Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* IronHouse Gym */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary mb-2">IronHouse Gym</h3>
                        
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      Bold gym website featuring class timetables, trainer profiles, and membership sign-up to motivate visitors and convert them into dedicated members.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-muted-foreground">
                        <TrendingUp className="h-5 w-5 text-primary mr-3" />
                        <span>Interactive class timetables</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-5 w-5 text-primary mr-3" />
                        <span>Trainer profiles and specialties</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Rocket className="h-5 w-5 text-primary mr-3" />
                        <span>Online membership sign-up</span>
                      </div>
                    </div>
                    
                    <a href="https://404codelab.com/ironhouse-gym/index.html" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({
                    variant: "default"
                  }), "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90")}>
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </a>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
                      <img src="/lovable-uploads/47f9ad80-e301-4e42-aab1-48bedbe2da16.png" alt="IronHouse Gym Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inkspire */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                        <Palette className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary mb-2">Inkspire</h3>
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      Professional tattoo parlor website featuring artist portfolios, design galleries, and consultation booking to help clients find the perfect artist for their vision.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-5 w-5 text-primary mr-3" />
                        <span>Detailed artist bios and portfolios</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Eye className="h-5 w-5 text-accent mr-3" />
                        <span>High-res tattoo gallery showcase</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Code className="h-5 w-5 text-primary mr-3" />
                        <span>Design consultation booking</span>
                      </div>
                    </div>
                    
                    <a href="https://404codelab.com/inkspire/index.html" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({
                    variant: "default"
                  }), "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90")}>
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </a>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
                      <img src="/lovable-uploads/0f5fc07e-8b2a-49a3-b4d4-1e7a3adb62b1.png" alt="Inkspire Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-foreground">💡 Want a Site Like This One?</h3>
                <p className="mb-6 max-w-2xl mx-auto text-muted-foreground">
                  Experience the quality firsthand — you're already browsing our latest work! 
                  Let's create something equally impressive for your business.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => navigate('/contact')} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                    <Zap className="mr-2 h-5 w-5" />
                    Contact Us
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-border hover:bg-muted text-foreground">
                        <Eye className="mr-2 h-5 w-5" />
                        See Our Process
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-border text-foreground">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center text-primary mb-6">
                          Our Development Process
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-8">
                        {/* Phase 1: Discovery */}
                        <div className="flex items-start gap-4 p-6 bg-muted/50 rounded-lg border border-border">
                          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-primary mb-2">1. Discovery Phase</h3>
                            <p className="text-muted-foreground mb-3">
                              We start by understanding your vision, goals, and target audience through detailed consultations.
                            </p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>• Requirements gathering and project scope definition</div>
                              <div>• Target audience research and competitor analysis</div>
                              <div>• Technical feasibility assessment</div>
                              <div>• Timeline: 1-2 weeks</div>
                            </div>
                          </div>
                        </div>

                        {/* Phase 2: Design */}
                        <div className="flex items-start gap-4 p-6 bg-muted/50 rounded-lg border border-border">
                          <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Palette className="h-6 w-6 text-accent" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-accent mb-2">2. Design Phase</h3>
                            <p className="text-muted-foreground mb-3">
                              Creating wireframes, mockups, and interactive prototypes that bring your vision to life.
                            </p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>• Wireframing and user experience design</div>
                              <div>• Visual design and branding integration</div>
                              <div>• Interactive prototypes and user testing</div>
                              <div>• Timeline: 2-3 weeks</div>
                            </div>
                          </div>
                        </div>

                        {/* Phase 3: Development */}
                        <div className="flex items-start gap-4 p-6 bg-muted/50 rounded-lg border border-border">
                          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Code className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-primary mb-2">3. Development Phase</h3>
                            <p className="text-muted-foreground mb-3">
                              Building your project with modern technologies, focusing on performance and scalability.
                            </p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>• Frontend development with React/TypeScript</div>
                              <div>• Backend development and database setup</div>
                              <div>• Responsive design implementation</div>
                              <div>• Quality assurance and testing</div>
                              <div>• Timeline: 3-8 weeks (varies by complexity)</div>
                            </div>
                          </div>
                        </div>

                        {/* Phase 4: Launch */}
                        <div className="flex items-start gap-4 p-6 bg-muted/50 rounded-lg border border-border">
                          <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Rocket className="h-6 w-6 text-accent" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-accent mb-2">4. Launch Phase</h3>
                            <p className="text-muted-foreground mb-3">
                              Deploying your project to production with thorough testing and optimization.
                            </p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>• Production deployment and configuration</div>
                              <div>• Performance optimization and monitoring</div>
                              <div>• SEO setup and analytics integration</div>
                              <div>• Timeline: 1 week</div>
                            </div>
                          </div>
                        </div>

                        {/* Phase 5: Support */}
                        <div className="flex items-start gap-4 p-6 bg-muted/50 rounded-lg border border-border">
                          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <HeadphonesIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-primary mb-2">5. Support & Maintenance</h3>
                            <p className="text-muted-foreground mb-3">
                              Ongoing support to keep your project secure, updated, and performing at its best.
                            </p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>• Regular updates and security patches</div>
                              <div>• Performance monitoring and optimization</div>
                              <div>• Feature enhancements and bug fixes</div>
                              <div>• Timeline: Ongoing as needed</div>
                            </div>
                          </div>
                        </div>

                        {/* Communication & Tools */}
                        <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-border">
                          <h3 className="text-lg font-bold text-primary mb-3">Communication & Tools</h3>
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <strong className="text-foreground">Weekly Updates:</strong> Regular progress reports and demos
                            </div>
                            <div>
                              <strong className="text-foreground">Direct Access:</strong> Dedicated project manager and developer contact
                            </div>
                            <div>
                              <strong className="text-foreground">Modern Tools:</strong> Git, Slack, Figma for collaboration
                            </div>
                            <div>
                              <strong className="text-foreground">Feedback Loops:</strong> Continuous iteration based on your input
                            </div>
                          </div>
                        </div>

                        <div className="text-center pt-4">
                          <Button onClick={() => navigate('/contact')} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                            Start Your Project
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default WebPortfolio;