
import { differenceInCalendarDays, parseISO, isValid } from "date-fns";

export interface TestMember {
  member_id: string;
  full_name?: string | null;
  membership_type?: string | null;
  payment_status?: string | null;
  membership_end_date?: string | null;
  last_visit?: string | null;
}

export interface CategorizationResult {
  active: TestMember[];
  dueSoon: TestMember[];
  overdue: TestMember[];
  inactive: {
    member_id: string;
    full_name?: string | null;
    reason: string;
  }[];
}

export function categorizeMembers(members: TestMember[]) {
  const today = new Date();
  // Standardize today's time to 00:00
  today.setHours(0, 0, 0, 0);

  const result: CategorizationResult = {
    active: [],
    dueSoon: [],
    overdue: [],
    inactive: [],
  };

  members.forEach((member) => {
    const endDate = member.membership_end_date ? parseISO(member.membership_end_date) : undefined;
    const lastVisit = member.last_visit ? parseISO(member.last_visit) : undefined;
    const now = today;

    let inactiveReasons = [];

    // Inactive rule 1: membership expired 30+ days ago
    if (endDate && isValid(endDate) && differenceInCalendarDays(now, endDate) > 30) {
      inactiveReasons.push("Membership expired more than 30 days ago.");
    }

    // Inactive rule 2: last visit > 14 days ago or never visited
    if (!lastVisit) {
      inactiveReasons.push("No check-in record in the last 14 days.");
    } else if (isValid(lastVisit) && differenceInCalendarDays(now, lastVisit) > 14) {
      inactiveReasons.push("Last check-in was over 14 days ago.");
    }

    if (inactiveReasons.length) {
      result.inactive.push({
        member_id: member.member_id,
        full_name: member.full_name,
        reason: inactiveReasons.join(" "),
      });
      return;
    }

    // Overdue Renewal: membership_end_date in the past (today or before) and payment_status NOT 'paid'
    if (
      endDate &&
      isValid(endDate) &&
      differenceInCalendarDays(now, endDate) >= 0 &&
      member.payment_status?.toLowerCase() !== "paid"
    ) {
      result.overdue.push(member);
      return;
    }

    // Due for Renewal: membership_end_date within next 7 days (today included) and payment_status NOT 'paid'
    if (
      endDate &&
      isValid(endDate) &&
      differenceInCalendarDays(endDate, now) >= 0 &&
      differenceInCalendarDays(endDate, now) <= 7 &&
      member.payment_status?.toLowerCase() !== "paid"
    ) {
      result.dueSoon.push(member);
      return;
    }

    // Else, active
    result.active.push(member);
  });

  return result;
}

