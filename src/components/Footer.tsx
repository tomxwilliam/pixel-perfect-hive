
import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, Coffee, MessageCircle } from "lucide-react";
import { FaTiktok, FaDiscord, FaXTwitter } from "react-icons/fa6";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="">
              <img src="/lovable-uploads/e8dbb82e-a966-421f-82ba-b83542109f76.png" alt="404 Code Lab Logo" className="w-24 h-24 object-contain" />
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Scottish-based indie dev studio creating standout digital experiences. 
              Bold ideas, pixel-perfect reality.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/thomas-jackk" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/in/thomas-jackk" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://x.com/thomas_jackk" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <FaXTwitter className="h-5 w-5" />
              </a>
              <a href="https://tiktok.com/@thomas_jackk" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <FaTiktok className="h-5 w-5" />
              </a>
              <a href="https://discord.gg/your-server" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <FaDiscord className="h-5 w-5" />
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
            <div className="space-y-2 text-muted-foreground">
              <p>📧 hello@404codelab.com</p>
              <p>📍 Based in Scotland</p>
              <p>🌍 Working worldwide</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 404 Code Lab. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-muted-foreground text-sm mt-4 md:mt-0">
            <Coffee className="h-4 w-4" />
            <span>Page not found? Neither are we... we're coding! 🚀</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
