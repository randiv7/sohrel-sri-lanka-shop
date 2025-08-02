import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2 } from "lucide-react";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in as admin
    const checkAdminSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if they're admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .maybeSingle();
        
        if (adminData) {
          window.location.href = '/admin';
        }
      }
    };
    checkAdminSession();
  }, []);

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (adminError && adminError.code !== 'PGRST116') {
          throw adminError;
        }

        if (!adminData) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "You don't have admin permissions",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Signed in successfully!",
        });
        window.location.href = '/admin';
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-16 w-16 text-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 tracking-[0.2em] uppercase">LIORA</h1>
          <p className="text-muted-foreground tracking-wide">Admin Access Portal</p>
        </div>

        <Card className="border border-border">
          <CardHeader className="pb-8">
            <CardTitle className="tracking-wide text-center">Administrative Access</CardTitle>
            <CardDescription className="text-center tracking-wide">
              Enter credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="tracking-wide"
                />
              </div>
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="tracking-wide"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full tracking-wide py-6" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Access Admin Panel
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button 
            variant="link" 
            onClick={() => window.location.href = '/'}
            className="text-muted-foreground tracking-wide"
          >
            ← Return to Store
          </Button>
        </div>

        <div className="mt-8 p-6 border border-border rounded-lg">
          <p className="text-sm text-muted-foreground text-center tracking-wide">
            <strong>Restricted Access:</strong> Admin privileges required. 
            Contact your system administrator for access credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;