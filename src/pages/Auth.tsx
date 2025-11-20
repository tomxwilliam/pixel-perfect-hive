
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { StaticNavigation } from '@/components/StaticNavigation';
import { Footer } from '@/components/Footer';
import { Checkbox } from '@/components/ui/checkbox';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user, profile, loading, isAdmin } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in based on role
  useEffect(() => {
    if (user && !loading) {
      const redirectPath = isAdmin ? '/admin' : '/dashboard';
      console.log('Redirecting authenticated user to:', redirectPath, { 
        hasProfile: !!profile, 
        profileRole: profile?.role, 
        isAdmin 
      });
      navigate(redirectPath, { replace: true });
    }
  }, [user, profile, loading, isAdmin, navigate]);

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

    // Check if terms are accepted first
    if (!termsAccepted) {
      setError('You must agree to the Terms and Conditions to create an account');
      setIsLoading(false);
      return;
    }

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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      console.error('Google sign in failed:', error);
      setError(error.message || 'Google sign in failed. Please try again.');
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: error.message || 'Please try again.'
      });
      setIsLoading(false);
    }
    // If successful, user will be redirected by Google OAuth flow
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <img 
            src="/assets/hero-bg-light.png" 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-100 dark:opacity-0 transition-opacity duration-300"
          />
          <img 
            src="/assets/hero-bg-dark.png" 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-0 dark:opacity-100 transition-opacity duration-300"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <StaticNavigation />
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-140px)] p-4">
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
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <FcGoogle className="mr-2 h-5 w-5" />
                      Continue with Google
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with email
                        </span>
                      </div>
                    </div>

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
                  </div>
                </TabsContent>

                <TabsContent value="signup">
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <FcGoogle className="mr-2 h-5 w-5" />
                      Continue with Google
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with email
                        </span>
                      </div>
                    </div>

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
                      
                      {/* Terms and Conditions Checkbox */}
                      <div className="flex items-start space-x-3 py-4">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                          disabled={isLoading}
                          aria-required="true"
                          aria-label="Accept Terms and Conditions"
                        />
                        <Label 
                          htmlFor="terms" 
                          className="text-sm leading-relaxed cursor-pointer text-muted-foreground"
                        >
                          I confirm I have read and agree to the{' '}
                          <Link 
                            to="/legal/terms" 
                            className="text-primary hover:text-primary/80 underline underline-offset-4"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Terms and Conditions
                          </Link>
                          , including attribution, portfolio use, and data processing.
                        </Label>
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
                      <Button type="submit" className="w-full" disabled={isLoading || !termsAccepted}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Auth;
