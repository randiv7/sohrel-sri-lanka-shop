import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Clock, AlertCircle } from "lucide-react";

interface CODFields {
  alternatePhone: string;
  preferredTimeSlot: string;
  idVerificationConsent: boolean;
  codDeliveryInstructions: string;
}

interface CODSpecificFieldsProps {
  fields: CODFields;
  onFieldChange: (field: keyof CODFields, value: string | boolean) => void;
  orderValue: number;
}

const timeSlots = [
  { value: "morning", label: "Morning (9:00 AM - 12:00 PM)" },
  { value: "afternoon", label: "Afternoon (12:00 PM - 5:00 PM)" },
  { value: "evening", label: "Evening (5:00 PM - 8:00 PM)" },
  { value: "anytime", label: "Anytime (9:00 AM - 8:00 PM)" }
];

const CODSpecificFields = ({ fields, onFieldChange, orderValue }: CODSpecificFieldsProps) => {
  const requiresIDVerification = orderValue > 10000;

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Phone className="w-5 h-5" />
          Cash on Delivery Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="alternatePhone" className="flex items-center gap-1">
              Alternate Phone Number
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="alternatePhone"
              placeholder="071-234-5678"
              value={fields.alternatePhone}
              onChange={(e) => onFieldChange('alternatePhone', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Backup contact for delivery coordination
            </p>
          </div>

          <div>
            <Label htmlFor="timeSlot" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Preferred Delivery Time
            </Label>
            <Select 
              value={fields.preferredTimeSlot} 
              onValueChange={(value) => onFieldChange('preferredTimeSlot', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="codInstructions">Special COD Delivery Instructions</Label>
          <Textarea
            id="codInstructions"
            placeholder="e.g., Call before arriving, Ring apartment bell #123, Meet at security gate..."
            value={fields.codDeliveryInstructions}
            onChange={(e) => onFieldChange('codDeliveryInstructions', e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        {requiresIDVerification && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-3 flex-1">
                <div>
                  <h4 className="font-medium text-blue-900">ID Verification Required</h4>
                  <p className="text-sm text-blue-700">
                    Orders above LKR 10,000 require ID verification for security purposes.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="idConsent"
                    checked={fields.idVerificationConsent}
                    onCheckedChange={(checked) => onFieldChange('idVerificationConsent', checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="idConsent" className="text-sm leading-relaxed cursor-pointer">
                    I consent to provide valid ID (NIC/Passport/Driving License) upon delivery for verification purposes. The delivery person will verify the ID holder matches the order details.
                  </Label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-brand-grey-light p-4 rounded-md border border-brand-border">
          <h4 className="font-medium text-brand-black mb-2">COD Process:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>We'll call you to confirm the order details</li>
            <li>Your order will be prepared and dispatched</li>
            <li>Delivery person will contact you before arrival</li>
            <li>Inspect the product before making payment</li>
            <li>Pay the exact amount in cash to the delivery person</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default CODSpecificFields;