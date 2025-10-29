import { CardGridBlock as CardGridBlockType } from "@/types/cms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";

interface CardGridBlockProps {
  block: CardGridBlockType;
}

export const CardGridBlock = ({ block }: CardGridBlockProps) => {
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon className="w-8 h-8" /> : null;
  };

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  return (
    <section className="py-16">
      {block.title && (
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {block.title}
        </h2>
      )}
      <div className={`grid gap-6 ${gridCols[block.columns || 3]}`}>
        {block.cards.map((card, index) => {
          const cardContent = (
            <Card className="h-full hover:shadow-lg transition-shadow">
              {card.image && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img 
                    src={card.image} 
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                {card.icon && (
                  <div className="mb-2 text-primary">
                    {getIcon(card.icon)}
                  </div>
                )}
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          );

          return card.link ? (
            <Link key={index} to={card.link}>
              {cardContent}
            </Link>
          ) : (
            <div key={index}>
              {cardContent}
            </div>
          );
        })}
      </div>
    </section>
  );
};
