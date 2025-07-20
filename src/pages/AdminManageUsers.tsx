
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Search, ArrowLeft, Mail, Calendar, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface UserData {
  profile: UserProfile;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  orderCount: number;
  totalSpent: number;
}

const AdminManageUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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

      const permissions = adminData.permissions as any;
      if (!permissions?.manage_users) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to manage users.",
          variant: "destructive",
        });
        navigate('/admin');
        return;
      }

      loadUsers();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin/login');
    }
  };

  const loadUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Get user auth data and order statistics
      const usersData: UserData[] = [];
      
      for (const profile of profiles) {
        try {
          // Get user auth data using admin API
          const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);
          
          if (authUser.user) {
            // Get order statistics
            const { data: orders } = await supabase
              .from('orders')
              .select('total_amount')
              .eq('user_id', profile.user_id);

            const orderCount = orders?.length || 0;
            const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

            usersData.push({
              profile,
              email: authUser.user.email || 'Unknown',
              created_at: authUser.user.created_at,
              last_sign_in_at: authUser.user.last_sign_in_at,
              orderCount,
              totalSpent
            });
          }
        } catch (userError) {
          console.warn(`Failed to load data for user ${profile.user_id}:`, userError);
          // Still add the profile with limited data
          usersData.push({
            profile,
            email: 'Unknown',
            created_at: profile.created_at,
            last_sign_in_at: null,
            orderCount: 0,
            totalSpent: 0
          });
        }
      }

      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        user.email.toLowerCase().includes(searchLower) ||
        (user.profile.full_name && user.profile.full_name.toLowerCase().includes(searchLower)) ||
        (user.profile.phone && user.profile.phone.includes(searchTerm))
      );
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.profile.full_name || a.email;
          bValue = b.profile.full_name || b.email;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'orders':
          aValue = a.orderCount;
          bValue = b.orderCount;
          break;
        case 'spent':
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        case 'last_signin':
          aValue = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
          bValue = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading users...</div>
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
            <User className="h-8 w-8" />
            Manage Users
          </h1>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Join Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="orders">Order Count</SelectItem>
                  <SelectItem value="spent">Total Spent</SelectItem>
                  <SelectItem value="last_signin">Last Sign In</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Order</label>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.orderCount > 0).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.reduce((sum, u) => sum + u.orderCount, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {users.reduce((sum, u) => sum + u.totalSpent, 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Users ({filteredAndSortedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAndSortedUsers.map((userData) => (
              <div key={userData.profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">
                      {userData.profile.full_name || 'No Name'}
                    </h3>
                    {userData.orderCount > 0 && (
                      <Badge variant="default">Customer</Badge>
                    )}
                    {userData.orderCount === 0 && (
                      <Badge variant="secondary">No Orders</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {userData.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined: {new Date(userData.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      Orders: {userData.orderCount} | Spent: LKR {userData.totalSpent.toLocaleString()}
                    </div>
                    <div>
                      {userData.last_sign_in_at ? (
                        `Last login: ${new Date(userData.last_sign_in_at).toLocaleDateString()}`
                      ) : (
                        'Never signed in'
                      )}
                    </div>
                  </div>
                  {userData.profile.phone && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Phone: {userData.profile.phone}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredAndSortedUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No users match your search criteria.' : 'No users found.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManageUsers;
