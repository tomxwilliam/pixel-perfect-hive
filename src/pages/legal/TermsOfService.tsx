import { Link } from "react-router-dom";
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

            <div className="prose prose-lg max-w-none dark:prose-invert space-y-8">
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Attribution</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    All clients agree that every website, landing page, or web application created by 404 Code Lab will display the text 
                    <strong className="text-foreground"> "Website created by 404CodeLab.com"</strong> in the footer on all public pages.
                  </p>
                  <p>
                    Clients agree not to remove, hide, or alter this credit without written permission from 404 Code Lab.
                  </p>
                  <p>
                    <strong className="text-foreground">Optional Paid Add-on:</strong> We offer an optional service to remove the footer credit. 
                    Please contact us at <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80">hello@404codelab.com</a> for pricing.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Portfolio Use</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    By engaging our services, clients grant 404 Code Lab a worldwide, royalty-free, non-exclusive licence to use their website, 
                    logo, branding, screenshots, and URLs in portfolios, case studies, and marketing materials.
                  </p>
                  <p>
                    This includes use on:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The 404 Code Lab website</li>
                    <li>Social media platforms (LinkedIn, Twitter, Instagram, TikTok, Behance, etc.)</li>
                    <li>Proposal documents and pitch decks</li>
                    <li>Presentations and conferences</li>
                    <li>Marketing materials and advertisements</li>
                  </ul>
                  <p>
                    If you require confidentiality or do not wish your project to be featured, please notify us in writing before work commences.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Data Protection and Privacy (UK GDPR)</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    404 Code Lab complies with UK GDPR and the Data Protection Act 2018. We are committed to protecting your personal data 
                    and respecting your privacy rights.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">What Data We Collect</h3>
                  <p>We collect and process the following types of data:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-foreground">Contact Information:</strong> Name, email address, phone number, company name, and postal address</li>
                    <li><strong className="text-foreground">Account Information:</strong> Username, password (encrypted), profile details</li>
                    <li><strong className="text-foreground">Project Information:</strong> Project requirements, files, content, feedback, and communications</li>
                    <li><strong className="text-foreground">Technical Data:</strong> IP address, browser type, device information, cookies, and usage analytics</li>
                    <li><strong className="text-foreground">Financial Data:</strong> Billing address and payment transaction details (we do not store full card details)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Why We Collect Data</h3>
                  <p>We process your data under the following lawful bases:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-foreground">Contract:</strong> To deliver the services you have requested and fulfil our contractual obligations</li>
                    <li><strong className="text-foreground">Legitimate Interests:</strong> To improve our services, send marketing communications (with opt-out), and protect against fraud</li>
                    <li><strong className="text-foreground">Legal Obligation:</strong> To comply with tax, accounting, and regulatory requirements</li>
                    <li><strong className="text-foreground">Consent:</strong> Where required, such as for cookies and analytics (managed through our cookie consent banner)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Where We Store Data</h3>
                  <p>
                    Your data is stored securely on servers within the UK and European Economic Area (EEA). We use reputable third-party services 
                    including Supabase, Stripe, and cloud hosting providers. These providers comply with UK GDPR standards.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">How Long We Keep Data</h3>
                  <p>We retain data for the following periods:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-foreground">Active Clients:</strong> For the duration of our relationship and 7 years after for tax and legal purposes</li>
                    <li><strong className="text-foreground">Marketing Data:</strong> Until you unsubscribe or request deletion</li>
                    <li><strong className="text-foreground">Technical Logs:</strong> Up to 12 months for security and troubleshooting</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Who We Share Data With</h3>
                  <p>We may share your data with:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Payment processors (Stripe, Tide) for billing</li>
                    <li>Hosting and infrastructure providers (Netlify, Supabase, AWS)</li>
                    <li>Email service providers (for transactional and marketing emails)</li>
                    <li>Analytics providers (Google Analytics, with anonymised data if consent given)</li>
                    <li>Legal and regulatory authorities when required by law</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Your Rights</h3>
                  <p>Under UK GDPR, you have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access your personal data</li>
                    <li>Rectify inaccurate data</li>
                    <li>Request deletion of your data (subject to legal retention requirements)</li>
                    <li>Restrict or object to processing</li>
                    <li>Data portability</li>
                    <li>Withdraw consent at any time</li>
                    <li>Lodge a complaint with the Information Commissioner's Office (ICO)</li>
                  </ul>
                  <p>
                    To exercise any of these rights, contact us at <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80">hello@404codelab.com</a>
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Client Responsibilities</h3>
                  <p>
                    <strong className="text-foreground">Important:</strong> Clients remain responsible for compliance with data protection laws 
                    relating to their own website visitors. This includes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Providing a privacy notice on your website</li>
                    <li>Implementing cookie consent banners where required</li>
                    <li>Handling data subject requests from your users</li>
                    <li>Complying with industry-specific regulations (e.g., marketing, healthcare, finance)</li>
                  </ul>
                  <p>
                    For full details, please see our <Link to="/legal/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Payments and Refunds</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Payment Terms:</strong> Invoices are due within the payment terms specified on each invoice, 
                    typically 7 to 14 days from issue unless otherwise agreed in writing.
                  </p>
                  <p>
                    <strong className="text-foreground">Late Payments:</strong> If payment is not received by the due date, we reserve the right to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Pause all active work on your project</li>
                    <li>Suspend access to staging environments or development platforms</li>
                    <li>Suspend hosting services after providing reasonable notice</li>
                    <li>Charge interest on overdue invoices at 8% above the Bank of England base rate per annum</li>
                  </ul>
                  <p>
                    <strong className="text-foreground">Refunds:</strong> Work that has already been delivered or started is non-refundable. 
                    We operate on a milestone-based payment structure, and once a milestone is approved and paid, it cannot be refunded.
                  </p>
                  <p>
                    <strong className="text-foreground">Deposits:</strong> Project deposits are non-refundable once work has commenced, as they cover 
                    initial setup, planning, and resource allocation.
                  </p>
                  <p>
                    For full refund terms, see our <Link to="/legal/refunds" className="text-primary hover:text-primary/80">Refunds Policy</Link>.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Ownership and Licence</h2>
                <div className="space-y-4 text-muted-foreground">
                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">What You Own</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-foreground">Custom Designs:</strong> All custom designs, graphics, and visual assets created specifically for your project</li>
                    <li><strong className="text-foreground">Your Content:</strong> All text, images, videos, logos, and other content provided by you</li>
                    <li><strong className="text-foreground">Domain Names:</strong> Domain names registered in your name belong to you</li>
                    <li><strong className="text-foreground">Final Deliverables:</strong> The final website, app, or digital product once all invoices are paid in full</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">What We Own</h3>
                  <p>404 Code Lab retains ownership of:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-foreground">Reusable Code:</strong> Template code, frameworks, libraries, and components that we use across multiple projects</li>
                    <li><strong className="text-foreground">Development Tools:</strong> Our proprietary development methodologies, workflows, and internal tools</li>
                    <li><strong className="text-foreground">Pre-existing Assets:</strong> Stock photos, icon libraries, fonts, and third-party resources (subject to their own licences)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Licence Grant</h3>
                  <p>
                    Upon full payment of all outstanding invoices, we grant you a perpetual, worldwide, non-exclusive licence to use the delivered 
                    website, application, or digital product for your business purposes.
                  </p>
                  <p>
                    This licence includes the right to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Operate and display the website or app publicly</li>
                    <li>Make reasonable modifications and updates</li>
                    <li>Transfer the licence if you sell your business (subject to maintaining attribution where required)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Third-Party Licences</h3>
                  <p>
                    Your project may include third-party libraries, frameworks, plugins, or assets (e.g., React, WordPress plugins, fonts). 
                    These remain subject to their original licences (typically open-source licences such as MIT, GPL, Apache 2.0). 
                    You are responsible for complying with those licences.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Hosting and Domain Control</h3>
                  <p>
                    Where we register domains or set up hosting accounts on your behalf, these should be registered in your name or transferred 
                    to your control once fully paid. You will receive login details and full administrative access.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Client Responsibilities</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    As our client, you agree to the following responsibilities:
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Content and Materials</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You are responsible for providing all text, images, videos, logos, and other content in a timely manner</li>
                    <li>You confirm that you have the legal right to use all content you provide, including intellectual property rights and licences</li>
                    <li>You agree that your content does not infringe copyright, trademark, privacy, or other rights of third parties</li>
                    <li>You confirm your content does not contain defamatory, obscene, or illegal material</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Legal Compliance</h3>
                  <p>You are responsible for ensuring your website or app complies with all applicable laws and regulations, including but not limited to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-foreground">Data Protection:</strong> UK GDPR, Data Protection Act 2018, PECR (cookies and electronic marketing)</li>
                    <li><strong className="text-foreground">Accessibility:</strong> Public Sector Bodies Accessibility Regulations 2018, Equality Act 2010</li>
                    <li><strong className="text-foreground">E-commerce:</strong> Consumer Contracts Regulations, Electronic Commerce Regulations</li>
                    <li><strong className="text-foreground">Industry-Specific:</strong> Financial services, healthcare, legal, gambling, and other regulated industries</li>
                    <li><strong className="text-foreground">Advertising Standards:</strong> ASA codes, competition law, and truth-in-advertising requirements</li>
                  </ul>
                  <p>
                    While we can provide guidance and implement technical solutions (e.g., cookie banners), ultimate legal responsibility rests with you.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Feedback and Approvals</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You agree to provide timely feedback and approvals at project milestones</li>
                    <li>Delays in providing feedback may result in project timeline extensions</li>
                    <li>Once you approve a milestone, changes may be subject to additional charges</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Service Limits and Liability</h2>
                <div className="space-y-4 text-muted-foreground">
                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Limitation of Liability</h3>
                  <p>
                    To the fullest extent permitted by law, 404 Code Lab's total liability for any claims arising from our services is limited to 
                    the total amount you have paid to us in the 12 months immediately preceding the claim.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Exclusions</h3>
                  <p>We exclude liability for:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Loss of profits, revenue, business, contracts, or anticipated savings</li>
                    <li>Loss of data or corruption of data</li>
                    <li>Business interruption or loss of business opportunity</li>
                    <li>Any indirect or consequential losses</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Third-Party Service Providers</h3>
                  <p>
                    We are not responsible for failures, downtime, data loss, or issues caused by third-party services including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Hosting providers (Netlify, Vercel, AWS, etc.)</li>
                    <li>Domain registrars and DNS providers</li>
                    <li>Email service providers</li>
                    <li>Payment gateways (Stripe, PayPal, etc.)</li>
                    <li>Content delivery networks (CDNs)</li>
                    <li>Third-party APIs and integrations</li>
                  </ul>
                  <p>
                    While we select reputable providers, uptime, performance, and security depend on their infrastructure and terms of service.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">No Warranties</h3>
                  <p>
                    Services are provided "as is" without warranties of any kind, express or implied. We do not guarantee that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Your website or app will be 100% error-free or uninterrupted</li>
                    <li>Your website will achieve specific search engine rankings or traffic levels</li>
                    <li>Your website will generate a specific amount of sales or conversions</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">What We Do Guarantee</h3>
                  <p>We commit to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Delivering work that meets the agreed specifications and brief</li>
                    <li>Using industry best practices in design and development</li>
                    <li>Providing professional service with reasonable skill and care</li>
                    <li>Fixing genuine bugs and errors discovered within the agreed support period</li>
                  </ul>

                  <p className="text-sm italic mt-4">
                    Nothing in these terms excludes or limits our liability for death or personal injury caused by negligence, fraud or fraudulent 
                    misrepresentation, or any other liability that cannot be excluded or limited under UK law.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Support and Maintenance</h2>
                <div className="space-y-4 text-muted-foreground">
                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Included Support</h3>
                  <p>
                    After project launch, we provide <strong className="text-foreground">30 days of complimentary support</strong> which includes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Fixing genuine bugs and errors in functionality that we developed</li>
                    <li>Minor adjustments to delivered designs (within reason)</li>
                    <li>Technical support and guidance on using your new website or app</li>
                    <li>Assistance with content updates (time-limited)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">What Counts as Paid Change Requests</h3>
                  <p>The following are <strong className="text-foreground">not</strong> included in complimentary support and will be quoted separately:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>New features or functionality not in the original scope</li>
                    <li>Design changes beyond minor tweaks</li>
                    <li>Content writing, photography, or videography</li>
                    <li>Integration with new third-party services or APIs</li>
                    <li>Major restructuring of site architecture or navigation</li>
                    <li>Additional pages or sections beyond the original agreement</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Ongoing Maintenance Plans</h3>
                  <p>
                    We offer optional monthly maintenance plans which include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Regular security updates and patches</li>
                    <li>Software and plugin updates (WordPress, frameworks, dependencies)</li>
                    <li>Monthly backups and recovery</li>
                    <li>Priority support response times</li>
                    <li>Performance monitoring and optimization</li>
                    <li>Included hours for content updates or minor changes</li>
                  </ul>
                  <p>
                    Contact us at <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80">hello@404codelab.com</a> for maintenance plan pricing and options.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Security Updates</h3>
                  <p>
                    <strong className="text-foreground">Critical security updates</strong> (e.g., patching known vulnerabilities in WordPress or major libraries) 
                    are separate services unless you have an active maintenance plan. While we will notify you of critical security issues, 
                    you are responsible for authorising and paying for updates outside the support period.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Response Times</h3>
                  <p>Support requests are handled during UK business hours (Monday–Friday, 9am–5pm). Response times:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-foreground">Critical Issues:</strong> Within 4 business hours</li>
                    <li><strong className="text-foreground">Non-Critical Issues:</strong> Within 2 business days</li>
                    <li><strong className="text-foreground">Change Requests:</strong> Quote provided within 3 business days</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Suspension and Termination</h2>
                <div className="space-y-4 text-muted-foreground">
                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Our Right to Suspend or Terminate</h3>
                  <p>404 Code Lab reserves the right to suspend or terminate services immediately if:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-foreground">Non-Payment:</strong> Invoices remain unpaid beyond 30 days after the due date (after reasonable notice)</li>
                    <li><strong className="text-foreground">Illegal Activity:</strong> Your website or app is used for illegal purposes, fraud, or content that violates UK law</li>
                    <li><strong className="text-foreground">Abuse:</strong> Harassment, threatening behaviour, or abusive conduct toward our team</li>
                    <li><strong className="text-foreground">Security Risk:</strong> Your site is compromised and poses a risk to our infrastructure or other clients</li>
                    <li><strong className="text-foreground">Terms Breach:</strong> Material breach of these terms that is not remedied within 14 days of written notice</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Your Right to Terminate</h3>
                  <p>
                    You may terminate services at any time by giving us <strong className="text-foreground">30 days' written notice</strong>. 
                    However:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You remain liable for payment of all work completed or in progress up to the termination date</li>
                    <li>Deposits and milestone payments already made are non-refundable</li>
                    <li>We will provide you with all work completed to date in a reasonable format</li>
                    <li>Ongoing hosting or maintenance services will be terminated at the end of the notice period</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Effect of Termination</h3>
                  <p>Upon termination:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You will receive all source files, designs, and deliverables for work that has been paid for</li>
                    <li>You must immediately settle any outstanding invoices</li>
                    <li>Access to staging environments, development platforms, and support will be revoked</li>
                    <li>Hosting services will be cancelled (with data export provided where feasible)</li>
                    <li>Attribution requirements remain in place unless separately agreed</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Survival of Terms</h3>
                  <p>
                    The following sections survive termination: Attribution, Portfolio Use, Ownership and Licence, Limitation of Liability, and Confidentiality.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Changes to These Terms</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    404 Code Lab reserves the right to update or modify these Terms and Conditions at any time to reflect changes in our services, 
                    legal requirements, or business practices.
                  </p>
                  <p>
                    <strong className="text-foreground">How We Notify You:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The latest version will always be available at <Link to="/legal/terms" className="text-primary hover:text-primary/80">404codelab.com/legal/terms</Link></li>
                    <li>Material changes will be communicated by email to active clients</li>
                    <li>A notification may also appear in your customer dashboard if applicable</li>
                    <li>The "Last Updated" date at the top of this page will be revised</li>
                  </ul>
                  <p>
                    <strong className="text-foreground">Your Acceptance:</strong> Continued use of our services after changes are published constitutes 
                    acceptance of the updated terms. If you do not agree to the changes, you must stop using our services and notify us in writing.
                  </p>
                  <p>
                    <strong className="text-foreground">Existing Projects:</strong> For projects already in progress, the terms in effect at the time 
                    of contract signing will generally apply unless both parties agree otherwise in writing.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Governing Law and Jurisdiction</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    These Terms and Conditions are governed by the laws of <strong className="text-foreground">Scotland, United Kingdom</strong>.
                  </p>
                  <p>
                    Any disputes arising from these terms or our services will be subject to the exclusive jurisdiction of the Scottish courts, 
                    unless you are a consumer in which case you may bring proceedings in your local court.
                  </p>
                  <p>
                    We are committed to resolving disputes amicably. Before initiating legal proceedings, we encourage clients to contact us 
                    to discuss the matter and attempt a mutual resolution.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Contact Information</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    If you have any questions, concerns, or requests regarding these Terms and Conditions, please contact us:
                  </p>
                  <div className="bg-muted/50 p-6 rounded-lg mt-4">
                    <p className="font-semibold text-foreground">404 Code Lab</p>
                    <p>📧 Email: <a href="mailto:hello@404codelab.com" className="text-primary hover:text-primary/80">hello@404codelab.com</a></p>
                    <p>📱 Phone: <a href="tel:07496295759" className="text-primary hover:text-primary/80">07496 295759</a></p>
                    <p>🌐 Website: <a href="https://404codelab.com" className="text-primary hover:text-primary/80" target="_blank" rel="noopener noreferrer">404codelab.com</a></p>
                    <p>📍 Based in Scotland, United Kingdom</p>
                  </div>
                </div>
              </section>

              <section className="mb-8 border-t border-border pt-8">
                <p className="text-sm text-muted-foreground italic">
                  <strong className="text-foreground">Last Updated:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-sm text-muted-foreground italic mt-2">
                  By using the services of 404 Code Lab, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
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