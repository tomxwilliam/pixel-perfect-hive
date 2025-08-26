import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";

export default function CookiePolicy() {
  return (
    <>
      <Seo
        title="Cookie Policy | 404 Code Lab"
        description="Learn about how 404 Code Lab uses cookies and similar technologies to improve your browsing experience."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Cookie Policy
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                This Cookie Policy explains how 404 Code Lab uses cookies and similar technologies.
              </p>
            </header>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">What Are Cookies?</h2>
                <p className="text-muted-foreground">
                  Cookies are small files stored on your device to improve browsing and remember preferences.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Types of Cookies We Use</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Necessary Cookies</strong> – required for site functionality (e.g., login sessions).</li>
                  <li><strong>Analytics Cookies</strong> – help us understand site performance and improve services.</li>
                  <li><strong>Preference Cookies</strong> – remember your settings (e.g., language, preferences).</li>
                  <li><strong>Third-Party Cookies</strong> – used by services like Google Analytics.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Managing Cookies</h2>
                <p className="text-muted-foreground mb-4">You can:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Adjust your browser settings to block or delete cookies</li>
                  <li>Use cookie consent tools provided on our site</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  <strong>Note:</strong> Disabling cookies may affect site functionality
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Updates</h2>
                <p className="text-muted-foreground">
                  We may update this policy from time to time. Changes will be posted on this page.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact</h2>
                <p className="text-muted-foreground">
                  Questions? Email us at <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80">hello@404codelab.com</a>
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