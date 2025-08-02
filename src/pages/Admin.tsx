import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  Settings,
  LogOut,
  Loader2
} from "lucide-react";

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = '/admin/login';
        return;
      }

      setUser(session.user);
      
      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (adminError && adminError.code !== 'PGRST116') {
        throw adminError;
      }

      if (!adminData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        window.location.href = '/';
        return;
      }

      setIsAdmin(true);
      await loadStats();
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast({
        title: "Error",
        description: "Failed to verify admin access",
        variant: "destructive",
      });
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total orders
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total customers (profiles)
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalCustomers: customersCount || 0,
        totalRevenue
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-[0.2em] uppercase">LIORA</h1>
              <p className="text-muted-foreground tracking-wider text-sm mt-1">Admin Dashboard</p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-muted-foreground tracking-wide">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="tracking-wide">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="border border-border p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium tracking-wide uppercase">Products</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-bold tracking-tight">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground tracking-wide mt-2">
                Active in catalog
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium tracking-wide uppercase">Orders</CardTitle>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-bold tracking-tight">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground tracking-wide mt-2">
                All time
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium tracking-wide uppercase">Customers</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-bold tracking-tight">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground tracking-wide mt-2">
                Registered
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium tracking-wide uppercase">Revenue</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl font-bold tracking-tight">LKR {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground tracking-wide mt-2">
                Total earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border border-border">
            <CardHeader className="pb-6">
              <CardTitle className="tracking-wide">Product Management</CardTitle>
              <CardDescription className="text-muted-foreground tracking-wide">
                Manage your product catalog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full tracking-wide" onClick={() => window.location.href = '/admin/products/new'}>
                  Add New Product
                </Button>
                <Button variant="outline" className="w-full tracking-wide" onClick={() => window.location.href = '/admin/products'}>
                  Manage Products
                </Button>
                <Button variant="outline" className="w-full tracking-wide" onClick={() => window.location.href = '/admin/categories'}>
                  Manage Categories
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-6">
              <CardTitle className="tracking-wide">Order Management</CardTitle>
              <CardDescription className="text-muted-foreground tracking-wide">
                Manage customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full tracking-wide" onClick={() => window.location.href = '/admin/orders'}>
                  View All Orders
                </Button>
                <Button variant="outline" className="w-full tracking-wide" onClick={() => window.location.href = '/admin/orders?status=pending'}>
                  Pending Orders
                </Button>
                <Button variant="outline" className="w-full tracking-wide" onClick={() => window.location.href = '/admin/analytics'}>
                  Sales Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-6">
              <CardTitle className="tracking-wide">Store Settings</CardTitle>
              <CardDescription className="text-muted-foreground tracking-wide">
                Configure store preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full tracking-wide" onClick={() => window.location.href = '/admin/settings'}>
                  <Settings className="h-4 w-4 mr-2" />
                  Store Settings
                </Button>
                <Button variant="outline" className="w-full tracking-wide" onClick={() => window.location.href = '/admin/manage-users'}>
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full tracking-wide" onClick={() => window.location.href = '/admin/users'}>
                  Manage Admins
                </Button>
                <Button variant="outline" className="w-full tracking-wide" onClick={() => window.location.href = '/admin/coupons'}>
                  Manage Coupons
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Admin;