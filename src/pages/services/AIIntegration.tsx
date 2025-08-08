import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AIIntegration() {
  const title = "AI Integration into Apps and Websites | 404 Code Lab";
  const description = "We integrate AI chatbots, automation, analytics, and personalised UX into apps and websites to drive growth and efficiency.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "AI Integration into Apps and Websites",
    "provider": { "@type": "Organization", "name": "404 Code Lab" },
    "areaServed": "Global",
    "serviceType": "AI Integration",
    "description": description
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title={title} description={description} jsonLd={jsonLd} />
      <Navigation />
      <main>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Badge variant="secondary" className="mb-4">Service</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">AI Integration into Apps and Websites</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              From discovery to deployment, we embed production-ready AI into your product: strategy, model selection, data pipelines,
              safety guardrails, and UX integration. Ship assistants, automation, analytics, and personalisation that measurably move the needle.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/contact" aria-label="Get a quote for AI integration">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </header>

        <section aria-labelledby="features" className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="features" className="text-2xl md:text-3xl font-semibold mb-6">What we build</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "AI Chatbots & Assistants", desc: "24/7 support, lead qualification, onboarding flows, and in-product help." },
                { title: "Process Automation", desc: "Integrate tools and trigger workflows to reduce manual work and response times." },
                { title: "Data Analysis & Insights", desc: "Turn unstructured data into actionable insights and summaries." },
                { title: "Predictive Analytics", desc: "Forecast churn, demand, or conversion with tailored ML pipelines." },
                { title: "Personalised Experiences", desc: "Recommendations, dynamic content, and adaptive UX for each user." },
                { title: "Content Generation", desc: "On-brand copy, product descriptions, and image assets with approval flows." },
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

        <section aria-labelledby="use-cases" className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="use-cases" className="text-2xl md:text-3xl font-semibold mb-6">Use cases</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "E‑commerce personalisation",
                  text: "Boost AOV with intelligent recommendations and semantic search.",
                  image: "/lovable-uploads/1e963e0b-cd28-4c9f-a4ee-0efb51b7c7fa.png",
                  alt: "AI powered recommendations UI mockup"
                },
                {
                  title: "SaaS support automation",
                  text: "Deflect tickets with an in-app assistant trained on your docs and data.",
                  image: "/lovable-uploads/47f9ad80-e301-4e42-aab1-48bedbe2da16.png",
                  alt: "AI chatbot embedded in SaaS app"
                },
                {
                  title: "Operational workflows",
                  text: "Connect CRMs, helpdesks, and data stores to trigger smart automations.",
                  image: "/lovable-uploads/5deb9273-b749-4781-803a-ac052ba93374.png",
                  alt: "Automation flow diagram"
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

        <section aria-labelledby="cta" className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta" className="text-2xl md:text-3xl font-semibold">Ready to integrate AI?</h2>
            <p className="mt-3 text-muted-foreground">Speak with 404 Code Lab about your roadmap and opportunities.</p>
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
