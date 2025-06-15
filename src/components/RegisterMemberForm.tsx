import React, { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";

// Membership and Payment Status options
const membershipTypes = ["Monthly", "Yearly", "Weekly", "Daily", "Quarterly"];
const paymentStatuses = ["Paid", "Pending", "Not Paid", "Overdue"];

interface RegisterMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXTERNAL_WEBHOOK_URL = "https://naturally-tolerant-leech.ngrok-free.app/webhook-test/ba3b058f-268f-4e28-8000-702c42e4f4d8";

const RegisterMemberForm: React.FC<RegisterMemberFormProps> = ({ open, onOpenChange }) => {
  const [form, setForm] = useState({
    phone: "",
    fullName: "",
    membershipType: "",
    membershipStart: undefined as Date | undefined,
    paymentStatus: "",
    amountPaid: "",
    whatsappConsent: "",
    referrerId: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Use Supabase's user session to control registration visibility
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    // Optional: listen to auth events if needed
  }, []);

  // Show amount paid only if "Paid" is selected
  const showAmountPaid = form.paymentStatus === "Paid";

  const sanitizeInput = (value: string) => value.trim().replace(/[<>]/g, "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: sanitizeInput(e.target.value) });
  };

  const handleDateChange = (date: Date | undefined) => {
    setForm({ ...form, membershipStart: date });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Input validation and sanitization
    if (!form.phone || !form.fullName || !form.membershipType || !form.membershipStart || !form.paymentStatus || !form.whatsappConsent) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    if (showAmountPaid && !form.amountPaid) {
      toast({ title: "Error", description: "Please enter the amount paid for Paid status.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      // Webhook payload: all fields sanitized above
      const payload = {
        phone: form.phone,
        fullName: form.fullName,
        membershipType: form.membershipType,
        membershipStart: form.membershipStart?.toISOString().split("T")[0],
        paymentStatus: form.paymentStatus,
        amountPaid: showAmountPaid ? form.amountPaid : undefined,
        whatsappConsent: form.whatsappConsent,
        referrerId: form.referrerId
      };

      // For the webhook, strongly recommend restricting this endpoint and validating signatures
      const res = await fetch(EXTERNAL_WEBHOOK_URL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Submission failed");

      toast({ title: "Success", description: "Member registered successfully!" });
      setForm({
        phone: "",
        fullName: "",
        membershipType: "",
        membershipStart: undefined,
        paymentStatus: "",
        amountPaid: "",
        whatsappConsent: "",
        referrerId: ""
      });
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to register member.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Only show the form for authenticated users
  if (!user) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Register a New Member</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 text-red-600">
            You must be logged in to register a new member.
          </div>
          <DrawerClose asChild>
            <Button type="button" variant="ghost">
              Close
            </Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Register a New Member</DrawerTitle>
        </DrawerHeader>
        <form className="px-4 pb-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <Input name="phone" placeholder="07XXXXXXXX" value={form.phone} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <Input name="fullName" placeholder="Member's full name" value={form.fullName} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Membership Type *</label>
            <select
              name="membershipType"
              className="w-full border rounded-md h-10 px-2 bg-white"
              value={form.membershipType}
              onChange={handleChange}
              required
            >
              <option value="">Select...</option>
              {membershipTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Membership Start Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.membershipStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  {form.membershipStart ? format(form.membershipStart, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0 w-auto">
                <Calendar
                  mode="single"
                  selected={form.membershipStart}
                  onSelect={handleDateChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Status *</label>
            <select
              name="paymentStatus"
              className="w-full border rounded-md h-10 px-2 bg-white"
              value={form.paymentStatus}
              onChange={handleChange}
              required
            >
              <option value="">Select...</option>
              {paymentStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          {showAmountPaid && (
            <div>
              <label className="block text-sm font-medium mb-1">Amount Paid *</label>
              <Input
                name="amountPaid"
                placeholder="Enter amount"
                type="number"
                value={form.amountPaid}
                onChange={handleChange}
                required={showAmountPaid}
                min={0}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp Consent *</label>
            <select
              name="whatsappConsent"
              className="w-full border rounded-md h-10 px-2 bg-white"
              value={form.whatsappConsent}
              onChange={handleChange}
              required
            >
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Referrer ID (Optional)</label>
            <Input name="referrerId" placeholder="Referrer Name or ID" value={form.referrerId} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-2">
            <DrawerClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default RegisterMemberForm;
