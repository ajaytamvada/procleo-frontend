import React from 'react';
import { FileText, ShoppingCart, TrendingUp } from 'lucide-react';

interface StatusSummaryProps {
    stats: {
        totalPurchaseRequests: number;
        pendingPRs: number;
        totalPurchaseOrders: number;
        pendingPOs: number;
        totalRFPs: number;
        activeRFPs: number;
    };
}

const StatusSummaryCard: React.FC<StatusSummaryProps> = ({ stats }) => {
    const items = [
        {
            label: 'Purchase Requests',
            total: stats.totalPurchaseRequests,
            pending: stats.pendingPRs,
            icon: FileText,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        {
            label: 'Purchase Orders',
            total: stats.totalPurchaseOrders,
            pending: stats.pendingPOs,
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            label: 'Request for Proposals',
            total: stats.totalRFPs,
            pending: stats.activeRFPs, // Using active as pending equivalent
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Status Overview</h3>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${item.bgColor} ${item.color}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-700">{item.label}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Pending / Total</p>
                            <p className="text-sm font-bold text-gray-900">
                                <span className="text-orange-600">{item.pending}</span>
                                <span className="text-gray-400 mx-1">/</span>
                                <span>{item.total}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatusSummaryCard;
