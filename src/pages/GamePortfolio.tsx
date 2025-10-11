import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { useGames, useFeaturedGame } from "@/hooks/useGames";
import { Skeleton } from "@/components/ui/skeleton";

const GamePortfolio = () => {
  const { data: games = [], isLoading } = useGames();
  const { data: featuredGame } = useFeaturedGame();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      in_concept: 'In Concept',
      early_development: 'Early Development',
      active_development: 'Active Development',
      launched: 'Launched',
    };
    return labels[status] || status;
  };

  const nonFeaturedGames = games.filter(game => !game.is_featured);

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

      {/* Featured Game Section */}
      {featuredGame && (
        <section className="py-20 px-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20">
          <div className="container mx-auto max-w-6xl">
            <Card className="overflow-hidden border-2 shadow-xl">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      {featuredGame.logo_url && (
                        <img src={featuredGame.logo_url} alt={featuredGame.name} className="w-16 h-16 rounded-lg" />
                      )}
                      <div>
                        <h2 className="text-3xl font-bold text-foreground">{featuredGame.name}</h2>
                        <Badge className="mt-2">{getStatusLabel(featuredGame.status)}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-lg text-muted-foreground mb-6">
                      {featuredGame.description}
                    </p>

                    <div className="space-y-4 mb-6">
                      {featuredGame.key_point_1 && (
                        <div className="flex items-start gap-3">
                          {(() => {
                            const Icon = (LucideIcons as any)[featuredGame.key_point_1_icon || 'Star'];
                            return Icon ? <Icon className="w-5 h-5 text-primary mt-1" /> : null;
                          })()}
                          <span className="text-foreground">{featuredGame.key_point_1}</span>
                        </div>
                      )}
                      {featuredGame.key_point_2 && (
                        <div className="flex items-start gap-3">
                          {(() => {
                            const Icon = (LucideIcons as any)[featuredGame.key_point_2_icon || 'Zap'];
                            return Icon ? <Icon className="w-5 h-5 text-primary mt-1" /> : null;
                          })()}
                          <span className="text-foreground">{featuredGame.key_point_2}</span>
                        </div>
                      )}
                      {featuredGame.key_point_3 && (
                        <div className="flex items-start gap-3">
                          {(() => {
                            const Icon = (LucideIcons as any)[featuredGame.key_point_3_icon || 'TrendingUp'];
                            return Icon ? <Icon className="w-5 h-5 text-primary mt-1" /> : null;
                          })()}
                          <span className="text-foreground">{featuredGame.key_point_3}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {(featuredGame.ios_link || featuredGame.google_play_link) && (
                    <div className="flex flex-wrap gap-3">
                      {featuredGame.ios_link && (
                        <Button size="lg" asChild>
                          <a href={featuredGame.ios_link} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-5 w-5" />
                            Download on iOS
                          </a>
                        </Button>
                      )}
                      {featuredGame.google_play_link && (
                        <Button size="lg" variant="outline" asChild>
                          <a href={featuredGame.google_play_link} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-5 w-5" />
                            Get it on Android
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {featuredGame.feature_image_url && (
                  <div className="relative h-64 md:h-auto">
                    <img 
                      src={featuredGame.feature_image_url}
                      alt={`${featuredGame.name} screenshot`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Other Games Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {nonFeaturedGames.length > 0 ? 'More Games' : 'Games Coming Soon'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {nonFeaturedGames.length > 0 
                ? 'Explore our other exciting projects in development'
                : 'Stay tuned for more amazing games'
              }
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : nonFeaturedGames.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {nonFeaturedGames.map((game) => (
                <Card key={game.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {game.logo_url && (
                          <img src={game.logo_url} alt={game.name} className="w-10 h-10 rounded" />
                        )}
                        <CardTitle className="text-xl">{game.name}</CardTitle>
                      </div>
                      <div className="flex flex-col gap-1">
                        {game.is_new && <Badge variant="secondary">New</Badge>}
                        <Badge variant="outline">{getStatusLabel(game.status)}</Badge>
                      </div>
                    </div>
                    <CardDescription className="text-base">
                      {game.description}
                    </CardDescription>
                    
                    {(game.ios_link || game.google_play_link) && (
                      <div className="flex gap-2 mt-4">
                        {game.ios_link && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={game.ios_link} target="_blank" rel="noopener noreferrer">
                              iOS
                            </a>
                          </Button>
                        )}
                        {game.google_play_link && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={game.google_play_link} target="_blank" rel="noopener noreferrer">
                              Android
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No additional games available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

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
