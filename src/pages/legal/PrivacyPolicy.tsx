import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";
import { usePageContent } from "@/hooks/usePageContent";

export default function PrivacyPolicy() {
  const { data: pageContent } = usePageContent('/legal/privacy');
  
  return (
    <>
      <Seo
        title={pageContent?.meta_title || "Privacy Policy - 404 Code Lab"}
        description={pageContent?.meta_description || "Read our privacy policy."}
        canonicalUrl={pageContent?.canonical_url}
        noIndex={pageContent?.no_index}
      />
      <div className="min-h-screen bg-background">
        <StaticNavigation />
        
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
                <p className="text-muted-foreground mb-4">We do not sell your data.</p>
                <p className="text-muted-foreground mb-2">We may share limited data with:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Payment processors</li>
                  <li>Service providers (for hosting, analytics, or support)</li>
                  <li>Legal authorities (if required by law)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Rights (GDPR)</h2>
                <p className="text-muted-foreground mb-2">You have the right to:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Access the personal data we hold on you</li>
                  <li>Request correction or deletion</li>
                  <li>Restrict or object to processing</li>
                  <li>Withdraw consent at any time</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise your rights, contact us at: <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80 underline">hello@404codelab.com</a>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Retention</h2>
                <p className="text-muted-foreground">
                  We keep your data only as long as necessary to provide services or meet legal obligations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Game Privacy – That's Life</h2>
                <p className="text-muted-foreground mb-4">
                  In addition to our general Privacy Policy, <em>That's Life</em> collects limited gameplay and device data to operate correctly and to improve the player experience.
                </p>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">Data We Collect</h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>Device identifiers (used for analytics and ad tracking, only with user consent)</li>
                  <li>Gameplay progress, story choices, and karma points</li>
                  <li>Optional player nickname or profile (if created)</li>
                  <li>Ad engagement data (for rewarded ads, bonuses, or premium features)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Purpose of Collection</h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>To save and sync gameplay progress across devices</li>
                  <li>To analyse performance and balance features</li>
                  <li>To show optional rewarded ads and premium offers</li>
                  <li>To prevent misuse and ensure app stability</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Data Linked to You</h3>
                <p className="text-muted-foreground mb-4">
                  We do <strong>not</strong> collect personal identifiers such as your real name, email, or payment details within the game. Any device or usage data is linked only to anonymous identifiers.
                </p>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Tracking Transparency (iOS)</h3>
                <p className="text-muted-foreground mb-4">
                  That's Life complies with Apple's App Tracking Transparency (ATT) framework. We only use your device's advertising identifier (IDFA) for analytics or personalised ads <strong>after you grant explicit permission</strong> through the iOS prompt. If permission is denied, ads remain non-personalised.
                </p>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Third-Party SDKs</h3>
                <p className="text-muted-foreground mb-2">We use reputable third-party tools for analytics and advertising:</p>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li><a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">Google AdMob Privacy & Terms</a></li>
                  <li><a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">Firebase Analytics Privacy</a></li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Children's Privacy</h3>
                <p className="text-muted-foreground">
                  That's Life is intended for audiences aged 13+. We do not knowingly collect personal information from children under 13 (or under 16 in the UK/EU). If you believe a child has provided data, contact <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80 underline">hello@404codelab.com</a> for removal.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Game Privacy – BeeVerse</h2>
                <p className="text-muted-foreground mb-4">
                  <em>BeeVerse</em> is a simulation and incremental-progression game. We collect limited gameplay data to maintain save states and improve performance.
                </p>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">Data We Collect</h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>Player progress (honey, bees, research, upgrades)</li>
                  <li>Device identifiers for analytics and ads (only if consented)</li>
                  <li>Reward-ad engagement data</li>
                  <li>In-app purchase receipts (handled securely by Apple or Google)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Purpose of Collection</h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>To maintain and restore gameplay progress</li>
                  <li>To improve balance and user experience</li>
                  <li>To deliver rewarded ads and daily bonuses</li>
                  <li>To process purchases securely via App Store or Google Play</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Data Linked to You</h3>
                <p className="text-muted-foreground mb-4">
                  No personal identifiers (name, email, address) are collected by BeeVerse. In-app purchases are handled directly by the platform provider.
                </p>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Tracking Transparency (iOS)</h3>
                <p className="text-muted-foreground mb-4">
                  BeeVerse uses Apple's ATT framework to request consent before accessing the IDFA for ad tracking. Refusal will not affect gameplay.
                </p>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Third-Party SDKs</h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li><a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">Google AdMob Privacy</a></li>
                  <li><a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">Firebase Privacy</a></li>
                  <li><a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">Apple Privacy Policy</a></li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Children's Privacy</h3>
                <p className="text-muted-foreground">
                  BeeVerse is suitable for players aged 13+. No child-specific data is knowingly collected.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Game Privacy – Murder by Letters</h2>
                <p className="text-muted-foreground mb-4">
                  <em>Murder by Letters</em> is a puzzle mystery game. We collect minimal anonymous gameplay and analytics data to enhance gameplay and fix issues.
                </p>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">Data We Collect</h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>Puzzle and level progress</li>
                  <li>Anonymous analytics on play duration and difficulty</li>
                  <li>Device identifiers (only if consented)</li>
                  <li>Reward-ad engagement data (for hint bonuses)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Purpose of Collection</h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>To save player progress locally or via cloud sync</li>
                  <li>To optimise puzzle balance and game updates</li>
                  <li>To serve optional rewarded ads and hints</li>
                  <li>To maintain game integrity and prevent cheating</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Data Linked to You</h3>
                <p className="text-muted-foreground mb-4">
                  We do not collect or link personal data such as name, email, or location. All analytics are anonymised.
                </p>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Tracking Transparency (iOS)</h3>
                <p className="text-muted-foreground mb-4">
                  Compliant with Apple's ATT framework. Tracking for ads or analytics occurs only after user consent. Declining tracking will not reduce game functionality.
                </p>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Third-Party SDKs</h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li><a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">AdMob Privacy</a></li>
                  <li><a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">Firebase Privacy</a></li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-foreground">Children's Privacy</h3>
                <p className="text-muted-foreground">
                  Intended for general audiences aged 13+. We do not knowingly collect information from children under 13.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
                <p className="text-muted-foreground">
                  For questions about this Privacy Policy or any of our games, contact us at <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80 underline">hello@404codelab.com</a>.
                </p>
                <p className="text-muted-foreground mt-2">
                  404 Code Lab is based in Scotland and operates worldwide.
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