
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Smartphone, Zap, Code, TrendingUp, Star, Shield, CheckCircle, Users, Clock, Lightbulb } from "lucide-react";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";

const AppPortfolio = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo 
        title="App Portfolio | Mobile App Development by 404 Code Lab"
        description="Discover our professional mobile app development portfolio. iOS and Android apps with React Native, native development, and custom solutions."
        canonicalUrl="https://404codelab.com/portfolio/apps"
      />
      <StaticNavigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-background via-accent/10 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-accent/20 text-accent border-accent/30 px-4 py-2">
            📱 Custom App Design & Development
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-accent to-primary bg-clip-text text-transparent">
            Apps Portfolio
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Whether you're launching a tool, a tracker, or the next viral app — we can help you build it from wireframe to App Store.
          </p>
        </div>
      </section>

      {/* Tech Stack Showcase */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 mb-12">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-primary">Proven Technology Foundation</h2>
                <p className="text-xl max-w-3xl mx-auto text-foreground">
                  Beevers may be a game, but the tech stack behind it is rock solid — and reusable across industries.
                  We've built the infrastructure, now we can build your app.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Code className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2 text-primary">Native Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Optimised for iOS and Android with smooth 60fps animations
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-bold mb-2 text-accent">Secure & Scalable</h3>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade security with cloud infrastructure
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2 text-primary">Analytics Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Built-in analytics and user behaviour tracking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-4 text-primary">Productivity Tools</h3>
                <p className="text-muted-foreground mb-4">
                  Task managers, time trackers, and workflow optimisation apps that actually get used.
                </p>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Business Apps
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-accent/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🏃‍♂️</div>
                <h3 className="text-xl font-bold mb-4 text-accent">Health & Fitness</h3>
                <p className="text-muted-foreground mb-4">
                  Workout trackers, habit builders, and wellness apps with engaging user experiences.
                </p>
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  Lifestyle Apps
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold mb-4 text-primary">Educational Apps</h3>
                <p className="text-muted-foreground mb-4">
                  Interactive learning platforms with gamification and progress tracking.
                </p>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  EdTech
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-accent/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-4 text-accent">Finance & Trading</h3>
                <p className="text-muted-foreground mb-4">
                  Budget trackers, investment apps, and financial planning tools with real-time data.
                </p>
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  FinTech
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🛍️</div>
                <h3 className="text-xl font-bold mb-4 text-primary">E-commerce</h3>
                <p className="text-muted-foreground mb-4">
                  Shopping apps, marketplace platforms, and retail solutions with smooth checkout flows.
                </p>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Retail Apps
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-accent/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-bold mb-4 text-accent">Social & Communication</h3>
                <p className="text-muted-foreground mb-4">
                  Chat apps, community platforms, and social networking with real-time features.
                </p>
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  Social Apps
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Current Projects */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-accent">Apps In Progress</h2>
            <p className="text-xl text-muted-foreground">
              We're currently working on several exciting projects. Here's what's cooking:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Star className="h-6 w-6 text-primary mr-3" />
                  <h3 className="text-xl font-bold text-primary">Client Website & Portal</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  A comprehensive website with customer portal and companion mobile app 
                  currently in development for a key client, featuring user management, 
                  data visualization, and seamless cross-platform integration.
                </p>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Development
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Smartphone className="h-6 w-6 text-accent mr-3" />
                  <h3 className="text-xl font-bold text-accent">Directory Platform</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  A comprehensive directory-style website and companion mobile app 
                  currently in development, featuring advanced search, filtering, 
                  user profiles, and location-based services.
                </p>
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  Development
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to Build Your App?</h3>
                <p className="mb-6 max-w-2xl mx-auto text-muted-foreground">
                  From concept to App Store, we'll guide you through every step of the development process. 
                  Our proven track record with Beevers shows we can deliver apps that users love.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90">
                    <Zap className="mr-2 h-5 w-5" />
                    Start Your App Project
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                        <Code className="mr-2 h-5 w-5" />
                        View Technical Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-accent">Our App Development Process</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 text-muted-foreground">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center mt-1">
                                <Lightbulb className="h-4 w-4 text-accent" />
                              </div>
                              <div>
                                <h3 className="font-bold text-accent mb-2">1. Discovery & Strategy</h3>
                                <p className="text-sm">We start by understanding your vision, target audience, and business goals. This includes market research, competitor analysis, and feature prioritization.</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-1">
                                <Code className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-bold text-primary mb-2">2. Design & Prototyping</h3>
                                <p className="text-sm">Interactive wireframes and high-fidelity designs using modern UI/UX principles. We create clickable prototypes for early testing and feedback.</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-1">
                                <Shield className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-bold text-primary mb-2">3. Development & Testing</h3>
                                <p className="text-sm">Agile development with regular updates, comprehensive testing on real devices, and continuous integration for quality assurance.</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center mt-1">
                                <TrendingUp className="h-4 w-4 text-accent" />
                              </div>
                              <div>
                                <h3 className="font-bold text-accent mb-2">4. Launch & Optimisation</h3>
                                <p className="text-sm">App Store submission, launch strategy, analytics setup, and ongoing optimisation based on user feedback and performance data.</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="text-xl font-bold text-foreground mb-4">Our Technical Expertise</h3>
                            
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <h4 className="font-bold text-primary mb-2">Frontend Technologies</h4>
                              <div className="flex flex-wrap gap-2">
                                <Badge className="bg-primary/20 text-primary border-primary/30">React Native</Badge>
                                <Badge className="bg-primary/20 text-primary border-primary/30">Flutter</Badge>
                                <Badge className="bg-primary/20 text-primary border-primary/30">Swift</Badge>
                                <Badge className="bg-primary/20 text-primary border-primary/30">Kotlin</Badge>
                              </div>
                            </div>
                            
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <h4 className="font-bold text-accent mb-2">Backend & Cloud</h4>
                              <div className="flex flex-wrap gap-2">
                                <Badge className="bg-accent/20 text-accent border-accent/30">Node.js</Badge>
                                <Badge className="bg-accent/20 text-accent border-accent/30">Firebase</Badge>
                                <Badge className="bg-accent/20 text-accent border-accent/30">AWS</Badge>
                                <Badge className="bg-accent/20 text-accent border-accent/30">MongoDB</Badge>
                              </div>
                            </div>
                            
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <h4 className="font-bold text-primary mb-2">Key Features We Implement</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                  <span>Push notifications & real-time updates</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                  <span>User authentication & social login</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                  <span>In-app purchases & payment processing</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                  <span>Analytics & crash reporting</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                  <span>Offline functionality & data sync</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-border pt-6">
                          <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div>
                              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Clock className="h-6 w-6 text-accent" />
                              </div>
                              <h4 className="font-bold text-accent mb-2">Timeline</h4>
                              <p className="text-sm">8-16 weeks typical development cycle, depending on complexity and features</p>
                            </div>
                            
                            <div>
                              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Users className="h-6 w-6 text-primary" />
                              </div>
                              <h4 className="font-bold text-primary mb-2">Team</h4>
                              <p className="text-sm">Dedicated project manager, UI/UX designer, and senior developers assigned to your project</p>
                            </div>
                            
                            <div>
                              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Shield className="h-6 w-6 text-primary" />
                              </div>
                              <h4 className="font-bold text-primary mb-2">Support</h4>
                              <p className="text-sm">3 months post-launch support included, with ongoing maintenance options available</p>
                            </div>
                          </div>
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
    </div>
  );
};

export default AppPortfolio;
