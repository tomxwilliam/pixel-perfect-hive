import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";

export default function RefundsPolicy() {
  return (
    <>
      <Seo
        title="Refunds & Cancellations Policy | 404 Code Lab"
        description="Learn about 404 Code Lab's refund and cancellation policy, including your 14-day cooling-off period under UK law."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Refunds &amp; Cancellations Policy
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                At 404 Code Lab, we aim to keep our policies fair and transparent.
              </p>
            </header>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Cooling-Off Period</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Under UK law, consumers are entitled to a 14-day cooling-off period from the date of purchase</li>
                  <li>If you cancel within 14 days, you may receive a full refund, provided the service has not already been fully delivered or used</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Refunds After Cooling-Off</h2>
                <p className="text-muted-foreground mb-4">Refunds may be considered if:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Services were not provided as described</li>
                  <li>A billing error occurred</li>
                </ul>
                
                <p className="text-muted-foreground mb-4 mt-6">Refunds will not apply if:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Services were used or activated beyond the cooling-off period</li>
                  <li>Terms of Service were breached</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Cancellations</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>You can cancel at any time via your customer portal or by contacting <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80">hello@404codelab.com</a></li>
                  <li>Cancellations take effect at the end of your current billing cycle unless otherwise agreed</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Auto-Renewals</h2>
                <p className="text-muted-foreground">
                  All subscriptions auto-renew annually unless cancelled before the renewal date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact</h2>
                <p className="text-muted-foreground">
                  For refund requests or questions, contact us at: <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80">hello@404codelab.com</a>
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