import { differenceInCalendarDays, parseISO, isValid, isBefore, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  join_date: string;
  status?: string | null;
  Birthdate?: string | null;
}

export interface MemberWithTransaction extends Member {
  transaction?: {
    status: string | null;
    "ending date": string | null;
  }[];
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

export async function fetchMembersWithTransactions(): Promise<MemberWithTransaction[]> {
  // Read directly from transaction table to get accurate renewal data
  const { data, error } = await supabase
    .from("transaction")
    .select(`
      status,
      "ending date",
      members!inner(
        id,
        name,
        email,
        phone,
        join_date,
        status,
        Birthdate
      )
    `);

  if (error) throw error;
  
  // Transform the data to group transactions by member
  const memberMap = new Map<number, MemberWithTransaction>();
  
  data?.forEach((txn: any) => {
    const member = txn.members;
    const memberId = member.id;
    
    if (!memberMap.has(memberId)) {
      memberMap.set(memberId, {
        ...member,
        transaction: []
      });
    }
    
    memberMap.get(memberId)!.transaction!.push({
      status: txn.status,
      "ending date": txn["ending date"]
    });
  });
  
  return Array.from(memberMap.values());
}

export function categorizeMembers(members: MemberWithTransaction[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingThreshold = addDays(today, 7); // 7 days from now

  const result: CategorizationResult = {
    active: [],
    dueSoon: [],
    overdue: [],
    inactive: [],
  };

  members.forEach((member) => {
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

    // Add to active (regardless of payment status)
    result.active.push(member);

    // Check transaction data for overdue and upcoming renewals (separate from active status)
    if (member.transaction && Array.isArray(member.transaction)) {
      member.transaction.forEach((txn: any) => {
        // Check for overdue (incomplete status)
        if (txn.status?.toLowerCase() === 'incomplete') {
          result.overdue.push(member);
        }

        // Check for upcoming renewals (ending date within 7 days but not passed)
        if (txn["ending date"]) {
          const endingDate = parseISO(txn["ending date"]);
          if (isValid(endingDate)) {
            if (isBefore(today, endingDate) && isBefore(endingDate, upcomingThreshold)) {
              result.dueSoon.push(member);
            }
          }
        }
      });
    }
  });

  return result;
}