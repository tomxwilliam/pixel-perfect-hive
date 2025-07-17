
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Download, ChevronDown, User, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

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
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center py-2">
            <img 
              src="/lovable-uploads/e8dbb82e-a966-421f-82ba-b83542109f76.png" 
              alt="404 Code Lab Logo" 
              className="w-16 h-16 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* Auth & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    <User className="mr-2 h-4 w-4" />
                    {profile?.first_name || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Customer Portal
                  </Button>
                </Link>
              </div>
            )}

            <Button 
              size="sm" 
              className="hidden sm:flex bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
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
              <SheetContent side="right" className="bg-background border">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile={true} onLinkClick={() => setIsOpen(false)} />
                  
                  {user ? (
                    <div className="space-y-2 pt-4 border-t">
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-4 border-t">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                          Customer Portal
                        </Button>
                      </Link>
                    </div>
                  )}

                  <Button className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500">
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
