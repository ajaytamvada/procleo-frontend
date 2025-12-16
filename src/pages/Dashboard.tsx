import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  FileCheck,
  ArrowUpRight,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import RecentActivityWidget from '@/components/dashboard/RecentActivityWidget';
import StatusSummaryCard from '@/components/dashboard/StatusSummaryCard';
// import LiveSourcingEvents from './LiveSourcingEvents';

const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useDashboardData();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen bg-slate-50'>
        <div className='flex flex-col items-center gap-4'>
          <div className='relative'>
            <div className='w-16 h-16 border-4 border-indigo-100 rounded-full'></div>
            <div className='absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent'></div>
          </div>
          <p className='text-slate-500 font-medium'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className='flex items-center justify-center h-screen bg-slate-50'>
        <div className='text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100'>
          <div className='w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4'>
            <AlertCircle className='w-8 h-8 text-red-500' />
          </div>
          <h3 className='text-lg font-semibold text-slate-800 mb-2'>
            Failed to load data
          </h3>
          <p className='text-slate-500'>Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const { stats, recentOrders, monthlySpend, categorySpend } = dashboardData;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statsList = [
    {
      name: 'Total Purchase Orders',
      value: stats.totalPurchaseOrders.toString(),
      change: `${stats.pendingPOs} pending`,
      changeType: 'warning',
      icon: ShoppingCart,
      href: '/purchase-orders',
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Total Vendors',
      value: stats.totalVendors.toString(),
      change: 'Active',
      changeType: 'increase',
      icon: Users,
      href: '/master/suppliers',
      gradient: 'from-emerald-500 to-emerald-600',
      lightBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      name: 'Purchase Requests',
      value: stats.totalPurchaseRequests.toString(),
      change: `${stats.pendingPRs} pending`,
      changeType: 'warning',
      icon: FileText,
      href: '/purchase-requisition/manage',
      gradient: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      name: 'Total RFPs',
      value: stats.totalRFPs.toString(),
      change: `${stats.activeRFPs} active`,
      changeType: 'increase',
      icon: TrendingUp,
      href: '/rfp/manage',
      gradient: 'from-violet-500 to-purple-600',
      lightBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'PENDING_APPROVAL':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return <Clock className='w-3 h-3' />;
    if (statusLower.includes('approved'))
      return <CheckCircle className='w-3 h-3' />;
    if (statusLower.includes('completed'))
      return <CheckCircle className='w-3 h-3' />;
    return <FileCheck className='w-3 h-3' />;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Main Content */}
      <div className='lg:p-3 space-y-8'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='text-xl lg:text-xl font-bold text-slate-800'>
              {getGreeting()}, {user?.firstName || 'User'} 👋
            </h1>
            <p className='text-slate-500 mt-1 flex items-center font-medium gap-2 text-sm'>
              <Calendar className='w-4 h-4' />
              {getCurrentDate()}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <select className='px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer hover:border-slate-300 transition-colors'>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        {/* Stats Grid - Cashfree Style Cards */}
        {/* 
  Stats Cards Grid - Count & Status on Same Line
  Replace your existing stats grid section in Dashboard.tsx with this code
*/}

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
          {statsList.map(item => (
            <Link
              key={item.name}
              to={item.href}
              className='group relative bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1'
            >
              {/* Gradient accent line */}
              <div
                className={`absolute top-0 left-6 right-6 h-1 bg-gradient-to-r ${item.gradient} rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity`}
              />

              {/* Header Row - Title & Icon */}
              <div className='flex items-start justify-between gap-3 mb-4'>
                <span className='text-sm font-medium text-slate-500 leading-snug'>
                  {item.name}
                </span>
                <div
                  className={`p-2.5 rounded-xl ${item.lightBg} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                >
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
              </div>

              {/* Value & Status - Same Line */}
              <div className='flex items-center justify-between'>
                <p className='text-xl font-bold text-slate-800 tracking-tight'>
                  {item.value}
                </p>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    item.changeType === 'increase'
                      ? 'bg-emerald-50 text-emerald-600'
                      : item.changeType === 'decrease'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {item.changeType === 'increase' && (
                    <ArrowUpRight className='w-3 h-3' />
                  )}
                  {item.change}
                </span>
              </div>

              {/* Hover arrow */}
              <div className='absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0'>
                <ChevronRight className='w-4 h-4 text-slate-400' />
              </div>
            </Link>
          ))}
        </div>

        {/* 
  Live Sourcing Events Cards - Smaller & Lighter
  Color: #7C3AED (Violet-600)
*/}

        <div className='space-y-4'>
          {/* Section Header */}
          <h2 className='text-lg font-semibold text-slate-800'>
            Live Sourcing Events
          </h2>

          {/* Cards Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Card 1 */}
            <div className='bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group cursor-pointer'>
              {/* Left Accent Border - Violet */}
              <div
                className='absolute top-0 left-0 w-[3px] h-full'
                style={{ backgroundColor: '#7C3AED' }}
              />

              <div className='p-4 pl-5'>
                {/* Header - Live Badge & Timer */}
                <div className='flex items-center justify-between mb-3'>
                  <span className='inline-flex items-center px-2 py-0.5 rounded bg-red-50 border border-red-100'>
                    <span className='w-1 h-1 bg-red-500 rounded-full mr-1 animate-pulse'></span>
                    <span className='text-[10px] font-semibold text-red-500 uppercase'>
                      Live
                    </span>
                  </span>
                  <span className='text-xs text-slate-400'>
                    <span className='font-mono text-slate-500'>00:42:15</span>
                    <span className='ml-1'>left</span>
                  </span>
                </div>

                {/* Title & Start Price */}
                <div className='mb-4'>
                  <h4 className='font-semibold text-slate-700 text-sm leading-snug mb-1 group-hover:text-violet-600 transition-colors'>
                    Packaging Material - Corrugated Boxes
                  </h4>
                  <p className='text-xs text-slate-400'>
                    Start Price:{' '}
                    <span className='font-medium text-slate-500'>
                      ₹12,00,000
                    </span>
                  </p>
                </div>

                {/* Current Lowest & Saved */}
                <div className='flex items-end justify-between'>
                  <div>
                    <p className='text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5'>
                      Current Lowest
                    </p>
                    <p className='text-lg font-bold text-slate-700'>₹10.5L</p>
                  </div>
                  <span className='text-xs font-semibold text-emerald-500'>
                    12.5% Saved
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className='bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group cursor-pointer'>
              {/* Left Accent Border - Violet */}
              <div
                className='absolute top-0 left-0 w-[3px] h-full'
                style={{ backgroundColor: '#7C3AED' }}
              />

              <div className='p-4 pl-5'>
                {/* Header - Live Badge & Timer */}
                <div className='flex items-center justify-between mb-3'>
                  <span className='inline-flex items-center px-2 py-0.5 rounded bg-red-50 border border-red-100'>
                    <span className='w-1 h-1 bg-red-500 rounded-full mr-1 animate-pulse'></span>
                    <span className='text-[10px] font-semibold text-red-500 uppercase'>
                      Live
                    </span>
                  </span>
                  <span className='text-xs text-slate-400'>
                    <span className='font-mono text-slate-500'>01:15:00</span>
                    <span className='ml-1'>left</span>
                  </span>
                </div>

                {/* Title & Start Price */}
                <div className='mb-4'>
                  <h4 className='font-semibold text-slate-700 text-sm leading-snug mb-1 group-hover:text-violet-600 transition-colors'>
                    Logistics Contract - North Zone
                  </h4>
                  <p className='text-xs text-slate-400'>
                    Start Price:{' '}
                    <span className='font-medium text-slate-500'>
                      ₹12,00,000
                    </span>
                  </p>
                </div>

                {/* Current Lowest & Saved */}
                <div className='flex items-end justify-between'>
                  <div>
                    <p className='text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5'>
                      Current Lowest
                    </p>
                    <p className='text-lg font-bold text-slate-700'>₹10.5L</p>
                  </div>
                  <span className='text-xs font-semibold text-emerald-500'>
                    8.2% Saved
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className='bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group cursor-pointer'>
              {/* Left Accent Border - Violet */}
              <div
                className='absolute top-0 left-0 w-[3px] h-full'
                style={{ backgroundColor: '#7C3AED' }}
              />

              <div className='p-4 pl-5'>
                {/* Header - Live Badge & Timer */}
                <div className='flex items-center justify-between mb-3'>
                  <span className='inline-flex items-center px-2 py-0.5 rounded bg-red-50 border border-red-100'>
                    <span className='w-1 h-1 bg-red-500 rounded-full mr-1 animate-pulse'></span>
                    <span className='text-[10px] font-semibold text-red-500 uppercase'>
                      Live
                    </span>
                  </span>
                  <span className='text-xs text-slate-400'>
                    <span className='font-mono text-slate-500'>02:30:00</span>
                    <span className='ml-1'>left</span>
                  </span>
                </div>

                {/* Title & Start Price */}
                <div className='mb-4'>
                  <h4 className='font-semibold text-slate-700 text-sm leading-snug mb-1 group-hover:text-violet-600 transition-colors'>
                    Office Supplies - Annual Contract
                  </h4>
                  <p className='text-xs text-slate-400'>
                    Start Price:{' '}
                    <span className='font-medium text-slate-500'>
                      ₹8,50,000
                    </span>
                  </p>
                </div>

                {/* Current Lowest & Saved */}
                <div className='flex items-end justify-between'>
                  <div>
                    <p className='text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5'>
                      Current Lowest
                    </p>
                    <p className='text-lg font-bold text-slate-700'>₹7.2L</p>
                  </div>
                  <span className='text-xs font-semibold text-emerald-500'>
                    15.3% Saved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Summary Cards Row */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Status Summary Card */}
          <div className='bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-slate-800'>
                Status Summary
              </h3>
              <button className='text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1'>
                View All <ChevronRight className='w-4 h-4' />
              </button>
            </div>
            <StatusSummaryCard stats={stats} />
          </div>

          {/* Recent Activity Widget */}
          <div className='bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-slate-800'>
                Recent Activity
              </h3>
              <button className='text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1'>
                View All <ChevronRight className='w-4 h-4' />
              </button>
            </div>
            <RecentActivityWidget />
          </div>
        </div>

        {/* Charts Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Monthly Spend Trend */}
          <div className='bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-semibold text-slate-800'>
                  Monthly Spend vs Budget
                </h3>
                <p className='text-sm text-slate-500 mt-1'>
                  Track your spending patterns
                </p>
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-indigo-500'></div>
                  <span className='text-xs text-slate-500'>Spend</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-slate-200'></div>
                  <span className='text-xs text-slate-500'>Budget</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width='100%' height={300}>
              <AreaChart data={monthlySpend}>
                <defs>
                  <linearGradient
                    id='spendGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor='#6366f1' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#6366f1' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id='budgetGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor='#e2e8f0' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#e2e8f0' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#f1f5f9'
                  vertical={false}
                />
                <XAxis
                  dataKey='month'
                  stroke='#94a3b8'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke='#94a3b8'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={value => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
                    padding: '12px 16px',
                  }}
                  formatter={(value: number, name: string) => [
                    `₹${value.toLocaleString()}`,
                    name === 'spend' ? 'Actual Spend' : 'Budget',
                  ]}
                  labelStyle={{
                    color: '#1e293b',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='budget'
                  stroke='#e2e8f0'
                  strokeWidth={2}
                  fill='url(#budgetGradient)'
                />
                <Area
                  type='monotone'
                  dataKey='spend'
                  stroke='#6366f1'
                  strokeWidth={2}
                  fill='url(#spendGradient)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Spend Distribution */}
          <div className='bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-semibold text-slate-800'>
                  Spend by Category
                </h3>
                <p className='text-sm text-slate-500 mt-1'>
                  Distribution overview
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <ResponsiveContainer width='60%' height={280}>
                <PieChart>
                  <Pie
                    data={categorySpend}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey='value'
                  >
                    {categorySpend.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke='none'
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
                      padding: '12px 16px',
                    }}
                    formatter={(value: number) => [
                      `₹${value.toLocaleString()}`,
                      'Amount',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className='w-[40%] space-y-3'>
                {categorySpend.map((item, index) => (
                  <div key={index} className='flex items-center gap-3'>
                    <div
                      className='w-3 h-3 rounded-full flex-shrink-0'
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm text-slate-600 truncate'>
                        {item.name}
                      </p>
                      <p className='text-xs text-slate-400'>
                        ₹{item.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Purchase Orders - Cashfree Style Table */}
        <div className='bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300'>
          <div className='p-6 border-b border-slate-100 flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-slate-800'>
                Recent Purchase Orders
              </h2>
              <p className='text-sm text-slate-500 mt-1'>
                Your latest procurement activities
              </p>
            </div>
            <Link
              to='/purchase-orders'
              className='inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors'
            >
              View All
              <ArrowUpRight className='w-4 h-4' />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className='divide-y divide-slate-100'>
              {recentOrders.slice(0, 5).map(order => (
                <div
                  key={order.id}
                  className='flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group'
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-indigo-200'>
                      {order.poNumber.slice(-2)}
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors'>
                        {order.poNumber}
                      </p>
                      <p className='text-sm text-slate-500 mt-0.5'>
                        {order.supplierName}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-6'>
                    <div className='text-right'>
                      <p className='text-sm font-semibold text-slate-800'>
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                      <p className='text-xs text-slate-400 mt-0.5 flex items-center justify-end gap-1'>
                        <Calendar className='w-3 h-3' />
                        {order.poDate}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className='capitalize'>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <ChevronRight className='w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all' />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='p-12 text-center'>
              <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <ShoppingCart className='w-8 h-8 text-slate-400' />
              </div>
              <p className='text-slate-500 font-medium'>
                No recent purchase orders
              </p>
              <p className='text-slate-400 text-sm mt-1'>
                New orders will appear here
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between text-sm text-slate-400 pt-4'>
          <p>Last updated: Just now</p>
          <button className='hover:text-indigo-600 transition-colors flex items-center gap-1'>
            <span>Need Help?</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
