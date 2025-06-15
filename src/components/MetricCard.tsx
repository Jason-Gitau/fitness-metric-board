
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend: {
    value: string;
    isPositive: boolean;
  };
  subtitle: string;
  icon?: React.ReactNode;
  bgColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  subtitle,
  icon,
  bgColor = 'bg-blue-50'
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {icon && (
              <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mr-3`}>
                {icon}
              </div>
            )}
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <div className="mb-3">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">{trend.value}</span>
            </div>
            <span className="text-sm text-gray-500">{subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
