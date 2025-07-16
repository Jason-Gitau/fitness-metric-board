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
import { Calendar, Phone, Mail, User, Clock } from "lucide-react";
import { Member } from "@/utils/memberCategorization";
import { format, parseISO, isValid } from "date-fns";

interface DueMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
}

const DueMembersDialog: React.FC<DueMembersDialogProps> = ({
  open,
  onOpenChange,
  members,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            Due for Renewal
          </DialogTitle>
          <DialogDescription className="text-center">
            Members with subscriptions expiring within 7 days
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No members due for renewal</p>
              <p className="text-sm text-gray-400 mt-1">
                All subscriptions are up to date!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-orange-600" />
                          <h4 className="font-semibold text-gray-900">
                            {member.name}
                          </h4>
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                            Due Soon
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          {member.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          {member.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">
                              Member since: {
                                isValid(parseISO(member.join_date))
                                  ? format(parseISO(member.join_date), 'MMM dd, yyyy')
                                  : 'Unknown'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Type: {member.membership_type}
                        </span>
                        <span className="text-orange-600 font-medium">
                          Contact for renewal
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

export default DueMembersDialog;