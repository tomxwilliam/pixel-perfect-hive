import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface UseCaseItem {
  title: string;
  text: string;
  image?: string;
  alt?: string;
}

interface LandingTemplateProps {
  title: string;
  intro: string;
  features: string[];
  benefits?: string[];
  useCases: UseCaseItem[];
  ctaLabel?: string;
  ctaHref?: string;
  icon?: ReactNode;
  seo?: { title: string; description: string; noIndex?: boolean };
}

export default function LandingTemplate({
  title,
  intro,
  features,
  benefits,
  useCases,
  ctaLabel = "Get a Quote",
  ctaHref = "/contact",
  icon,
  seo,
}: LandingTemplateProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    provider: { "@type": "Organization", name: "404 Code Lab" },
    description: seo?.description || intro,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {seo && <Seo title={seo.title} description={seo.description} jsonLd={jsonLd} noIndex={seo.noIndex} />}
      <Navigation />
      <main>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Badge variant="secondary" className="mb-4">Landing</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">{intro}</p>
            <div className="mt-6">
              <Button asChild>
                <Link to={ctaHref} aria-label={ctaLabel}>{ctaLabel}</Link>
              </Button>
            </div>
          </div>
        </header>

        <section aria-labelledby="key-points" className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-2">
            <div>
              <h2 id="key-points" className="text-xl md:text-2xl font-semibold mb-4">Key Features</h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                {features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            {benefits && benefits.length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-semibold mb-4">Benefits</h2>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {benefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="use-cases" className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="use-cases" className="text-xl md:text-2xl font-semibold mb-6">Example use cases</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {useCases.map((u) => (
                <Card key={u.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{u.title}</CardTitle>
                    <CardDescription>{u.text}</CardDescription>
                  </CardHeader>
                  {u.image && (
                    <CardContent className="pt-0 pb-6">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.image}
                        alt={u.alt || u.title}
                        loading="lazy"
                        className="w-full rounded-md border"
                      />
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="cta" className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta" className="text-2xl md:text-3xl font-semibold">Start your project</h2>
            <p className="mt-3 text-muted-foreground">Tell us about your requirements and we’ll send a tailored quote.</p>
            <div className="mt-6">
              <Button asChild>
                <Link to={ctaHref} aria-label={ctaLabel}>{ctaLabel}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
