
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { status: 'Paid', count: 4200, color: '#10b981' },
  { status: 'Pending', count: 850, color: '#f59e0b' },
  { status: 'Overdue', count: 320, color: '#ef4444' },
  { status: 'Failed', count: 114, color: '#6b7280' }
];

const PaymentOverview = () => {
  const totalPending = data.find(d => d.status === 'Pending')?.count || 0;
  const totalOverdue = data.find(d => d.status === 'Overdue')?.count || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-700">{totalPending}</div>
          <div className="text-sm text-yellow-600">Pending Payments</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-700">{totalOverdue}</div>
          <div className="text-sm text-red-600">Overdue Payments</div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOverview;
