import { FeaturesBlock as FeaturesBlockType } from "@/types/cms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as Icons from "lucide-react";

interface FeaturesBlockProps {
  block: FeaturesBlockType;
}

export const FeaturesBlock = ({ block }: FeaturesBlockProps) => {
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
      {(block.title || block.subtitle) && (
        <div className="text-center mb-12">
          {block.title && (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{block.title}</h2>
          )}
          {block.subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {block.subtitle}
            </p>
          )}
        </div>
      )}
      <div className={`grid gap-6 ${gridCols[block.columns || 3]}`}>
        {block.features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              {feature.icon && (
                <div className="mb-2 text-primary">
                  {getIcon(feature.icon)}
                </div>
              )}
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
