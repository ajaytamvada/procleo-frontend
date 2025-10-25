import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, QrCode } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  category: string;
  location: string;
  status: 'active' | 'maintenance' | 'retired' | 'missing';
  value: string;
  purchaseDate: string;
  assignedTo?: string;
}

const Assets: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const assets: Asset[] = [
    {
      id: 'AST-001',
      name: 'Dell Laptop XPS 13',
      category: 'IT Equipment',
      location: 'Office - Floor 2',
      status: 'active',
      value: '$1,299.00',
      purchaseDate: '2023-12-15',
      assignedTo: 'John Doe',
    },
    {
      id: 'AST-002',
      name: 'Office Desk Chair',
      category: 'Furniture',
      location: 'Office - Floor 1',
      status: 'active',
      value: '$299.00',
      purchaseDate: '2023-11-20',
      assignedTo: 'Jane Smith',
    },
    {
      id: 'AST-003',
      name: 'Network Printer HP',
      category: 'IT Equipment',
      location: 'Office - Main Floor',
      status: 'maintenance',
      value: '$450.00',
      purchaseDate: '2023-10-10',
    },
    {
      id: 'AST-004',
      name: 'Conference Table',
      category: 'Furniture',
      location: 'Conference Room A',
      status: 'active',
      value: '$899.00',
      purchaseDate: '2023-09-05',
    },
    {
      id: 'AST-005',
      name: 'Projector Epson',
      category: 'IT Equipment',
      location: 'Conference Room B',
      status: 'retired',
      value: '$650.00',
      purchaseDate: '2022-08-15',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-gray-100 text-gray-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(assets.map(asset => asset.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600">Track and manage company assets</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary btn-md">
            <QrCode className="w-4 h-4 mr-2" />
            Scan Asset
          </button>
          <button className="btn btn-primary btn-md">
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </button>
        </div>
      </div>

      {/* Asset Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Assets</div>
          <div className="text-2xl font-bold text-gray-900">{assets.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {assets.filter(a => a.status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Maintenance</div>
          <div className="text-2xl font-bold text-yellow-600">
            {assets.filter(a => a.status === 'maintenance').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-600">Total Value</div>
          <div className="text-2xl font-bold text-gray-900">
            ${assets.reduce((sum, asset) => sum + parseFloat(asset.value.replace('$', '').replace(',', '')), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by asset ID, name, or assigned person..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              className="input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-secondary btn-md">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                <p className="text-sm text-gray-500">{asset.id}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</div>
                <div className="text-sm text-gray-900">{asset.category}</div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</div>
                <div className="text-sm text-gray-900">{asset.location}</div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                  {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                </span>
              </div>

              <div className="flex justify-between">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Value</div>
                  <div className="text-sm font-medium text-gray-900">{asset.value}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Purchase Date</div>
                  <div className="text-sm text-gray-900">{asset.purchaseDate}</div>
                </div>
              </div>

              {asset.assignedTo && (
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned To</div>
                  <div className="text-sm text-gray-900">{asset.assignedTo}</div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View Details
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                  <QrCode className="w-4 h-4 inline mr-1" />
                  QR Code
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No assets found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Assets;