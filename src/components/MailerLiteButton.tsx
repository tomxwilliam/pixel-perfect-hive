import { Mail } from 'lucide-react';

declare global {
  interface Window {
    ml?: (action: string, formId?: string, flag?: boolean) => void;
  }
}

const MailerLiteButton = () => {
  const handleClick = () => {
    if (window.ml) {
      window.ml('show', 'T6SkkF', true);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 group"
      aria-label="Subscribe to newsletter"
    >
      <Mail className="w-5 h-5" />
      <span className="hidden sm:inline font-medium">Subscribe</span>
    </button>
  );
};

export default MailerLiteButton;
