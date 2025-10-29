import { FAQBlock as FAQBlockType } from "@/types/cms";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQBlockProps {
  block: FAQBlockType;
}

export const FAQBlock = ({ block }: FAQBlockProps) => {
  return (
    <section className="py-16">
      {block.title && (
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {block.title}
        </h2>
      )}
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {block.items.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <div 
                  className="prose prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
