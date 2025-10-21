
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Smartphone, Zap, Code, TrendingUp, Star, Shield, CheckCircle, Users, Clock, Lightbulb, ExternalLink, Download } from "lucide-react";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";
import { useAppProjects, AppProject } from "@/hooks/useAppProjects";

const getStatusBadgeVariant = (status: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    completed: { bg: "bg-green-500/20", text: "text-green-500", border: "border-green-500/30" },
    launched: { bg: "bg-green-500/20", text: "text-green-500", border: "border-green-500/30" },
    in_development: { bg: "bg-primary/20", text: "text-primary", border: "border-primary/30" },
    beta: { bg: "bg-accent/20", text: "text-accent", border: "border-accent/30" },
    planning: { bg: "bg-muted/20", text: "text-muted-foreground", border: "border-muted/30" },
  };
  return colors[status] || colors.in_development;
};

const AppCard = ({ app, index }: { app: AppProject; index: number }) => {
  const statusColors = getStatusBadgeVariant(app.status);
  const isEven = index % 2 === 0;
  
  return (
    <Card className={`${isEven ? "bg-gradient-to-br from-primary/5 to-accent/5" : "bg-gradient-to-br from-accent/5 to-primary/5"} border-border overflow-hidden`}>
      <CardContent className="p-0">
        <div className={`grid md:grid-cols-2 gap-6 ${isEven ? "" : "md:grid-flow-dense"}`}>
          {/* Image Section */}
          <div className={`relative ${isEven ? "" : "md:col-start-2"} h-64 md:h-auto`}>
            {app.feature_image_url ? (
              <img
                src={app.feature_image_url}
                alt={app.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Smartphone className="h-20 w-20 text-muted-foreground/30" />
              </div>
            )}
            {app.is_featured && (
              <Badge className="absolute top-4 right-4 bg-accent text-white border-0">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          {/* Content Section */}
          <div className={`p-8 flex flex-col justify-center ${isEven ? "" : "md:col-start-1 md:row-start-1"}`}>
            <div className="flex items-start gap-3 mb-4">
              {app.logo_url && (
                <img
                  src={app.logo_url}
                  alt={`${app.name} logo`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-1">{app.name}</h3>
                {app.client_name && (
                  <p className="text-sm text-muted-foreground">Client: {app.client_name}</p>
                )}
              </div>
            </div>

            <p className="text-muted-foreground mb-4">{app.description}</p>

            {/* Features */}
            {app.features && app.features.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Key Features:</h4>
                <ul className="space-y-1">
                  {app.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technologies */}
            {app.technologies && app.technologies.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {app.technologies.slice(0, 6).map((tech, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Status and Category */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={`${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                {app.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
              <Badge variant="outline">{app.app_category}</Badge>
            </div>

            {/* Download Links */}
            <div className="flex flex-wrap gap-3">
              {app.ios_link && (
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <a href={app.ios_link} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    iOS App
                  </a>
                </Button>
              )}
              {app.android_link && (
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="bg-accent hover:bg-accent/90"
                >
                  <a href={app.android_link} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Android App
                  </a>
                </Button>
              )}
              {app.web_demo_url && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <a href={app.web_demo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Web Demo
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AppProjectsSection = () => {
  const { data: appProjects = [], isLoading } = useAppProjects();

  // Filter out hidden projects if needed
  const visibleProjects = appProjects.filter(app => app.status !== 'hidden');

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 text-accent">Our App Portfolio</h2>
          <p className="text-xl text-muted-foreground">
            Loading our latest app projects...
          </p>
        </div>
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-6">
                  <Skeleton className="h-64 md:h-96 w-full" />
                  <div className="p-8 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (visibleProjects.length === 0) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 text-accent">Our App Portfolio</h2>
          <p className="text-xl text-muted-foreground">
            Our app portfolio is coming soon! Check back later for exciting mobile projects.
          </p>
        </div>
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-border">
          <CardContent className="p-12 text-center">
            <Smartphone className="h-20 w-20 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Apps Yet</h3>
            <p className="text-muted-foreground mb-6">
              We're working on some exciting mobile app projects. In the meantime, check out our{" "}
              <a href="/portfolio/games" className="text-primary hover:underline">
                game development portfolio
              </a>{" "}
              to see what we can build.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 text-accent">Our App Portfolio</h2>
        <p className="text-xl text-muted-foreground">
          Explore our mobile app development work across various platforms and industries.
        </p>
      </div>

      <div className="space-y-8">
        {visibleProjects.map((app, index) => (
          <AppCard key={app.id} app={app} index={index} />
        ))}
      </div>
    </div>
  );
};


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

          {/* Dynamic App Projects */}
          <AppProjectsSection />

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
