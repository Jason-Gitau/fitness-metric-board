
import React from 'react';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import MembershipChart from '../components/MembershipChart';
import AcquisitionChart from '../components/AcquisitionChart';
import UpcomingRenewals from '../components/UpcomingRenewals';
import PaymentOverview from '../components/PaymentOverview';
import { Users, UserCheck, DollarSign, Calendar } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
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
          <MetricCard
            title="Total Members"
            value="5,684"
            trend={{ value: "10 daily", isPositive: true }}
            subtitle="As of today"
            icon={<Users className="h-5 w-5 text-blue-600" />}
            bgColor="bg-blue-50"
          />
          <MetricCard
            title="Active Members"
            value="4,900"
            trend={{ value: "5 daily", isPositive: true }}
            subtitle="Currently active"
            icon={<UserCheck className="h-5 w-5 text-green-600" />}
            bgColor="bg-green-50"
          />
          <MetricCard
            title="Revenue (Month)"
            value="Ksh 1,250,000"
            trend={{ value: "12%", isPositive: true }}
            subtitle="This Month"
            icon={<DollarSign className="h-5 w-5 text-purple-600" />}
            bgColor="bg-purple-50"
          />
          <MetricCard
            title="Total Visits"
            value="15,000"
            trend={{ value: "8% this week", isPositive: true }}
            subtitle="Current Month"
            icon={<Calendar className="h-5 w-5 text-orange-600" />}
            bgColor="bg-orange-50"
          />
        </div>

        {/* Row 2: Detailed Member Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MembershipChart />
          <AcquisitionChart />
        </div>

        {/* Row 3: Operational & Financial Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingRenewals />
          <PaymentOverview />
        </div>
      </main>
    </div>
  );
};

export default Index;
