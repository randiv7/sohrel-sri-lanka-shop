
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowLeft, Percent, DollarSign, Calendar, Users } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_order_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minimum_order_amount: '',
    usage_limit: '',
    expires_at: ''
  });
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

      loadCoupons();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin/login');
    }
  };

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast({
        title: "Error",
        description: "Failed to load coupons.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minimum_order_amount: '',
      usage_limit: '',
      expires_at: ''
    });
    setEditingCoupon(null);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minimum_order_amount: coupon.minimum_order_amount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : ''
    });
    setEditingCoupon(coupon);
    setIsCreating(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        minimum_order_amount: formData.minimum_order_amount ? parseFloat(formData.minimum_order_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        is_active: true
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Coupon updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert(couponData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Coupon created successfully.",
        });
      }

      setIsCreating(false);
      resetForm();
      loadCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save coupon.",
        variant: "destructive",
      });
    }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Coupon ${coupon.is_active ? 'deactivated' : 'activated'} successfully.`,
      });

      loadCoupons();
    } catch (error) {
      console.error('Error updating coupon status:', error);
      toast({
        title: "Error",
        description: "Failed to update coupon status.",
        variant: "destructive",
      });
    }
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coupon deleted successfully.",
      });

      loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: "Failed to delete coupon.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading coupons...</div>
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
            <Percent className="h-8 w-8" />
            Manage Coupons
          </h1>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon ? 'Update coupon details below.' : 'Enter the details for the new coupon.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Enter coupon code"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Discount Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'percentage' | 'fixed' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (LKR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="value">
                Discount Value * {formData.type === 'percentage' ? '(%)' : '(LKR)'}
              </Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder={formData.type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                min="0"
                max={formData.type === 'percentage' ? '100' : undefined}
                step={formData.type === 'percentage' ? '1' : '0.01'}
                required
              />
            </div>

            <div>
              <Label htmlFor="minimum_order_amount">Minimum Order Amount (LKR)</Label>
              <Input
                id="minimum_order_amount"
                type="number"
                value={formData.minimum_order_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, minimum_order_amount: e.target.value }))}
                placeholder="Optional minimum order amount"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="usage_limit">Usage Limit</Label>
              <Input
                id="usage_limit"
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                placeholder="Optional usage limit"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="expires_at">Expiry Date</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{coupon.code}</h3>
                    <Badge variant={coupon.is_active ? "default" : "secondary"}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {coupon.expires_at && new Date(coupon.expires_at) < new Date() && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {coupon.type === 'percentage' ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `LKR ${coupon.value}`} off
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Used: {coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}
                    </div>
                    {coupon.minimum_order_amount && (
                      <div>Min: LKR {coupon.minimum_order_amount}</div>
                    )}
                    {coupon.expires_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires: {new Date(coupon.expires_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleCouponStatus(coupon)}
                  >
                    {coupon.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(coupon)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the coupon "{coupon.code}"? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteCoupon(coupon.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            
            {coupons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No coupons found. Create your first coupon to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCoupons;
