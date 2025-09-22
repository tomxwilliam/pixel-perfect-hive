import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Globe, Zap, Code, Smartphone, TrendingUp, Eye, ArrowRight, Users, Palette, Rocket, HeadphonesIcon } from "lucide-react";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProjectSlideshow } from "@/components/portfolio/ProjectSlideshow";
import Seo from "@/components/Seo";
const WebPortfolio = () => {
  return <div className="min-h-screen bg-background text-foreground">
      <Seo 
        title="Web Portfolio | Professional Website Development by 404 Code Lab"
        description="Explore our web development portfolio. Custom websites, e-commerce platforms, and web applications built with React, Next.js, and modern technologies."
        canonicalUrl="https://404codelab.com/portfolio/web"
      />
      <StaticNavigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-background via-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-2">
            💻 Websites That Work
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent py-[10px]">
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
                  just clean, optimised code that users and search engines love.
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

          {/* Charity Section */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-8 mb-12 text-center">
            <h3 className="text-2xl font-bold mb-4 text-primary">Supporting Non-Profits & Charities</h3>
            <p className="text-lg text-muted-foreground mb-4">Are you a registered charity or non-profit organisation? We believe in giving back to the community.</p>
            <p className="text-muted-foreground mb-6">
              Contact us and we'll create a simple, professional website for your charity to help you get started with your online presence - at no cost.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <a href="/contact">Contact Us for Charity Websites</a>
            </Button>
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
            <ProjectSlideshow
              title="SparkleClean"
              description="A modern cleaning service website featuring an elegant gallery showcase, streamlined contact forms, and service booking system designed to convert visitors into customers."
              features={[
                { icon: <Globe className="h-6 w-6 text-primary" />, text: "" },
                { icon: <Palette className="h-5 w-5 text-primary mr-3" />, text: "Modern gallery with before/after photos" },
                { icon: <Users className="h-5 w-5 text-accent mr-3" />, text: "Streamlined contact and booking forms" },
                { icon: <Smartphone className="h-5 w-5 text-primary mr-3" />, text: "Mobile-optimised for on-the-go bookings" }
              ]}
              images={[
                { 
                  src: "/lovable-uploads/sc1-3.png", 
                  alt: "SparkleClean Homepage",
                  caption: "Homepage showcasing cleaning services with professional design"
                },
                { 
                  src: "/lovable-uploads/sc2-3.png", 
                  alt: "SparkleClean About Page",
                  caption: "About page highlighting company mission and team values"
                },
                { 
                  src: "/lovable-uploads/sc3-3.png", 
                  alt: "SparkleClean Services",
                  caption: "Services page with detailed cleaning packages and pricing"
                },
                { 
                  src: "/lovable-uploads/sc4-3.png", 
                  alt: "SparkleClean Gallery",
                  caption: "Before and after gallery showcasing cleaning transformations"
                },
                { 
                  src: "/lovable-uploads/sc5-3.png", 
                  alt: "SparkleClean Contact",
                  caption: "Contact page with quote request form and service areas"
                }
              ]}
              liveUrl="https://404codelab.com/sparkleclean/index.html"
              gradient="primary"
            />

            {/* FixRight Plumbing */}
            <ProjectSlideshow
              title="FixRight Plumbing"
              description="Emergency plumbing service website with 24/7 booking system, boiler service scheduling, and instant quote calculator to help customers get immediate assistance."
              features={[
                { icon: <Zap className="h-6 w-6 text-accent" />, text: "" },
                { icon: <Rocket className="h-5 w-5 text-accent mr-3" />, text: "24/7 emergency booking system" },
                { icon: <Code className="h-5 w-5 text-accent/70 mr-3" />, text: "Instant quote calculator" },
                { icon: <HeadphonesIcon className="h-5 w-5 text-accent mr-3" />, text: "Live chat support integration" }
              ]}
              images={[
                { 
                  src: "/lovable-uploads/fr1.png", 
                  alt: "FixRight Plumbing Homepage",
                  caption: "Homepage showcasing professional plumbing & heating services"
                },
                { 
                  src: "/lovable-uploads/fr2.png", 
                  alt: "FixRight Plumbing About Page",
                  caption: "About page highlighting 15+ years of experience and qualifications"
                },
                { 
                  src: "/lovable-uploads/fr3.png", 
                  alt: "FixRight Plumbing Services",
                  caption: "Comprehensive services page with emergency callout options"
                },
                { 
                  src: "/lovable-uploads/fr4.png", 
                  alt: "FixRight Plumbing Projects",
                  caption: "Recent projects gallery with customer testimonials"
                },
                { 
                  src: "/lovable-uploads/fr5.png", 
                  alt: "FixRight Plumbing Contact",
                  caption: "Contact page with emergency callout and quote request forms"
                }
              ]}
              liveUrl="https://404codelab.com/fixright-plumbing/index.html"
              gradient="accent"
            />

            {/* Shear Perfection */}
            <ProjectSlideshow
              title="Shear Perfection"
              description="Hair & beauty salon website featuring online booking system, treatment galleries, and stylist profiles to showcase expertise and build client confidence."
              features={[
                { icon: <Palette className="h-6 w-6 text-accent" />, text: "" },
                { icon: <Users className="h-5 w-5 text-accent mr-3" />, text: "Online appointment booking" },
                { icon: <Eye className="h-5 w-5 text-accent/70 mr-3" />, text: "Treatment gallery showcase" },
                { icon: <TrendingUp className="h-5 w-5 text-accent mr-3" />, text: "Stylist profiles and reviews" }
              ]}
              images={[
                { 
                  src: "/lovable-uploads/sp1.png", 
                  alt: "Shear Perfection Homepage",
                  caption: "Homepage showcasing beauty services and online booking"
                },
                { 
                  src: "/lovable-uploads/sp2.png", 
                  alt: "Shear Perfection About Page",
                  caption: "About page featuring salon story, values, and expert team"
                },
                { 
                  src: "/lovable-uploads/sp3.png", 
                  alt: "Shear Perfection Treatments",
                  caption: "Comprehensive treatments page with pricing and service packages"
                },
                { 
                  src: "/lovable-uploads/sp4.png", 
                  alt: "Shear Perfection Gallery",
                  caption: "Before and after gallery showcasing hair transformations and beauty treatments"
                },
                { 
                  src: "/lovable-uploads/sp5.png", 
                  alt: "Shear Perfection Contact",
                  caption: "Contact page with appointment booking form and salon information"
                }
              ]}
              liveUrl="https://404codelab.com/shear-perfection/index.html"
              gradient="primary"
            />

            {/* Padrino's Pizza */}
            <ProjectSlideshow
              title="Padrino's Pizza"
              description="Takeaway pizza restaurant website with interactive menu builder, food gallery, and seamless online ordering system to boost delivery sales."
              features={[
                { icon: <Globe className="h-6 w-6 text-primary" />, text: "" },
                { icon: <Code className="h-5 w-5 text-primary mr-3" />, text: "Interactive menu and pizza builder" },
                { icon: <Eye className="h-5 w-5 text-accent mr-3" />, text: "Appetizing food gallery" },
                { icon: <Rocket className="h-5 w-5 text-primary mr-3" />, text: "One-click ordering system" }
              ]}
              images={[
                { 
                  src: "/lovable-uploads/pp1.png", 
                  alt: "Padrino's Pizza Homepage",
                  caption: "Homepage featuring authentic wood-fired pizzas and family tradition"
                },
                { 
                  src: "/lovable-uploads/pp2.png", 
                  alt: "Padrino's Pizza About",
                  caption: "Family story and values with expert team profiles"
                },
                { 
                  src: "/lovable-uploads/pp3.png", 
                  alt: "Padrino's Pizza Menu",
                  caption: "Complete menu with wood-fired pizzas, starters, and desserts"
                },
                { 
                  src: "/lovable-uploads/pp4.png", 
                  alt: "Padrino's Pizza Gallery",
                  caption: "Mouth-watering pizza gallery and behind-the-scenes photos"
                },
                { 
                  src: "/lovable-uploads/pp5.png", 
                  alt: "Padrino's Pizza Contact",
                  caption: "Contact page with delivery information and opening hours"
                }
              ]}
              liveUrl="https://404codelab.com/padrinos-pizza/index.html"
              gradient="primary"
            />

            {/* Sweet Crumbs */}
            <ProjectSlideshow
              title="Sweet Crumbs"
              description="Custom cake shop website featuring flavor browsing, cake galleries, and personalized order forms to help customers create their dream celebrations."
              features={[
                { icon: <Palette className="h-6 w-6 text-accent" />, text: "" },
                { icon: <Eye className="h-5 w-5 text-accent mr-3" />, text: "Interactive flavor and design galleries" },
                { icon: <Code className="h-5 w-5 text-accent/70 mr-3" />, text: "Custom order form builder" },
                { icon: <Users className="h-5 w-5 text-accent mr-3" />, text: "Event consultation booking" }
              ]}
              images={[
                { 
                  src: "/lovable-uploads/sc1.png", 
                  alt: "Sweet Crumbs Homepage",
                  caption: "Homepage featuring premium chocolate cake with hero section"
                },
                { 
                  src: "/lovable-uploads/sc2.png", 
                  alt: "Sweet Crumbs About Page",
                  caption: "About page showcasing team and baking expertise"
                },
                { 
                  src: "/lovable-uploads/sc3.png", 
                  alt: "Sweet Crumbs Flavours",
                  caption: "Interactive flavour selection and pricing page"
                },
                { 
                  src: "/lovable-uploads/sc4.png", 
                  alt: "Sweet Crumbs Gallery",
                  caption: "Gallery showcasing custom cake portfolio"
                },
                { 
                  src: "/lovable-uploads/sc5.png", 
                  alt: "Sweet Crumbs Contact",
                  caption: "Contact page with cake order enquiry form"
                }
              ]}
              liveUrl="https://404codelab.com/sweet-crumbs/index.html"
              gradient="accent"
            />

            {/* Happy Paws */}
            <ProjectSlideshow
              title="Happy Paws"
              description="Dog grooming & daycare website with service galleries, staff profiles, and online booking to help pet owners find trusted care for their furry friends."
              features={[
                { icon: <Users className="h-6 w-6 text-accent" />, text: "" },
                { icon: <Eye className="h-5 w-5 text-accent mr-3" />, text: "Before/after grooming galleries" },
                { icon: <Users className="h-5 w-5 text-accent/70 mr-3" />, text: "Staff profiles and credentials" },
                { icon: <Rocket className="h-5 w-5 text-accent mr-3" />, text: "Online booking and scheduling" }
              ]}
              images={[
                { 
                  src: "/lovable-uploads/5deb9273-b749-4781-803a-ac052ba93374.png", 
                  alt: "Happy Paws Website Preview",
                  caption: "Dog grooming & daycare with online booking"
                }
              ]}
              liveUrl="https://404codelab.com/happy-paws/index.html"
              gradient="primary"
            />

            {/* Crafted Joinery */}
            <ProjectSlideshow
              title="Crafted Joinery"
              description="Bespoke joinery portfolio website showcasing handcrafted furniture, project galleries, and consultation booking to attract high-value custom work clients."
              features={[
                { icon: <Code className="h-6 w-6 text-primary" />, text: "" },
                { icon: <Eye className="h-5 w-5 text-primary mr-3" />, text: "High-quality project photo galleries" },
                { icon: <Palette className="h-5 w-5 text-accent mr-3" />, text: "Material and finish showcases" },
                { icon: <Users className="h-5 w-5 text-primary mr-3" />, text: "Consultation booking system" }
              ]}
              images={[
                { 
                  src: "/lovable-uploads/ae042420-8758-4f7f-89c6-368216ad3dd5.png", 
                  alt: "Crafted Joinery Website Preview",
                  caption: "Bespoke joinery portfolio with consultation booking"
                }
              ]}
              liveUrl="https://404codelab.com/crafted-joinery/index.html"
              gradient="primary"
            />

            {/* IronHouse Gym */}
            <ProjectSlideshow
              title="IronHouse Gym"
              description="Bold gym website featuring class timetables, trainer profiles, and membership sign-up to motivate visitors and convert them into dedicated members."
              features={[
                { icon: <Zap className="h-6 w-6 text-primary" />, text: "" },
                { icon: <TrendingUp className="h-5 w-5 text-primary mr-3" />, text: "Interactive class timetables" },
                { icon: <Users className="h-5 w-5 text-primary mr-3" />, text: "Trainer profiles and specialties" },
                { icon: <Rocket className="h-5 w-5 text-primary mr-3" />, text: "Online membership sign-up" }
              ]}
              images={[
                { 
                  src: "/lovable-uploads/ih1.png", 
                  alt: "IronHouse Gym Homepage",
                  caption: "Homepage featuring strength revolution messaging"
                },
                { 
                  src: "/lovable-uploads/ih2.png", 
                  alt: "IronHouse Gym About Page",
                  caption: "About page showcasing gym values and community"
                },
                { 
                  src: "/lovable-uploads/ih3.png", 
                  alt: "IronHouse Gym Timetable",
                  caption: "Interactive class timetable and booking system"
                },
                { 
                  src: "/lovable-uploads/ih4.png", 
                  alt: "IronHouse Gym Trainers",
                  caption: "Trainer profiles and specialties showcase"
                },
                { 
                  src: "/lovable-uploads/ih5.png", 
                  alt: "IronHouse Gym Contact",
                  caption: "Contact page with membership options"
                }
              ]}
              liveUrl="https://404codelab.com/ironhouse-gym/index.html"
              gradient="primary"
            />

            {/* Inkspire */}
            <ProjectSlideshow
              title="Inkspire"
              description="Professional tattoo parlor website featuring artist portfolios, design galleries, and consultation booking to help clients find the perfect artist for their vision."
              features={[
                { icon: <Palette className="h-6 w-6 text-primary" />, text: "" },
                { icon: <Users className="h-5 w-5 text-primary mr-3" />, text: "Detailed artist bios and portfolios" },
                { icon: <Eye className="h-5 w-5 text-accent mr-3" />, text: "High-res tattoo gallery showcase" },
                { icon: <Code className="h-5 w-5 text-primary mr-3" />, text: "Design consultation booking" }
              ]}
              images={[
                { 
                  src: "/lovable-uploads/0f5fc07e-8b2a-49a3-b4d4-1e7a3adb62b1.png", 
                  alt: "Inkspire Website Preview",
                  caption: "Professional tattoo parlor with artist portfolios"
                }
              ]}
              liveUrl="https://404codelab.com/inkspire/index.html"
              gradient="primary"
            />

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
                  <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                    <a href="/contact">
                      <Zap className="mr-2 h-5 w-5" />
                      Contact Us
                    </a>
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
                              Deploying your project to production with thorough testing and optimisation.
                            </p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>• Production deployment and configuration</div>
                              <div>• Performance optimisation and monitoring</div>
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
                              <div>• Performance monitoring and optimisation</div>
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
                          <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                            <a href="/contact">
                              Start Your Project
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
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