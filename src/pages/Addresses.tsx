import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Edit, Trash2, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Addresses = () => {
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    district: '',
    province: '',
    postal_code: '',
    special_instructions: '',
    is_default: false
  });
  const { toast } = useToast();

  const sriLankanProvinces = [
    'Western', 'Central', 'Southern', 'North Western', 'North Central',
    'Northern', 'Eastern', 'Uva', 'Sabaragamuwa'
  ];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = '/auth';
        return;
      }

      setUser(session.user);
      await loadAddresses(session.user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      district: '',
      province: '',
      postal_code: '',
      special_instructions: '',
      is_default: false
    });
    setEditingAddress(null);
  };

  const openEditDialog = (address: any) => {
    setEditingAddress(address);
    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      district: address.district,
      province: address.province,
      postal_code: address.postal_code,
      special_instructions: address.special_instructions || '',
      is_default: address.is_default
    });
    setDialogOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const addressData = {
        user_id: user.id,
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('customer_addresses')
          .update(addressData)
          .eq('id', editingAddress.id);

        if (error) throw error;
      } else {
        // Create new address
        // If this is the first address, make it default
        if (addresses.length === 0) {
          addressData.is_default = true;
        }

        const { error } = await supabase
          .from('customer_addresses')
          .insert([addressData]);

        if (error) throw error;
      }

      // If setting as default, update other addresses
      if (formData.is_default) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', editingAddress?.id || 'new');
      }

      toast({
        title: "Success",
        description: `Address ${editingAddress ? 'updated' : 'added'} successfully`,
      });

      await loadAddresses(user.id);
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Address deleted successfully",
      });

      await loadAddresses(user.id);
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      // Remove default from all addresses
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      await supabase
        .from('customer_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      toast({
        title: "Success",
        description: "Default address updated",
      });

      await loadAddresses(user.id);
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading addresses...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Addresses</h1>
              <p className="text-muted-foreground">
                Manage your shipping and billing addresses
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAddress ? 'Update your address details' : 'Add a new shipping address'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address_line_1">Address Line 1 *</Label>
                    <Input
                      id="address_line_1"
                      required
                      value={formData.address_line_1}
                      onChange={(e) => setFormData({...formData, address_line_1: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address_line_2">Address Line 2</Label>
                    <Input
                      id="address_line_2"
                      value={formData.address_line_2}
                      onChange={(e) => setFormData({...formData, address_line_2: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        required
                        value={formData.district}
                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Postal Code *</Label>
                      <Input
                        id="postal_code"
                        required
                        value={formData.postal_code}
                        onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="province">Province *</Label>
                    <select
                      id="province"
                      required
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">Select Province</option>
                      {sriLankanProvinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="special_instructions">Special Instructions</Label>
                    <Input
                      id="special_instructions"
                      placeholder="Delivery instructions, landmarks, etc."
                      value={formData.special_instructions}
                      onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                      className="rounded border-input"
                    />
                    <Label htmlFor="is_default">Set as default address</Label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : (editingAddress ? "Update Address" : "Add Address")}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Addresses Grid */}
          <div className="grid gap-4">
            {addresses.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No addresses saved</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first address to make checkout faster
                    </p>
                    <Button onClick={() => setDialogOpen(true)}>
                      Add Address
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              addresses.map((address) => (
                <Card key={address.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {address.full_name}
                        </CardTitle>
                        {address.is_default && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(address)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAddress(address.id)}
                          disabled={addresses.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">{address.phone}</p>
                      <div className="text-sm text-muted-foreground">
                        <p>{address.address_line_1}</p>
                        {address.address_line_2 && <p>{address.address_line_2}</p>}
                        <p>{address.city}, {address.district}</p>
                        <p>{address.province} {address.postal_code}</p>
                        {address.special_instructions && (
                          <p className="italic">Note: {address.special_instructions}</p>
                        )}
                      </div>
                    </div>
                    {!address.is_default && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        onClick={() => setDefaultAddress(address.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Addresses;