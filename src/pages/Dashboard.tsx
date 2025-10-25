import React from 'react';
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Purchase Orders',
      value: '1,234',
      change: '+12%',
      changeType: 'increase',
      icon: ShoppingCart,
    },
    {
      name: 'Active Assets',
      value: '8,567',
      change: '+5%',
      changeType: 'increase',
      icon: Package,
    },
    {
      name: 'Registered Vendors',
      value: '456',
      change: '+8%',
      changeType: 'increase',
      icon: Users,
    },
    {
      name: 'Total Spend',
      value: '$2.1M',
      change: '-3%',
      changeType: 'decrease',
      icon: DollarSign,
    },
  ];

  const recentOrders = [
    {
      id: 'PO-001',
      vendor: 'TechCorp Solutions',
      amount: '$12,500',
      status: 'pending',
      date: '2024-01-15',
    },
    {
      id: 'PO-002',
      vendor: 'Office Supplies Inc',
      amount: '$850',
      status: 'approved',
      date: '2024-01-14',
    },
    {
      id: 'PO-003',
      vendor: 'Industrial Equipment Ltd',
      amount: '$45,000',
      status: 'completed',
      date: '2024-01-13',
    },
  ];

  // Dummy chart data
  const monthlySpendData = [
    { month: 'Jan', spend: 85000, budget: 90000, orders: 42 },
    { month: 'Feb', spend: 92000, budget: 95000, orders: 47 },
    { month: 'Mar', spend: 78000, budget: 85000, orders: 38 },
    { month: 'Apr', spend: 105000, budget: 100000, orders: 52 },
    { month: 'May', spend: 89000, budget: 95000, orders: 45 },
    { month: 'Jun', spend: 96000, budget: 110000, orders: 49 },
  ];

  const categorySpendData = [
    { name: 'IT Equipment', value: 450000, color: '#8884d8' },
    { name: 'Office Supplies', value: 125000, color: '#82ca9d' },
    { name: 'Facilities', value: 285000, color: '#ffc658' },
    { name: 'Marketing', value: 95000, color: '#ff7300' },
    { name: 'Operations', value: 340000, color: '#0088fe' },
  ];

  const vendorPerformanceData = [
    { vendor: 'TechCorp', onTime: 95, quality: 92, cost: 88 },
    { vendor: 'OfficeSupplies', onTime: 88, quality: 94, cost: 96 },
    { vendor: 'Industrial', onTime: 92, quality: 89, cost: 85 },
    { vendor: 'Marketing Co', onTime: 85, quality: 91, cost: 90 },
    { vendor: 'Facilities Ltd', onTime: 90, quality: 87, cost: 93 },
  ];

  const orderStatusData = [
    { status: 'Pending', count: 23, color: '#ffc658' },
    { status: 'Approved', count: 45, color: '#8884d8' },
    { status: 'In Progress', count: 32, color: '#82ca9d' },
    { status: 'Completed', count: 156, color: '#0088fe' },
    { status: 'Cancelled', count: 8, color: '#ff7300' },
  ];

  const savingsData = [
    { month: 'Jan', target: 15000, achieved: 18500 },
    { month: 'Feb', target: 12000, achieved: 14200 },
    { month: 'Mar', target: 20000, achieved: 16800 },
    { month: 'Apr', target: 18000, achieved: 22000 },
    { month: 'May', target: 16000, achieved: 19500 },
    { month: 'Jun', target: 22000, achieved: 25200 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'approved':
        return 'badge-primary';
      case 'completed':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'approved':
        return <TrendingUp className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: 'transparent' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: '#1a0b2e' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Welcome back! Here's what's happening with your procurement.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map((stat) => (
          <div key={stat.name} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
          }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium" style={{ color: '#6b7280' }}>{stat.name}</p>
                <p className="text-2xl font-bold mt-2" style={{ color: '#1a0b2e' }}>{stat.value}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}>
                <stat.icon className="w-5 h-5" style={{ color: '#6366f1' }} />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {stat.changeType === 'increase' ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span
                className={`ml-1 text-xs font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
              <span className="ml-1 text-xs text-gray-500">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Spend Trend */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          padding: '20px'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1a0b2e' }}>Monthly Spend vs Budget</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlySpendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'spend' ? 'Actual Spend' : 'Budget']}
              />
              <Legend />
              <Area type="monotone" dataKey="budget" stackId="1" stroke="#e5e7eb" fill="#f3f4f6" />
              <Area type="monotone" dataKey="spend" stackId="2" stroke="#6366f1" fill="#8b5cf6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Spend Distribution */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          padding: '20px'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1a0b2e' }}>Spend by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorySpendData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent?: number }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categorySpendData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vendor Performance */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          padding: '20px'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1a0b2e' }}>Vendor Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendorPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="vendor" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend />
              <Bar dataKey="onTime" fill="#10b981" name="On-Time Delivery" />
              <Bar dataKey="quality" fill="#3b82f6" name="Quality Score" />
              <Bar dataKey="cost" fill="#f59e0b" name="Cost Efficiency" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          padding: '20px'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1a0b2e' }}>Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}`, 'Orders']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Savings Achievement Chart */}
      <div className="mb-6">
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          padding: '20px'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1a0b2e' }}>Cost Savings Achievement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={savingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'target' ? 'Target Savings' : 'Achieved Savings']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 6 }}
                name="Target"
              />
              <Line 
                type="monotone" 
                dataKey="achieved" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 6 }}
                name="Achieved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Purchase Orders */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}>
        <div className="p-5" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#1a0b2e' }}>Recent Purchase Orders</h2>
        </div>
        <div className="p-5 space-y-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex justify-between items-center p-3 rounded-lg transition-all duration-200 hover:shadow-md"
              style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #c7d2fe 0%, #e0e7ff 100%)' }}>
                  <ShoppingCart className="w-4 h-4" style={{ color: '#6366f1' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.vendor}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{order.amount}</p>
                  <p className="text-xs text-gray-500">{order.date}</p>
                </div>
                <div className={`badge ${getStatusColor(order.status)} flex items-center`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1 capitalize">{order.status}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-4 text-center">
            <button className="text-sm font-medium transition-colors duration-200" 
              style={{ color: '#6366f1' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#4f46e5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#6366f1'; }}>
              View all purchase orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;