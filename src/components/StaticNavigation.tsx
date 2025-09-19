import { useState, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export const StaticNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, profile, signOut } = useAuth();
  const { theme } = useTheme();

  // Derive isDarkMode from theme
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const logoSrc = isDarkMode
    ? "/assets/logo-dark.png"
    : "/assets/logo-light.png";

  const handleServicesEnter = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
    }
    setServicesOpen(true);
  };

  const handleServicesLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 150); // Small delay to allow mouse movement
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAdmin = profile?.role === 'admin' || profile?.email === 'admin@404codelab.com';
  const isCodeLabEmail = profile?.email?.includes('@404codelab.com');

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center">
              <img
                src={logoSrc}
                alt="404 Code Lab"
                className="h-16 w-auto"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a
                href="/"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </a>
              <a
                href="/about"
                className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </a>
              
              {/* Services Dropdown */}
              <div 
                className="relative"
                onMouseEnter={handleServicesEnter}
                onMouseLeave={handleServicesLeave}
              >
                <button className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                  Services
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                {servicesOpen && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-50"
                    onMouseEnter={handleServicesEnter}
                    onMouseLeave={handleServicesLeave}
                  >
                    <a
                      href="/portfolio/web"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Web Development
                    </a>
                    <a
                      href="/portfolio/apps"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      App Development
                    </a>
                    <a
                      href="/portfolio/games"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Game Development
                    </a>
                    <a
                      href="/services/ai-integration"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      AI Integration
                    </a>
                  </div>
                )}
              </div>

              <a
                href="/contact"
                className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Right side - Theme toggle and user menu */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <ThemeToggle />
            
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url || ''} alt={`${profile.first_name} ${profile.last_name}` || 'User'} />
                      <AvatarFallback>
                        {profile.first_name ? profile.first_name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border border-border" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {(profile.first_name || profile.last_name) && (
                        <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                      )}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <a href="/dashboard" className="w-full">Dashboard</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/projects" className="w-full">Project Management</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/settings" className="w-full">Settings</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/support" className="w-full">Support</a>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem>
                      <a href="/admin" className="w-full">Admin Panel</a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default">
                <a href="/auth">Sign In</a>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-primary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              <a
                href="/"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </a>
              <a
                href="/about"
                className="text-muted-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </a>
              
              {/* Mobile Services */}
              <div className="space-y-1">
                <div className="text-muted-foreground px-3 py-2 text-base font-medium">Services</div>
                <a
                  href="/portfolio/web"
                  className="text-muted-foreground hover:text-primary block px-6 py-2 rounded-md text-sm transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Web Development
                </a>
                <a
                  href="/portfolio/apps"
                  className="text-muted-foreground hover:text-primary block px-6 py-2 rounded-md text-sm transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  App Development
                </a>
                <a
                  href="/portfolio/games"
                  className="text-muted-foreground hover:text-primary block px-6 py-2 rounded-md text-sm transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Game Development
                </a>
                <a
                  href="/services/ai-integration"
                  className="text-muted-foreground hover:text-primary block px-6 py-2 rounded-md text-sm transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  AI Integration
                </a>
              </div>

              <a
                href="/contact"
                className="text-muted-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </a>

              {/* Mobile user menu */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-3 px-3">
                  <ThemeToggle />
                  {user && profile ? (
                    <div className="flex-1">
                      <div className="text-base font-medium text-foreground">{profile.first_name} {profile.last_name}</div>
                      <div className="text-sm text-muted-foreground">{profile.email}</div>
                      <div className="mt-2 space-y-1">
                        <a
                          href="/dashboard"
                          className="block text-muted-foreground hover:text-primary text-sm"
                          onClick={() => setIsOpen(false)}
                        >
                          Dashboard
                        </a>
                        <a
                          href="/projects"
                          className="block text-muted-foreground hover:text-primary text-sm"
                          onClick={() => setIsOpen(false)}
                        >
                          Project Management
                        </a>
                        <a
                          href="/settings"
                          className="block text-muted-foreground hover:text-primary text-sm"
                          onClick={() => setIsOpen(false)}
                        >
                          Settings
                        </a>
                        <a
                          href="/support"
                          className="block text-muted-foreground hover:text-primary text-sm"
                          onClick={() => setIsOpen(false)}
                        >
                          Support
                        </a>
                        {isAdmin && (
                          <a
                            href="/admin"
                            className="block text-muted-foreground hover:text-primary text-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            Admin Panel
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            handleLogout();
                          }}
                          className="block text-muted-foreground hover:text-primary text-sm text-left"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Button asChild variant="default" className="flex-1">
                      <a href="/auth" onClick={() => setIsOpen(false)}>Sign In</a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};