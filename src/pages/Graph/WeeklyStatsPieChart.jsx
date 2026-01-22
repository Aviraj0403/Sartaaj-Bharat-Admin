import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

// Weekly Stats Pie Chart
const WeeklyStatsPieChart = ({ statsData }) => {
  const COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", 
    "#10b981", "#3b82f6", "#ef4444", "#84cc16"
  ];

  // Prepare data for the pie chart from the statsData
  const formattedData = statsData.map((stat, index) => ({
    name: `Day ${index + 1}`,
    fullDate: new Date(stat._id).toLocaleDateString(),
    value: stat.totalRevenue,
    orders: stat.totalOrders || 0,
  }));

  // Calculate total revenue for percentage calculation
  const totalRevenue = formattedData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip with enhanced styling
  const CustomTooltip = ({ payload, active }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalRevenue) * 100).toFixed(1);
      
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <p className="font-semibold text-gray-800">{data.fullDate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Revenue: <span className="font-bold text-indigo-600">₹{data.value.toLocaleString()}</span></p>
            <p className="text-sm text-gray-600">Orders: <span className="font-bold text-purple-600">{data.orders}</span></p>
            <p className="text-sm text-gray-600">Share: <span className="font-bold text-emerald-600">{percentage}%</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-semibold drop-shadow-lg"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Revenue Distribution</h3>
          <p className="text-gray-600">Weekly performance breakdown</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <span className="text-indigo-700 font-semibold">Weekly Stats</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={color} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={140}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
              animationBegin={0}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index % COLORS.length})`}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Stats */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
            <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyStatsPieChart;
