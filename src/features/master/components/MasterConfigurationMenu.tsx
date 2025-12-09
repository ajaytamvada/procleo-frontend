import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Settings,
  BookOpen,
  MapPin,
  FolderTree,
  BarChart3,
  Shield,
  DollarSign,
  Users,
  Tag,
  Package,
  Briefcase,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MenuSection {
  id: string;
  title: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
  expandable?: boolean;
  path?: string;
}

interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon?: React.ReactNode;
}

const masterConfigSections: MenuSection[] = [
  {
    id: 'configuration',
    title: 'Configuration',
    expandable: false,
    items: [
      {
        id: 'company-info',
        title: 'Company Info',
        path: '/master/company',
        icon: <Building2 size={16} />,
      },
      {
        id: 'p2p-setup',
        title: 'P2P Setup',
        path: '/master/p2p-setup',
        icon: <Settings size={16} />,
      },
      {
        id: 'knowledge-base',
        title: 'Knowledge Base',
        path: '/master/knowledge-base',
        icon: <BookOpen size={16} />,
      },
    ],
  },
  {
    id: 'geographical',
    title: 'Geographical Area',
    icon: <MapPin size={16} />,
    expandable: true,
    items: [
      { id: 'countries', title: 'Countries', path: '/master/countries' },
      { id: 'states', title: 'States', path: '/master/states' },
      { id: 'cities', title: 'Cities', path: '/master/cities' },
      { id: 'locations', title: 'Locations', path: '/master/locations' },
    ],
  },
  {
    id: 'categories',
    title: 'Categories',
    icon: <FolderTree size={16} />,
    expandable: true,
    items: [
      {
        id: 'asset-categories',
        title: 'Asset Categories',
        path: '/master/asset-categories',
      },
      {
        id: 'product-categories',
        title: 'Product Categories',
        path: '/master/product-categories',
      },
      {
        id: 'service-categories',
        title: 'Service Categories',
        path: '/master/service-categories',
      },
      {
        id: 'expense-categories',
        title: 'Expense Categories',
        path: '/master/expense-categories',
      },
    ],
  },
  {
    id: 'organization-details',
    title: 'Organization Details',
    icon: <Briefcase size={16} />,
    expandable: true,
    items: [
      {
        id: 'designations',
        title: 'Designation',
        path: '/master/designations',
      },
      { id: 'departments', title: 'Department', path: '/master/departments' },
      {
        id: 'cost-centers',
        title: 'Cost Center',
        path: '/master/cost-centers',
      },
      { id: 'employees', title: 'Employee', path: '/master/employees' },
      { id: 'groups', title: 'Group', path: '/master/groups' },
    ],
  },
  {
    id: 'org-insights',
    title: 'Org Insights',
    icon: <BarChart3 size={16} />,
    expandable: true,
    items: [
      { id: 'divisions', title: 'Divisions', path: '/master/divisions' },
      {
        id: 'business-units',
        title: 'Business Units',
        path: '/master/business-units',
      },
    ],
  },
  {
    id: 'access-management',
    title: 'Access Management',
    icon: <Shield size={16} />,
    expandable: true,
    items: [
      { id: 'user-roles', title: 'User Roles', path: '/master/user-roles' },
      { id: 'permissions', title: 'Permissions', path: '/master/permissions' },
      {
        id: 'approval-matrix',
        title: 'Approval Matrix',
        path: '/master/approval-matrix',
      },
    ],
  },
  {
    id: 'finance-setup',
    title: 'Finance Setup',
    expandable: false,
    items: [
      {
        id: 'supplier',
        title: 'Supplier',
        path: '/master/suppliers',
        icon: <Users size={16} />,
      },
      {
        id: 'tag-setup',
        title: 'Tag Setup',
        path: '/master/tags',
        icon: <Tag size={16} />,
      },
      {
        id: 'stockroom',
        title: 'StockRoom',
        path: '/master/stockrooms',
        icon: <Package size={16} />,
      },
      {
        id: 'currency',
        title: 'Currency',
        path: '/master/currency',
        icon: <DollarSign size={16} />,
      },
      {
        id: 'tax-setup',
        title: 'Tax Setup',
        path: '/master/tax',
        icon: <DollarSign size={16} />,
      },
      {
        id: 'uom',
        title: 'Unit of Measure',
        path: '/master/uom',
        icon: <Settings size={16} />,
      },
    ],
  },
  {
    id: 'organization-details',
    title: 'Organization Details',
    icon: <Briefcase size={16} />,
    expandable: true,
    items: [
      {
        id: 'designations',
        title: 'Designation',
        path: '/master/designations',
      },
      { id: 'departments', title: 'Department', path: '/master/departments' },
      {
        id: 'cost-centers',
        title: 'Cost Center',
        path: '/master/cost-centers',
      },
      { id: 'employees', title: 'Employee', path: '/master/employees' },
      { id: 'groups', title: 'Group', path: '/master/groups' },
    ],
  },
];

const MasterConfigurationMenu: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['configuration', 'finance-setup', 'organization-details'])
  );
  const [activeItem, setActiveItem] = useState<string>('');
  const navigate = useNavigate();

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleItemClick = (item: MenuItem) => {
    setActiveItem(item.id);
    navigate(item.path);
  };

  const renderMenuItem = (item: MenuItem) => (
    <button
      key={item.id}
      onClick={() => handleItemClick(item)}
      className={`w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
        activeItem === item.id
          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
          : 'text-gray-700'
      }`}
    >
      {item.icon && <span className='mr-2'>{item.icon}</span>}
      {item.title}
    </button>
  );

  const renderSection = (section: MenuSection) => {
    const isExpanded = expandedSections.has(section.id);
    const showItems = !section.expandable || isExpanded;

    return (
      <div key={section.id} className='border-b border-gray-200'>
        <button
          onClick={() => section.expandable && toggleSection(section.id)}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors ${
            section.expandable ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          <div className='flex items-center'>
            {section.icon && <span className='mr-2'>{section.icon}</span>}
            {section.title}
          </div>
          {section.expandable && (
            <span className='ml-auto'>
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
          )}
        </button>

        {showItems && section.items && (
          <div className='bg-white'>{section.items.map(renderMenuItem)}</div>
        )}
      </div>
    );
  };

  return (
    <div className='w-64 bg-white border-r border-gray-200 shadow-sm'>
      <div className='p-4 border-b border-gray-200'>
        <h2 className='text-lg font-semibold text-gray-800'>
          Master Configuration
        </h2>
        <p className='text-sm text-gray-600 mt-1'>
          System configuration and setup
        </p>
      </div>

      <div className='overflow-y-auto max-h-[calc(100vh-120px)]'>
        {masterConfigSections.map(renderSection)}
      </div>
    </div>
  );
};

export default MasterConfigurationMenu;
