import { differenceInCalendarDays, parseISO, isValid, isBefore, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export interface Member {
  id: string;
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
    id: string;
    name: string;
    reason: string;
  }[];
}

export async function fetchMembersWithTransactions(): Promise<MemberWithTransaction[]> {
  // Read directly from transactions table to get accurate renewal data
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      status,
      ending_date,
      members!inner(
        id,
        name,
        email,
        phone,
        join_date,
        status
      )
    `);

  if (error) throw error;
  
  // Transform the data to group transactions by member
  const memberMap = new Map<string, MemberWithTransaction>();
  
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
      "ending date": txn.ending_date
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
    // Use the member status column directly to categorize members
    const memberStatus = member.status?.toLowerCase() || 'active';

    // Categorize based on member status
    if (memberStatus === 'inactive' || memberStatus === 'suspended') {
      result.inactive.push({
        id: member.id,
        name: member.name,
        reason: `Status: ${member.status}`,
      });
      return;
    }

    // All other statuses (active, etc.) are considered active members
    if (memberStatus === 'active') {
      result.active.push(member);
    }

    // Check transaction data for overdue and upcoming renewals
    if (member.transaction && Array.isArray(member.transaction)) {
      member.transaction.forEach((txn: any) => {
        // Check for overdue (incomplete/failed payment status)
        if (txn.status?.toLowerCase() === 'incomplete' || txn.status?.toLowerCase() === 'failed') {
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