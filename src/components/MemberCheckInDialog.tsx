
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface MemberCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MemberCheckInDialog: React.FC<MemberCheckInDialogProps> = ({ open, onOpenChange }) => {
  const [memberId, setMemberId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId.trim()) {
      toast({ title: "Error", description: "Please enter a Member ID.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("https://naturally-tolerant-leech.ngrok-free.app/webhook-test/55d9aa3f-d27f-4c61-9e19-f84b1c3f452c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (!res.ok) throw new Error("Submission failed");
      toast({ title: "Check-In Successful", description: "Member has been checked in." });
      setMemberId(""); // clear field
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to check in member.", variant: "destructive" });
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
          <DialogDescription>Please enter the Member ID to check in.</DialogDescription>
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
