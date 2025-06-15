
import React, { useState } from 'react';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import MembershipChart from '../components/MembershipChart';
import AcquisitionChart from '../components/AcquisitionChart';
import UpcomingRenewals from '../components/UpcomingRenewals';
import PaymentOverview from '../components/PaymentOverview';
import { Users, UserCheck, DollarSign, Calendar } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categorizeMembers } from "@/utils/memberCategorization";
import UpcomingRenewalsTable from "@/components/UpcomingRenewalsTable";
import InactiveMembersTable from "@/components/InactiveMembersTable";
import ActiveMembersDialog from "@/components/ActiveMembersDialog";
import OverdueMembersDialog from "@/components/OverdueMembersDialog";
import StreakLeaderboard from "@/components/StreakLeaderboard";
import ChatWidget from "@/components/ChatWidget";

const Index = () => {
  const { data: members, isLoading, error } = useQuery({
    queryKey: ["test_members"],
    queryFn: async () => {
      let { data, error } = await supabase
        .from("test_members")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const categorized = members ? categorizeMembers(members) : null;

  const [showActiveDialog, setShowActiveDialog] = useState(false);
  const [showOverdueDialog, setShowOverdueDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <StreakLeaderboard />

        {/* Date Range Selector */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-600 mt-1">Monitor your gym performance and member activities</p>
          </div>
          <div className="flex items-center space-x-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>

        {/* Row 1: Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Active (clickable) */}
          <div className="cursor-pointer" onClick={() => setShowActiveDialog(true)}>
            <MetricCard
              title="Total Active"
              value={categorized ? categorized.active.length.toString() : "—"}
              trend={{ value: "", isPositive: true }}
              subtitle="Active Members"
              icon={<Users className="h-5 w-5 text-blue-600" />}
              bgColor="bg-blue-50"
            />
          </div>
          {/* Due for Renewal */}
          <MetricCard
            title="Due for Renewal"
            value={categorized ? categorized.dueSoon.length.toString() : "—"}
            trend={{ value: "", isPositive: false }}
            subtitle="7 days"
            icon={<Calendar className="h-5 w-5 text-orange-600" />}
            bgColor="bg-orange-50"
          />
          {/* Overdue Renewals (clickable) */}
          <div className="cursor-pointer" onClick={() => setShowOverdueDialog(true)}>
            <MetricCard
              title="Overdue Renewals"
              value={categorized ? categorized.overdue.length.toString() : "—"}
              trend={{ value: "", isPositive: false }}
              subtitle="Need Action"
              icon={<Calendar className="h-5 w-5 text-red-600" />}
              bgColor="bg-red-50"
            />
          </div>
          <MetricCard
            title="Inactive"
            value={categorized ? categorized.inactive.length.toString() : "—"}
            trend={{ value: "", isPositive: false }}
            subtitle="No visit/expired"
            icon={<Users className="h-5 w-5 text-gray-400" />}
            bgColor="bg-gray-100"
          />
        </div>

        {/* Dialogs */}
        {categorized && (
          <>
            <ActiveMembersDialog
              open={showActiveDialog}
              onOpenChange={setShowActiveDialog}
              members={categorized.active}
            />
            <OverdueMembersDialog
              open={showOverdueDialog}
              onOpenChange={setShowOverdueDialog}
              members={categorized.overdue}
            />
          </>
        )}

        {/* Row 2: Detailed Member Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MembershipChart />
          <AcquisitionChart />
        </div>

        {/* Row 3: Operational & Financial Insights (now dynamic) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            {isLoading && (
              <div className="flex items-center justify-center flex-1 py-12 text-gray-400">
                Loading...
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center flex-1 py-12 text-red-500">
                Failed to fetch members.
              </div>
            )}
            {!isLoading && !error && categorized && (
              <UpcomingRenewalsTable dueSoonMembers={categorized.dueSoon} />
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            {isLoading && (
              <div className="flex items-center justify-center flex-1 py-12 text-gray-400">
                Loading...
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center flex-1 py-12 text-red-500">
                Failed to fetch members.
              </div>
            )}
            {!isLoading && !error && categorized && (
              <InactiveMembersTable inactiveMembers={categorized.inactive} />
            )}
          </div>
        </div>
      </main>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default Index;
