import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Zap, Code, TrendingUp, Star, Shield } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
const AppPortfolio = () => {
  return <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-purple-600/20 text-purple-300 border-purple-500/30 px-4 py-2">
            📱 Custom App Design & Development
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Apps Portfolio
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Whether you're launching a tool, a tracker, or the next viral app — we can help you build it from wireframe to App Store.
          </p>
        </div>
      </section>

      {/* Tech Stack Showcase */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 mb-12">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-blue-300">Proven Technology Foundation</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Beevers may be a game, but the tech stack behind it is rock solid — and reusable across industries.
                  We've built the infrastructure, now we can build your app.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Code className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="font-bold mb-2 text-blue-300">Native Performance</h3>
                  <p className="text-gray-300 text-sm">
                    Optimized for iOS and Android with smooth 60fps animations
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="font-bold mb-2 text-purple-300">Secure & Scalable</h3>
                  <p className="text-gray-300 text-sm">
                    Enterprise-grade security with cloud infrastructure
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="font-bold mb-2 text-green-300">Analytics Ready</h3>
                  <p className="text-gray-300 text-sm">
                    Built-in analytics and user behavior tracking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-4 text-blue-300">Productivity Tools</h3>
                <p className="text-gray-300 mb-4">
                  Task managers, time trackers, and workflow optimization apps that actually get used.
                </p>
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                  Business Apps
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🏃‍♂️</div>
                <h3 className="text-xl font-bold mb-4 text-purple-300">Health & Fitness</h3>
                <p className="text-gray-300 mb-4">
                  Workout trackers, habit builders, and wellness apps with engaging user experiences.
                </p>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                  Lifestyle Apps
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold mb-4 text-green-300">Educational Apps</h3>
                <p className="text-gray-300 mb-4">
                  Interactive learning platforms with gamification and progress tracking.
                </p>
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                  EdTech
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-4 text-yellow-300">Finance & Trading</h3>
                <p className="text-gray-300 mb-4">
                  Budget trackers, investment apps, and financial planning tools with real-time data.
                </p>
                <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30">
                  FinTech
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🛍️</div>
                <h3 className="text-xl font-bold mb-4 text-red-300">E-commerce</h3>
                <p className="text-gray-300 mb-4">
                  Shopping apps, marketplace platforms, and retail solutions with smooth checkout flows.
                </p>
                <Badge className="bg-red-600/20 text-red-300 border-red-500/30">
                  Retail Apps
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-bold mb-4 text-cyan-300">Social & Communication</h3>
                <p className="text-gray-300 mb-4">
                  Chat apps, community platforms, and social networking with real-time features.
                </p>
                <Badge className="bg-cyan-600/20 text-cyan-300 border-cyan-500/30">
                  Social Apps
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Current Projects */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-purple-300">Apps In Progress</h2>
            <p className="text-xl text-gray-300">
              We're currently working on several exciting projects. Here's what's cooking:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Star className="h-6 w-6 text-blue-400 mr-3" />
                  <h3 className="text-xl font-bold text-blue-300">Internal Productivity Suite</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  A comprehensive productivity platform we're building for our own studio, 
                  featuring project management, time tracking, and team collaboration tools.
                </p>
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                  Beta Testing
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Smartphone className="h-6 w-6 text-purple-400 mr-3" />
                  <h3 className="text-xl font-bold text-purple-300">Client Concept Apps</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Several innovative app concepts in development for forward-thinking clients 
                  across healthcare, education, and entertainment sectors.
                </p>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                  Development
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Build Your App?</h3>
                <p className="mb-6 max-w-2xl mx-auto text-stone-950">
                  From concept to App Store, we'll guide you through every step of the development process. 
                  Our proven track record with Beevers shows we can deliver apps that users love.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Zap className="mr-2 h-5 w-5" />
                    Start Your App Project
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Code className="mr-2 h-5 w-5" />
                    View Technical Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default AppPortfolio;