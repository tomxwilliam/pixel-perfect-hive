export type BlockType = 
  | 'text'
  | 'image'
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'cta'
  | 'faq'
  | 'card_grid'
  | 'stats'
  | 'services';

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  alignment?: 'left' | 'center' | 'right';
  className?: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  width?: string;
  height?: string;
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  alignment?: 'left' | 'center';
}

export interface Feature {
  icon?: string;
  title: string;
  description: string;
}

export interface FeaturesBlock extends BaseBlock {
  type: 'features';
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
}

export interface Testimonial {
  name: string;
  role?: string;
  company?: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialsBlock extends BaseBlock {
  type: 'testimonials';
  title?: string;
  testimonials: Testimonial[];
}

export interface CTABlock extends BaseBlock {
  type: 'cta';
  title: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQBlock extends BaseBlock {
  type: 'faq';
  title?: string;
  items: FAQItem[];
}

export interface Card {
  icon?: string;
  title: string;
  description: string;
  link?: string;
  image?: string;
}

export interface CardGridBlock extends BaseBlock {
  type: 'card_grid';
  title?: string;
  cards: Card[];
  columns?: 2 | 3 | 4;
}

export interface Stat {
  value: string;
  label: string;
  icon?: string;
}

export interface StatsBlock extends BaseBlock {
  type: 'stats';
  title?: string;
  stats: Stat[];
}

export interface Service {
  icon: string;
  title: string;
  description: string;
  link?: string;
}

export interface ServicesBlock extends BaseBlock {
  type: 'services';
  title?: string;
  services: Service[];
  layout?: 'grid' | 'list';
}

export type ContentBlock = 
  | TextBlock
  | ImageBlock
  | HeroBlock
  | FeaturesBlock
  | TestimonialsBlock
  | CTABlock
  | FAQBlock
  | CardGridBlock
  | StatsBlock
  | ServicesBlock;
