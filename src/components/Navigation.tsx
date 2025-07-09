
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Download, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = ({ mobile = false, onLinkClick = () => {} }) => (
    <>
      <Link 
        to="/" 
        className={`${mobile ? 'block py-2' : ''} hover:text-blue-400 transition-colors ${isActive('/') ? 'text-blue-400' : 'text-gray-300'}`}
        onClick={onLinkClick}
      >
        Home
      </Link>
      <Link 
        to="/about" 
        className={`${mobile ? 'block py-2' : ''} hover:text-blue-400 transition-colors ${isActive('/about') ? 'text-blue-400' : 'text-gray-300'}`}
        onClick={onLinkClick}
      >
        About
      </Link>
      
      {mobile ? (
        <div className="py-2">
          <div className="text-gray-300 font-medium mb-2">Portfolio</div>
          <Link to="/portfolio/games" className="block py-1 pl-4 text-gray-400 hover:text-blue-400" onClick={onLinkClick}>
            🎮 Games
          </Link>
          <Link to="/portfolio/apps" className="block py-1 pl-4 text-gray-400 hover:text-blue-400" onClick={onLinkClick}>
            📱 Apps  
          </Link>
          <Link to="/portfolio/web" className="block py-1 pl-4 text-gray-400 hover:text-blue-400" onClick={onLinkClick}>
            💻 Web Design
          </Link>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center text-gray-300 hover:text-blue-400 transition-colors">
            Portfolio
            <ChevronDown className="ml-1 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-700">
            <DropdownMenuItem asChild>
              <Link to="/portfolio/games" className="text-gray-300 hover:text-blue-400 cursor-pointer">
                🎮 Games
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/portfolio/apps" className="text-gray-300 hover:text-blue-400 cursor-pointer">
                📱 Apps
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/portfolio/web" className="text-gray-300 hover:text-blue-400 cursor-pointer">
                💻 Web Design
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      <Link 
        to="/contact" 
        className={`${mobile ? 'block py-2' : ''} hover:text-blue-400 transition-colors ${isActive('/contact') ? 'text-blue-400' : 'text-gray-300'}`}
        onClick={onLinkClick}
      >
        Contact
      </Link>
    </>
  );

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">404</span>
            </div>
            <span className="font-bold text-white text-lg">Code Lab</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* App Store Button & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button 
              size="sm" 
              className="hidden sm:flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Download className="mr-2 h-4 w-4" />
              App Store
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-900 border-gray-800">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile={true} onLinkClick={() => setIsOpen(false)} />
                  <Button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
                    <Download className="mr-2 h-4 w-4" />
                    App Store
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
