import { Link } from "react-router-dom";
import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePageContent } from "@/hooks/usePageContent";

export default function AIIntegration() {
  const { data: pageContent } = usePageContent('/services/ai-integration');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo 
        title={pageContent?.meta_title || "AI Integration Services - Add Intelligence to Your Apps | 404 Code Lab"}
        description={pageContent?.meta_description || "Professional AI integration services for websites and mobile apps."}
        canonicalUrl={pageContent?.canonical_url || "https://404codelab.com/services/ai-integration"}
      />
      <StaticNavigation />
      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-background via-primary/10 to-accent/10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-2">
              🤖 AI Integration
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              AI Integration into Apps and Websites
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From discovery to deployment, we embed production-ready AI into your product: strategy, model selection, data pipelines,
              safety guardrails, and UX integration. Ship assistants, automation, analytics, and personalisation that measurably move the needle.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/contact" aria-label="Get a quote for AI integration">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="features" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 id="features" className="text-3xl font-bold mb-6 text-primary">What we build</h2>
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

        <section aria-labelledby="use-cases" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 id="use-cases" className="text-3xl font-bold mb-6 text-primary">Use cases</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "E‑commerce personalisation",
                  text: "Boost AOV with intelligent recommendations and semantic search.",
                  image: "/lovable-uploads/4823f2ae-5275-4f6c-8ea9-0d29e5f8e011.png",
                  alt: "AI powered recommendations UI mockup"
                },
                {
                  title: "SaaS support automation",
                  text: "Deflect tickets with an in-app assistant trained on your docs and data.",
                  image: "/lovable-uploads/593bb6c4-a62b-47c4-9a2f-9223d539bff7.png",
                  alt: "AI chatbot embedded in SaaS app"
                },
                {
                  title: "Operational workflows",
                  text: "Connect CRMs, helpdesks, and data stores to trigger smart automations.",
                  image: "/lovable-uploads/11dd4a5f-f848-489c-876d-1b24c2201d72.png",
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

        <section aria-labelledby="cta" className="py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 id="cta" className="text-3xl font-bold">Ready to integrate AI?</h2>
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
