
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import type { TestMember } from "@/utils/memberCategorization";
import { Users } from "lucide-react";
import { format } from "date-fns";

interface ActiveMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TestMember[];
}

const ActiveMembersDialog: React.FC<ActiveMembersDialogProps> = ({ open, onOpenChange, members }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center mb-1">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            <DialogTitle>Active Members</DialogTitle>
          </div>
          <DialogDescription>
            These are all members who are currently active.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto max-h-[60vh]">
          {members.length === 0 ? (
            <div className="flex justify-center text-gray-400 py-8">No active members</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Membership Type</TableHead>
                  <TableHead>Membership End</TableHead>
                  <TableHead>Last Visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.member_id}>
                    <TableCell className="font-medium">{m.full_name ?? <span className="italic text-gray-400">—</span>}</TableCell>
                    <TableCell>{m.membership_type ?? <span className="italic text-gray-400">—</span>}</TableCell>
                    <TableCell>
                      {m.membership_end_date ? format(new Date(m.membership_end_date), "MMM d, yyyy") : <span className="italic text-gray-400">—</span>}
                    </TableCell>
                    <TableCell>
                      {m.last_visit ? format(new Date(m.last_visit), "MMM d, yyyy") : <span className="italic text-gray-400">Never</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogClose asChild>
          <button className="mt-6 mx-auto block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-6 rounded-lg transition">Close</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default ActiveMembersDialog;
