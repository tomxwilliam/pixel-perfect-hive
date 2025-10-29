import { ContentBlock } from "@/types/cms";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { HeroBlock } from "./blocks/HeroBlock";
import { FeaturesBlock } from "./blocks/FeaturesBlock";
import { TestimonialsBlock } from "./blocks/TestimonialsBlock";
import { CTABlock } from "./blocks/CTABlock";
import { FAQBlock } from "./blocks/FAQBlock";
import { CardGridBlock } from "./blocks/CardGridBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { ServicesBlock } from "./blocks/ServicesBlock";

interface BlockRendererProps {
  blocks: ContentBlock[];
}

export const BlockRenderer = ({ blocks }: BlockRendererProps) => {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-0">
      {sortedBlocks.map((block) => {
        switch (block.type) {
          case 'text':
            return <TextBlock key={block.id} block={block} />;
          case 'image':
            return <ImageBlock key={block.id} block={block} />;
          case 'hero':
            return <HeroBlock key={block.id} block={block} />;
          case 'features':
            return <FeaturesBlock key={block.id} block={block} />;
          case 'testimonials':
            return <TestimonialsBlock key={block.id} block={block} />;
          case 'cta':
            return <CTABlock key={block.id} block={block} />;
          case 'faq':
            return <FAQBlock key={block.id} block={block} />;
          case 'card_grid':
            return <CardGridBlock key={block.id} block={block} />;
          case 'stats':
            return <StatsBlock key={block.id} block={block} />;
          case 'services':
            return <ServicesBlock key={block.id} block={block} />;
          default:
            console.warn(`Unknown block type: ${(block as any).type}`);
            return null;
        }
      })}
    </div>
  );
};
