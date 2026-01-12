import React from 'react';
import {
  FileText,
  ShoppingCart,
  TrendingUp,
  Package,
  FileCheck,
} from 'lucide-react';

interface DashboardStats {
  totalPurchaseRequests: number;
  pendingPRs: number;
  totalPurchaseOrders: number;
  pendingPOs: number;
  totalRFPs: number;
  activeRFPs: number;
  totalVendors?: number;
}

interface StatusSummaryCardProps {
  stats: DashboardStats;
}

const StatusSummaryCard: React.FC<StatusSummaryCardProps> = ({ stats }) => {
  const summaryItems = [
    {
      name: 'Purchase Requests',
      icon: FileText,
      pending: stats.pendingPRs,
      total: stats.totalPurchaseRequests,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      pendingColor: 'text-amber-600',
    },
    {
      name: 'Purchase Orders',
      icon: ShoppingCart,
      pending: stats.pendingPOs,
      total: stats.totalPurchaseOrders,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      pendingColor: 'text-blue-600',
    },
    {
      name: 'Request for Proposals',
      icon: TrendingUp,
      pending: stats.activeRFPs,
      total: stats.totalRFPs,
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
      pendingColor: 'text-violet-600',
    },
  ];

  return (
    <div className='space-y-3'>
      {summaryItems.map((item, index) => (
        <div
          key={item.name}
          className='flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors'
        >
          <div className='flex items-center gap-3'>
            <div
              className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}
            >
              <item.icon size={18} className={item.iconColor} />
            </div>
            <span className='text-sm font-medium text-slate-700'>
              {item.name}
            </span>
          </div>
          <div className='text-right'>
            <p className='text-xs text-slate-400 uppercase tracking-wide mb-0.5'>
              Pending / Total
            </p>
            <p className='text-sm font-semibold'>
              <span className={item.pendingColor}>{item.pending}</span>
              <span className='text-slate-400 mx-1'>/</span>
              <span className='text-slate-800'>{item.total}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusSummaryCard;
