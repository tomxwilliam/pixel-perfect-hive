export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function generateExcerpt(content: string, maxLength = 160): string {
  const stripped = content.replace(/<[^>]+>/g, '');
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength).trim() + '...';
}
