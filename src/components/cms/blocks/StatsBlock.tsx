import { StatsBlock as StatsBlockType } from "@/types/cms";
import { Card, CardContent } from "@/components/ui/card";
import * as Icons from "lucide-react";

interface StatsBlockProps {
  block: StatsBlockType;
}

export const StatsBlock = ({ block }: StatsBlockProps) => {
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon className="w-6 h-6" /> : null;
  };

  return (
    <section className="py-16">
      {block.title && (
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {block.title}
        </h2>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {block.stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6 text-center">
              {stat.icon && (
                <div className="flex justify-center mb-3 text-primary">
                  {getIcon(stat.icon)}
                </div>
              )}
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
