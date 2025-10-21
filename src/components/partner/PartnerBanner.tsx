import { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const BANNER_DISMISSED_KEY = "partner_banner_dismissed";

export default function PartnerBanner() {
  const [isDismissed, setIsDismissed] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    setIsDismissed(dismissed === "true");
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <Card className="relative p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-5 w-5" />
      </button>
      
      <div className="pr-8">
        <h3 className="text-xl font-bold mb-2">Need hosting & a domain?</h3>
        <p className="text-muted-foreground mb-4">
          We partner with 20i for fast, secure UK hosting. Set up in minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate("/partner/hosting")}>
            Get Hosting & Domain
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3">
          Affiliate disclosure: we may earn a commission at no extra cost to you.
        </p>
      </div>
    </Card>
  );
}
