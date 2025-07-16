import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import MemberGrowthChart from '../components/MemberGrowthChart';
import RevenueChart from '../components/RevenueChart';
import GymUsageAnalytics from '../components/GymUsageAnalytics';
import UpcomingRenewals from '../components/UpcomingRenewals';
import PaymentOverview from '../components/PaymentOverview';
import { Users, UserCheck, DollarSign, Calendar } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categorizeMembers, fetchMembersWithTransactions } from "@/utils/memberCategorization";
import UpcomingRenewalsTable from "@/components/UpcomingRenewalsTable";
import InactiveMembersTable from "@/components/InactiveMembersTable";
import ActiveMembersDialog from "@/components/ActiveMembersDialog";
import OverdueMembersDialog from "@/components/OverdueMembersDialog";
import DueMembersDialog from "@/components/DueMembersDialog";
import InactiveMembersDialog from "@/components/InactiveMembersDialog";
import StreakLeaderboard from "@/components/StreakLeaderboard";
import ChatWidget from "@/components/ChatWidget";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { data: members, isLoading, error } = useQuery({
    queryKey: ["members_with_transactions"],
    queryFn: fetchMembersWithTransactions,
  });

  const categorized = members ? categorizeMembers(members) : null;

  const [showActiveDialog, setShowActiveDialog] = useState(false);
  const [showOverdueDialog, setShowOverdueDialog] = useState(false);
  const [showDueDialog, setShowDueDialog] = useState(false);
  const [showInactiveDialog, setShowInactiveDialog] = useState(false);

  const { user, loading } = useAuthState();
  const navigate = useNavigate();

  React.useEffect(() => {
    // If not logged in and not loading, redirect to /auth
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <StreakLeaderboard />

        {/* Removed Date Range Selector */}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Monitor your gym performance and member activities</p>
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
          {/* Due for Renewal (clickable) */}
          <div className="cursor-pointer" onClick={() => setShowDueDialog(true)}>
            <MetricCard
              title="Due for Renewal"
              value={categorized ? categorized.dueSoon.length.toString() : "—"}
              trend={{ value: "", isPositive: false }}
              subtitle="7 days"
              icon={<Calendar className="h-5 w-5 text-orange-600" />}
              bgColor="bg-orange-50"
            />
          </div>
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
          {/* Inactive (clickable) */}
          <div className="cursor-pointer" onClick={() => setShowInactiveDialog(true)}>
            <MetricCard
              title="Inactive"
              value={categorized ? categorized.inactive.length.toString() : "—"}
              trend={{ value: "", isPositive: false }}
              subtitle="No visit/expired"
              icon={<Users className="h-5 w-5 text-gray-400" />}
              bgColor="bg-gray-100"
            />
          </div>
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
            <DueMembersDialog
              open={showDueDialog}
              onOpenChange={setShowDueDialog}
              members={categorized.dueSoon}
            />
            <InactiveMembersDialog
              open={showInactiveDialog}
              onOpenChange={setShowInactiveDialog}
              members={categorized.inactive}
            />
          </>
        )}

        {/* Row 2: Business Intelligence Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MemberGrowthChart />
          <RevenueChart />
        </div>

        {/* Row 3: Gym Usage Analytics */}
        <div className="mb-8">
          <GymUsageAnalytics />
        </div>

        {/* Row 4: Operational Insights */}
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
              <UpcomingRenewalsTable dueSoonMembers={categorized.dueSoon.map(m => ({ member_id: m.id.toString(), full_name: m.name, membership_end_date: null }))} />
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
              <InactiveMembersTable inactiveMembers={categorized.inactive.map(m => ({ member_id: m.id.toString(), full_name: m.name, reason: m.reason }))} />
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
