import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserX, Phone, Mail, User, AlertTriangle } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

interface InactiveMember {
  id: string;
  name: string;
  reason: string;
}

interface InactiveMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: InactiveMember[];
}

const InactiveMembersDialog: React.FC<InactiveMembersDialogProps> = ({
  open,
  onOpenChange,
  members,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <UserX className="w-6 h-6 text-gray-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            Inactive Members
          </DialogTitle>
          <DialogDescription className="text-center">
            Members with inactive status or expired memberships
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {members.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No inactive members</p>
              <p className="text-sm text-gray-400 mt-1">
                All members are active!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <h4 className="font-semibold text-gray-900">
                            {member.name}
                          </h4>
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            Inactive
                          </Badge>
                        </div>
                        
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-red-600">{member.reason}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Member ID: {member.id.slice(0, 8)}...
                        </span>
                        <span className="text-red-600 font-medium">
                          Requires attention
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InactiveMembersDialog;