import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Zap, Users, Target } from "lucide-react";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";
import { usePageContent } from "@/hooks/usePageContent";
const About = () => {
  const { data: pageContent } = usePageContent('/about');

  return <div className="min-h-screen bg-background text-foreground">
      <Seo 
        title={pageContent?.meta_title || "About 404 Code Lab - Scotland-Based Digital Studio"}
        description={pageContent?.meta_description || "Learn about 404 Code Lab, a Scotland-based digital studio."}
        canonicalUrl={pageContent?.canonical_url || "https://404codelab.com/about"}
      />
      <StaticNavigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-background via-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-2">
            🧠 Who We Are
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            About 404 Code Lab
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            404 Code Lab is a Scotland-based indie dev studio creating standout digital experiences across the Central Belt. 
            From Edinburgh to Glasgow and everywhere in between, whether it's a buzzing game, a smooth mobile app, or a sharp website — we bring bold ideas to life.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary">We're developers, designers, gamers, and future-makers.</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                The name says "404" but we're never not found. We're passionate about creating digital experiences 
                that people actually want to use — no filler, no fluff, just pure engagement.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                From Edinburgh's historic streets to Glasgow's creative quarters, across the Central Belt to screens worldwide, 
                we craft everything ourselves. One studio. One vision. Zero templates.
              </p>
            </div>
            
            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Target className="h-8 w-8 text-accent mr-3" />
                  <h3 className="text-2xl font-bold text-accent">🚀 Our Mission</h3>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  To create addictive, high-performance experiences people actually want to use. 
                  We focus on what matters: engagement, performance, and that special something 
                  that makes users come back for more.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Code className="h-12 w-12 text-primary mx-auto" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary">🔧 Built From Scratch</h3>
                <p className="text-muted-foreground">
                  From design to code, we craft everything ourselves. Every pixel, every line of code, 
                  every interaction is intentionally designed for maximum impact.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-accent/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Zap className="h-12 w-12 text-accent mx-auto" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-accent">⚡ Performance First</h3>
                <p className="text-muted-foreground">
                  Speed and smoothness aren't afterthoughts — they're core features. 
                  We optimise for performance from day one, ensuring every experience feels instant.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Users className="h-12 w-12 text-primary mx-auto" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary">🎯 User-Focused</h3>
                <p className="text-muted-foreground">
                  We don't just build what looks good — we build what works. 
                  Every decision is made with the end user in mind, creating experiences that just make sense.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Services & Expertise Section - SEO Optimised */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Professional Digital Development Services in Scotland
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From web development to game design, we deliver custom solutions for businesses across the UK and worldwide
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="bg-card border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-primary">Custom Web Development</h3>
                  <p className="text-muted-foreground mb-4">
                    Central Belt web development studio specialising in responsive websites, progressive web applications, 
                    and custom e-commerce solutions. Serving Edinburgh, Glasgow, and businesses across Scotland with React, TypeScript, and modern frameworks.
                  </p>
                  <a href="/portfolio/web" className="text-primary hover:text-primary/80 font-medium">
                    View Web Projects →
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:border-accent/50 transition-all">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-accent">Game Development Studio</h3>
                  <p className="text-muted-foreground mb-4">
                    Independent game development creating engaging mobile games and browser-based gaming experiences. 
                    Expert in Unity, game mechanics, and player retention systems.
                  </p>
                  <a href="/portfolio/games" className="text-accent hover:text-accent/80 font-medium">
                    Explore Our Games →
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-primary">Mobile App Development</h3>
                  <p className="text-muted-foreground mb-4">
                    Professional mobile application development for iOS and Android across the Central Belt. 
                    Creating intuitive, high-performance apps for Edinburgh and Glasgow startups, plus established businesses throughout Scotland and the UK.
                  </p>
                  <a href="/portfolio/apps" className="text-primary hover:text-primary/80 font-medium">
                    View App Portfolio →
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:border-accent/50 transition-all">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-accent">AI Integration Services</h3>
                  <p className="text-muted-foreground mb-4">
                    Cutting-edge artificial intelligence integration for businesses. Chatbots, automation, 
                    machine learning solutions, and custom AI implementations to enhance your digital products.
                  </p>
                  <a href="/services/ai-integration" className="text-accent hover:text-accent/80 font-medium">
                    Learn About AI Services →
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Local SEO Section */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-center text-foreground">
                  Central Belt Digital Studio Serving Scotland & Beyond
                </h3>
                <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-6">
                  Based in Scotland's Central Belt, 404 Code Lab serves Edinburgh, Glasgow, and businesses throughout the region. 
                  We provide professional software development, web design, game development, and mobile app creation services 
                  to clients across the United Kingdom and internationally. Combining Edinburgh's technical excellence with 
                  Glasgow's creative innovation, we deliver world-class solutions with local expertise.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <span>🏴󠁧󠁢󠁳󠁣󠁴󠁿 Central Belt based</span>
                  <span>•</span>
                  <span>🏙️ Edinburgh & Glasgow</span>
                  <span>•</span>
                  <span>🇬󠁢 Scotland-wide service</span>
                  <span>•</span>
                  <span>🌍 International reach</span>
                  <span>•</span>
                  <span>💼 Professional development</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default About;