import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, DollarSign, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Member = Tables<'members'>;

interface StripePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
}

const membershipPrices = {
  daily: 15,
  weekly: 75,
  monthly: 250
};

const StripePaymentDialog: React.FC<StripePaymentDialogProps> = ({
  open,
  onOpenChange,
  member
}) => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!member) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          memberId: member.id,
          amount: membershipPrices[selectedPeriod],
          period: selectedPeriod,
          membershipType: member.membership_type
        }
      });

      if (error) {
        throw error;
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Online Payment
          </DialogTitle>
          <DialogDescription>
            {member ? `Process payment for ${member.name}` : "Select payment options"}
          </DialogDescription>
        </DialogHeader>

        {member && (
          <div className="space-y-6 pt-4">
            {/* Member Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-sm text-gray-700">Member Details</h3>
              <p className="text-lg font-bold text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-600">{member.email}</p>
              <p className="text-sm text-gray-600">Membership: {member.membership_type}</p>
            </div>

            {/* Payment Period Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 text-blue-600" />
                Select Payment Period
              </label>
              <RadioGroup
                value={selectedPeriod}
                onValueChange={(value: "daily" | "weekly" | "monthly") => setSelectedPeriod(value)}
                className="space-y-3"
              >
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily" className="font-medium cursor-pointer">Daily Pass</Label>
                  </div>
                  <div className="text-lg font-bold text-green-600">${membershipPrices.daily}</div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="font-medium cursor-pointer">Weekly Pass</Label>
                  </div>
                  <div className="text-lg font-bold text-green-600">${membershipPrices.weekly}</div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 bg-blue-50 border-blue-200">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="font-medium cursor-pointer">Monthly Pass</Label>
                  </div>
                  <div className="text-lg font-bold text-green-600">${membershipPrices.monthly}</div>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Summary */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${membershipPrices[selectedPeriod]}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} membership payment
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Pay with Stripe
                  </div>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Secure payment powered by Stripe. You will be redirected to complete your payment.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StripePaymentDialog;