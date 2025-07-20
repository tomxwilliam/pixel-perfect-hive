
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
import { Menu, X, User, Settings, LogOut, Home, Info, Mail, Briefcase, GamepadIcon, Smartphone, Globe } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Determine if we're in dark mode
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Choose logo based on theme
  const logoSrc = isDarkMode 
    ? "/lovable-uploads/e8dbb82e-a966-421f-82ba-b83542109f76.png"  // Current logo for dark mode
    : "/lovable-uploads/daa01be4-d91d-4d88-bec9-e9a2e01383a5.png"; // New logo for light mode

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const portfolioLinks = [
    { href: '/portfolio/games', label: 'Games', icon: GamepadIcon },
    { href: '/portfolio/apps', label: 'Mobile Apps', icon: Smartphone },
    { href: '/portfolio/web', label: 'Web Apps', icon: Globe },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img 
                src={logoSrc}
                alt="404 Code Lab Logo" 
                className="w-16 h-16 object-cover hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  console.log('Logo failed to load, hiding image');
                  e.currentTarget.style.display = 'none';
                }}
              />
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
                    Portfolio
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {portfolioLinks.map((link) => (
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
                aria-expanded="false"
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
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-b border-border">
            <Link
              to="/"
              className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <Home className="inline-block w-4 h-4 mr-2" />
              Home
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <Info className="inline-block w-4 h-4 mr-2" />
              About
            </Link>
            
            {/* Mobile Portfolio Links */}
            {portfolioLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium pl-6"
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="inline-block w-4 h-4 mr-2" />
                {link.label}
              </Link>
            ))}
            
            <Link
              to="/contact"
              className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <Mail className="inline-block w-4 h-4 mr-2" />
              Contact
            </Link>
            
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="inline-block w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="inline-block w-4 h-4 mr-2" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium w-full text-left"
                >
                  <LogOut className="inline-block w-4 h-4 mr-2" />
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
