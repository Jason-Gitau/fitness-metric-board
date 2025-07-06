import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, User, Mail, Phone, Calendar, Users, Gift } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const statusOptions = ["active", "inactive", "pending", "expired"];

interface RegisterMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEBHOOK_URL = "https://dolphin-precise-quetzal.ngrok-free.app/webhook-test/4820b04b-c696-4501-98b1-04a8e499b620";

const RegisterMemberForm: React.FC<RegisterMemberFormProps> = ({ open, onOpenChange }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    join_date: undefined as Date | undefined,
    status: "active",
    Birthdate: undefined as Date | undefined
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'name' ? e.target.value : e.target.value.trim();
    setForm({ ...form, [e.target.name]: value });
  };

  const handleDateChange = (field: string) => (date: Date | undefined) => {
    setForm({ ...form, [field]: date });
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

      const payload = [{
        name: form.name,
        email: form.email,
        phone: form.phone,
        join_date: form.join_date.toISOString().split("T")[0],
        status: form.status,
        Birthdate: form.Birthdate ? form.Birthdate.toISOString().split("T")[0] : ""
      }];

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Submission failed");

      toast({ title: "Success", description: "Member registered successfully!" });
      setForm({
        name: "",
        email: "",
        phone: "",
        join_date: undefined,
        status: "active",
        Birthdate: undefined
      });
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to register member.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Register New Member
                </DrawerTitle>
                <p className="text-sm text-muted-foreground mt-1">Add a new member to your gym community</p>
              </div>
            </div>
          </div>
        </DrawerHeader>
        
        <div className="px-6 pb-6 overflow-y-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                        <User className="w-4 h-4 text-primary" />
                        <span>Full Name *</span>
                      </label>
                      <Input 
                        name="name" 
                        placeholder="Enter member's full name" 
                        value={form.name} 
                        onChange={handleChange} 
                        required 
                        className="border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <span>Email Address *</span>
                      </label>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>Phone Number *</span>
                      </label>
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
                      <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                        <Gift className="w-4 h-4 text-primary" />
                        <span>Date of Birth</span>
                      </label>
                      <div className="flex gap-2">
                        <Input 
                          type="date"
                          name="birthdateInput"
                          placeholder="YYYY-MM-DD"
                          value={form.Birthdate ? format(form.Birthdate, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              const date = new Date(e.target.value);
                              setForm({ ...form, Birthdate: date });
                            } else {
                              setForm({ ...form, Birthdate: undefined });
                            }
                          }}
                          className="flex-1 border-2 focus:border-primary transition-colors"
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="border-2 hover:border-primary transition-colors"
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="p-0 w-auto">
                            <CalendarComponent
                              mode="single"
                              selected={form.Birthdate}
                              onSelect={handleDateChange("Birthdate")}
                              initialFocus
                              className="p-3 pointer-events-auto"
                              captionLayout="dropdown-buttons"
                              fromYear={1924}
                              toYear={new Date().getFullYear()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Membership Information Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Membership Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        <span>Join Date *</span>
                      </label>
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
                      <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Member Status</span>
                      </label>
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
                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <DrawerClose asChild>
                    <Button type="button" variant="outline" className="px-6">
                      Cancel
                    </Button>
                  </DrawerClose>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
