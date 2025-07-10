
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Zap, Code, Smartphone, TrendingUp, Eye } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const WebPortfolio = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-gray-900 via-green-900 to-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-green-600/20 text-green-300 border-green-500/30 px-4 py-2">
            💻 Websites That Work
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">
            Web Design Portfolio
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We don't just design sites — we design experiences. Clean UI, strong UX, fast performance, 
            and responsive across all devices.
          </p>
        </div>
      </section>

      {/* Featured Project - This Site */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30 mb-12">
            <CardContent className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center mb-6">
                    <Globe className="h-8 w-8 text-green-400 mr-4" />
                    <div>
                      <h2 className="text-3xl font-bold text-green-300 mb-2">404 Code Lab Website</h2>
                      <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                        Featured Project
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                    This very website showcases our approach to modern web design: 
                    bold aesthetics, smooth interactions, and performance-first architecture.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-gray-300">
                      <Zap className="h-5 w-5 text-yellow-400 mr-3" />
                      <span>Lightning-fast loading times</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Smartphone className="h-5 w-5 text-blue-400 mr-3" />
                      <span>Fully responsive design</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Eye className="h-5 w-5 text-purple-400 mr-3" />
                      <span>Accessible and user-friendly</span>
                    </div>
                  </div>
                  
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    <Code className="mr-2 h-5 w-5" />
                    View Source Code
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4">🌐</div>
                    <p className="text-gray-300">
                      You're experiencing our web design philosophy right now!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design Philosophy */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-green-300">Performance First</h3>
                <p className="text-gray-300">
                  Every site we build loads in under 3 seconds. No bloated frameworks, 
                  just clean, optimized code that users and search engines love.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-blue-300">Mobile-First Design</h3>
                <p className="text-gray-300">
                  With 60% of traffic coming from mobile, we design for small screens first, 
                  then scale up to create perfect experiences on every device.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-purple-300">Conversion Focused</h3>
                <p className="text-gray-300">
                  Beautiful designs that drive action. Every element is strategically placed 
                  to guide users toward your business goals.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Website Types */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-green-300">Website Types We Create</h2>
            <p className="text-xl text-gray-300">
              From simple landing pages to complex web applications, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="font-bold mb-2 text-blue-300">Landing Pages</h3>
                <p className="text-gray-300 text-sm">
                  High-converting single pages designed to capture leads and drive sales.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">🏢</div>
                <h3 className="font-bold mb-2 text-purple-300">Business Websites</h3>
                <p className="text-gray-300 text-sm">
                  Professional corporate sites that establish credibility and attract clients.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">🛍️</div>
                <h3 className="font-bold mb-2 text-green-300">E-commerce</h3>
                <p className="text-gray-300 text-sm">
                  Online stores with smooth checkout flows and inventory management.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📝</div>
                <h3 className="font-bold mb-2 text-yellow-300">Portfolios</h3>
                <p className="text-gray-300 text-sm">
                  Stunning showcase websites for creatives and professionals.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="font-bold mb-2 text-red-300">Web Applications</h3>
                <p className="text-gray-300 text-sm">
                  Complex dashboards and tools with real-time data and user management.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="font-bold mb-2 text-cyan-300">Progressive Web Apps</h3>
                <p className="text-gray-300 text-sm">
                  App-like experiences that work across all platforms and devices.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 mb-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 text-blue-300">More Projects Coming Soon</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                We're currently working on several exciting web projects for clients across various industries. 
                Check back soon to see our first batch of client websites and in-house projects.
              </p>
              <div className="flex items-center justify-center space-x-2 text-gray-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border-green-500/30">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">💡 Want a Site Like This One?</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Experience the quality firsthand — you're already browsing our latest work! 
                  Let's create something equally impressive for your business.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    <Zap className="mr-2 h-5 w-5" />
                    Start Your Website
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Eye className="mr-2 h-5 w-5" />
                    See Our Process
                  </Button>
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

export default WebPortfolio;
