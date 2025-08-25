import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";

export default function PrivacyPolicy() {
  return (
    <>
      <Seo
        title="Privacy Policy | 404 Code Lab"
        description="Learn how 404 Code Lab collects, uses, and protects your personal data in compliance with UK GDPR regulations."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Privacy Policy
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                At 404 Code Lab, your privacy matters to us. This policy explains what information we collect, why we collect it, and how we use and protect it.
              </p>
            </header>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Information We Collect</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Contact details (name, email, phone, billing address)</li>
                  <li>Payment information (processed securely via third-party providers)</li>
                  <li>Account activity and service usage</li>
                  <li>Cookies and analytics data (see our Cookie Policy)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">How We Use Your Information</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>To provide hosting and digital services</li>
                  <li>To process payments and invoices</li>
                  <li>To improve and personalise our services</li>
                  <li>To meet legal and regulatory obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Sharing Your Information</h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell your data. We may share limited data with:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Payment processors</li>
                  <li>Service providers (for hosting, analytics, or support)</li>
                  <li>Legal authorities (if required by law)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Rights (GDPR)</h2>
                <p className="text-muted-foreground mb-4">You have the right to:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Access the personal data we hold on you</li>
                  <li>Request correction or deletion</li>
                  <li>Restrict or object to processing</li>
                  <li>Withdraw consent at any time</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise your rights, contact us at: <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80">hello@404codelab.com</a>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Retention</h2>
                <p className="text-muted-foreground">
                  We keep your data only as long as necessary to provide services or meet legal obligations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
                <p className="text-muted-foreground">
                  For questions about this Privacy Policy, contact us at: <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80">hello@404codelab.com</a>
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