
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { UserCheck, Phone, User, Sparkles, CheckCircle, AlertTriangle, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface MemberCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MemberCheckInDialog: React.FC<MemberCheckInDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [memberData, setMemberData] = useState({
    name: "",
    phone: ""
  });
  const [paymentData, setPaymentData] = useState({
    amount: "",
    period: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [checkInStep, setCheckInStep] = useState<"form" | "processing" | "payment" | "success">("form");
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Search for existing members
  const { data: members = [] } = useQuery({
    queryKey: ["search_members_checkin", memberData.name],
    queryFn: async () => {
      if (!memberData.name.trim()) return [];
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .ilike("name", `%${memberData.name}%`)
        .eq("status", "active")
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: memberData.name.length > 2
  });

  const handleInputChange = (field: string, value: string) => {
    setMemberData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateEndingDate = (period: string, startDate: Date) => {
    const endDate = new Date(startDate);
    
    if (period === 'daily') {
      // For daily, end at midnight of the same day
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'weekly') {
      endDate.setDate(endDate.getDate() + 7);
    } else if (period === 'monthly') {
      endDate.setDate(endDate.getDate() + 30);
    }
    
    return endDate;
  };

  const handlePaymentSubmit = async () => {
    if (!paymentData.amount || !paymentData.period) {
      toast({
        title: "Missing Payment Details",
        description: "Please enter amount and select payment period.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const currentTime = new Date();
      const endingDate = calculateEndingDate(paymentData.period, currentTime);

      // Update or create transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .upsert({
          member_id: currentMember.id,
          amount: parseFloat(paymentData.amount),
          start_date: currentTime.toISOString(),
          ending_date: endingDate.toISOString(),
          payment_method: 'cash',
          subscription_period: paymentData.period,
          status: 'complete',
          description: `${paymentData.period} payment during check-in`,
          updated_at: new Date().toISOString()
        });

      if (transactionError) {
        toast({
          title: "Payment Update Failed",
          description: "Unable to update payment. Please try again.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Now proceed with check-in
      await processCheckIn();
      
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An error occurred while processing payment.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const processCheckIn = async () => {
    try {
      // Create new check-in record
      const { error: checkInError } = await supabase
        .from('check_ins')
        .insert({
          member_id: currentMember.id,
          check_in_time: new Date().toISOString()
        });

      if (checkInError) {
        toast({
          title: "Check-in Failed",
          description: "Unable to record check-in. Please try again.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      setCheckInStep("success");
      toast({
        title: "Check-In Successful! 🎉",
        description: `Welcome ${currentMember.name}! You're all checked in.`,
      });
      
      setTimeout(() => {
        handleDialogClose();
      }, 2500);

    } catch (err) {
      toast({
        title: "System Error",
        description: "An unexpected error occurred during check-in.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberData.name.trim() || !memberData.phone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and phone number.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    setCheckInStep("processing");

    try {
      // Use selected member ID if available, otherwise search by name and phone
      let member: any = null;
      let memberError: any = null;
      
      if (selectedMember) {
        const { data, error } = await supabase
          .from('members')
          .select('id, name, phone, status')
          .eq('id', selectedMember)
          .single();
        member = data;
        memberError = error;
      } else {
        const { data, error } = await supabase
          .from('members')
          .select('id, name, phone, status')
          .eq('name', memberData.name.trim())
          .eq('phone', memberData.phone.trim())
          .single();
        member = data;
        memberError = error;
      }

      if (memberError || !member) {
        toast({
          title: "Member Not Found",
          description: "No member found with the provided name and phone number.",
          variant: "destructive",
        });
        setCheckInStep("form");
        setSubmitting(false);
        return;
      }

      if (member.status === 'inactive') {
        toast({
          title: "Member Inactive",
          description: "This member account is inactive. Please contact staff.",
          variant: "destructive",
        });
        setCheckInStep("form");
        setSubmitting(false);
        return;
      }

      setCurrentMember(member);

      // Check the latest transaction ending date
      const { data: latestTransaction, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('member_id', member.id)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (transactionError) {
        toast({
          title: "Database Error",
          description: "Unable to check payment status. Please try again.",
          variant: "destructive",
        });
        setCheckInStep("form");
        setSubmitting(false);
        return;
      }

      const currentTime = new Date();
      
      // Check if payment is valid
      if (!latestTransaction || !latestTransaction.ending_date || 
          new Date(latestTransaction.ending_date) < currentTime) {
        
        // Payment expired or doesn't exist - show payment form
        setCheckInStep("payment");
        setSubmitting(false);
        return;
      }

      // Payment is valid - proceed with check-in
      await processCheckIn();

    } catch (err: any) {
      toast({
        title: "System Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setCheckInStep("form");
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setMemberData({ name: "", phone: "" });
    setPaymentData({ amount: "", period: "" });
    setCheckInStep("form");
    setSubmitting(false);
    setCurrentMember(null);
    setSelectedMember(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-md mx-auto overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 animate-pulse"></div>
        
        <div className="relative z-10">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mb-2">
              {checkInStep === "form" && <UserCheck className="w-8 h-8 text-white" />}
              {checkInStep === "processing" && <Sparkles className="w-8 h-8 text-white animate-spin" />}
              {checkInStep === "payment" && <CreditCard className="w-8 h-8 text-white" />}
              {checkInStep === "success" && <CheckCircle className="w-8 h-8 text-white" />}
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {checkInStep === "form" && "Member Check-In"}
              {checkInStep === "processing" && "Verifying..."}
              {checkInStep === "payment" && "Payment Required"}
              {checkInStep === "success" && "Welcome!"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base">
              {checkInStep === "form" && "Enter your details to check in"}
              {checkInStep === "processing" && "Verifying your membership details"}
              {checkInStep === "payment" && "Your payment has expired. Please update your payment to continue."}
              {checkInStep === "success" && "You're successfully checked in!"}
            </DialogDescription>
          </DialogHeader>

          {checkInStep === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="w-4 h-4 text-primary" />
                  <span>Full Name</span>
                </label>
                <div className="relative">
                  <Input
                    placeholder="Enter your full name"
                    value={memberData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={submitting}
                    required
                    className="pl-10 border-2 focus:border-primary transition-all duration-300 hover:shadow-lg text-base sm:text-sm"
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
                          setMemberData(prev => ({
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
                  <Phone className="w-4 h-4 text-primary" />
                  <span>Phone Number</span>
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={memberData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={submitting}
                    required
                    className="pl-10 border-2 focus:border-primary transition-all duration-300 hover:shadow-lg text-base sm:text-sm"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleDialogClose}
                  disabled={submitting}
                  className="w-full sm:flex-1 hover:bg-muted/80 transition-colors h-12 sm:h-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full sm:flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 h-12 sm:h-auto"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Checking In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Check In</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}

          {checkInStep === "processing" && (
            <div className="flex flex-col items-center space-y-4 py-6 sm:py-8">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-sm sm:text-base">Verifying {memberData.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Please wait a moment...</p>
              </div>
            </div>
          )}

          {checkInStep === "payment" && (
            <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base text-destructive">Payment Expired</p>
                    <p className="text-xs sm:text-sm text-destructive/80 mt-1">
                      Hi {currentMember?.name}, your gym access has expired. Please update your payment to continue.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>Amount (Ksh)</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount in Kenyan Shillings"
                    value={paymentData.amount}
                    onChange={(e) => handlePaymentChange("amount", e.target.value)}
                    disabled={submitting}
                    required
                    className="border-2 focus:border-primary transition-all duration-300 text-base sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Payment Period</label>
                  <Select value={paymentData.period} onValueChange={(value) => handlePaymentChange("period", value)}>
                    <SelectTrigger className="border-2 focus:border-primary transition-all duration-300 h-12 sm:h-10">
                      <SelectValue placeholder="Select payment period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily (Valid until midnight today)</SelectItem>
                      <SelectItem value="weekly">Weekly (7 days)</SelectItem>
                      <SelectItem value="monthly">Monthly (30 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleDialogClose}
                    disabled={submitting}
                    className="w-full sm:flex-1 hover:bg-muted/80 transition-colors h-12 sm:h-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePaymentSubmit}
                    disabled={submitting || !paymentData.amount || !paymentData.period}
                    className="w-full sm:flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 h-12 sm:h-auto"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>Processing Payment...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>Update Payment & Check In</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {checkInStep === "success" && (
            <div className="flex flex-col items-center space-y-4 py-6 sm:py-8">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-600" />
                </div>
                <div className="absolute -inset-2 bg-green-200/50 rounded-full animate-ping"></div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-base sm:text-lg">Welcome back, {currentMember?.name}!</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Enjoy your workout! 💪</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberCheckInDialog;
