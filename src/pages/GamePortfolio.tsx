import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { useGames } from "@/hooks/useGames";
import { Skeleton } from "@/components/ui/skeleton";

const GamePortfolio = () => {
  const { data: games = [], isLoading } = useGames();

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
      <section className={`py-20 px-4 ${bgClass}`}>
        <div className="container mx-auto max-w-6xl">
          <Card className="overflow-hidden border-2 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {game.logo_url && (
                      <img src={game.logo_url} alt={game.name} className="w-16 h-16 rounded-lg" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-3xl font-bold text-foreground">{game.name}</h2>
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
                  
                  <p className="text-lg text-muted-foreground mb-6">
                    {game.description}
                  </p>

                  <div className="space-y-4 mb-6">
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
                  <div className="flex flex-wrap gap-3">
                    {game.ios_link && (
                      <Button size="lg" asChild>
                        <a href={game.ios_link} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-5 w-5" />
                          Download on iOS
                        </a>
                      </Button>
                    )}
                    {game.google_play_link && (
                      <Button size="lg" variant="outline" asChild>
                        <a href={game.google_play_link} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-5 w-5" />
                          Get it on Android
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {game.feature_image_url && (
                <div className="relative h-64 md:h-auto">
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
        title="Game Portfolio | Mobile Games by 404 Code Lab"
        description="Explore our collection of addictive mobile games including BeeVerse. Professional game development with Unity, engaging gameplay, and monetization strategies."
        canonicalUrl="https://404codelab.com/portfolio/games"
      />
      <StaticNavigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-background via-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-2">
            🎮 Game Development
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Games Portfolio
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            This is where we shine. We build fun-first mobile games with smart systems, satisfying loops, and polish that sticks.
          </p>
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-primary/30">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Have a Game Idea?</h3>
              <p className="mb-6 max-w-2xl mx-auto text-muted-foreground">
                Whether you have a complete concept or just a spark of an idea, 
                we'd love to hear about it. Let's build the next addictive mobile game together!
              </p>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
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
