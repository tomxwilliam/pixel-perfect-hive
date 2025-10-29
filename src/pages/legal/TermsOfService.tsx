import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";
import { usePageContent } from "@/hooks/usePageContent";

export default function TermsOfService() {
  const { data: pageContent } = usePageContent('/legal/terms');
  
  return (
    <>
      <Seo
        title={pageContent?.meta_title || "Terms of Service - 404 Code Lab"}
        description={pageContent?.meta_description || "Read the terms of service."}
        canonicalUrl={pageContent?.canonical_url}
        noIndex={pageContent?.no_index}
      />
      <div className="min-h-screen bg-background">
        <StaticNavigation />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Terms of Service
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These Terms govern your use of services provided by 404 Code Lab. By signing up for our services, you agree to these Terms.
              </p>
            </header>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Service Use</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Accounts must be created with accurate information</li>
                  <li>You are responsible for keeping your login details secure</li>
                  <li>Services must not be used for illegal activities, spam, or harmful behaviour</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Billing &amp; Renewals</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Subscriptions are billed annually</li>
                  <li>Payment must be made in advance</li>
                  <li>Services automatically renew unless cancelled before the renewal date</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Cancellation &amp; Suspension</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>You may cancel at any time (see Refund Policy)</li>
                  <li>We reserve the right to suspend or terminate services if you breach these Terms</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Liability Disclaimer</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Services are provided "as is" without guarantees</li>
                  <li>We are not liable for downtime, data loss, or indirect damages</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms are governed by the laws of Scotland, United Kingdom.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact</h2>
                <p className="text-muted-foreground">
                  For any issues, email <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80">hello@404codelab.com</a>
                </p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}