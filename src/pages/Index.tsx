import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Download, ExternalLink, Gamepad2, Smartphone, Globe, Code, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
const Index = () => {
  return <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30 px-4 py-2 text-sm">
            🚀 404 Code Lab
          </Badge>
          
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent py-[15px] md:text-7xl">
            Building the Future of Play
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Smart apps. Addictive games. Slick web design. We turn bold ideas into pixel-perfect reality.
          </p>

          {/* Featured Game */}
          <Card className="mb-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <span className="text-2xl mr-2 text-stone-950">🐝</span>
                <h3 className="text-xl font-bold text-yellow-300">Now Featuring: Beevers</h3>
              </div>
              <p className="mb-4 text-stone-950">The ultimate idle bee empire game.</p>
              <p className="text-sm text-gray-400 mb-4">Download now on iPhone.</p>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Download className="mr-2 h-4 w-4" />
                App Store
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center text-gray-400 animate-bounce">
            <span className="mr-2">Explore Our Work</span>
            <ArrowDown className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800/80 border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Gamepad2 className="h-12 w-12 text-blue-400 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-blue-300">🎮 Games</h3>
                <p className="text-gray-300 mb-6">Addictive mobile games with smart systems and satisfying loops.</p>
                <Link to="/portfolio/games">
                  <Button variant="outline" className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20">
                    View Games
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Smartphone className="h-12 w-12 text-purple-400 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-purple-300">📱 Apps</h3>
                <p className="text-gray-300 mb-6">Custom mobile applications built from wireframe to App Store.</p>
                <Link to="/portfolio/apps">
                  <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
                    View Apps
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Globe className="h-12 w-12 text-green-400 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-green-300">💻 Web Design</h3>
                <p className="text-gray-300 mb-6">Sleek websites with real-world power and pixel-perfect design.</p>
                <Link to="/portfolio/web">
                  <Button variant="outline" className="border-green-500/50 text-green-300 hover:bg-green-500/20">
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
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Build Something Amazing?</h2>
          <p className="text-xl text-gray-300 mb-8">Let's turn your bold ideas into pixel-perfect reality.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Zap className="mr-2 h-5 w-5" />
                Start Your Project
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-gray-600 text-slate-100 bg-slate-900 hover:bg-slate-800">
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