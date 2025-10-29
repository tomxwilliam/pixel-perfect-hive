import { StaticNavigation } from "@/components/StaticNavigation";
import { Footer } from "@/components/Footer";
import Seo from "@/components/Seo";
import { usePageContent } from "@/hooks/usePageContent";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { Settings } from "lucide-react";

export default function CookiePolicy() {
  const { openPreferenceCenter } = useCookieConsent();
  const { data: pageContent } = usePageContent('/legal/cookies');

  return (
    <>
      <Seo
        title={pageContent?.meta_title || "Cookie Policy - 404 Code Lab"}
        description={pageContent?.meta_description || "Learn how we use cookies."}
        canonicalUrl={pageContent?.canonical_url}
        noIndex={pageContent?.no_index}
      />
      <div className="min-h-screen bg-background">
        <StaticNavigation />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Cookie Policy
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                This Cookie Policy explains how 404 Code Lab uses cookies and similar technologies.
              </p>
              <Button onClick={openPreferenceCenter} size="lg">
                <Settings className="mr-2 h-4 w-4" />
                Manage Cookie Preferences
              </Button>
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
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Necessary Cookies</h3>
                    <p className="text-muted-foreground mb-3">
                      These cookies are essential for the website to function properly and cannot be disabled in our systems.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-border rounded-lg">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Cookie Name</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Purpose</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="px-4 py-2 text-sm">sb-access-token</td>
                            <td className="px-4 py-2 text-sm">User authentication and session management</td>
                            <td className="px-4 py-2 text-sm">1 hour</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm">sb-refresh-token</td>
                            <td className="px-4 py-2 text-sm">Session refresh token</td>
                            <td className="px-4 py-2 text-sm">30 days</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm">cookie-consent-preferences</td>
                            <td className="px-4 py-2 text-sm">Stores your cookie consent choices</td>
                            <td className="px-4 py-2 text-sm">1 year</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Preference Cookies</h3>
                    <p className="text-muted-foreground mb-3">
                      These cookies allow the website to remember choices you make (such as your theme preference) and provide enhanced features.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-border rounded-lg">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Cookie Name</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Purpose</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="px-4 py-2 text-sm">vite-ui-theme</td>
                            <td className="px-4 py-2 text-sm">Stores your light/dark theme preference</td>
                            <td className="px-4 py-2 text-sm">Persistent</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm">sidebar:state</td>
                            <td className="px-4 py-2 text-sm">Remembers sidebar open/closed state</td>
                            <td className="px-4 py-2 text-sm">Persistent</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Analytics Cookies</h3>
                    <p className="text-muted-foreground mb-3">
                      These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-border rounded-lg">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Cookie Name</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Purpose</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="px-4 py-2 text-sm">_ga</td>
                            <td className="px-4 py-2 text-sm">Google Analytics - distinguish unique users</td>
                            <td className="px-4 py-2 text-sm">2 years</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm">_gid</td>
                            <td className="px-4 py-2 text-sm">Google Analytics - distinguish unique users</td>
                            <td className="px-4 py-2 text-sm">24 hours</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm">_ga_*</td>
                            <td className="px-4 py-2 text-sm">Google Analytics - persist session state</td>
                            <td className="px-4 py-2 text-sm">2 years</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Note:</strong> Analytics cookies are only set if you consent to them.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Marketing Cookies</h3>
                    <p className="text-muted-foreground">
                      We currently do not use marketing cookies. If we do in the future, we will update this policy and request your consent.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">How We Use Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  We use cookies for the following purposes:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li>
                    <strong>Authentication & Security:</strong> To keep you logged in securely and protect against unauthorized access to your account.
                  </li>
                  <li>
                    <strong>User Experience:</strong> To remember your preferences (like theme settings) so you have a consistent experience across visits.
                  </li>
                  <li>
                    <strong>Analytics & Performance:</strong> To understand how you use our website and identify areas for improvement (only with your consent).
                  </li>
                  <li>
                    <strong>Functionality:</strong> To enable features like the customer portal, project management tools, and support systems.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Managing Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  You have full control over which cookies we use. Here are your options:
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Using Our Cookie Preference Center</h3>
                    <p className="text-muted-foreground mb-2">
                      Click the button below to manage your cookie preferences at any time:
                    </p>
                    <Button onClick={openPreferenceCenter} variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Open Cookie Preferences
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Browser Settings</h3>
                    <p className="text-muted-foreground mb-2">
                      You can also control cookies through your browser settings:
                    </p>
                    <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                      <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                      <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                      <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                      <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                    </ul>
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Important:</strong> Disabling necessary cookies will prevent you from using essential features like logging in to your account. Disabling preference cookies will reset your settings on each visit.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Rights (GDPR & UK GDPR)</h2>
                <p className="text-muted-foreground mb-4">
                  Under data protection laws, you have rights regarding cookies:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Right to be informed:</strong> You have the right to clear information about cookies (this policy).</li>
                  <li><strong>Right to consent:</strong> We ask for your consent before setting non-essential cookies.</li>
                  <li><strong>Right to withdraw:</strong> You can withdraw consent at any time through our preference center.</li>
                  <li><strong>Right to object:</strong> You can object to processing via browser settings or our tools.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Updates to This Policy</h2>
                <p className="text-muted-foreground mb-2">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.
                </p>
                <p className="text-muted-foreground">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
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