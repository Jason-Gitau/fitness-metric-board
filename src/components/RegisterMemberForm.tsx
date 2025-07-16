import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, User, Mail, Phone, Calendar, Users, UserCheck, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const statusOptions = ["active", "inactive", "pending", "expired"];
const genderOptions = ["male", "female", "rather not say"];

interface RegisterMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RegisterMemberForm: React.FC<RegisterMemberFormProps> = ({ open, onOpenChange }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    join_date: undefined as Date | undefined,
    status: "active",
    gender: "male"
  });

  const [submitting, setSubmitting] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newMemberId, setNewMemberId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'name' ? e.target.value : e.target.value.trim();
    setForm({ ...form, [e.target.name]: value });
  };

  const handleDateChange = (field: string) => (date: Date | undefined) => {
    setForm({ ...form, [field]: date });
  };

  const handleGenderChange = (value: string) => {
    setForm({ ...form, gender: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.join_date) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in to register a member.", variant: "destructive" });
        return;
      }

      // Insert member into database
      const { data, error } = await supabase
        .from('members')
        .insert([{
          name: form.name,
          email: form.email,
          phone: form.phone,
          join_date: form.join_date.toISOString(),
          status: form.status,
          gender: form.gender
        }])
        .select()
        .single();

      if (error) throw error;

      setNewMemberId(data.id);
      toast({ title: "Success", description: "Member registered successfully!" });
      
      // Ask if they want to update payment
      setShowPaymentForm(true);

    } catch (err) {
      toast({ title: "Error", description: "Failed to register member.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemberId) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const amount = parseFloat(formData.get('amount') as string);
    const period = formData.get('period') as string;

    if (!amount || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const now = new Date();
      let endingDate = new Date(now);
      
      if (period === 'daily') {
        endingDate.setHours(23, 59, 59, 999); // Valid till midnight today
      } else if (period === 'weekly') {
        endingDate.setDate(now.getDate() + 7);
      } else if (period === 'monthly') {
        endingDate.setMonth(now.getMonth() + 1);
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          member_id: newMemberId,
          amount: amount,
          period: period,
          start_date: now.toISOString(),
          ending_date: endingDate.toISOString(),
          status: 'complete',
          payment_method: 'cash',
          description: `${period} payment for new member registration`,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({ title: "Success", description: "Payment recorded successfully!" });
      
      // Reset form and close
      setForm({
        name: "",
        email: "",
        phone: "",
        join_date: undefined,
        status: "active",
        gender: "male"
      });
      setShowPaymentForm(false);
      setNewMemberId(null);
      onOpenChange(false);

    } catch (err) {
      toast({ title: "Error", description: "Failed to record payment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipPayment = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      join_date: undefined,
      status: "active",
      gender: "male"
    });
    setShowPaymentForm(false);
    setNewMemberId(null);
    onOpenChange(false);
  };

  if (showPaymentForm) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="pb-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DrawerTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Update Payment
                  </DrawerTitle>
                  <p className="text-sm text-muted-foreground mt-1">Set up payment for the new member</p>
                </div>
              </div>
            </div>
          </DrawerHeader>
          
          <div className="px-4 pb-6 overflow-y-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-4">
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Amount (KSh) *</Label>
                      <Input
                        name="amount"
                        type="number"
                        step="0.01"
                        placeholder="Enter amount"
                        required
                        className="border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Payment Period *</Label>
                      <select
                        name="period"
                        className="w-full border-2 rounded-md h-10 px-3 bg-background border-input focus:border-primary transition-colors"
                        required
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleSkipPayment}
                      className="flex-1 sm:flex-initial"
                    >
                      Skip Payment
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 sm:flex-initial bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
                    >
                      {submitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Recording...</span>
                        </div>
                      ) : (
                        "Record Payment"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Register New Member
                </DrawerTitle>
                <p className="text-sm text-muted-foreground mt-1">Add a new member to your gym community</p>
              </div>
            </div>
          </div>
        </DrawerHeader>
        
        <div className="px-4 pb-6 overflow-y-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center space-x-2">
                        <User className="w-4 h-4 text-primary" />
                        <span>Full Name *</span>
                      </Label>
                      <Input 
                        name="name" 
                        placeholder="Enter full name" 
                        value={form.name} 
                        onChange={handleChange} 
                        required 
                        className="border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <span>Email *</span>
                      </Label>
                      <Input 
                        name="email" 
                        type="email"
                        placeholder="member@example.com" 
                        value={form.email} 
                        onChange={handleChange} 
                        required 
                        className="border-2 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>Phone Number *</span>
                      </Label>
                      <Input 
                        name="phone" 
                        placeholder="07XXXXXXXX" 
                        value={form.phone} 
                        onChange={handleChange} 
                        required 
                        className="border-2 focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-primary" />
                        <span>Gender</span>
                      </Label>
                      <RadioGroup 
                        value={form.gender} 
                        onValueChange={handleGenderChange}
                        className="flex flex-row space-x-6"
                      >
                        {genderOptions.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option} className="text-sm capitalize">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* Membership Information Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Membership Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <span>Join Date *</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border-2 hover:border-primary transition-colors",
                              !form.join_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.join_date ? format(form.join_date, "PPP") : <span>Select join date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-0 w-auto">
                          <CalendarComponent
                            mode="single"
                            selected={form.join_date}
                            onSelect={handleDateChange("join_date")}
                            initialFocus
                            className="p-3"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center space-x-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Status</span>
                      </Label>
                      <select
                        name="status"
                        className="w-full border-2 rounded-md h-10 px-3 bg-background border-input focus:border-primary transition-colors"
                        value={form.status}
                        onChange={handleChange}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                  <DrawerClose asChild>
                    <Button type="button" variant="outline" className="flex-1 sm:flex-initial">
                      Cancel
                    </Button>
                  </DrawerClose>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {submitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Registering...</span>
                      </div>
                    ) : (
                      "Register Member"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default RegisterMemberForm;