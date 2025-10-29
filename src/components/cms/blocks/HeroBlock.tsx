import { HeroBlock as HeroBlockType } from "@/types/cms";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface HeroBlockProps {
  block: HeroBlockType;
}

export const HeroBlock = ({ block }: HeroBlockProps) => {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
  };

  return (
    <section 
      className="relative min-h-[500px] flex items-center justify-center py-20 px-4"
      style={block.backgroundImage ? {
        backgroundImage: `url(${block.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      {block.backgroundImage && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}
      <div className={`container relative z-10 flex flex-col ${alignmentClasses[block.alignment || 'center']} gap-6`}>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          {block.title}
        </h1>
        {block.subtitle && (
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
            {block.subtitle}
          </p>
        )}
        {block.description && (
          <p className="text-lg text-muted-foreground max-w-2xl">
            {block.description}
          </p>
        )}
        {block.ctaText && block.ctaLink && (
          <Link to={block.ctaLink}>
            <Button size="lg" className="mt-4">
              {block.ctaText}
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};
