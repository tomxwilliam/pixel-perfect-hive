import { Link } from "react-router-dom";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AppDevelopment() {
  const title = "Mobile App Development Services | 404 Code Lab";
  const description = "Custom mobile app development for iOS and Android. We create native and cross-platform applications that deliver exceptional user experiences and drive business growth.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Mobile App Development Services",
    "provider": { "@type": "Organization", "name": "404 Code Lab" },
    "areaServed": "Global",
    "serviceType": "Mobile App Development",
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
              📱 App Development
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Mobile App Development
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into powerful mobile applications. We develop native iOS and Android apps, as well as cross-platform solutions 
              that deliver exceptional performance and user experiences across all devices.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/contact" aria-label="Get a quote for app development">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="features" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 id="features" className="text-3xl font-bold mb-6 text-primary">What we build</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Native iOS Apps", desc: "Swift-based iOS applications optimized for iPhone and iPad with native performance." },
                { title: "Native Android Apps", desc: "Kotlin/Java Android applications that leverage platform-specific features and design." },
                { title: "Cross-Platform Apps", desc: "React Native and Flutter apps that work seamlessly across iOS and Android." },
                { title: "Progressive Web Apps", desc: "Web-based apps that work offline and provide native-like experiences." },
                { title: "App Store Optimization", desc: "Complete app store submission and optimization for maximum visibility." },
                { title: "Backend Integration", desc: "API development, database design, and cloud services integration." },
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
                  title: "Business apps",
                  text: "Enterprise applications for internal processes, CRM, and workforce management.",
                  image: "/lovable-uploads/0f5fc07e-8b2a-49a3-b4d4-1e7a3adb62b1.png",
                  alt: "Business mobile app interface"
                },
                {
                  title: "E-commerce apps",
                  text: "Mobile shopping experiences with secure payments and personalized recommendations.",
                  image: "/lovable-uploads/1e963e0b-cd28-4c9f-a4ee-0efb51b7c7fa.png",
                  alt: "E-commerce mobile app design"
                },
                {
                  title: "Social platforms",
                  text: "Community-driven apps with real-time messaging, feeds, and user interactions.",
                  image: "/lovable-uploads/40db8b65-10fc-4b8a-bdbe-0c197159ca3a.png",
                  alt: "Social media app interface"
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
            <h2 id="cta" className="text-3xl font-bold">Ready to build your app?</h2>
            <p className="mt-3 text-muted-foreground">Let's turn your app idea into reality with our expert development team.</p>
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