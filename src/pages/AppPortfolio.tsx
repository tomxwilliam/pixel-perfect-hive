import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Smartphone, Zap, Code, TrendingUp, Star, Shield, CheckCircle, Users, Clock, Lightbulb } from "lucide-react";
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
                <p className="text-xl max-w-3xl mx-auto text-stone-950">
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
                  <p className="text-sm text-stone-950">
                    Optimized for iOS and Android with smooth 60fps animations
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="font-bold mb-2 text-purple-300">Secure & Scalable</h3>
                  <p className="text-sm text-stone-950">
                    Enterprise-grade security with cloud infrastructure
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="font-bold mb-2 text-green-300">Analytics Ready</h3>
                  <p className="text-sm text-stone-950">
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
                  <h3 className="text-xl font-bold text-blue-300">Client Website & Portal</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  A comprehensive website with customer portal and companion mobile app 
                  currently in development for a key client, featuring user management, 
                  data visualization, and seamless cross-platform integration.
                </p>
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                  Development
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Smartphone className="h-6 w-6 text-purple-400 mr-3" />
                  <h3 className="text-xl font-bold text-purple-300">Directory Platform</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  A comprehensive directory-style website and companion mobile app 
                  currently in development, featuring advanced search, filtering, 
                  user profiles, and location-based services.
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-gray-600 text-slate-100 bg-slate-950 hover:bg-slate-800">
                        <Code className="mr-2 h-5 w-5" />
                        View Technical Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-purple-300">Our App Development Process</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 text-gray-300">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center mt-1">
                                <Lightbulb className="h-4 w-4 text-purple-400" />
                              </div>
                              <div>
                                <h3 className="font-bold text-purple-300 mb-2">1. Discovery & Strategy</h3>
                                <p className="text-sm">We start by understanding your vision, target audience, and business goals. This includes market research, competitor analysis, and feature prioritization.</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center mt-1">
                                <Code className="h-4 w-4 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-bold text-blue-300 mb-2">2. Design & Prototyping</h3>
                                <p className="text-sm">Interactive wireframes and high-fidelity designs using modern UI/UX principles. We create clickable prototypes for early testing and feedback.</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center mt-1">
                                <Shield className="h-4 w-4 text-green-400" />
                              </div>
                              <div>
                                <h3 className="font-bold text-green-300 mb-2">3. Development & Testing</h3>
                                <p className="text-sm">Agile development with regular updates, comprehensive testing on real devices, and continuous integration for quality assurance.</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-yellow-600/20 rounded-full flex items-center justify-center mt-1">
                                <TrendingUp className="h-4 w-4 text-yellow-400" />
                              </div>
                              <div>
                                <h3 className="font-bold text-yellow-300 mb-2">4. Launch & Optimization</h3>
                                <p className="text-sm">App Store submission, launch strategy, analytics setup, and ongoing optimization based on user feedback and performance data.</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-200 mb-4">Our Technical Expertise</h3>
                            
                            <div className="bg-gray-800/50 p-4 rounded-lg">
                              <h4 className="font-bold text-blue-300 mb-2">Frontend Technologies</h4>
                              <div className="flex flex-wrap gap-2">
                                <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">React Native</Badge>
                                <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">Flutter</Badge>
                                <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">Swift</Badge>
                                <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">Kotlin</Badge>
                              </div>
                            </div>
                            
                            <div className="bg-gray-800/50 p-4 rounded-lg">
                              <h4 className="font-bold text-purple-300 mb-2">Backend & Cloud</h4>
                              <div className="flex flex-wrap gap-2">
                                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">Node.js</Badge>
                                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">Firebase</Badge>
                                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">AWS</Badge>
                                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">MongoDB</Badge>
                              </div>
                            </div>
                            
                            <div className="bg-gray-800/50 p-4 rounded-lg">
                              <h4 className="font-bold text-green-300 mb-2">Key Features We Implement</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                  <span>Push notifications & real-time updates</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                  <span>User authentication & social login</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                  <span>In-app purchases & payment processing</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                  <span>Analytics & crash reporting</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                  <span>Offline functionality & data sync</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-700 pt-6">
                          <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div>
                              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Clock className="h-6 w-6 text-purple-400" />
                              </div>
                              <h4 className="font-bold text-purple-300 mb-2">Timeline</h4>
                              <p className="text-sm">8-16 weeks typical development cycle, depending on complexity and features</p>
                            </div>
                            
                            <div>
                              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Users className="h-6 w-6 text-blue-400" />
                              </div>
                              <h4 className="font-bold text-blue-300 mb-2">Team</h4>
                              <p className="text-sm">Dedicated project manager, UI/UX designer, and senior developers assigned to your project</p>
                            </div>
                            
                            <div>
                              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Shield className="h-6 w-6 text-green-400" />
                              </div>
                              <h4 className="font-bold text-green-300 mb-2">Support</h4>
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
    </div>;
};
export default AppPortfolio;