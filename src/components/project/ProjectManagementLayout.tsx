import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { 
  Home,
  FolderKanban,
  Bell,
  Settings,
  HelpCircle,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectManagementHeaderProps {
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
  notificationCount?: number;
}

const ProjectManagementHeader: React.FC<ProjectManagementHeaderProps> = ({
  title = "Project Management",
  subtitle = "Manage projects, tasks, and team collaboration efficiently",
  showNotifications = true,
  notificationCount = 0
}) => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1">
                  <FolderKanban className="h-4 w-4" />
                  Project Management
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Separator />

        {/* Main Header Content */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {showNotifications && (
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>

            <Button variant="outline" size="sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

interface ProjectManagementFooterProps {
  showCompanyInfo?: boolean;
  showSocialLinks?: boolean;
  showQuickLinks?: boolean;
}

const ProjectManagementFooter: React.FC<ProjectManagementFooterProps> = ({
  showCompanyInfo = true,
  showSocialLinks = true,
  showQuickLinks = true
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            {showCompanyInfo && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">404 Code Lab</h3>
                <p className="text-sm text-muted-foreground">
                  Professional project management and development services. 
                  Building innovative solutions for the digital world.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>London, UK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>hello@404codelab.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>+44 (0) 20 1234 5678</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Links */}
            {showQuickLinks && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
                <nav className="space-y-2">
                  <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/projects" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Projects
                  </Link>
                  <Link to="/admin" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Admin Panel
                  </Link>
                  <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact Support
                  </Link>
                </nav>
              </div>
            )}

            {/* Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Services</h3>
              <nav className="space-y-2">
                <Link to="/portfolio/web" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Web Development
                </Link>
                <Link to="/portfolio/apps" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mobile Apps
                </Link>
                <Link to="/portfolio/games" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Game Development
                </Link>
                <Link to="/services/ai-integration" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  AI Integration
                </Link>
              </nav>
            </div>

            {/* Social Links & Newsletter */}
            {showSocialLinks && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Connect</h3>
                <div className="flex space-x-4">
                  <a href="https://github.com/404codelab" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </a>
                  <a href="https://twitter.com/404codelab" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Twitter</span>
                  </a>
                  <a href="https://linkedin.com/company/404codelab" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                  <a href="mailto:hello@404codelab.com" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="h-5 w-5" />
                    <span className="sr-only">Email</span>
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">
                  Stay updated with our latest projects and insights.
                </p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Bottom Footer */}
        <div className="py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} 404 Code Lab. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { ProjectManagementHeader, ProjectManagementFooter };