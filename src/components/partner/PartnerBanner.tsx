import { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const BANNER_DISMISSED_KEY = "partner_banner_dismissed";

export default function PartnerBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    // Show banner by default - only hide if explicitly dismissed
    setIsDismissed(dismissed === "true");
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <Card className="relative p-4 md:p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 rounded-2xl animate-in fade-in-0 slide-in-from-top-2">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 md:top-4 md:right-4 text-muted-foreground hover:text-foreground transition-colors tap-target"
        aria-label="Dismiss hosting partner banner"
      >
        <X className="h-5 w-5" />
      </button>
      
      <div className="pr-10 md:pr-12">
        <h3 className="text-lg md:text-xl font-bold mb-2">Need hosting & a domain?</h3>
        <p className="text-sm md:text-base text-muted-foreground mb-4">
          We partner with 20i for fast, secure UK hosting. Set up in minutes.
        </p>
        
        <Button 
          onClick={() => navigate("/partner/hosting")}
          className="btn-glow tap-target"
          aria-label="Get hosting and domain from 20i partner"
        >
          Get Hosting & Domain
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
        
        <p className="text-xs text-muted-foreground mt-3">
          Affiliate disclosure: we may earn a commission at no extra cost to you.
        </p>
      </div>
    </Card>
  );
}
