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
      <CardContent className="p-4 sm:p-6 lg:p-12">
        <div className="space-y-6 sm:space-y-8">
          {/* Title */}
          <h3 className={cn("text-2xl sm:text-3xl font-bold text-center", gradient === "primary" ? "text-primary" : "text-accent")}>
            {title}
          </h3>
          
          {/* Image Slideshow */}
          <div className="relative">
            <div className={cn("bg-gradient-to-br rounded-2xl p-4 sm:p-6 lg:p-8", `from-${gradient}/20 to-${gradient === "primary" ? "accent" : "primary"}/20`)}>
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer relative">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="relative group">
                              <img 
                                src={image.src} 
                                alt={image.alt} 
                                className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105" 
                              />
                              {/* View Website Overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center space-x-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                  <span className="text-primary font-semibold text-sm sm:text-base">View Website</span>
                                </div>
                              </div>
                              {image.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 sm:p-3 rounded-b-lg">
                                  <p className="text-xs sm:text-sm">{image.caption}</p>
                                </div>
                              )}
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-lg z-10 h-8 w-8 sm:h-10 sm:w-10" />
                      <CarouselNext className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-lg z-10 h-8 w-8 sm:h-10 sm:w-10" />
                    </Carousel>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-6xl w-full h-[85vh] sm:h-[90vh] p-0 m-2 sm:m-4">
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
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 h-10 w-10 sm:h-12 sm:w-12"
                        onClick={() => setModalSlide(modalSlide > 0 ? modalSlide - 1 : images.length - 1)}
                      >
                        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 h-10 w-10 sm:h-12 sm:w-12"
                        onClick={() => setModalSlide(modalSlide < images.length - 1 ? modalSlide + 1 : 0)}
                      >
                        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                      
                      {/* Image Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end space-y-2 sm:space-y-0">
                          <div>
                            <h4 className="text-white text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{title}</h4>
                            {images[modalSlide]?.caption && (
                              <p className="text-white/80 text-xs sm:text-sm">{images[modalSlide].caption}</p>
                            )}
                          </div>
                          <div className="text-white/60 text-xs sm:text-sm">
                            {modalSlide + 1} / {images.length}
                          </div>
                        </div>
                      </div>
                      
                      {/* Thumbnail Navigation */}
                      <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2">
                        <div className="flex space-x-1 sm:space-x-2">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setModalSlide(index)}
                              className={cn(
                                "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200",
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
              
              {/* Slide indicators */}
              <div className="flex justify-center mt-3 sm:mt-4 space-x-1 sm:space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200 touch-manipulation",
                      index === currentSlide 
                        ? (gradient === "primary" ? "bg-primary" : "bg-accent") 
                        : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              
              {/* Slide counter */}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/60 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {currentSlide + 1} / {images.length}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-base sm:text-lg text-muted-foreground text-center leading-relaxed max-w-3xl mx-auto px-2 sm:px-0">
            {description}
          </p>
          
          {/* Features */}
          <div className="space-y-3 sm:space-y-4">
            {features.slice(1).map((feature, index) => (
              <div key={index} className="flex items-center justify-center text-muted-foreground px-4 sm:px-0">
                <div className="flex-shrink-0">{feature.icon}</div>
                <span className="ml-2 text-sm sm:text-base text-center">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Visit Website Button */}
          {liveUrl && (
            <div className="flex justify-center pt-4">
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2",
                  styles.button
                )}
              >
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Visit Website</span>
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};