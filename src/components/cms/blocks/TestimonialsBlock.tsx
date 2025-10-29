import { TestimonialsBlock as TestimonialsBlockType } from "@/types/cms";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface TestimonialsBlockProps {
  block: TestimonialsBlockType;
}

export const TestimonialsBlock = ({ block }: TestimonialsBlockProps) => {
  return (
    <section className="py-16">
      {block.title && (
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {block.title}
        </h2>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {block.testimonials.map((testimonial, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              {testimonial.rating && (
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              )}
              <p className="text-muted-foreground mb-4 italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback>
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  {(testimonial.role || testimonial.company) && (
                    <p className="text-sm text-muted-foreground">
                      {[testimonial.role, testimonial.company].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
