import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Download, ExternalLink, Gamepad2, Smartphone, Globe, Code, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
const Index = () => {
  return <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-primary/10 to-accent/20">
        <div className="absolute inset-0 bg-background/20"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-3 py-2 text-xs sm:px-4 sm:text-sm inline-flex items-center justify-center">
            🚀 404 Code Lab
          </Badge>
          
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent py-[15px] md:text-7xl">
            Building the Future of Play
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Smart apps. Addictive games. Slick web design. We turn bold ideas into pixel-perfect reality.
          </p>

          {/* Featured Game */}
          <Card className="mb-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <span className="text-2xl mr-2">🐝</span>
                <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-300">Now Featuring: BeeVerse</h3>
              </div>
              <p className="mb-4 text-foreground">The ultimate idle bee empire game.</p>
              <p className="text-sm text-muted-foreground mb-4">Download now on iPhone.</p>
              <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                <Download className="mr-2 h-4 w-4" />
                App Store
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center text-muted-foreground animate-bounce">
            <span className="mr-2">Explore Our Work</span>
            <ArrowDown className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:transform hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Gamepad2 className="h-12 w-12 text-primary mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">🎮 Games</h3>
                <p className="text-muted-foreground mb-6">Addictive mobile games with smart systems and satisfying loops.</p>
                <Link to="/portfolio/games">
                  <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/20">
                    View Games
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-accent/50 transition-all duration-300 hover:transform hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Smartphone className="h-12 w-12 text-accent mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-accent">📱 Apps</h3>
                <p className="text-muted-foreground mb-6">Custom mobile applications built from wireframe to App Store.</p>
                <Link to="/portfolio/apps">
                  <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/20">
                    View Apps
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-secondary/50 transition-all duration-300 hover:transform hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Globe className="h-12 w-12 text-secondary mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">💻 Web Design</h3>
                <p className="text-muted-foreground mb-6">Sleek websites with real-world power and pixel-perfect design.</p>
                <Link to="/portfolio/web">
                  <Button variant="outline" className="border-secondary/50 text-foreground hover:bg-secondary/10 hover:text-secondary">
                    View Websites
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/20 to-accent/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Build Something Amazing?</h2>
          <p className="text-xl text-muted-foreground mb-8">Let's turn your bold ideas into pixel-perfect reality.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                <Zap className="mr-2 h-5 w-5" />
                Start Your Project
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-border text-foreground bg-background hover:bg-muted">
                <Users className="mr-2 h-5 w-5" />
                Learn About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;