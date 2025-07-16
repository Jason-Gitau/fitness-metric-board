import { differenceInCalendarDays, parseISO, isValid, isBefore, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  join_date: string;
  status?: string | null;
  created_at: string;
  updated_at: string;
  membership_type: string;
}

export interface MemberWithTransaction extends Member {
  transaction?: {
    status: string | null;
    "ending date": string | null;
    subscription_period?: string | null;
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
  // Get all members first
  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("*");

  if (membersError) throw membersError;

  // Get all transactions
  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("member_id, status, ending_date, subscription_period");

  if (transactionsError) throw transactionsError;
  
  // Transform the data to include transactions for each member
  const memberMap = new Map<string, MemberWithTransaction>();
  
  // Initialize all members
  members?.forEach((member: any) => {
    memberMap.set(member.id, {
      ...member,
      join_date: member.created_at, // Use created_at as join_date
      transaction: []
    });
  });
  
  // Add transactions to relevant members
  transactions?.forEach((txn: any) => {
    if (memberMap.has(txn.member_id)) {
      memberMap.get(txn.member_id)!.transaction!.push({
        status: txn.status,
        "ending date": txn.ending_date,
        subscription_period: txn.subscription_period
      });
    }
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
    // Only apply due/overdue logic for weekly and monthly subscriptions
    if (member.transaction && Array.isArray(member.transaction)) {
      member.transaction.forEach((txn: any) => {
        // Get the subscription period from the transaction
        const subscriptionPeriod = txn.subscription_period || 'daily';
        
        // Only check for due/overdue if it's weekly or monthly subscription
        if (subscriptionPeriod === 'weekly' || subscriptionPeriod === 'monthly') {
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
              } else if (isBefore(endingDate, today)) {
                // Payment has expired for weekly/monthly subscribers
                result.overdue.push(member);
              }
            }
          }
        }
      });
    }
  });

  return result;
}