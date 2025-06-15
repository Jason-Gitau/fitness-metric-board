
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', members: 240 },
  { month: 'Feb', members: 280 },
  { month: 'Mar', members: 320 },
  { month: 'Apr', members: 290 },
  { month: 'May', members: 350 },
  { month: 'Jun', members: 410 },
  { month: 'Jul', members: 380 },
  { month: 'Aug', members: 420 },
  { month: 'Sep', members: 460 },
  { month: 'Oct', members: 520 },
  { month: 'Nov', members: 580 },
  { month: 'Dec', members: 640 }
];

const AcquisitionChart = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">New Member Acquisition</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="members" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <span className="font-medium text-green-600">↑ 15.2%</span> increase from last year
      </div>
    </div>
  );
};

export default AcquisitionChart;
