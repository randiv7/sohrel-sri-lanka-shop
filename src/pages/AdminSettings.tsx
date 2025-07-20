
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings, ArrowLeft, Save, Store, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface StoreSettings {
  store_name: string;
  store_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  postal_code: string;
  province: string;
  currency: string;
  tax_rate: number;
  free_shipping_threshold: number;
  maintenance_mode: boolean;
  allow_guest_checkout: boolean;
  require_phone_verification: boolean;
  auto_approve_reviews: boolean;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'SOHREL',
    store_description: 'Premium fashion and lifestyle store in Sri Lanka',
    contact_email: 'info@sohrel.com',
    contact_phone: '+94 70 123 4567',
    address: '123 Main Street',
    city: 'Colombo',
    postal_code: '00100',
    province: 'Western Province',
    currency: 'LKR',
    tax_rate: 0,
    free_shipping_threshold: 5000,
    maintenance_mode: false,
    allow_guest_checkout: true,
    require_phone_verification: false,
    auto_approve_reviews: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      if (!permissions?.manage_settings) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to manage store settings.",
          variant: "destructive",
        });
        navigate('/admin');
        return;
      }

      // Load settings would go here if we had a settings table
      // For now, we'll use the default values
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin/login');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Here you would save to a store_settings table
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Store settings saved successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save store settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: keyof StoreSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading settings...</div>
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
            <Settings className="h-8 w-8" />
            Store Settings
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="store_name">Store Name</Label>
              <Input
                id="store_name"
                value={settings.store_name}
                onChange={(e) => handleInputChange('store_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="store_description">Store Description</Label>
              <Textarea
                id="store_description"
                value={settings.store_description}
                onChange={(e) => handleInputChange('store_description', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                placeholder="LKR"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={settings.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Store Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={settings.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={settings.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                value={settings.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Business Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.tax_rate}
                onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="free_shipping_threshold">Free Shipping Threshold (LKR)</Label>
              <Input
                id="free_shipping_threshold"
                type="number"
                min="0"
                step="0.01"
                value={settings.free_shipping_threshold}
                onChange={(e) => handleInputChange('free_shipping_threshold', parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Feature Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable the store for maintenance</p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow_guest_checkout">Allow Guest Checkout</Label>
                <p className="text-sm text-muted-foreground">Allow customers to checkout without creating an account</p>
              </div>
              <Switch
                id="allow_guest_checkout"
                checked={settings.allow_guest_checkout}
                onCheckedChange={(checked) => handleInputChange('allow_guest_checkout', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require_phone_verification">Require Phone Verification</Label>
                <p className="text-sm text-muted-foreground">Require customers to verify their phone number</p>
              </div>
              <Switch
                id="require_phone_verification"
                checked={settings.require_phone_verification}
                onCheckedChange={(checked) => handleInputChange('require_phone_verification', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto_approve_reviews">Auto-approve Reviews</Label>
                <p className="text-sm text-muted-foreground">Automatically approve customer reviews without moderation</p>
              </div>
              <Switch
                id="auto_approve_reviews"
                checked={settings.auto_approve_reviews}
                onCheckedChange={(checked) => handleInputChange('auto_approve_reviews', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
