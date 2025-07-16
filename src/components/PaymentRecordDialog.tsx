import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Phone, User, Sparkles, CheckCircle, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface PaymentRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentRecordDialog: React.FC<PaymentRecordDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState({
    name: "",
    phone: "",
    amount: ""
  });
  const [paymentDuration, setPaymentDuration] = useState<"daily" | "weekly" | "monthly">("daily");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mpesa">("cash");
  const [submitting, setSubmitting] = useState(false);
  const [recordStep, setRecordStep] = useState<"form" | "processing" | "success">("form");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Search for existing members
  const { data: members = [] } = useQuery({
    queryKey: ["search_members", paymentData.name],
    queryFn: async () => {
      if (!paymentData.name.trim()) return [];
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .ilike("name", `%${paymentData.name}%`)
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: paymentData.name.length > 2
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.name.trim() || !paymentData.phone.trim() || !paymentData.amount.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(Number(paymentData.amount)) || Number(paymentData.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    setRecordStep("processing");

    try {
      // Get member ID from selected member or search by name
      let memberId = selectedMember;
      
      if (!memberId && paymentData.name.trim()) {
        const { data: existingMembers, error: searchError } = await supabase
          .from("members")
          .select("id")
          .eq("name", paymentData.name.trim())
          .limit(1);
        
        if (searchError) throw new Error("Failed to search for member");
        
        if (existingMembers && existingMembers.length > 0) {
          memberId = existingMembers[0].id;
        }
      }

      if (!memberId) {
        throw new Error("Member not found. Please select a valid member.");
      }

      // Calculate dates
      const today = new Date();
      const startDate = new Date(today);
      let endDate: Date;
      
      if (paymentDuration === "daily") {
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Valid till midnight
      } else if (paymentDuration === "weekly") {
        endDate = new Date(today);
        endDate.setDate(today.getDate() + 7);
      } else { // monthly
        endDate = new Date(today);
        endDate.setMonth(today.getMonth() + 1);
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          member_id: memberId,
          amount: Number(paymentData.amount),
          start_date: startDate.toISOString(),
          ending_date: endDate.toISOString(),
          status: 'complete',
          payment_method: paymentMethod,
          subscription_period: paymentDuration,
          description: `${paymentDuration} payment recorded manually`,
          updated_at: new Date().toISOString()
        });

      if (transactionError) {
        throw new Error("Failed to record payment transaction");
      }

      setRecordStep("success");
      toast({
        title: "Payment Recorded! 💰",
        description: `Payment of KSh ${paymentData.amount} recorded for ${paymentData.name}.`,
      });
      
      // Auto close after success animation
      setTimeout(() => {
        handleDialogClose();
      }, 3000);

    } catch (err: any) {
      console.error('Payment recording error:', err);
      toast({
        title: "Recording Failed",
        description: err.message || "Unable to record payment. Please try again.",
        variant: "destructive",
      });
      setRecordStep("form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setPaymentData({ name: "", phone: "", amount: "" });
    setPaymentDuration("daily");
    setPaymentMethod("cash");
    setRecordStep("form");
    setSubmitting(false);
    setSelectedMember(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md mx-auto overflow-hidden" aria-describedby="payment-description">
        {/* Animated money background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 animate-pulse"></div>
        <div className="absolute top-4 right-4 opacity-10">
          <DollarSign className="w-32 h-32 text-green-600 animate-bounce" />
        </div>
        
        <div className="relative z-10">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
              {recordStep === "form" && <CreditCard className="w-8 h-8 text-white" />}
              {recordStep === "processing" && <Sparkles className="w-8 h-8 text-white animate-spin" />}
              {recordStep === "success" && <CheckCircle className="w-8 h-8 text-white" />}
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              {recordStep === "form" && "Record Payment"}
              {recordStep === "processing" && "Processing..."}
              {recordStep === "success" && "Payment Recorded!"}
            </DialogTitle>
            <DialogDescription id="payment-description" className="text-center">
              {recordStep === "form" && "Enter member payment details"}
              {recordStep === "processing" && "Recording payment information"}
              {recordStep === "success" && "Payment has been successfully recorded!"}
            </DialogDescription>
          </DialogHeader>

          {recordStep === "form" && (
            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="w-4 h-4 text-green-600" />
                  <span>Member Name</span>
                </label>
                <div className="relative">
                  <Input
                    placeholder="Enter member's full name"
                    value={paymentData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={submitting}
                    required
                    className="pl-10 border-2 focus:border-green-500 transition-all duration-300 hover:shadow-md"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                {/* Show member suggestions */}
                {members.length > 0 && (
                  <div className="mt-2 border rounded-lg bg-white shadow-sm max-h-32 overflow-y-auto">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setSelectedMember(member.id);
                          setPaymentData(prev => ({
                            ...prev,
                            name: member.name,
                            phone: member.phone || ""
                          }));
                        }}
                      >
                        <div className="font-medium text-sm">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.phone || member.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span>Phone Number</span>
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={paymentData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={submitting}
                    required
                    className="pl-10 border-2 focus:border-green-500 transition-all duration-300 hover:shadow-md"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Amount Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span>Payment Amount (KSh)</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Enter amount in Kenyan Shillings"
                    value={paymentData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    disabled={submitting}
                    required
                    className="pl-12 border-2 focus:border-green-500 transition-all duration-300 hover:shadow-md text-lg font-semibold"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">KSh</span>
                </div>
              </div>

              {/* Payment Duration */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span>Payment Duration</span>
                </label>
                <RadioGroup
                  value={paymentDuration}
                  onValueChange={(value: "daily" | "weekly" | "monthly") => setPaymentDuration(value)}
                  className="grid grid-cols-3 gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily" className="text-sm font-medium cursor-pointer">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="text-sm font-medium cursor-pointer">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="text-sm font-medium cursor-pointer">Monthly</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span>Payment Method</span>
                </label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: "cash" | "mpesa") => setPaymentMethod(value)}
                  className="grid grid-cols-2 gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="text-sm font-medium cursor-pointer">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mpesa" id="mpesa" />
                    <Label htmlFor="mpesa" className="text-sm font-medium cursor-pointer">M-Pesa</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleDialogClose}
                  disabled={submitting}
                  className="flex-1 hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Recording...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Record Payment</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}

          {recordStep === "processing" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-green-100 rounded-full"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <DollarSign className="absolute inset-0 w-8 h-8 m-auto text-green-600 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium">Recording payment for {paymentData.name}</p>
                <p className="text-sm text-muted-foreground">Amount: KSh {paymentData.amount}</p>
              </div>
            </div>
          )}

          {recordStep === "success" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="relative">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div className="absolute -inset-2 bg-green-200/50 rounded-full animate-ping"></div>
                {/* Floating money icons */}
                <div className="absolute -top-4 -left-4 animate-bounce delay-100">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div className="absolute -top-4 -right-4 animate-bounce delay-300">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-lg text-green-700">Payment Recorded!</p>
                <p className="text-sm text-muted-foreground">
                  KSh {paymentData.amount} from {paymentData.name}
                </p>
                <div className="text-xs text-green-600 font-medium">✨ Transaction Complete ✨</div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRecordDialog;