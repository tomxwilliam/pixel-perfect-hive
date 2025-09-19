import { Link } from "react-router-dom";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function WebDevelopment() {
  const title = "Web Development Services | 404 Code Lab";
  const description = "Professional web development services including responsive websites, e-commerce platforms, web applications, and custom solutions tailored to your business needs.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Web Development Services",
    "provider": { "@type": "Organization", "name": "404 Code Lab" },
    "areaServed": "Global",
    "serviceType": "Web Development",
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
              🌐 Web Development
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Professional Web Development
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From stunning business websites to complex web applications, we create digital experiences that engage users and drive results. 
              Modern, responsive, and optimized for performance and SEO.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/contact" aria-label="Get a quote for web development">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="features" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 id="features" className="text-3xl font-bold mb-6 text-primary">What we build</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Business Websites", desc: "Professional websites that showcase your brand and convert visitors into customers." },
                { title: "E-commerce Platforms", desc: "Fully-featured online stores with payment integration, inventory management, and analytics." },
                { title: "Web Applications", desc: "Custom web apps with complex functionality, user authentication, and database integration." },
                { title: "Landing Pages", desc: "High-converting landing pages optimized for campaigns and lead generation." },
                { title: "CMS Solutions", desc: "Content management systems that allow you to easily update and manage your content." },
                { title: "API Integration", desc: "Connect your website to third-party services, databases, and external APIs." },
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
                  title: "Corporate websites",
                  text: "Professional business websites with modern design and optimized user experience.",
                  image: "/lovable-uploads/0649ad28-de44-42bb-b776-70c0a8fca446.png",
                  alt: "Modern corporate website design"
                },
                {
                  title: "E-commerce stores",
                  text: "Full-featured online stores with secure payment processing and inventory management.",
                  image: "/lovable-uploads/08b142ce-467d-4503-aa9d-28d4085bbf3b.png",
                  alt: "E-commerce website interface"
                },
                {
                  title: "SaaS platforms",
                  text: "Scalable web applications with user dashboards, subscriptions, and advanced features.",
                  image: "/lovable-uploads/0dc251b9-ee51-4b4b-a33a-a9cd8bd5888a.png",
                  alt: "SaaS platform dashboard"
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
            <h2 id="cta" className="text-3xl font-bold">Ready to build your website?</h2>
            <p className="mt-3 text-muted-foreground">Let's discuss your web development project and create something amazing together.</p>
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