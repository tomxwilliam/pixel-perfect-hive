import { CTABlock as CTABlockType } from "@/types/cms";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CTABlockProps {
  block: CTABlockType;
}

export const CTABlock = ({ block }: CTABlockProps) => {
  return (
    <section 
      className="relative py-20 px-4"
      style={block.backgroundImage ? {
        backgroundImage: `url(${block.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      {block.backgroundImage && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}
      <div className="container relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {block.title}
        </h2>
        {block.description && (
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {block.description}
          </p>
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          {block.primaryButtonText && block.primaryButtonLink && (
            <Link to={block.primaryButtonLink}>
              <Button size="lg">
                {block.primaryButtonText}
              </Button>
            </Link>
          )}
          {block.secondaryButtonText && block.secondaryButtonLink && (
            <Link to={block.secondaryButtonLink}>
              <Button size="lg" variant="outline">
                {block.secondaryButtonText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
