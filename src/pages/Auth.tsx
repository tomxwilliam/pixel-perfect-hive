
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { StaticNavigation } from '@/components/StaticNavigation';
import { Footer } from '@/components/Footer';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp, user, profile, loading } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in based on role
  useEffect(() => {
    if (user && !loading) {
      // Use email-based fallback for admin detection if profile isn't available yet
      const isAdmin = profile?.role === 'admin' || user.email?.includes('@404codelab.com');
      const redirectPath = isAdmin ? '/admin' : '/dashboard';
      console.log('Redirecting authenticated user to:', redirectPath, { 
        hasProfile: !!profile, 
        profileRole: profile?.role, 
        isAdmin 
      });
      navigate(redirectPath, { replace: true });
    }
  }, [user, profile, loading, navigate]);

  // Don't render the form if user is already authenticated
  if (user && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      console.error('Sign in failed:', error);
      setError(error.message || 'Sign in failed. Please try again.');
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || 'Please check your credentials and try again.'
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully."
      });
      // The useEffect will handle the redirect
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    console.log('Starting sign up process for:', email);
    try {
      const { error } = await signUp(email, password, firstName, lastName);

      if (error) {
        console.error('Sign up failed:', error);
        let errorMessage = 'Sign up failed. Please try again.';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        // Handle specific error cases
        if (error.message?.includes('already registered')) {
          errorMessage = 'This email is already registered. Please try signing in instead.';
        } else if (error.message?.includes('weak_password')) {
          errorMessage = 'Password is too weak. Please choose a stronger password.';
        } else if (error.message?.includes('invalid_email')) {
          errorMessage = 'Please enter a valid email address.';
        }
        
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: errorMessage
        });
      } else {
        setSuccessMessage('Account created successfully! You are now signed in.');
        toast({
          title: "Account created!",
          description: "Welcome! You are now signed in."
        });
        
        // Clear the form
        (e.target as HTMLFormElement).reset();
        // The useEffect will handle the redirect
      }
    } catch (err: any) {
      console.error('Unexpected error during signup:', err);
      setError(err?.message || 'An unexpected error occurred');
      toast({
        variant: "destructive", 
        title: "Error",
        description: err?.message || 'An unexpected error occurred'
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <StaticNavigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] p-4">
        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Access your account or create a new one to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"  
                        name="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {successMessage && (
                      <Alert>
                        <AlertDescription>{successMessage}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
