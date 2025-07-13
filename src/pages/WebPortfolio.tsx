import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Globe, Zap, Code, Smartphone, TrendingUp, Eye, ArrowRight, Users, Palette, Rocket, HeadphonesIcon } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
const WebPortfolio = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gray-900 text-white">
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

      {/* Design Philosophy */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
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

          {/* Local Business Web Design Projects */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-green-300">Here's some of our recent websites we have created.</h2>
            <p className="text-xl text-gray-300">
              Recent website projects we've completed for local businesses across various industries.
            </p>
          </div>

          <div className="space-y-12">
            {/* SparkleClean */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mr-4">
                        <Globe className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-blue-300 mb-2">SparkleClean</h3>
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                          New Project
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      A modern cleaning service website featuring an elegant gallery showcase, streamlined contact forms, and service booking system designed to convert visitors into customers.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-300">
                        <Palette className="h-5 w-5 text-blue-400 mr-3" />
                        <span>Modern gallery with before/after photos</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Users className="h-5 w-5 text-cyan-400 mr-3" />
                        <span>Streamlined contact and booking forms</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Smartphone className="h-5 w-5 text-blue-400 mr-3" />
                        <span>Mobile-optimized for on-the-go bookings</span>
                      </div>
                    </div>
                    
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-2xl p-8">
                      <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop" alt="SparkleClean Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FixRight Plumbing */}
            <Card className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mr-4">
                        <Zap className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-green-300 mb-2">FixRight Plumbing</h3>
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                          New Project
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      Emergency plumbing service website with 24/7 booking system, boiler service scheduling, and instant quote calculator to help customers get immediate assistance.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-300">
                        <Rocket className="h-5 w-5 text-green-400 mr-3" />
                        <span>24/7 emergency booking system</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Code className="h-5 w-5 text-teal-400 mr-3" />
                        <span>Instant quote calculator</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <HeadphonesIcon className="h-5 w-5 text-green-400 mr-3" />
                        <span>Live chat support integration</span>
                      </div>
                    </div>
                    
                    <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-2xl p-8">
                      <img src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=400&fit=crop" alt="FixRight Plumbing Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shear Perfection */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mr-4">
                        <Palette className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-purple-300 mb-2">Shear Perfection</h3>
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                          New Project
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      Hair & beauty salon website featuring online booking system, treatment galleries, and stylist profiles to showcase expertise and build client confidence.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-300">
                        <Users className="h-5 w-5 text-purple-400 mr-3" />
                        <span>Online appointment booking</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Eye className="h-5 w-5 text-pink-400 mr-3" />
                        <span>Treatment gallery showcase</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <TrendingUp className="h-5 w-5 text-purple-400 mr-3" />
                        <span>Stylist profiles and reviews</span>
                      </div>
                    </div>
                    
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl p-8">
                      <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" alt="Shear Perfection Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Padrino's Pizza */}
            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center mr-4">
                        <Globe className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-yellow-300 mb-2">Padrino's Pizza</h3>
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                          New Project
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      Takeaway pizza restaurant website with interactive menu builder, food gallery, and seamless online ordering system to boost delivery sales.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-300">
                        <Code className="h-5 w-5 text-yellow-400 mr-3" />
                        <span>Interactive menu and pizza builder</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Eye className="h-5 w-5 text-orange-400 mr-3" />
                        <span>Appetizing food gallery</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Rocket className="h-5 w-5 text-yellow-400 mr-3" />
                        <span>One-click ordering system</span>
                      </div>
                    </div>
                    
                    <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl p-8">
                      <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop" alt="Padrino's Pizza Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sweet Crumbs */}
            <Card className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-pink-500/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center mr-4">
                        <Palette className="h-6 w-6 text-pink-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-pink-300 mb-2">Sweet Crumbs</h3>
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                          New Project
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      Custom cake shop website featuring flavor browsing, cake galleries, and personalized order forms to help customers create their dream celebrations.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-300">
                        <Eye className="h-5 w-5 text-pink-400 mr-3" />
                        <span>Interactive flavor and design galleries</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Code className="h-5 w-5 text-rose-400 mr-3" />
                        <span>Custom order form builder</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Users className="h-5 w-5 text-pink-400 mr-3" />
                        <span>Event consultation booking</span>
                      </div>
                    </div>
                    
                    <Button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-2xl p-8">
                      <img src="https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=600&h=400&fit=crop" alt="Sweet Crumbs Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Happy Paws */}
            <Card className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border-cyan-500/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mr-4">
                        <Users className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-cyan-300 mb-2">Happy Paws</h3>
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                          New Project
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      Dog grooming & daycare website with service galleries, staff profiles, and online booking to help pet owners find trusted care for their furry friends.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-300">
                        <Eye className="h-5 w-5 text-cyan-400 mr-3" />
                        <span>Before/after grooming galleries</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Users className="h-5 w-5 text-teal-400 mr-3" />
                        <span>Staff profiles and credentials</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Rocket className="h-5 w-5 text-cyan-400 mr-3" />
                        <span>Online booking and scheduling</span>
                      </div>
                    </div>
                    
                    <Button className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-2xl p-8">
                      <img src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&h=400&fit=crop" alt="Happy Paws Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crafted Joinery */}
            <Card className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mr-4">
                        <Code className="h-6 w-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-orange-300 mb-2">Crafted Joinery</h3>
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                          New Project
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      Bespoke joinery portfolio website showcasing handcrafted furniture, project galleries, and consultation booking to attract high-value custom work clients.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-300">
                        <Eye className="h-5 w-5 text-orange-400 mr-3" />
                        <span>High-quality project photo galleries</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Palette className="h-5 w-5 text-amber-400 mr-3" />
                        <span>Material and finish showcases</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Users className="h-5 w-5 text-orange-400 mr-3" />
                        <span>Consultation booking system</span>
                      </div>
                    </div>
                    
                    <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-2xl p-8">
                      <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop" alt="Crafted Joinery Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* IronHouse Gym */}
            <Card className="bg-gradient-to-r from-red-500/10 to-crimson-500/10 border-red-500/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mr-4">
                        <Zap className="h-6 w-6 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-red-300 mb-2">IronHouse Gym</h3>
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                          New Project
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      Bold gym website featuring class timetables, trainer profiles, and membership sign-up to motivate visitors and convert them into dedicated members.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-300">
                        <TrendingUp className="h-5 w-5 text-red-400 mr-3" />
                        <span>Interactive class timetables</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Users className="h-5 w-5 text-red-400 mr-3" />
                        <span>Trainer profiles and specialties</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Rocket className="h-5 w-5 text-red-400 mr-3" />
                        <span>Online membership sign-up</span>
                      </div>
                    </div>
                    
                    <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-red-400/20 to-red-600/20 rounded-2xl p-8">
                      <img src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop" alt="IronHouse Gym Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inkspire */}
            <Card className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-indigo-500/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mr-4">
                        <Palette className="h-6 w-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-indigo-300 mb-2">Inkspire</h3>
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                          New Project
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      Tattoo studio website featuring artist biographies, high-resolution tattoo galleries, and consultation booking to showcase artistry and attract new clients.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-300">
                        <Users className="h-5 w-5 text-indigo-400 mr-3" />
                        <span>Detailed artist bios and portfolios</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Eye className="h-5 w-5 text-violet-400 mr-3" />
                        <span>High-res tattoo gallery showcase</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Code className="h-5 w-5 text-indigo-400 mr-3" />
                        <span>Design consultation booking</span>
                      </div>
                    </div>
                    
                    <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-2xl p-8">
                      <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop" alt="Inkspire Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Elite Motors */}
            <Card className="bg-gradient-to-r from-slate-500/10 to-gray-500/10 border-slate-500/30">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-slate-600/20 rounded-lg flex items-center justify-center mr-4">
                        <Rocket className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-300 mb-2">Elite Motors</h3>
                        <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                          New Project
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      Premium car dealership website with inventory management, virtual showroom tours, and financing calculator to deliver luxury car buying experience online.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-gray-300">
                        <Eye className="h-5 w-5 text-slate-400 mr-3" />
                        <span>Virtual showroom and 360° tours</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Code className="h-5 w-5 text-gray-400 mr-3" />
                        <span>Advanced search and filtering</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <TrendingUp className="h-5 w-5 text-slate-400 mr-3" />
                        <span>Financing calculator and forms</span>
                      </div>
                    </div>
                    
                    <Button className="bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700">
                      <Globe className="mr-2 h-5 w-5" />
                      View Project
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-slate-400/20 to-gray-400/20 rounded-2xl p-8">
                      <img src="https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=600&h=400&fit=crop" alt="Elite Motors Website Preview" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                  <Button onClick={() => navigate('/contact')} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    <Zap className="mr-2 h-5 w-5" />
                    Contact Us
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                        <Eye className="mr-2 h-5 w-5" />
                        See Our Process
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center text-green-300 mb-6">
                          Our Development Process
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-8">
                        {/* Phase 1: Discovery */}
                        <div className="flex items-start gap-4 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="h-6 w-6 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-blue-300 mb-2">1. Discovery Phase</h3>
                            <p className="text-gray-300 mb-3">
                              We start by understanding your vision, goals, and target audience through detailed consultations.
                            </p>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div>• Requirements gathering and project scope definition</div>
                              <div>• Target audience research and competitor analysis</div>
                              <div>• Technical feasibility assessment</div>
                              <div>• Timeline: 1-2 weeks</div>
                            </div>
                          </div>
                        </div>

                        {/* Phase 2: Design */}
                        <div className="flex items-start gap-4 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Palette className="h-6 w-6 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-purple-300 mb-2">2. Design Phase</h3>
                            <p className="text-gray-300 mb-3">
                              Creating wireframes, mockups, and interactive prototypes that bring your vision to life.
                            </p>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div>• Wireframing and user experience design</div>
                              <div>• Visual design and branding integration</div>
                              <div>• Interactive prototypes and user testing</div>
                              <div>• Timeline: 2-3 weeks</div>
                            </div>
                          </div>
                        </div>

                        {/* Phase 3: Development */}
                        <div className="flex items-start gap-4 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Code className="h-6 w-6 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-green-300 mb-2">3. Development Phase</h3>
                            <p className="text-gray-300 mb-3">
                              Building your project with modern technologies, focusing on performance and scalability.
                            </p>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div>• Frontend development with React/TypeScript</div>
                              <div>• Backend development and database setup</div>
                              <div>• Responsive design implementation</div>
                              <div>• Quality assurance and testing</div>
                              <div>• Timeline: 3-8 weeks (varies by complexity)</div>
                            </div>
                          </div>
                        </div>

                        {/* Phase 4: Launch */}
                        <div className="flex items-start gap-4 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Rocket className="h-6 w-6 text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-yellow-300 mb-2">4. Launch Phase</h3>
                            <p className="text-gray-300 mb-3">
                              Deploying your project to production with thorough testing and optimization.
                            </p>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div>• Production deployment and configuration</div>
                              <div>• Performance optimization and monitoring</div>
                              <div>• SEO setup and analytics integration</div>
                              <div>• Timeline: 1 week</div>
                            </div>
                          </div>
                        </div>

                        {/* Phase 5: Support */}
                        <div className="flex items-start gap-4 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <HeadphonesIcon className="h-6 w-6 text-cyan-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-cyan-300 mb-2">5. Support & Maintenance</h3>
                            <p className="text-gray-300 mb-3">
                              Ongoing support to keep your project secure, updated, and performing at its best.
                            </p>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div>• Regular updates and security patches</div>
                              <div>• Performance monitoring and optimization</div>
                              <div>• Feature enhancements and bug fixes</div>
                              <div>• Timeline: Ongoing as needed</div>
                            </div>
                          </div>
                        </div>

                        {/* Communication & Tools */}
                        <div className="p-6 bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-lg border border-green-500/30">
                          <h3 className="text-lg font-bold text-green-300 mb-3">Communication & Tools</h3>
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                            <div>
                              <strong className="text-white">Weekly Updates:</strong> Regular progress reports and demos
                            </div>
                            <div>
                              <strong className="text-white">Direct Access:</strong> Dedicated project manager and developer contact
                            </div>
                            <div>
                              <strong className="text-white">Modern Tools:</strong> Git, Slack, Figma for collaboration
                            </div>
                            <div>
                              <strong className="text-white">Feedback Loops:</strong> Continuous iteration based on your input
                            </div>
                          </div>
                        </div>

                        <div className="text-center pt-4">
                          <Button onClick={() => navigate('/contact')} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                            Start Your Project
                            <ArrowRight className="ml-2 h-4 w-4" />
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