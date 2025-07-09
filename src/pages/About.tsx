
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Zap, Users, Target } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30 px-4 py-2">
            🧠 Who We Are
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            About 404 Code Lab
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            404 Code Lab is a Scottish-based indie dev studio creating standout digital experiences. 
            Whether it's a buzzing game, a smooth mobile app, or a sharp website — we bring bold ideas to life.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-blue-300">We're developers, designers, gamers, and future-makers.</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                The name says "404" but we're never not found. We're passionate about creating digital experiences 
                that people actually want to use — no filler, no fluff, just pure engagement.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                From the bustling streets of Scotland to screens worldwide, we craft everything ourselves. 
                One studio. One vision. Zero templates.
              </p>
            </div>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Target className="h-8 w-8 text-purple-400 mr-3" />
                  <h3 className="text-2xl font-bold text-purple-300">🚀 Our Mission</h3>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  To create addictive, high-performance experiences people actually want to use. 
                  We focus on what matters: engagement, performance, and that special something 
                  that makes users come back for more.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Code className="h-12 w-12 text-blue-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-blue-300">🔧 Built From Scratch</h3>
                <p className="text-gray-300">
                  From design to code, we craft everything ourselves. Every pixel, every line of code, 
                  every interaction is intentionally designed for maximum impact.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Zap className="h-12 w-12 text-purple-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-purple-300">⚡ Performance First</h3>
                <p className="text-gray-300">
                  Speed and smoothness aren't afterthoughts — they're core features. 
                  We optimize for performance from day one, ensuring every experience feels instant.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Users className="h-12 w-12 text-green-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-green-300">🎯 User-Focused</h3>
                <p className="text-gray-300">
                  We don't just build what looks good — we build what works. 
                  Every decision is made with the end user in mind, creating experiences that just make sense.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Current Focus */}
          <div className="mt-16">
            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-6">
                  <span className="text-3xl mr-3">🐝</span>
                  <h3 className="text-2xl font-bold text-yellow-300">Currently Buzzing: Beevers</h3>
                </div>
                <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                  Our flagship game Beevers showcases everything we stand for: addictive gameplay, 
                  smart systems, and polish that keeps players coming back. It's not just a game — 
                  it's a demonstration of our technical capabilities and design philosophy.
                </p>
                <p className="text-yellow-300 font-medium">
                  The tech stack behind Beevers is rock solid — and reusable across industries.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
