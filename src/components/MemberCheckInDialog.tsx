
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface MemberCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper: check overdue
function isMemberOverdue(member: any) {
  if (!member?.membership_end_date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(member.membership_end_date);
  endDate.setHours(0, 0, 0, 0);

  // overdue: endDate before today and not paid
  if (endDate < today && member.payment_status?.toLowerCase() !== "paid") {
    return true;
  }
  return false;
}

const MemberCheckInDialog: React.FC<MemberCheckInDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [memberId, setMemberId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Member ID.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);

    try {
      // 1. Fetch member details
      const { data: member, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", parseInt(memberId.trim()))
        .maybeSingle();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch member info.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      if (!member) {
        toast({
          title: "Not Found",
          description: "Member with that ID does not exist.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // 2. Check for overdue status
      if (isMemberOverdue(member)) {
        toast({
          title: "Check-In Blocked",
          description: `Subscription is overdue for member "${member.name ?? member.id}". Please renew subscription before checking in.`,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Not overdue: Try webhook
      const res = await fetch(
        "https://naturally-tolerant-leech.ngrok-free.app/webhook-test/55d9aa3f-d27f-4c61-9e19-f84b1c3f452c",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId }),
        }
      );
      const result = await res.json().catch(() => ({}));
      // Show webhook response (success or error)
      if (res.ok) {
        toast({
          title: "Check-In Successful",
          description:
            result?.message ||
            `Member "${member.name ?? member.id}" has been checked in.`,
        });
        setMemberId("");
        onOpenChange(false);
      } else {
        toast({
          title: "Check-In Failed",
          description:
            (result && result.message)
              ? result.message
              : "Failed to check in member. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setMemberId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Member Check In</DialogTitle>
          <DialogDescription>
            Please enter the Member ID to check in.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            placeholder="Enter Member ID"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            disabled={submitting}
            required
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Checking In..." : "Check In"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberCheckInDialog;
