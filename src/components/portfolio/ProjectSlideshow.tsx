import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Globe, ChevronLeft, ChevronRight, X } from "lucide-react";

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
  const [modalSlide, setModalSlide] = useState(0);

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
        <div className="space-y-8">
          {/* Title */}
          <h3 className={cn("text-3xl font-bold text-center", gradient === "primary" ? "text-primary" : "text-accent")}>
            {title}
          </h3>
          
          {/* Image Slideshow */}
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
          
          {/* Description */}
          <p className="text-lg text-muted-foreground text-center leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>
          
          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center text-muted-foreground">
                {feature.icon}
                <span className="ml-2">{feature.text}</span>
              </div>
            ))}
          </div>
          
          {/* View Website Button */}
          <div className="flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button className={cn(styles.button, "animate-fade-in")}>
                  <Globe className="mr-2 h-5 w-5" />
                  View Website
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
                <div className="relative h-full bg-black rounded-lg overflow-hidden">
                  {/* Full-screen Image Slideshow */}
                  <div className="relative h-full">
                    <img 
                      src={images[modalSlide]?.src} 
                      alt={images[modalSlide]?.alt} 
                      className="w-full h-full object-contain" 
                    />
                    
                    {/* Navigation Arrows */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                      onClick={() => setModalSlide(modalSlide > 0 ? modalSlide - 1 : images.length - 1)}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                      onClick={() => setModalSlide(modalSlide < images.length - 1 ? modalSlide + 1 : 0)}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                    
                    {/* Image Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="text-white text-xl font-semibold mb-2">{title}</h4>
                          {images[modalSlide]?.caption && (
                            <p className="text-white/80 text-sm">{images[modalSlide].caption}</p>
                          )}
                        </div>
                        <div className="text-white/60 text-sm">
                          {modalSlide + 1} / {images.length}
                        </div>
                      </div>
                    </div>
                    
                    {/* Thumbnail Navigation */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
                      <div className="flex space-x-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setModalSlide(index)}
                            className={cn(
                              "w-3 h-3 rounded-full transition-all duration-200",
                              index === modalSlide 
                                ? "bg-white" 
                                : "bg-white/40 hover:bg-white/60"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};