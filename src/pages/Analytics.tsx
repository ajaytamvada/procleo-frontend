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

const Analytics: React.FC = () => {
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

  const { recentOrders, monthlySpend, categorySpend } = dashboardData;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

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

  // Calculate insights from data
  const calculateInsights = () => {
    const totalSpend = monthlySpend.reduce((acc, curr) => acc + curr.spend, 0);
    const totalBudget = monthlySpend.reduce(
      (acc, curr) => acc + curr.budget,
      0
    );
    const spendRate =
      totalBudget > 0 ? ((totalSpend / totalBudget) * 100).toFixed(1) : '0';

    const sortedCategories = [...categorySpend].sort(
      (a, b) => b.value - a.value
    );
    const totalCategorySpend = categorySpend.reduce(
      (acc, curr) => acc + curr.value,
      0
    );

    const highestCategory = sortedCategories[0];
    const lowestCategory = sortedCategories[sortedCategories.length - 1];

    return {
      spendRate,
      spendRateChange: '+5.2', // Mock data - calculate from yesterday's data
      totalOrders: recentOrders.length,
      ordersChange: '+12', // Mock data - calculate from yesterday's data
      highestCategoryPercentage: highestCategory
        ? ((highestCategory.value / totalCategorySpend) * 100).toFixed(0)
        : '0',
      highestCategory: highestCategory?.name || '--',
      lowestCategoryPercentage: lowestCategory
        ? ((lowestCategory.value / totalCategorySpend) * 100).toFixed(0)
        : '0',
      lowestCategory: lowestCategory?.name || '--',
    };
  };

  const insights = calculateInsights();

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

        {/* Charts Grid with Insights */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Monthly Spend Trend - Takes 2 columns */}
          <div className='lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300'>
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
            <ResponsiveContainer width='100%' height={350}>
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

          {/* Insights Panel - Takes 1 column */}
          <div className='bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300'>
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-slate-800'>Insights</h3>
              <p className='text-xs text-slate-500 mt-1'>
                (in comparison to yesterday)
              </p>
            </div>

            <div className='space-y-8'>
              {/* Total Spend Rate */}
              <div>
                <p className='text-sm text-slate-500 mb-2'>Total Spend Rate</p>
                <div className='flex items-baseline gap-2'>
                  <span className='text-lg font-semibold text-slate-800'>
                    {insights.spendRate}%
                  </span>
                  <span className='text-sm text-slate-400'>
                    {insights.spendRateChange}%
                  </span>
                </div>
              </div>

              {/* Total Number of Orders */}
              <div>
                <p className='text-sm text-slate-500 mb-2'>
                  Total Number of Orders
                </p>
                <div className='flex items-baseline gap-2'>
                  <span className='text-lg font-semibold text-slate-800'>
                    {insights.totalOrders}
                  </span>
                  <span className='text-sm text-slate-400'>
                    {insights.ordersChange}%
                  </span>
                </div>
              </div>

              {/* Highest Category Spend */}
              <div>
                <p className='text-sm text-slate-500 mb-2'>
                  Highest Category Spend
                </p>
                <div className='flex items-baseline gap-2'>
                  <span className='text-lg font-semibold text-slate-800'>
                    {insights.highestCategoryPercentage}%
                  </span>
                  <span className='text-sm text-slate-400'>
                    {insights.highestCategory}
                  </span>
                </div>
              </div>

              {/* Lowest Category Spend */}
              <div>
                <p className='text-sm text-slate-500 mb-2'>
                  Lowest Category Spend
                </p>
                <div className='flex items-baseline gap-2'>
                  <span className='text-lg font-semibold text-slate-800'>
                    {insights.lowestCategoryPercentage}%
                  </span>
                  <span className='text-sm text-slate-400'>
                    {insights.lowestCategory}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Spend Distribution - Full Width */}
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

export default Analytics;
