export interface PartnerConfig {
  affiliateUrl: string;
  partnerName: string;
}

export interface PartnerFeature {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PartnerStep {
  step: number;
  title: string;
  description: string;
}

export interface PartnerFAQ {
  question: string;
  answer: string;
}
