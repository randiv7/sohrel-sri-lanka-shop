import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, UserCog, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  permissions: any;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  email?: string;
}

const AdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!adminData || !adminData.is_active) {
        navigate('/');
        return;
      }

      // Check if user has admin management permissions
      const permissions = adminData.permissions as any;
      if (!permissions?.manage_admins) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to manage admin accounts.",
          variant: "destructive",
        });
        navigate('/admin');
        return;
      }

      loadAdminUsers();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin/login');
    }
  };

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get email addresses for each admin user
      const adminUsersWithEmails = await Promise.all(
        (data || []).map(async (admin) => {
          const { data: userData } = await supabase.auth.admin.getUserById(admin.user_id);
          return {
            ...admin,
            email: userData.user?.email || 'Unknown'
          };
        })
      );

      setAdminUsers(adminUsersWithEmails);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast({
        title: "Error",
        description: "Failed to load admin users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAdminUser = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Call the database function to create admin user
      const { data, error } = await supabase.rpc('create_admin_user', {
        user_email: newAdminEmail.trim()
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin user created successfully.",
      });

      setNewAdminEmail('');
      loadAdminUsers();
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user. Make sure the user exists in the system.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteAdminUser = async (adminId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin user removed successfully.",
      });

      loadAdminUsers();
    } catch (error) {
      console.error('Error deleting admin user:', error);
      toast({
        title: "Error",
        description: "Failed to remove admin user.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="h-8 w-8" />
            Admin User Management
          </h1>
        </div>
      </div>

      {/* Create New Admin */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Admin User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter user email address"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                The user must already have an account in the system.
              </p>
            </div>
            <Button 
              onClick={createAdminUser} 
              disabled={isCreating}
              className="px-8"
            >
              {isCreating ? 'Creating...' : 'Create Admin'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Admin Users ({adminUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminUsers.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">{admin.email}</h3>
                      <p className="text-sm text-muted-foreground">
                        Role: {admin.role} • Created: {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                      {admin.last_login && (
                        <p className="text-xs text-muted-foreground">
                          Last login: {new Date(admin.last_login).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={admin.is_active ? "default" : "secondary"}>
                    {admin.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Admin Access</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove admin access for {admin.email}? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAdminUser(admin.id, admin.user_id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove Access
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            
            {adminUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No admin users found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;