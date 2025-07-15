import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, Clock, Shield, Phone } from "lucide-react";

interface CODPaymentOptionProps {
  orderValue: number;
  province: string;
  codFee: number;
  estimatedDelivery: string;
  isSelected: boolean;
  onSelect: () => void;
}

const CODPaymentOption = ({ 
  orderValue, 
  province, 
  codFee, 
  estimatedDelivery, 
  isSelected, 
  onSelect 
}: CODPaymentOptionProps) => {
  const isFreeShipping = orderValue >= 5000;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-brand-black bg-brand-grey-light shadow-[var(--shadow-elevated)]' 
          : 'border-brand-border hover:border-muted-foreground'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-black" />
              <CardTitle className="text-lg">Cash on Delivery</CardTitle>
            </div>
            {isFreeShipping && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                FREE COD
              </Badge>
            )}
          </div>
          <div className="text-right">
            {codFee > 0 ? (
              <span className="text-lg font-semibold text-brand-black">
                +LKR {codFee}
              </span>
            ) : (
              <span className="text-lg font-semibold text-green-600">FREE</span>
            )}
          </div>
        </div>
        <CardDescription className="text-muted-foreground">
          Pay when your order is delivered to your doorstep
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Delivery: {estimatedDelivery}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span>Secure & Verified</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>We'll call to confirm your order before dispatch</span>
          </div>
          <div className="space-y-1">
            <p>• No advance payment required</p>
            <p>• Inspect product before payment</p>
            <p>• Available across Sri Lanka</p>
            {orderValue >= 5000 ? (
              <p className="text-green-600 font-medium">• FREE COD for orders above LKR 5,000</p>
            ) : (
              <p>• COD fee: LKR {codFee} (Free for orders above LKR 5,000)</p>
            )}
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-md text-xs text-muted-foreground">
          <p className="font-medium mb-1">Terms & Conditions:</p>
          <p>Orders will be verified by phone call. High-value orders may require ID verification upon delivery. Please ensure someone is available at the delivery address.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CODPaymentOption;