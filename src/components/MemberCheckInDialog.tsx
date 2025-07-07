
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
import { toast } from "@/hooks/use-toast";
import { UserCheck, Phone, User, Sparkles, CheckCircle } from "lucide-react";

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
  const [submitting, setSubmitting] = useState(false);
  const [checkInStep, setCheckInStep] = useState<"form" | "processing" | "success">("form");

  const handleInputChange = (field: string, value: string) => {
    setMemberData(prev => ({
      ...prev,
      [field]: value
    }));
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
      // Send data to webhook for verification
      const res = await fetch(
        "https://PLACEHOLDER_WEBHOOK_URL/member-checkin-verification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: memberData.name.trim(),
            phone: memberData.phone.trim(),
            timestamp: new Date().toISOString()
          }),
        }
      );
      
      const result = await res.json().catch(() => ({}));
      
      if (res.ok) {
        setCheckInStep("success");
        toast({
          title: "Check-In Successful! 🎉",
          description: result?.message || `Welcome ${memberData.name}! You're all checked in.`,
        });
        
        // Auto close after success animation
        setTimeout(() => {
          handleDialogClose();
        }, 2500);
      } else {
        toast({
          title: "Verification Failed",
          description: result?.message || "Unable to verify member details. Please check your information.",
          variant: "destructive",
        });
        setCheckInStep("form");
      }
    } catch (err: any) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to verification service. Please try again.",
        variant: "destructive",
      });
      setCheckInStep("form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setMemberData({ name: "", phone: "" });
    setCheckInStep("form");
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md mx-auto overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 animate-pulse"></div>
        
        <div className="relative z-10">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mb-2">
              {checkInStep === "form" && <UserCheck className="w-8 h-8 text-white" />}
              {checkInStep === "processing" && <Sparkles className="w-8 h-8 text-white animate-spin" />}
              {checkInStep === "success" && <CheckCircle className="w-8 h-8 text-white" />}
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {checkInStep === "form" && "Member Check-In"}
              {checkInStep === "processing" && "Verifying..."}
              {checkInStep === "success" && "Welcome!"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {checkInStep === "form" && "Enter your details to check in"}
              {checkInStep === "processing" && "Verifying your membership details"}
              {checkInStep === "success" && "You're successfully checked in!"}
            </DialogDescription>
          </DialogHeader>

          {checkInStep === "form" && (
            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
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
                    className="pl-10 border-2 focus:border-primary transition-all duration-300 hover:shadow-lg"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
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
                    className="pl-10 border-2 focus:border-primary transition-all duration-300 hover:shadow-lg"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
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
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
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
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium">Verifying {memberData.name}</p>
                <p className="text-sm text-muted-foreground">Please wait a moment...</p>
              </div>
            </div>
          )}

          {checkInStep === "success" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="relative">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div className="absolute -inset-2 bg-green-200/50 rounded-full animate-ping"></div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-lg">Welcome back, {memberData.name}!</p>
                <p className="text-sm text-muted-foreground">Enjoy your workout! 💪</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberCheckInDialog;
