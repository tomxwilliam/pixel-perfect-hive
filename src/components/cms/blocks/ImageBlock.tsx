import { ImageBlock as ImageBlockType } from "@/types/cms";

interface ImageBlockProps {
  block: ImageBlockType;
}

export const ImageBlock = ({ block }: ImageBlockProps) => {
  return (
    <figure className="my-8">
      <img
        src={block.src}
        alt={block.alt}
        className="w-full h-auto rounded-lg shadow-lg"
        style={{
          width: block.width || '100%',
          height: block.height || 'auto',
        }}
      />
      {block.caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
};
