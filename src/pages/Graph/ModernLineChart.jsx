import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';

const ModernLineChart = ({ statsData }) => {
  // Format the data for better display
  const formattedData = statsData.map((stat, index) => ({
    day: `Day ${index + 1}`,
    date: new Date(stat._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    totalRevenue: stat.totalRevenue || 0,
    totalOrders: stat.totalOrders || 0,
  }));

  // Calculate averages for reference lines
  const avgRevenue = formattedData.reduce((sum, item) => sum + item.totalRevenue, 0) / formattedData.length;
  const avgOrders = formattedData.reduce((sum, item) => sum + item.totalOrders, 0) / formattedData.length;

  // Custom tooltip with enhanced styling
  const CustomTooltip = ({ payload, label, active }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-gray-600" />
            <p className="font-semibold text-gray-800">{data.date}</p>
          </div>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.dataKey === 'totalRevenue' ? 'Revenue' : 'Orders'}</span>
                </div>
                <span className="font-bold" style={{ color: entry.color }}>
                  {entry.dataKey === 'totalRevenue' ? `₹${entry.value.toLocaleString()}` : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom dot component
  const CustomDot = (props) => {
    const { cx, cy, fill } = props;
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill={fill} 
        stroke="white" 
        strokeWidth={2}
        className="drop-shadow-sm"
      />
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Performance Trends</h3>
          <p className="text-gray-600">Revenue and orders over time</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-lg">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span className="text-emerald-700 font-semibold">Trending Up</span>
        </div>
      </div>

      {/* Chart Container */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          
          {/* Grid */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e2e8f0" 
            vertical={false}
            opacity={0.6}
          />
          
          {/* Axes */}
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            dy={10}
          />
          <YAxis 
            yAxisId="revenue"
            orientation="left"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <YAxis 
            yAxisId="orders"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          
          {/* Reference Lines */}
          <ReferenceLine 
            yAxisId="revenue"
            y={avgRevenue} 
            stroke="#6366f1" 
            strokeDasharray="5 5" 
            strokeOpacity={0.5}
            label={{ value: "Avg Revenue", position: "topLeft", fill: "#6366f1" }}
          />
          
          {/* Tooltip and Legend */}
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px' }}
          />
          
          {/* Lines */}
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="totalRevenue"
            stroke="#6366f1"
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={{ 
              r: 6, 
              stroke: '#6366f1', 
              strokeWidth: 2, 
              fill: '#ffffff',
              className: 'drop-shadow-lg'
            }}
            animationDuration={2000}
            animationEasing="ease-out"
            name="Revenue (₹)"
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="totalOrders"
            stroke="#10b981"
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={{ 
              r: 6, 
              stroke: '#10b981', 
              strokeWidth: 2, 
              fill: '#ffffff',
              className: 'drop-shadow-lg'
            }}
            animationDuration={2000}
            animationEasing="ease-out"
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">₹{avgRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Avg Daily Revenue</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600">{Math.round(avgOrders)}</p>
          <p className="text-sm text-gray-600">Avg Daily Orders</p>
        </div>
      </div>
    </div>
  );
};

export default ModernLineChart;
