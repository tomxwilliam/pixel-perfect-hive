import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Gamepad2, Target, Zap, Smartphone, Trophy, Users, Brain, Heart, Sparkles } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { useGames } from "@/hooks/useGames";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { usePageContent } from "@/hooks/usePageContent";

const GamePortfolio = () => {
  const { data: games = [], isLoading } = useGames();
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const { data: pageContent } = usePageContent('/portfolio/games');

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      in_concept: 'In Concept',
      early_development: 'Early Development',
      active_development: 'Active Development',
      launched: 'Launched',
    };
    return labels[status] || status;
  };

  // Alternating background gradients for visual variety
  const backgrounds = [
    "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20",
    "bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20",
    "bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 dark:from-green-950/20 dark:via-teal-950/20 dark:to-cyan-950/20",
    "bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-violet-950/20",
  ];

  // Reusable Game Card Component
  const GameCard = ({ game, index }: { game: any; index: number }) => {
    const bgClass = backgrounds[index % backgrounds.length];

    return (
      <section className={`py-12 md:py-20 px-4 ${bgClass}`}>
        <div className="container mx-auto max-w-6xl">
          <Card className="overflow-hidden border-2 shadow-xl">
            <div className="grid md:grid-cols-2 gap-0 md:gap-8">
              <div className="p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-start sm:items-center gap-3 mb-4">
                    {game.logo_url && (
                      <img src={game.logo_url} alt={game.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{game.name}</h2>
                        {game.is_featured && (
                          <Badge variant="default">Featured</Badge>
                        )}
                        {game.is_new && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                      <Badge className="mt-1">{getStatusLabel(game.status)}</Badge>
                    </div>
                  </div>
                  
                  <p className="text-base sm:text-lg text-muted-foreground mb-4 md:mb-6">
                    {game.description}
                  </p>

                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    {game.key_point_1 && (
                      <div className="flex items-start gap-3">
                        {(() => {
                          const Icon = (LucideIcons as any)[game.key_point_1_icon || 'Star'];
                          return Icon ? <Icon className="w-5 h-5 text-primary mt-1" /> : null;
                        })()}
                        <span className="text-foreground">{game.key_point_1}</span>
                      </div>
                    )}
                    {game.key_point_2 && (
                      <div className="flex items-start gap-3">
                        {(() => {
                          const Icon = (LucideIcons as any)[game.key_point_2_icon || 'Zap'];
                          return Icon ? <Icon className="w-5 h-5 text-primary mt-1" /> : null;
                        })()}
                        <span className="text-foreground">{game.key_point_2}</span>
                      </div>
                    )}
                    {game.key_point_3 && (
                      <div className="flex items-start gap-3">
                        {(() => {
                          const Icon = (LucideIcons as any)[game.key_point_3_icon || 'TrendingUp'];
                          return Icon ? <Icon className="w-5 h-5 text-primary mt-1" /> : null;
                        })()}
                        <span className="text-foreground">{game.key_point_3}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(game.ios_link || game.google_play_link) && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {game.ios_link && (
                      <Button size="default" className="w-full sm:w-auto" asChild>
                        <a href={game.ios_link} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download on iOS
                        </a>
                      </Button>
                    )}
                    {game.google_play_link && (
                      <Button size="default" variant="outline" className="w-full sm:w-auto" asChild>
                        <a href={game.google_play_link} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Get it on Android
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {game.feature_image_url && (
                <div className="relative h-48 sm:h-64 md:h-auto order-first md:order-last">
                  <img 
                    src={game.feature_image_url}
                    alt={`${game.name} screenshot`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo 
        title={pageContent?.meta_title || "Game Development Portfolio - Mobile Games by 404 Code Lab"}
        description={pageContent?.meta_description || "Check out our mobile game development portfolio."}
        canonicalUrl={pageContent?.canonical_url || "https://404codelab.com/portfolio/games"}
      />
      <StaticNavigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-background via-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 md:mb-6 bg-primary/20 text-primary border-primary/30 px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base">
            🎮 Game Development
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Games Portfolio
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
            We don't just make games — we craft addictive experiences. Fun-first gameplay, smart monetization, and polish that keeps players coming back.
          </p>
        </div>
      </section>

      {/* Game Development Philosophy */}
      <section className="py-12 md:py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Game Development Philosophy
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We build games that players love, with mechanics that engage and monetization that feels natural.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <Card className="p-6 md:p-8 border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground">Fun-First Design</h3>
                <p className="text-muted-foreground">
                  Every mechanic is playtested until it feels just right. We build games that are instantly engaging with depth that rewards mastery.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 md:p-8 border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 md:w-8 md:h-8 text-accent" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground">Mobile-Optimised</h3>
                <p className="text-muted-foreground">
                  Built for touch controls and short sessions. Optimised performance across all devices, from budget phones to flagship models.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 md:p-8 border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground">Smart Monetization</h3>
                <p className="text-muted-foreground">
                  Ethical monetization that enhances gameplay. From rewarded ads to IAPs, we design systems that players actually appreciate.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Game Types We Create */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Game Types We Create
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From hyper-casual hits to complex strategy games, we've got the expertise to bring your vision to life.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="p-6 border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardContent className="p-0 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Hyper-Casual Games</h3>
                <p className="text-muted-foreground text-sm">
                  Quick, addictive gameplay loops designed for mass appeal. Perfect for ad-based monetization and viral growth.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardContent className="p-0 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Puzzle Games</h3>
                <p className="text-muted-foreground text-sm">
                  Brain-teasing challenges with satisfying progression. From match-3 mechanics to innovative puzzle systems.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardContent className="p-0 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Arcade Games</h3>
                <p className="text-muted-foreground text-sm">
                  Fast-paced action with high replay value. Score chasing, endless runners, and reflex-based gameplay.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardContent className="p-0 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Strategy Games</h3>
                <p className="text-muted-foreground text-sm">
                  Deep strategic gameplay with progression systems. Tower defense, resource management, and tactical combat.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardContent className="p-0 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Casual Games</h3>
                <p className="text-muted-foreground text-sm">
                  Relaxing, accessible gameplay for all ages. Building, simulation, and social mechanics that keep players engaged.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <CardContent className="p-0 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Multiplayer Games</h3>
                <p className="text-muted-foreground text-sm">
                  Real-time competition and cooperation. Matchmaking, leaderboards, and social features that drive engagement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* All Games Section */}
      {isLoading ? (
        <section className="py-20 px-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20">
          <div className="container mx-auto max-w-6xl">
            <Skeleton className="h-96 w-full" />
          </div>
        </section>
      ) : games.length > 0 ? (
        <>
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </>
      ) : (
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Games Coming Soon</h2>
            <p className="text-lg text-muted-foreground">
              Stay tuned for more amazing games!
            </p>
          </div>
        </section>
      )}

      {/* Game Development Section */}
      <section className="py-12 md:py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-4 md:mb-6 bg-primary/20 text-primary border-primary/30 px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base">
            Our Game Development Process
          </Badge>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-foreground">
            From Concept to Launch
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed px-2">
            We specialise in creating addictive mobile games with engaging gameplay loops, 
            smart monetisation strategies, and polished user experiences. Our full-stack
            approach covers everything from initial concept to App Store launch and beyond.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10 text-left">
            <Card className="p-4 md:p-6">
              <CardContent className="p-0">
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-foreground">Design & Concept</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Game mechanics, progression systems, and monetization strategy tailored to your vision.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-4 md:p-6">
              <CardContent className="p-0">
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-foreground">Development</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Built with Unity and optimised for both iOS and Android platforms with native performance.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-4 md:p-6">
              <CardContent className="p-0">
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-foreground">Launch & Support</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  App Store optimisation, analytics integration, and ongoing updates to keep players engaged.
                </p>
              </CardContent>
            </Card>
          </div>

          <Button 
            size="default"
            onClick={() => setProcessDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 w-full sm:w-auto"
          >
            See How the Full Process Works
          </Button>
        </div>
      </section>

      {/* Process Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold">Our Game Development Process</DialogTitle>
            <DialogDescription className="text-sm sm:text-base md:text-lg">
              From initial concept to successful launch - here's how we bring your game to life
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 md:space-y-8 mt-4 md:mt-6">
            {/* Phase 1 */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Badge className="text-sm md:text-base px-3 md:px-4 py-1 md:py-2">Phase 1</Badge>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Discovery & Concept</h3>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                We start by understanding your vision and target audience. Together, we define the core gameplay loop, 
                unique mechanics, and what will make your game stand out in the market.
              </p>
              <ul className="list-disc list-inside space-y-1 md:space-y-2 text-sm md:text-base text-muted-foreground ml-4">
                <li>Initial consultation and vision alignment</li>
                <li>Market research and competitor analysis</li>
                <li>Core gameplay mechanics definition</li>
                <li>Monetization strategy planning</li>
                <li>Technical feasibility assessment</li>
              </ul>
            </div>

            {/* Phase 2 */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Badge className="text-sm md:text-base px-3 md:px-4 py-1 md:py-2">Phase 2</Badge>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Design & Prototyping</h3>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                We create detailed game design documents and build interactive prototypes to validate the fun factor 
                before committing to full development.
              </p>
              <ul className="list-disc list-inside space-y-1 md:space-y-2 text-sm md:text-base text-muted-foreground ml-4">
                <li>Game design document creation</li>
                <li>UI/UX wireframes and mockups</li>
                <li>Playable prototype development</li>
                <li>Core loop testing and refinement</li>
                <li>Art style and visual direction</li>
              </ul>
            </div>

            {/* Phase 3 */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Badge className="text-sm md:text-base px-3 md:px-4 py-1 md:py-2">Phase 3</Badge>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Full Development</h3>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                Using Unity, we build your game with clean, scalable code. Regular builds keep you in the loop as 
                features come to life.
              </p>
              <ul className="list-disc list-inside space-y-1 md:space-y-2 text-sm md:text-base text-muted-foreground ml-4">
                <li>Unity development for iOS and Android</li>
                <li>Feature implementation in sprints</li>
                <li>Backend integration (if needed)</li>
                <li>In-app purchases and ads setup</li>
                <li>Regular playable builds for feedback</li>
              </ul>
            </div>

            {/* Phase 4 */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Badge className="text-sm md:text-base px-3 md:px-4 py-1 md:py-2">Phase 4</Badge>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Testing & Polish</h3>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                We rigorously test across devices, optimise performance, and add that final layer of polish that 
                separates good games from great ones.
              </p>
              <ul className="list-disc list-inside space-y-1 md:space-y-2 text-sm md:text-base text-muted-foreground ml-4">
                <li>Quality assurance testing</li>
                <li>Performance optimisation</li>
                <li>Device compatibility testing</li>
                <li>Bug fixing and refinement</li>
                <li>Balance and difficulty tuning</li>
              </ul>
            </div>

            {/* Phase 5 */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Badge className="text-sm md:text-base px-3 md:px-4 py-1 md:py-2">Phase 5</Badge>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Launch & App Store Submission</h3>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                We handle all the technical details of getting your game onto the App Store and Google Play, 
                including optimisation for discoverability.
              </p>
              <ul className="list-disc list-inside space-y-1 md:space-y-2 text-sm md:text-base text-muted-foreground ml-4">
                <li>App Store and Google Play account setup</li>
                <li>Store listing optimisation (ASO)</li>
                <li>Marketing assets preparation</li>
                <li>Submission and review process management</li>
                <li>Launch day support</li>
              </ul>
            </div>

            {/* Phase 6 */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Badge className="text-sm md:text-base px-3 md:px-4 py-1 md:py-2">Phase 6</Badge>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Post-Launch & Growth</h3>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                After launch, we monitor analytics, gather player feedback, and release updates to improve retention 
                and monetization.
              </p>
              <ul className="list-disc list-inside space-y-1 md:space-y-2 text-sm md:text-base text-muted-foreground ml-4">
                <li>Analytics integration and monitoring</li>
                <li>Player feedback analysis</li>
                <li>Regular content updates</li>
                <li>Performance optimisation based on data</li>
                <li>Ongoing technical support</li>
              </ul>
            </div>

            <div className="pt-4 md:pt-6 border-t">
              <p className="text-center text-sm md:text-base text-muted-foreground">
                Ready to start your game development journey?
              </p>
              <div className="flex justify-center mt-3 md:mt-4">
                <Button asChild size="default" className="bg-gradient-to-r from-primary to-accent w-full sm:w-auto">
                  <Link to="/contact">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-primary/30">
            <CardContent className="p-6 md:p-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4 text-foreground">Have a Game Idea?</h3>
              <p className="mb-4 md:mb-6 max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground">
                Whether you have a complete concept or just a spark of an idea, 
                we'd love to hear about it. Let's build the next addictive mobile game together!
              </p>
              <Button size="default" asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 w-full sm:w-auto">
                <Link to="/contact">
                  Discuss Your Game
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GamePortfolio;
