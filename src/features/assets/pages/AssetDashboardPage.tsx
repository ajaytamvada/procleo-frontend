import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Warehouse,
  Monitor,
  Wrench,
  ArrowRight,
  BarChart3,
  Building2,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  useAssetStats,
  useAssetStatsByCategory,
  useAssetStatsByDepartment,
  useAssets,
} from '../hooks/useAssets';
import type { Asset } from '../types';
import { ASSET_STATUS_COLORS, ASSET_STATUS_LABELS } from '../types';

const formatCurrency = (amount?: number) => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN');
};

const AssetDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useAssetStats();
  const { data: categoryStats, isLoading: categoryLoading } =
    useAssetStatsByCategory();
  const { data: departmentStats, isLoading: departmentLoading } =
    useAssetStatsByDepartment();
  const { data: recentAssetsData, isLoading: recentLoading } = useAssets(0, 5);

  const recentAssets = recentAssetsData?.content || [];

  const inStoreCount = stats?.IN_STORE || 0;
  const inUseCount = stats?.IN_USE || 0;
  const maintenanceCount = stats?.IN_MAINTENANCE || 0;
  const totalCount = Object.values(stats || {}).reduce(
    (sum: number, val) => sum + (val as number),
    0
  );

  const statCards = [
    {
      label: 'Total Assets',
      value: totalCount,
      icon: Package,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
    },
    {
      label: 'In Store',
      value: inStoreCount,
      icon: Warehouse,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      label: 'In Use',
      value: inUseCount,
      icon: Monitor,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    {
      label: 'Under Maintenance',
      value: maintenanceCount,
      icon: Wrench,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
    },
  ];

  const isLoading =
    statsLoading || categoryLoading || departmentLoading || recentLoading;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='flex flex-col items-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
          <p className='text-sm text-gray-500 mt-3'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-xl font-semibold text-gray-900'>Asset Dashboard</h1>
        <p className='text-sm text-gray-500 mt-1'>
          Overview of organizational asset statistics
        </p>
      </div>

      {/* Stat Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map(card => (
          <div
            key={card.label}
            className={`bg-white rounded-lg border ${card.border} p-5 flex items-center gap-4`}
          >
            <div
              className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}
            >
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className='text-sm text-gray-500'>{card.label}</p>
              <p className='text-2xl font-bold text-gray-900'>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Assets by Category */}
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-base font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <Layers className='h-5 w-5 text-violet-600' />
            Assets by Category
          </h2>
          {categoryStats && Object.keys(categoryStats).length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead>
                  <tr className='border-b border-gray-100'>
                    <th className='text-left text-xs font-medium text-gray-500 uppercase tracking-wide pb-3'>
                      Category
                    </th>
                    <th className='text-right text-xs font-medium text-gray-500 uppercase tracking-wide pb-3'>
                      Count
                    </th>
                    <th className='text-right text-xs font-medium text-gray-500 uppercase tracking-wide pb-3 w-24'>
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50'>
                  {Object.entries(categoryStats)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([category, count]) => (
                      <tr key={category} className='hover:bg-gray-50'>
                        <td className='py-2.5 text-sm text-gray-700'>
                          {category}
                        </td>
                        <td className='py-2.5 text-sm font-medium text-gray-900 text-right'>
                          {count as number}
                        </td>
                        <td className='py-2.5 text-sm text-gray-500 text-right'>
                          {totalCount > 0
                            ? (((count as number) / totalCount) * 100).toFixed(
                                1
                              )
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className='text-sm text-gray-400 text-center py-8'>
              No category data available
            </p>
          )}
        </div>

        {/* Assets by Department */}
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-base font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <Building2 className='h-5 w-5 text-violet-600' />
            Assets by Department
          </h2>
          {departmentStats && Object.keys(departmentStats).length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead>
                  <tr className='border-b border-gray-100'>
                    <th className='text-left text-xs font-medium text-gray-500 uppercase tracking-wide pb-3'>
                      Department
                    </th>
                    <th className='text-right text-xs font-medium text-gray-500 uppercase tracking-wide pb-3'>
                      Count
                    </th>
                    <th className='text-right text-xs font-medium text-gray-500 uppercase tracking-wide pb-3 w-24'>
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50'>
                  {Object.entries(departmentStats)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([department, count]) => (
                      <tr key={department} className='hover:bg-gray-50'>
                        <td className='py-2.5 text-sm text-gray-700'>
                          {department}
                        </td>
                        <td className='py-2.5 text-sm font-medium text-gray-900 text-right'>
                          {count as number}
                        </td>
                        <td className='py-2.5 text-sm text-gray-500 text-right'>
                          {totalCount > 0
                            ? (((count as number) / totalCount) * 100).toFixed(
                                1
                              )
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className='text-sm text-gray-400 text-center py-8'>
              No department data available
            </p>
          )}
        </div>
      </div>

      {/* Recent Assets */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
            <BarChart3 className='h-5 w-5 text-violet-600' />
            Recent Assets
          </h2>
          <button
            onClick={() => navigate('/assets/list')}
            className='text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1'
          >
            View All <ArrowRight className='h-4 w-4' />
          </button>
        </div>
        {recentAssets.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead>
                <tr className='bg-[#F7F8FA]'>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Asset Tag
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Item Name
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Category
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Status
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Unit Price
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {recentAssets.map((asset: Asset) => (
                  <tr
                    key={asset.id}
                    className='hover:bg-gray-50 transition-colors cursor-pointer'
                    onClick={() => navigate(`/assets/view/${asset.id}`)}
                  >
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <span className='text-sm font-medium text-violet-600'>
                        {asset.assetTag}
                      </span>
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-700'>
                      {asset.itemName}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                      {asset.categoryName || '-'}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <Badge
                        className={
                          ASSET_STATUS_COLORS[asset.status] ||
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {ASSET_STATUS_LABELS[asset.status] || asset.status}
                      </Badge>
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right'>
                      {formatCurrency(asset.unitPrice)}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                      {formatDate(asset.createdDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className='text-sm text-gray-400 text-center py-8'>
            No recent assets
          </p>
        )}
      </div>

      {/* Quick Links */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <button
          onClick={() => navigate('/assets/list')}
          className='bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left'
        >
          <div className='w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center'>
            <Package className='h-5 w-5 text-violet-600' />
          </div>
          <div>
            <p className='text-sm font-medium text-gray-900'>View All Assets</p>
            <p className='text-xs text-gray-500'>
              Browse complete asset inventory
            </p>
          </div>
          <ArrowRight className='h-4 w-4 text-gray-400 ml-auto' />
        </button>

        <button
          onClick={() => navigate('/assets/transfers')}
          className='bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left'
        >
          <div className='w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center'>
            <ArrowRightLeft className='h-5 w-5 text-blue-600' />
          </div>
          <div>
            <p className='text-sm font-medium text-gray-900'>
              Pending Transfers
            </p>
            <p className='text-xs text-gray-500'>
              Review and approve transfers
            </p>
          </div>
          <ArrowRight className='h-4 w-4 text-gray-400 ml-auto' />
        </button>

        <button
          onClick={() => navigate('/assets/maintenance')}
          className='bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left'
        >
          <div className='w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center'>
            <Wrench className='h-5 w-5 text-yellow-600' />
          </div>
          <div>
            <p className='text-sm font-medium text-gray-900'>
              Pending Maintenance
            </p>
            <p className='text-xs text-gray-500'>
              Track maintenance activities
            </p>
          </div>
          <ArrowRight className='h-4 w-4 text-gray-400 ml-auto' />
        </button>
      </div>
    </div>
  );
};

export default AssetDashboardPage;
