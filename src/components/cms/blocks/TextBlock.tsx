import { TextBlock as TextBlockType } from "@/types/cms";

interface TextBlockProps {
  block: TextBlockType;
}

export const TextBlock = ({ block }: TextBlockProps) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div 
      className={`prose prose-slate dark:prose-invert max-w-none ${alignmentClasses[block.alignment || 'left']} ${block.className || ''}`}
      dangerouslySetInnerHTML={{ __html: block.content }}
    />
  );
};
