import { ServicesBlock as ServicesBlockType } from "@/types/cms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";

interface ServicesBlockProps {
  block: ServicesBlockType;
}

export const ServicesBlock = ({ block }: ServicesBlockProps) => {
  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon className="w-12 h-12" /> : null;
  };

  const gridCols = block.layout === 'list' ? 'grid-cols-1' : 'md:grid-cols-3';

  return (
    <section className="py-16">
      {block.title && (
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {block.title}
        </h2>
      )}
      <div className={`grid gap-6 ${gridCols}`}>
        {block.services.map((service, index) => {
          const cardContent = (
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-4 text-primary">
                  {getIcon(service.icon)}
                </div>
                <CardTitle className="text-2xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          );

          return service.link ? (
            <Link key={index} to={service.link}>
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
