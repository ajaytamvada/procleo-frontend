import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Building2,
  Users,
  Award,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
} from 'lucide-react';

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { formatCurrency, formatDate } from '@/lib/utils';

// Mock vendor data
interface Vendor {
  id: string;
  name: string;
  code: string;
  email: string;
  contactEmail: string;
  phone: string;
  contactPhone: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  gstNumber?: string;
  panNumber?: string;
  businessType: 'manufacturer' | 'distributor' | 'retailer' | 'service_provider' | 'other';
  category: string;
  paymentTerms: string;
  creditLimit?: number;
  website?: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending' | 'blocked';
  rating: number;
  totalOrders: number;
  totalValue: number;
  lastOrderDate?: string;
  createdAt: string;
  createdBy: string;
  isVerified: boolean;
  documents: Array<{
    type: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  }>;
}

const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'ABC Suppliers Ltd.',
    code: 'ABC001',
    email: 'contact@abc.com',
    contactEmail: 'sales@abc.com',
    phone: '+91-9876543210',
    contactPhone: '+91-9876543211',
    address: {
      line1: '123 Business Park',
      line2: 'Tech City',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560001',
    },
    gstNumber: '29ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    businessType: 'manufacturer',
    category: 'Hardware',
    paymentTerms: 'Net 30',
    creditLimit: 500000,
    website: 'https://abc.com',
    description: 'Leading supplier of hardware components',
    status: 'active',
    rating: 4.5,
    totalOrders: 45,
    totalValue: 2500000,
    lastOrderDate: '2024-01-15',
    createdAt: '2023-01-15',
    createdBy: 'admin',
    isVerified: true,
    documents: [
      { type: 'GST Certificate', fileName: 'gst_cert.pdf', fileSize: 1024000, uploadedAt: '2023-01-15' },
    ],
  },
  {
    id: '2',
    name: 'XYZ Technologies',
    code: 'XYZ002',
    email: 'info@xyz.com',
    contactEmail: 'procurement@xyz.com',
    phone: '+91-8765432109',
    contactPhone: '+91-8765432108',
    address: {
      line1: '456 Innovation Hub',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      postalCode: '500001',
    },
    gstNumber: '36XYZAB5678G2Z3',
    panNumber: 'XYZAB5678G',
    businessType: 'service_provider',
    category: 'Software',
    paymentTerms: 'Net 45',
    creditLimit: 1000000,
    website: 'https://xyz.com',
    description: 'Software development and IT services',
    status: 'active',
    rating: 4.8,
    totalOrders: 23,
    totalValue: 1800000,
    lastOrderDate: '2024-01-10',
    createdAt: '2023-06-20',
    createdBy: 'manager',
    isVerified: true,
    documents: [],
  },
];

const businessTypes = [
  { value: 'manufacturer', label: 'Manufacturer', icon: Building2 },
  { value: 'distributor', label: 'Distributor', icon: TrendingUp },
  { value: 'retailer', label: 'Retailer', icon: Users },
  { value: 'service_provider', label: 'Service Provider', icon: Award },
  { value: 'other', label: 'Other', icon: Building2 },
];

const categories = [
  'Hardware', 'Software', 'Services', 'Office Supplies', 'Furniture', 'Equipment', 'Maintenance'
];

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
};

export function VendorManagement() {
  const navigate = useNavigate();
  const [vendors] = useState<Vendor[]>(mockVendors);
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = searchQuery === '' || 
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [vendors, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    return {
      total: vendors.length,
      active: vendors.filter(v => v.status === 'active').length,
      verified: vendors.filter(v => v.isVerified).length,
      totalBusiness: vendors.reduce((sum, v) => sum + v.totalValue, 0),
    };
  }, [vendors]);

  const breadcrumbItems = [
    { label: 'Master Data', href: '/masters' },
    { label: 'Vendor Management', isActive: true },
  ];

  const getBusinessTypeIcon = (type: string) => {
    const businessType = businessTypes.find(bt => bt.value === type);
    return businessType ? businessType.icon : Building2;
  };

  const VendorCard = ({ vendor }: { vendor: Vendor }) => {
    const StatusIcon = statusConfig[vendor.status].icon;
    const BusinessIcon = getBusinessTypeIcon(vendor.businessType);
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
        {/* Card Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BusinessIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                  {vendor.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{vendor.code}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${statusConfig[vendor.status].color}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[vendor.status].label}
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <MapPin className="w-3 h-3 mr-1" />
                Location
              </div>
              <p className="text-sm font-medium">{vendor.address.city}, {vendor.address.state}</p>
            </div>
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Award className="w-3 h-3 mr-1" />
                Category
              </div>
              <p className="text-sm font-medium">{vendor.category}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                Rating
              </div>
              <p className="text-sm font-medium">{vendor.rating.toFixed(1)} ({vendor.totalOrders} orders)</p>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Business</div>
              <p className="text-sm font-bold text-green-600">{formatCurrency(vendor.totalValue)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-3 h-3 mr-2" />
              {vendor.email}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-3 h-3 mr-2" />
              {vendor.phone}
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="px-4 py-3 bg-gray-50 rounded-b-lg flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Last order: {vendor.lastOrderDate ? formatDate(vendor.lastOrderDate) : 'None'}
          </div>
          <div className="flex space-x-1">
            <button 
              onClick={() => navigate(`/vendors/${vendor.id}`)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
              title="Edit Vendor"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete Vendor"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex-center py-8">
          <div className="spinner w-6 h-6 text-blue-600"></div>
          <p className="ml-2 text-gray-500">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-4">
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-1">Manage vendor relationships and track performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Vendors</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified Vendors</p>
              <p className="text-2xl font-bold text-purple-600">{stats.verified}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Business</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalBusiness)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search vendors by name, code, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Showing {filteredVendors.length} of {vendors.length} vendors</span>
        <span>Updated just now</span>
      </div>

      {/* Vendor Grid */}
      {filteredVendors.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Get started by adding your first vendor.'}
          </p>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add First Vendor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </div>
  );
}