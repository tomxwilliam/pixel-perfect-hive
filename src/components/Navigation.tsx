import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Menu, X, User, Settings, LogOut, Home, Info, Mail, Briefcase, GamepadIcon, Smartphone, Globe, Bot, FolderKanban } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Determine if we're in dark mode
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Choose logo based on theme - using available uploaded logos
  const logoSrc = isDarkMode 
    ? "/lovable-uploads/40db8b65-10fc-4b8a-bdbe-0c197159ca3a.png"  // Dark theme logo
    : "/lovable-uploads/daa01be4-d91d-4d88-bec9-e9a2e01383a5.png"; // Light theme logo

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const servicesLinks = [
    { href: '/services/ai-integration', label: 'AI Integration', icon: Bot },
    { href: '/portfolio/games', label: 'Games', icon: GamepadIcon },
    { href: '/portfolio/apps', label: 'Mobile Apps', icon: Smartphone },
    { href: '/portfolio/web', label: 'Web Dev', icon: Globe },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-24 h-24 flex items-center justify-center">
                <img 
                  src={logoSrc}
                  alt="404 Code Lab Logo" 
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    console.log('Logo failed to load, hiding image');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                <Home className="inline-block w-4 h-4 mr-1" />
                Home
              </Link>
              <Link to="/about" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                <Info className="inline-block w-4 h-4 mr-1" />
                About
              </Link>
              
              {/* Portfolio Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium">
                    <Briefcase className="inline-block w-4 h-4 mr-1" />
                    Services
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {servicesLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link to={link.href} className="flex items-center">
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/contact" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                <Mail className="inline-block w-4 h-4 mr-1" />
                Contact
              </Link>
            </div>
          </div>

          {/* User Menu and Theme Toggle */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.first_name || 'User'} />
                      <AvatarFallback>
                        {getInitials(profile?.first_name, profile?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/projects" className="flex items-center">
                      <FolderKanban className="mr-2 h-4 w-4" />
                      Project Management
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                className="min-h-[44px] min-w-[44px] p-2"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-6 space-y-2 bg-background border-b border-border shadow-lg">
            <Link
              to="/"
              className="text-foreground hover:text-primary hover:bg-accent block px-4 py-3 text-base font-medium rounded-lg transition-colors min-h-[44px] flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Home className="inline-block w-5 h-5 mr-3" />
              Home
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-primary hover:bg-accent block px-4 py-3 text-base font-medium rounded-lg transition-colors min-h-[44px] flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Info className="inline-block w-5 h-5 mr-3" />
              About
            </Link>
            
            {/* Mobile Portfolio Links */}
            {servicesLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-foreground hover:text-primary hover:bg-accent block px-4 py-3 text-base font-medium rounded-lg transition-colors min-h-[44px] flex items-center ml-4"
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="inline-block w-5 h-5 mr-3" />
                {link.label}
              </Link>
            ))}
            
            <Link
              to="/contact"
              className="text-foreground hover:text-primary hover:bg-accent block px-4 py-3 text-base font-medium rounded-lg transition-colors min-h-[44px] flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Mail className="inline-block w-5 h-5 mr-3" />
              Contact
            </Link>
            
            {user && (
              <>
                <div className="border-t border-border my-2"></div>
                <Link
                  to="/dashboard"
                  className="text-foreground hover:text-primary hover:bg-accent block px-4 py-3 text-base font-medium rounded-lg transition-colors min-h-[44px] flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="inline-block w-5 h-5 mr-3" />
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  className="text-foreground hover:text-primary hover:bg-accent block px-4 py-3 text-base font-medium rounded-lg transition-colors min-h-[44px] flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <FolderKanban className="inline-block w-5 h-5 mr-3" />
                  Project Management
                </Link>
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-foreground hover:text-primary hover:bg-accent block px-4 py-3 text-base font-medium rounded-lg transition-colors min-h-[44px] flex items-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="inline-block w-5 h-5 mr-3" />
                    Admin Panel
                  </Link>
                )}
                <div className="border-t border-border my-2"></div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="text-foreground hover:text-primary hover:bg-accent block px-4 py-3 text-base font-medium rounded-lg transition-colors min-h-[44px] flex items-center w-full text-left"
                >
                  <LogOut className="inline-block w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export { Navigation };
export default Navigation;
