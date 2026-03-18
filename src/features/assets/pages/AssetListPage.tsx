import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  Monitor,
  Wrench,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAssets, useAssetStats } from '../hooks/useAssets';
import type { Asset, AssetStatus } from '../types';
import { ASSET_STATUS_COLORS, ASSET_STATUS_LABELS } from '../types';

const formatCurrency = (amount?: number) => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const AssetListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const { data: assetsData, isLoading } = useAssets(currentPage, pageSize);
  const { data: stats } = useAssetStats();

  const assets = assetsData?.content || [];
  const totalPages = assetsData?.totalPages || 0;
  const totalElements = assetsData?.totalElements || 0;

  // Client-side filtering
  const filteredAssets = useMemo(() => {
    return assets.filter((asset: Asset) => {
      const matchesSearch =
        !searchTerm ||
        asset.assetTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.departmentName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        asset.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || asset.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assets, searchTerm, statusFilter]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter]);

  const handleViewAsset = (id: number) => {
    navigate(`/assets/view/${id}`);
  };

  const handleExportCSV = () => {
    const headers = [
      'Asset Tag',
      'Item Name',
      'Category',
      'Status',
      'Department',
      'Assigned To',
      'Location',
      'Unit Price',
    ];
    const rows = filteredAssets.map((asset: Asset) => [
      asset.assetTag,
      asset.itemName,
      asset.categoryName || '',
      ASSET_STATUS_LABELS[asset.status] || asset.status,
      asset.departmentName || '',
      asset.assignedToName || '',
      asset.warehouseLocation || '',
      asset.unitPrice?.toString() || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asset-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const inStoreCount = stats?.IN_STORE || 0;
  const inUseCount = (stats?.IN_USE || 0) + (stats?.INSTALLED || 0);
  const maintenanceCount = stats?.IN_MAINTENANCE || 0;
  const totalCount = Object.values(stats || {}).reduce(
    (sum: number, val) => sum + (val as number),
    0
  );

  const statCards = [
    {
      label: 'In Store',
      value: inStoreCount,
      icon: Warehouse,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'In Use',
      value: inUseCount,
      icon: Monitor,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Maintenance',
      value: maintenanceCount,
      icon: Wrench,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Total',
      value: totalCount,
      icon: Package,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

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
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>
            Asset Inventory
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Manage and track all organizational assets
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
        >
          <Download className='h-4 w-4' />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map(card => (
          <div
            key={card.label}
            className='bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4'
          >
            <div
              className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}
            >
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className='text-sm text-gray-500'>{card.label}</p>
              <p className='text-xl font-semibold text-gray-900'>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            type='text'
            placeholder='Search by asset tag, name, category, department...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Filter className='h-4 w-4 text-gray-400' />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          >
            <option value=''>All Status</option>
            <option value='IN_STORE'>In Store</option>
            <option value='IN_USE'>In Use</option>
            <option value='INSTALLED'>Installed</option>
            <option value='IN_MAINTENANCE'>Under Maintenance</option>
            <option value='IN_TRANSIT'>In Transit</option>
            <option value='DISPOSED'>Disposed</option>
            <option value='SOLD'>Sold</option>
            <option value='DAMAGED'>Damaged</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredAssets.length === 0 ? (
        <div className='bg-white rounded-lg border border-gray-200 py-16'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Search className='w-8 h-8 text-gray-400' />
            </div>
            <p className='text-gray-600 font-medium'>No Assets Found</p>
            <p className='text-gray-400 text-sm mt-1'>
              No assets match your search criteria.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-[#F7F8FA]'>
                  <tr>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Asset Tag
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Item Name
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Category
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Status
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Department
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Assigned To
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Location
                    </th>
                    <th className='px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Unit Price
                    </th>
                    <th className='px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredAssets.map((asset: Asset) => (
                    <tr
                      key={asset.id}
                      className='hover:bg-gray-50 transition-colors cursor-pointer'
                      onClick={() => handleViewAsset(asset.id)}
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='text-sm font-medium text-violet-600'>
                          {asset.assetTag}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                        {asset.itemName}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {asset.categoryName || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <Badge
                          className={
                            ASSET_STATUS_COLORS[asset.status] ||
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {ASSET_STATUS_LABELS[asset.status] || asset.status}
                        </Badge>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {asset.departmentName || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {asset.assignedToName || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {asset.warehouseLocation ||
                          asset.storageLocation ||
                          '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right'>
                        {formatCurrency(asset.unitPrice)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleViewAsset(asset.id);
                          }}
                          className='text-violet-600 hover:text-violet-700 p-1'
                          title='View'
                        >
                          <Eye className='h-4 w-4' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='bg-white rounded-lg border border-gray-200 px-6 py-4 flex items-center justify-between'>
              <p className='text-sm text-gray-600'>
                Showing{' '}
                <span className='font-medium'>
                  {currentPage * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className='font-medium'>
                  {Math.min((currentPage + 1) * pageSize, totalElements)}
                </span>{' '}
                of <span className='font-medium'>{totalElements}</span> results
              </p>

              <div className='flex items-center gap-1'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                  <ChevronLeft className='w-4 h-4' />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 7 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-violet-600 text-white border border-violet-600'
                          : 'text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))
                  }
                  disabled={currentPage === totalPages - 1}
                  className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                  <ChevronRight className='w-4 h-4' />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssetListPage;
