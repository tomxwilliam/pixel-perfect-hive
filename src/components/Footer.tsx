
import { Link } from "react-router-dom";
import { Github, Twitter, Mail, Coffee } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">404</span>
              </div>
              <span className="font-bold text-white text-lg">Code Lab</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Scottish-based indie dev studio creating standout digital experiences. 
              Bold ideas, pixel-perfect reality.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="mailto:hello@404codelab.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/portfolio/games" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Games
                </Link>
              </li>
              <li>
                <Link to="/portfolio/apps" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Apps
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <div className="space-y-2 text-gray-400">
              <p>📧 hello@404codelab.com</p>
              <p>📍 Based in Scotland</p>
              <p>🌍 Working worldwide</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 404 Code Lab. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-gray-400 text-sm mt-4 md:mt-0">
            <Coffee className="h-4 w-4" />
            <span>Page not found? Neither are we... we're coding! 🚀</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
