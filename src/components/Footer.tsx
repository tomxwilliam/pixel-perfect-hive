import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, Coffee, MessageCircle } from "lucide-react";
import { FaTiktok, FaXTwitter, FaBehance } from "react-icons/fa6";
import { useTheme } from "@/hooks/useTheme";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export const Footer = () => {
  const { theme } = useTheme();
  const { openPreferenceCenter } = useCookieConsent();
  
  // Determine if we're in dark mode
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Choose footer logo based on theme - using new footer-specific logos
  const logoSrc = isDarkMode 
    ? "/assets/footer-logo-dark.png"  // Dark theme footer logo
    : "/assets/footer-logo-light.png"; // Light theme footer logo

  return (
    <footer className="bg-background border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="w-16 h-16 flex items-center justify-center mb-4">
              <img 
                src={logoSrc} 
                alt="404 Code Lab Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Scottish-based indie dev studio creating standout digital experiences. 
              Bold ideas, pixel-perfect reality.
            </p>
            
            {/* NAP Information */}
            <div className="mb-4 text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">404 Code Lab</p>
              <p>Central Scotland</p>
              <p>📞 <a href="tel:+447864502527" className="hover:text-primary transition-colors">+44 7864 502527</a></p>
              <p>✉️ <a href="mailto:info@404codelab.com" className="hover:text-primary transition-colors">info@404codelab.com</a></p>
            </div>
            
            <div className="flex space-x-4">
              <a href="https://github.com/tomxwilliam" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/404codelab" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="http://x.com/404codelab" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <FaXTwitter className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@404codelab" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <FaTiktok className="h-5 w-5" />
              </a>
              <a href="https://www.behance.net/404codelab" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <FaBehance className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              </li>
              <li>
              <Link to="/portfolio/web" className="text-muted-foreground hover:text-primary transition-colors">
                Web Portfolio
              </Link>
              </li>
              <li>
              <Link to="/portfolio/games" className="text-muted-foreground hover:text-primary transition-colors">
                Games
              </Link>
              </li>
              <li>
              <Link to="/portfolio/apps" className="text-muted-foreground hover:text-primary transition-colors">
                Apps
              </Link>
              </li>
              <li>
              <Link to="/services/ai-integration" className="text-muted-foreground hover:text-primary transition-colors">
                AI Integration
              </Link>
              </li>
              <li>
              <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                Blog
              </Link>
              </li>
              <li>
              <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                Customer Portal
              </Link>
              </li>
              <li>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p className="font-semibold text-foreground">404 Code Lab</p>
              <p>Central Scotland</p>
              <p>📞 <a href="tel:+447864502527" className="hover:text-primary transition-colors">+44 7864 502527</a></p>
              <p>✉️ <a href="mailto:info@404codelab.com" className="hover:text-primary transition-colors">info@404codelab.com</a></p>
              <p className="pt-2">Serving Edinburgh, Glasgow & Central Scotland</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} 404 Code Lab. All rights reserved.
            </p>
            
            {/* Legal Links */}
            <div className="flex flex-wrap gap-4 text-sm">
              <Link to="/legal/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/legal/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/legal/refunds" className="text-muted-foreground hover:text-primary transition-colors">
                Refunds Policy
              </Link>
              <Link to="/legal/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </Link>
              <button
                onClick={openPreferenceCenter}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Cookie Settings
              </button>
            </div>
            
            <div className="flex items-center space-x-2 text-muted-foreground text-sm">
              <Coffee className="h-4 w-4" />
              <span>404, Not Here! 💻</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
