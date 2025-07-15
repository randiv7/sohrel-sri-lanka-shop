import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useCODCalculator } from "@/hooks/useCODCalculator";
import CODPaymentOption from "@/components/checkout/CODPaymentOption";
import CODSpecificFields from "@/components/checkout/CODSpecificFields";
import { ArrowLeft, CreditCard, Truck } from "lucide-react";

interface CheckoutForm {
  // Shipping Address
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  district: string;
  province: string;
  postal_code: string;
  special_instructions: string;
  
  // Payment
  payment_method: string;
  
  // COD Specific Fields
  alternatePhone: string;
  preferredTimeSlot: string;
  idVerificationConsent: boolean;
  codDeliveryInstructions: string;
  
  // Order notes
  notes: string;
}

const provinces = [
  "Western", "Central", "Southern", "Northern", "Eastern", 
  "North Western", "North Central", "Uva", "Sabaragamuwa"
];

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { trackEvent } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  
  const [form, setForm] = useState<CheckoutForm>({
    full_name: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    district: "",
    province: "",
    postal_code: "",
    special_instructions: "",
    payment_method: "cash_on_delivery",
    alternatePhone: "",
    preferredTimeSlot: "anytime",
    idVerificationConsent: false,
    codDeliveryInstructions: "",
    notes: ""
  });

  useEffect(() => {
    checkUser();
    
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      fetchSavedAddresses(user.id);
    }
  };

  const fetchSavedAddresses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setSavedAddresses(data || []);
      
      // Auto-select default address
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
        setForm(prev => ({
          ...prev,
          full_name: defaultAddress.full_name,
          phone: defaultAddress.phone,
          address_line_1: defaultAddress.address_line_1,
          address_line_2: defaultAddress.address_line_2 || "",
          city: defaultAddress.city,
          district: defaultAddress.district,
          province: defaultAddress.province,
          postal_code: defaultAddress.postal_code,
          special_instructions: defaultAddress.special_instructions || ""
        }));
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      setForm(prev => ({
        ...prev,
        full_name: address.full_name,
        phone: address.phone,
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2 || "",
        city: address.city,
        district: address.district,
        province: address.province,
        postal_code: address.postal_code,
        special_instructions: address.special_instructions || ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cartTotal = getCartTotal();
      const codCalculation = useCODCalculator(cartTotal, form.province);

      // Validate required fields
      if (!form.full_name || !form.phone || !form.address_line_1 || !form.city || !form.district || !form.province || !form.postal_code) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required shipping information.",
          variant: "destructive",
        });
        return;
      }

      // COD specific validations
      if (form.payment_method === "cash_on_delivery") {
        if (!form.alternatePhone) {
          toast({
            title: "Missing Information",
            description: "Please provide an alternate phone number for COD orders.",
            variant: "destructive",
          });
          return;
        }

        if (cartTotal > 10000 && !form.idVerificationConsent) {
          toast({
            title: "ID Verification Required",
            description: "Please consent to ID verification for high-value COD orders.",
            variant: "destructive",
          });
          return;
        }

        if (!codCalculation.isEligible) {
          toast({
            title: "COD Not Available",
            description: codCalculation.message || "Cash on Delivery is not available for this order.",
            variant: "destructive",
          });
          return;
        }
      }

      const shipping_address = {
        full_name: form.full_name,
        phone: form.phone,
        address_line_1: form.address_line_1,
        address_line_2: form.address_line_2,
        city: form.city,
        district: form.district,
        province: form.province,
        postal_code: form.postal_code,
        special_instructions: form.special_instructions,
        // COD specific fields
        ...(form.payment_method === "cash_on_delivery" && {
          alternate_phone: form.alternatePhone,
          preferred_time_slot: form.preferredTimeSlot,
          cod_delivery_instructions: form.codDeliveryInstructions,
          id_verification_required: cartTotal > 10000
        })
      };

      // Create order
      const totalCODFee = form.payment_method === "cash_on_delivery" ? codCalculation.codFee : 0;
      const orderData = {
        user_id: user?.id || null,
        guest_email: !user ? "guest@example.com" : null, // You might want to collect this
        subtotal: cartTotal,
        shipping_cost: 300, // Fixed shipping for now
        total_amount: cartTotal + 300 + totalCODFee,
        payment_method: form.payment_method,
        shipping_address,
        notes: form.notes,
        order_number: `SH${Date.now()}` // Temporary order number
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => {
        const price = item.product?.sale_price || item.product?.price || 0;
        return {
          order_id: order.id,
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          unit_price: price,
          total_price: price * item.quantity,
          product_snapshot: {
            name: item.product?.name || 'Unknown Product',
            size: item.product_variant?.size || 'N/A',
            color: item.product_variant?.color || 'N/A',
            image_url: item.product?.product_images?.[0]?.image_url || '/placeholder.svg'
          }
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Deduct inventory for ordered items
      for (const item of cartItems) {
        if (item.product_variant_id) {
          try {
            await supabase.functions.invoke('inventory-monitor', {
              body: {
                action: 'deduct_stock',
                order_items: [{
                  product_variant_id: item.product_variant_id,
                  quantity: item.quantity
                }],
                order_id: order.id
              }
            });
          } catch (inventoryError) {
            console.warn('Inventory deduction failed:', inventoryError);
            // Don't fail the order for inventory issues
          }
        }
      }

      // Track order completion
      trackEvent({
        event_type: 'order_completed',
        event_data: {
          order_id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          payment_method: order.payment_method,
          item_count: cartItems.length,
          items: cartItems.map(item => ({
            product_id: item.product_id,
            product_name: item.product?.name,
            variant_id: item.product_variant_id,
            quantity: item.quantity,
            price: item.product?.sale_price || item.product?.price
          }))
        }
      });

      // Save address if user is logged in and it's new
      if (user && !selectedAddress) {
        await supabase
          .from('customer_addresses')
          .insert({
            user_id: user.id,
            ...shipping_address,
            is_default: savedAddresses.length === 0
          });
      }

      // Clear cart
      clearCart();

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.order_number} has been placed.`,
      });

      navigate(`/order-confirmation/${order.id}`);

    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const cartTotal = getCartTotal();
  const shippingCost = 300;
  
  // COD calculations
  const codCalculation = useCODCalculator(cartTotal, form.province);
  const isCOD = form.payment_method === "cash_on_delivery";
  const finalTotal = cartTotal + shippingCost + (isCOD ? codCalculation.codFee : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/cart')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && savedAddresses.length > 0 && (
                  <div>
                    <Label>Saved Addresses</Label>
                    <Select value={selectedAddress} onValueChange={handleAddressSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a saved address" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Enter new address</SelectItem>
                        {savedAddresses.map((address) => (
                          <SelectItem key={address.id} value={address.id}>
                            {address.full_name} - {address.city}
                            {address.is_default && " (Default)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={form.full_name}
                        onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address_line_1">Address Line 1 *</Label>
                    <Input
                      id="address_line_1"
                      value={form.address_line_1}
                      onChange={(e) => setForm(prev => ({ ...prev, address_line_1: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address_line_2">Address Line 2</Label>
                    <Input
                      id="address_line_2"
                      value={form.address_line_2}
                      onChange={(e) => setForm(prev => ({ ...prev, address_line_2: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        value={form.district}
                        onChange={(e) => setForm(prev => ({ ...prev, district: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Province *</Label>
                      <Select value={form.province} onValueChange={(value) => setForm(prev => ({ ...prev, province: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="postal_code">Postal Code *</Label>
                    <Input
                      id="postal_code"
                      value={form.postal_code}
                      onChange={(e) => setForm(prev => ({ ...prev, postal_code: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="special_instructions">Special Instructions</Label>
                    <Textarea
                      id="special_instructions"
                      value={form.special_instructions}
                      onChange={(e) => setForm(prev => ({ ...prev, special_instructions: e.target.value }))}
                      placeholder="Any special delivery instructions..."
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cash on Delivery Option */}
                <CODPaymentOption
                  orderValue={cartTotal}
                  province={form.province}
                  codFee={codCalculation.codFee}
                  estimatedDelivery={codCalculation.estimatedDelivery}
                  isSelected={form.payment_method === "cash_on_delivery"}
                  onSelect={() => setForm(prev => ({ ...prev, payment_method: "cash_on_delivery" }))}
                />
                
                {/* Other Payment Methods */}
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    form.payment_method === "bank_transfer" 
                      ? 'border-brand-black bg-brand-grey-light' 
                      : 'border-brand-border hover:border-muted-foreground'
                  }`}
                  onClick={() => setForm(prev => ({ ...prev, payment_method: "bank_transfer" }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-brand-black" />
                      <div>
                        <h4 className="font-medium">Bank Transfer</h4>
                        <p className="text-sm text-muted-foreground">Pay via online banking</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* COD Specific Fields */}
            {form.payment_method === "cash_on_delivery" && (
              <CODSpecificFields
                fields={{
                  alternatePhone: form.alternatePhone,
                  preferredTimeSlot: form.preferredTimeSlot,
                  idVerificationConsent: form.idVerificationConsent,
                  codDeliveryInstructions: form.codDeliveryInstructions
                }}
                onFieldChange={(field, value) => setForm(prev => ({ ...prev, [field]: value }))}
                orderValue={cartTotal}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes for your order..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const price = item.product?.sale_price || item.product?.price || 0;
                    return (
                      <div key={item.id} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-muted-foreground">
                            Size: {item.product_variant?.size || 'N/A'} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">{formatPrice(price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  {isCOD && codCalculation.codFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>COD Fee</span>
                      <span>{formatPrice(codCalculation.codFee)}</span>
                    </div>
                  )}
                  {isCOD && codCalculation.isFreeShipping && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>COD Fee</span>
                      <span>FREE</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  className="w-full" 
                  size="lg"
                  disabled={loading || cartItems.length === 0}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;