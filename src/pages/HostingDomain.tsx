import HostingDomainCheckout from "@/components/customer/HostingDomainCheckout";
import Seo from "@/components/Seo";

export default function HostingDomainPage() {
  return (
    <>
      <Seo 
        title="Hosting & Domain Checkout"
        description="Get web hosting and register your domain in one simple checkout"
      />
      <div className="min-h-screen bg-background py-8">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Hosting & Domain Checkout</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get professional web hosting and register your perfect domain name in one seamless checkout process.
            </p>
          </div>
          <HostingDomainCheckout />
        </div>
      </div>
    </>
  );
}