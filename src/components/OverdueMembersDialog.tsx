
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
import type { Member } from "@/utils/memberCategorization";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface OverdueMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
}

const OverdueMembersDialog: React.FC<OverdueMembersDialogProps> = ({ open, onOpenChange, members }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center mb-1">
            <Calendar className="w-5 h-5 mr-2 text-red-600" />
            <DialogTitle>Overdue Renewals</DialogTitle>
          </div>
          <DialogDescription>
            These members have overdue renewal. Take action soon.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto max-h-[60vh]">
          {members.length === 0 ? (
            <div className="flex justify-center text-gray-400 py-8">No members with overdue renewals</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Membership Type</TableHead>
                  <TableHead>Membership End</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.status ?? <span className="italic text-gray-400">—</span>}</TableCell>
                    <TableCell>
                      {m.join_date ? format(new Date(m.join_date), "MMM d, yyyy") : <span className="italic text-gray-400">—</span>}
                    </TableCell>
                    <TableCell>
                      <span className="italic text-gray-400">—</span>
                    </TableCell>
                    <TableCell>
                      <span className="italic text-gray-400">—</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogClose asChild>
          <button className="mt-6 mx-auto block bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-6 rounded-lg transition">Close</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default OverdueMembersDialog;
