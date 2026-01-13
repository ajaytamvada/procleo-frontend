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
import LiveSourcingEvents from './LiveSourcingEvents';

const Overview: React.FC = () => {
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

  const { stats, recentOrders, monthlySpend, categorySpend, sourcingEvents } =
    dashboardData;

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

        {/* Live Sourcing Events */}
        {sourcingEvents && sourcingEvents.length > 0 && (
          <LiveSourcingEvents events={sourcingEvents} />
        )}
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

export default Overview;
