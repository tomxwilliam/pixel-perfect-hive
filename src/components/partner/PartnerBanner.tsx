import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Server } from 'lucide-react';

const PartnerBanner = () => {
  return (
    <Card className="card-premium border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Server className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              Premium Hosting with 20i
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get reliable, high-performance hosting for your website. We've partnered with 20i to offer you industry-leading hosting solutions with excellent support and uptime.
            </p>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => window.open('https://www.20i.com/managed-cloud-hosting?rafMzQ1NzA4Mg', '_blank')}
              className="gap-2"
            >
              View Hosting Plans
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerBanner;
