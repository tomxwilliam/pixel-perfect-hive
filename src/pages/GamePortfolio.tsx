import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Star, Zap, TrendingUp } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
const GamePortfolio = () => {
  return <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30 px-4 py-2">
            🎮 Game Development
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Games Portfolio
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            This is where we shine. We build fun-first mobile games with smart systems, satisfying loops, and polish that sticks.
          </p>
        </div>
      </section>

      {/* Featured Game */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 mb-12">
            <CardContent className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center mb-6">
                    <span className="text-4xl mr-4">🐝</span>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-300 mb-2">Beevers</h2>
                      <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30">
                        Featured Game
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xl mb-6 leading-relaxed text-zinc-950">
                    The ultimate idle bee empire game where bees run the economy. 
                    Build your hive, manage your workers, and watch your empire grow!
                  </p>
                  
                  <div className="space-y-4 mb-8 text-stone-950">
                    <div className="flex items-center text-gray-300">
                      <Star className="h-5 w-5 text-yellow-400 mr-3" />
                      <span className="text-stone-950">Strategic upgrades and prestige systems</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Zap className="h-5 w-5 text-blue-400 mr-3" />
                      <span>Smart buff mechanics and automation</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <TrendingUp className="h-5 w-5 text-green-400 mr-3" />
                      <span>Currently in active development</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Download className="mr-2 h-5 w-5" />
                      Download on iOS
                    </Button>
                    <Button variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
                      <ExternalLink className="mr-2 h-5 w-5" />
                      View Details
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4">🏭</div>
                    <p className="text-gray-300">
                      Game screenshots and preview coming soon!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Games */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">🎲 More Games in Development</h2>
            <p className="text-xl text-gray-300">
              Our hive is buzzing with new projects. Stay tuned for exciting announcements!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-4 text-blue-300">Strategy Game</h3>
                <p className="text-gray-300 mb-4">
                  Deep strategic gameplay with resource management and tactical combat.
                </p>
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                  In Concept
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🏃</div>
                <h3 className="text-xl font-bold mb-4 text-purple-300">Endless Runner</h3>
                <p className="text-gray-300 mb-4">
                  Fast-paced action with unique mechanics and stunning visual effects.
                </p>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                  Early Development
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🧩</div>
                <h3 className="text-xl font-bold mb-4 text-green-300">Puzzle Adventure</h3>
                <p className="text-gray-300 mb-4">
                  Mind-bending puzzles wrapped in an engaging narrative experience.
                </p>
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                  Planning Phase
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 text-stone-950">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Have a Game Idea?</h3>
                <p className="mb-6 max-w-2xl mx-auto text-stone-950">
                  Whether you have a complete concept or just a spark of an idea, 
                  we'd love to hear about it. Let's build the next addictive mobile game together!
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Zap className="mr-2 h-5 w-5" />
                  Discuss Your Game
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default GamePortfolio;