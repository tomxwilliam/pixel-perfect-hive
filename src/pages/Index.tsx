import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Download, ExternalLink, Gamepad2, Smartphone, Globe, Code, Zap, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import Seo from '@/components/Seo';
import { useFeaturedContent } from "@/hooks/useFeaturedContent";
import { usePageContent } from "@/hooks/usePageContent";
import LetterGlitch from "@/components/LetterGlitch";
const FeaturedContentSection = () => {
  const {
    data: featuredContent
  } = useFeaturedContent();
  if (!featuredContent || featuredContent.length === 0) {
    return null;
  }
  return <>
      {featuredContent.map(content => {
      const isExternalLink = content.cta_link.startsWith('http');
      const gradientFrom = content.gradient_from || "primary";
      const gradientTo = content.gradient_to || "accent";
      const borderColor = content.border_color || "primary";
      return <Card key={content.id} className={`mb-4 overflow-hidden border border-${borderColor}/20 bg-gradient-to-br from-${gradientFrom}/5 to-${gradientTo}/5 max-w-xs mx-auto`}>
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                {content.icon && <div className="text-xl">{content.icon}</div>}
                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-0.5">{content.title}</h3>
                  {content.subtitle && <p className="text-xs text-muted-foreground mb-0.5">{content.subtitle}</p>}
                  {content.description && <p className="text-xs text-muted-foreground/70 mb-2">{content.description}</p>}
                  {isExternalLink ? <Button variant="default" size="sm" onClick={() => window.open(content.cta_link, '_blank')} className="tap-target h-8 text-xs px-3">
                      {content.cta_text} <ArrowRight className="ml-1.5 h-3 w-3" />
                    </Button> : <Link to={content.cta_link}>
                      <Button variant="default" size="sm" className="tap-target h-8 text-xs px-3">
                        {content.cta_text} <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Button>
                    </Link>}
                </div>
              </div>
            </CardContent>
          </Card>;
    })}
    </>;
};
const Index = () => {
  const {
    data: pageContent
  } = usePageContent('/');
  return <>
      <Seo title={pageContent?.meta_title || "404 Code Lab - Web Development, Mobile Apps & Games"} description={pageContent?.meta_description || "Professional web development, mobile app creation, and game development services in Scotland."} canonicalUrl={pageContent?.canonical_url || "https://404codelab.com"} />
      <div className="min-h-screen bg-background text-foreground">
        <StaticNavigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-start justify-center px-4 pt-12">
        {/* LetterGlitch Background */}
        <div className="absolute inset-0">
          <LetterGlitch
            glitchSpeed={50}
            centerVignette={true}
            outerVignette={false}
            smooth={true}
            glitchColors={['#FF0080', '#00FFFF', '#00FF00']}
          />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-primary text-primary-foreground border-0 px-4 py-2 text-sm inline-flex items-center justify-center shadow-lg">🎉 Limited Time Offer - 20% Off All Projects</Badge>
          
          <h1 className="text-6xl font-bold mb-6 text-background dark:text-foreground drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] py-[15px]">
            Building the Future of Play
          </h1>
          
          <p className="text-xl mb-8 text-background dark:text-foreground drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] max-w-2xl mx-auto leading-relaxed px-4">
            Smart apps. Addictive games. Slick web design. We turn bold ideas into pixel-perfect reality.
          </p>

          {/* View Buttons */}
          <div className="flex flex-row gap-4 justify-center items-center mb-12 flex-wrap">
            <Link to="/portfolio/games">
              <Button size="lg" variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl">
                <Gamepad2 className="mr-2 h-5 w-5" />
                View Games
              </Button>
            </Link>
            <Link to="/portfolio/web">
              <Button size="lg" variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl">
                <Globe className="mr-2 h-5 w-5" />
                View Web Projects
              </Button>
            </Link>
          </div>

          <FeaturedContentSection />

          <div className="flex items-center justify-center text-background dark:text-foreground animate-bounce mt-12 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
            <span className="mr-2">Explore Our Work</span>
            <ArrowDown className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          {/* SEO Introduction */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Expert Digital Solutions for Modern Businesses
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              At 404 Code Lab, we specialise in creating cutting-edge mobile games, custom applications, and responsive web designs.
              Our team of experienced developers and designers transforms your vision into high-performance digital products that 
              engage users and drive results. From concept to launch, we deliver pixel-perfect solutions tailored to your business needs.
            </p>
          </div>

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
      </div>
    </>;
};
export default Index;