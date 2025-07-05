import { differenceInCalendarDays, parseISO, isValid } from "date-fns";

export interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  join_date: string;
  status?: string | null;
  Birthdate?: string | null;
}

export interface CategorizationResult {
  active: Member[];
  dueSoon: Member[];
  overdue: Member[];
  inactive: {
    id: number;
    name: string;
    reason: string;
  }[];
}

export function categorizeMembers(members: Member[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result: CategorizationResult = {
    active: [],
    dueSoon: [],
    overdue: [],
    inactive: [],
  };

  members.forEach((member) => {
    // Since the members table doesn't have membership_end_date or last_visit,
    // we'll use a simplified categorization based on status and join_date
    
    // If status is explicitly set to inactive or suspended
    if (member.status?.toLowerCase() === 'inactive' || member.status?.toLowerCase() === 'suspended') {
      result.inactive.push({
        id: member.id,
        name: member.name,
        reason: `Status: ${member.status}`,
      });
      return;
    }

    // Check if member joined more than 60 days ago and has inactive status
    const joinDate = parseISO(member.join_date);
    const daysSinceJoin = differenceInCalendarDays(today, joinDate);
    
    if (daysSinceJoin > 60 && (!member.status || member.status.toLowerCase() !== 'active')) {
      result.inactive.push({
        id: member.id,
        name: member.name,
        reason: "Long-term member with non-active status",
      });
      return;
    }

    // For simplicity, categorize based on status or default to active
    if (member.status?.toLowerCase() === 'pending') {
      result.dueSoon.push(member);
    } else if (member.status?.toLowerCase() === 'expired') {
      result.overdue.push(member);
    } else {
      result.active.push(member);
    }
  });

  return result;
}