import { Link } from "react-router-dom";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function GameDevelopment() {
  const title = "Game Development Services | 404 Code Lab";
  const description = "Professional game development services for mobile, web, and desktop platforms. We create engaging games using Unity, Unreal Engine, and custom solutions.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Game Development Services",
    "provider": { "@type": "Organization", "name": "404 Code Lab" },
    "areaServed": "Global",
    "serviceType": "Game Development",
    "description": description
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title={title} description={description} jsonLd={jsonLd} />
      <StaticNavigation />
      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-background via-primary/10 to-accent/10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-2">
              🎮 Game Development
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Professional Game Development
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Bring your game ideas to life with our expert development team. We create immersive gaming experiences across mobile, web, 
              and desktop platforms using cutting-edge technologies and proven game design principles.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/contact" aria-label="Get a quote for game development">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="features" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 id="features" className="text-3xl font-bold mb-6 text-primary">What we build</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Mobile Games", desc: "Engaging iOS and Android games optimized for touch interfaces and mobile gameplay." },
                { title: "Web Games", desc: "Browser-based games using WebGL, HTML5, and modern web technologies." },
                { title: "2D & 3D Games", desc: "Both 2D sprite-based and full 3D games with stunning visuals and smooth performance." },
                { title: "Puzzle Games", desc: "Brain-teasing puzzle games with progressive difficulty and engaging mechanics." },
                { title: "Action Games", desc: "Fast-paced action games with responsive controls and exciting gameplay." },
                { title: "Multiplayer Games", desc: "Real-time multiplayer experiences with matchmaking and social features." },
              ].map((f) => (
                <Card key={f.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                    <CardDescription>{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="use-cases" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 id="use-cases" className="text-3xl font-bold mb-6 text-primary">Use cases</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Casual mobile games",
                  text: "Easy-to-play mobile games perfect for short gaming sessions and broad audiences.",
                  image: "/lovable-uploads/47f9ad80-e301-4e42-aab1-48bedbe2da16.png",
                  alt: "Casual mobile game interface"
                },
                {
                  title: "Educational games",
                  text: "Learning-focused games that make education fun and interactive for all ages.",
                  image: "/lovable-uploads/4a5f1662-f838-4873-8197-031303c450d6.png",
                  alt: "Educational game design"
                },
                {
                  title: "Web-based games",
                  text: "Browser games that work across all devices without requiring downloads.",
                  image: "/lovable-uploads/5deb9273-b749-4781-803a-ac052ba93374.png",
                  alt: "Web game interface"
                },
              ].map((u) => (
                <Card key={u.title}>
                  <CardContent className="pt-6">
                    {u.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.image}
                        alt={u.alt}
                        loading="lazy"
                        className="w-full rounded-md border mb-4"
                      />
                    )}
                    <h3 className="font-semibold text-lg mb-1">{u.title}</h3>
                    <p className="text-muted-foreground">{u.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="cta" className="py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 id="cta" className="text-3xl font-bold">Ready to create your game?</h2>
            <p className="mt-3 text-muted-foreground">Let's discuss your game concept and bring it to life with engaging gameplay.</p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/contact" aria-label="Get a quote">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}