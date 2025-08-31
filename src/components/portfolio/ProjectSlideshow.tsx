import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Globe, ChevronLeft, ChevronRight } from "lucide-react";

interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
}

interface ProjectSlideshowProps {
  title: string;
  description: string;
  features: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
  images: ProjectImage[];
  liveUrl: string;
  gradient: "primary" | "accent";
}

export const ProjectSlideshow = ({
  title,
  description,
  features,
  images,
  liveUrl,
  gradient
}: ProjectSlideshowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const gradientClasses = {
    primary: {
      card: "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30",
      icon: "bg-primary/20 text-primary",
      button: "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
      slideshow: "from-primary/20 to-accent/20"
    },
    accent: {
      card: "bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30",
      icon: "bg-accent/20 text-accent",
      button: "bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90",
      slideshow: "from-accent/20 to-primary/20"
    }
  };

  const styles = gradientClasses[gradient];

  return (
    <Card className={styles.card}>
      <CardContent className="p-8 lg:p-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center mb-6">
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mr-4", styles.icon)}>
                {features[0]?.icon}
              </div>
              <div>
                <h3 className={cn("text-2xl font-bold mb-2", gradient === "primary" ? "text-primary" : "text-accent")}>
                  {title}
                </h3>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {description}
            </p>
            
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-muted-foreground">
                  {feature.icon}
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className={cn("bg-gradient-to-br rounded-2xl p-8", `from-${gradient}/20 to-${gradient === "primary" ? "accent" : "primary"}/20`)}>
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative group">
                        <img 
                          src={image.src} 
                          alt={image.alt} 
                          className="w-full h-64 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105" 
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3 rounded-b-lg">
                            <p className="text-sm">{image.caption}</p>
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-lg" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-lg" />
              </Carousel>
              
              {/* Slide indicators */}
              <div className="flex justify-center mt-4 space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200",
                      index === currentSlide 
                        ? (gradient === "primary" ? "bg-primary" : "bg-accent") 
                        : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              
              {/* Slide counter */}
              <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {currentSlide + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};