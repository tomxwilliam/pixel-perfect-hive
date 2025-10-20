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
import { Link } from "react-router-dom";
import { useWebProjects } from "@/hooks/useWebProjects";

const WebPortfolio = () => {
  const { data: projects, isLoading } = useWebProjects();
  
  // Map features to icons
  const getFeatureIcon = (index: number) => {
    const icons = [
      <Globe className="h-6 w-6 text-primary" />,
      <Zap className="h-6 w-6 text-accent" />,
      <Palette className="h-6 w-6 text-accent" />,
      <Code className="h-6 w-6 text-primary" />,
      <Users className="h-6 w-6 text-accent" />,
    ];
    return icons[index % icons.length];
  };
  
  const getFeatureItemIcon = (index: number) => {
    const icons = [
      <Palette className="h-5 w-5 text-primary mr-3" />,
      <Users className="h-5 w-5 text-accent mr-3" />,
      <Smartphone className="h-5 w-5 text-primary mr-3" />,
      <Rocket className="h-5 w-5 text-accent mr-3" />,
      <Code className="h-5 w-5 text-accent/70 mr-3" />,
      <Eye className="h-5 w-5 text-accent mr-3" />,
      <TrendingUp className="h-5 w-5 text-accent mr-3" />,
      <HeadphonesIcon className="h-5 w-5 text-accent mr-3" />,
    ];
    return icons[index % icons.length];
  };
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
              <Link to="/contact">Contact Us for Charity Websites</Link>
            </Button>
          </div>

          {/* Local Business Web Design Projects */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-primary">Our Portfolio</h2>
            <p className="text-xl text-muted-foreground">
              Recent website projects we've completed for local businesses across various industries.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-12">
              {projects.map((project, index) => (
                <ProjectSlideshow
                  key={project.id}
                  title={project.name}
                  description={project.description}
                  features={[
                    { icon: getFeatureIcon(index), text: "" },
                    ...(project.features || []).slice(0, 3).map((feature, i) => ({
                      icon: getFeatureItemIcon(i),
                      text: feature
                    }))
                  ]}
                  images={(project.screenshots || []).map((screenshot, i) => ({
                    src: screenshot,
                    alt: `${project.name} Screenshot ${i + 1}`,
                    caption: `${project.name} - View ${i + 1}`
                  }))}
                  liveUrl={project.project_url || undefined}
                  gradient={index % 2 === 0 ? "primary" : "accent"}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects to display yet.</p>
            </div>
          )}

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
                            <Link to="/contact">
                              Start Your Project
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
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