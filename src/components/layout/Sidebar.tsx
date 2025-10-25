import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  Package,
  Settings,
  BarChart3,
  FileText,
  X,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Cog,
  Circle,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { name: string; href: string; isHeader?: boolean }[];
  badge?: string;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  {
    name: 'Purchase Requisition',
    href: '/purchase-requisition',
    icon: ClipboardList,
    subItems: [
      { name: 'Create PR', href: '/purchase-requisition/create' },
      { name: 'Manage PR', href: '/purchase-requisition/manage' },
      { name: 'Approve PR', href: '/purchase-requisition/approve' },
      { name: 'PR Status', href: '/purchase-requisition/status' },
      { name: 'PR Preview', href: '/purchase-requisition/preview' }
    ]
  },
  {
    name: 'RFP Activity',
    href: '/rfp',
    icon: FileText,
    subItems: [
      { name: 'Create RFP (from PR)', href: '/rfp/create' },
      { name: 'Create RFP (Manual)', href: '/rfp/create-manual' },
      { name: 'Manage RFP', href: '/rfp/manage' },
      { name: 'RFP Preview', href: '/rfp/preview' },
      { name: 'Submit Quotation', href: '/rfp/submit-quotation' },
      { name: 'Re-submit Quotation', href: '/rfp/resubmit-quotation' },
      { name: 'Negotiate Quotation', href: '/rfp/negotiate' },
      { name: 'Preview Quotations', href: '/rfp/quotation-preview' },
      { name: 'Send for Approval', href: '/rfp/send-for-approval' },
      { name: 'Approve/Reject RFP', href: '/rfp/approval' },
      { name: 'RFP Summary', href: '/rfp/summary' }
    ]
  },
  {
    name: 'Purchase Orders',
    href: '/purchase-orders',
    icon: ShoppingCart,
    subItems: [
      { name: 'Create PO (from RFP)', href: '/purchase-orders/create-from-rfp' },
      { name: 'Create Direct PO', href: '/purchase-orders/direct/create' },
      { name: 'PO Approval', href: '/purchase-orders/approve' },
      { name: 'Modify PO', href: '/purchase-orders/modify' },
      { name: 'Print PO', href: '/purchase-orders/print' },
      { name: 'All PO', href: '/purchase-orders/all' }
    ]
  },
  { name: 'GRN', href: '/grn', icon: Package },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  {
    name: 'Master Configuration',
    href: '/master',
    icon: Cog,
    subItems: [
      { name: 'Company', href: '/master/company' },
      { name: 'Currency', href: '/master/currency' },
      { name: 'Suppliers', href: '/master/suppliers' },
      { name: 'Stock Rooms', href: '/master/stockrooms' },
      { name: '─ Geographical Area ─', href: '#', isHeader: true },
      { name: 'Countries', href: '/master/countries' },
      { name: 'States', href: '/master/states' },
      { name: 'Cities', href: '/master/cities' },
      { name: 'Locations', href: '/master/floors' },
      { name: '─ Items & Categories ─', href: '#', isHeader: true },
      { name: 'Categories', href: '/master/categories' },
      { name: 'Sub-Categories', href: '/master/subcategories' },
      { name: 'Items', href: '/master/items' },
      { name: 'Unit of Measure', href: '/master/uom' },
      { name: '─ Organization Details ─', href: '#', isHeader: true },
      { name: 'Designation', href: '/master/designations' },
      { name: 'Department', href: '/master/departments' },
      { name: 'Cost Center', href: '/master/cost-centers' },
      { name: 'Employee', href: '/master/employees' },
      { name: 'Group', href: '/master/groups' },
      { name: '─ Financial Setup ─', href: '#', isHeader: true },
      { name: 'Financial Year', href: '/master/financial-year' },
      { name: 'Budget', href: '/master/budget' },
      { name: 'Tax Setup', href: '/master/tax' },
      { name: 'Payment Terms', href: '/master/payment-terms' },
      { name: 'Terms and Conditions', href: '/master/terms-and-conditions' },
      { name: '─ Access Management ─', href: '#', isHeader: true },
      { name: 'User Type', href: '/master/user-types' },
      { name: 'User Permission', href: '/master/user-permissions' },
      { name: 'Login Provision', href: '/master/login-provision' }
    ]
  },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = useCallback((itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-64 flex-shrink-0 lg:block transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          margin: 0,
          padding: 0,
          background: 'linear-gradient(to bottom, #ffffff 0%, #faf9fb 100%)',
          borderRight: '1px solid #e5e7eb',
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {navigation.map((item, index) => (
                <div key={item.name}>
                  {item.subItems ? (
                    <div className="mb-1">
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className="group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-50/30 transition-all duration-200 relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="relative">
                            <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-all duration-300 ${
                            expandedItems.includes(item.name) ? 'rotate-180 text-purple-600' : 'rotate-0'
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedItems.includes(item.name) ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="ml-4 mt-1 pl-4 border-l-2 border-purple-100 space-y-0.5">
                          {item.subItems.map((subItem) => (
                            subItem.isHeader ? (
                              <div
                                key={subItem.name}
                                className="flex items-center gap-2 px-3 py-2 mt-2 mb-1"
                              >
                                <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent"></div>
                                <span className="text-[10px] font-bold text-purple-600/70 uppercase tracking-widest">
                                  {subItem.name.replace(/─/g, '').trim()}
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-l from-purple-200 to-transparent"></div>
                              </div>
                            ) : (
                              <NavLink
                                key={subItem.name}
                                to={subItem.href}
                                className={({ isActive }) =>
                                  `group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative overflow-hidden ${
                                    isActive
                                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-500/30 font-medium'
                                      : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50/50'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    onClose();
                                  }
                                }}
                              >
                                {({ isActive }) => (
                                  <>
                                    <Circle
                                      className={`w-1.5 h-1.5 transition-all duration-200 ${
                                        isActive ? 'fill-white scale-125' : 'fill-purple-400/50 group-hover:fill-purple-500'
                                      }`}
                                    />
                                    <span className="relative z-10">{subItem.name}</span>
                                    {isActive && (
                                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white/30 rounded-l-full"></div>
                                    )}
                                  </>
                                )}
                              </NavLink>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                            : 'text-gray-700 hover:text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-50/30'
                        }`
                      }
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          <div className="relative z-10">
                            <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'drop-shadow-sm' : ''}`} />
                          </div>
                          <span className="relative z-10 font-medium">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {isActive && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/30 rounded-l-full"></div>
                          )}
                          {!isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          )}
                        </>
                      )}
                    </NavLink>
                  )}

                  {/* Add subtle divider after certain sections */}
                  {(index === 0 || index === 5 || index === 6) && (
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2"></div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gradient-to-b from-transparent to-gray-50/50">
            <div className="text-center">
              <div className="text-[10px] text-gray-400 font-medium">
                © 2025 Autovitica P2P
              </div>
              <div className="text-[9px] text-gray-300 mt-0.5">
                Version 1.0.0
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #d8b4fe, #c084fc);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #c084fc, #a855f7);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
