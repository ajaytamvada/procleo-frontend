import React, { useState, useCallback, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  Package,
  Settings,
  BarChart3,
  FileText,
  ChevronDown,
  ClipboardList,
  Cog,
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { getModuleCode } from '@/config/moduleMapping';

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
  moduleCode?: string;
}

// Icon mapping for dynamic modules
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  ShoppingCart,
  Package,
  Settings,
  BarChart3,
  FileText,
  ClipboardList,
  Cog,
};

const DynamicSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { modules, hasModule, isLoaded } = usePermissions();

  const toggleExpanded = useCallback((itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  }, []);

  /**
   * Build navigation from user's modules
   */
  const navigation = useMemo<NavigationItem[]>(() => {
    if (!isLoaded || modules.length === 0) {
      return [];
    }

    // Group modules by parent
    const parentModules = modules.filter(
      m => !m.parentModuleCode && m.moduleType === 'MENU'
    );
    const childModules = modules.filter(
      m => m.parentModuleCode && m.moduleType === 'SUBMENU'
    );

    return parentModules
      .map(parent => {
        const children = childModules
          .filter(child => child.parentModuleCode === parent.moduleCode)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(child => ({
            name: child.moduleName,
            href: child.routePath || '#',
            moduleCode: child.moduleCode,
          }));

        const iconComponent =
          parent.iconName && iconMap[parent.iconName]
            ? iconMap[parent.iconName]
            : FileText;

        return {
          name: parent.moduleName,
          href: parent.routePath || '#',
          icon: iconComponent,
          subItems: children.length > 0 ? children : undefined,
          moduleCode: parent.moduleCode,
        };
      })
      .sort((a, b) => {
        // Force Invoices before GRN
        if (a.moduleCode === 'INVOICE' && b.moduleCode === 'GRN') return -1;
        if (a.moduleCode === 'GRN' && b.moduleCode === 'INVOICE') return 1;

        const aModule = modules.find(m => m.moduleCode === a.moduleCode);
        const bModule = modules.find(m => m.moduleCode === b.moduleCode);
        return (aModule?.sortOrder || 0) - (bModule?.sortOrder || 0);
      });
  }, [modules, isLoaded]);

  /**
   * Fallback static navigation for when permissions aren't loaded
   */
  const staticNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: Home, moduleCode: 'DASHBOARD' },
    {
      name: 'Purchase Requisition',
      href: '/purchase-requisition',
      icon: ClipboardList,
      moduleCode: 'PR',
      subItems: [
        { name: 'Create PR', href: '/purchase-requisition/create' },
        { name: 'Manage PR', href: '/purchase-requisition/manage' },
        { name: 'Approve PR', href: '/purchase-requisition/approve' },
        { name: 'PR Status', href: '/purchase-requisition/status' },
        { name: 'PR Preview', href: '/purchase-requisition/preview' },
      ],
    },
    {
      name: 'RFP Activity',
      href: '/rfp',
      icon: FileText,
      moduleCode: 'RFP',
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
        { name: 'RFP Summary', href: '/rfp/summary' },
      ],
    },
    {
      name: 'Purchase Orders',
      href: '/purchase-orders',
      icon: ShoppingCart,
      moduleCode: 'PO',
      subItems: [
        {
          name: 'Create PO (from RFP)',
          href: '/purchase-orders/create-from-rfp',
        },
        { name: 'Create Direct PO', href: '/purchase-orders/direct/create' },
        { name: 'PO Approval', href: '/purchase-orders/approve' },
        { name: 'Modify PO', href: '/purchase-orders/modify' },
        { name: 'Print PO', href: '/purchase-orders/print' },
        { name: 'All PO', href: '/purchase-orders/all' },
      ],
    },
    {
      name: 'Invoices',
      href: '/invoice',
      icon: FileText,
      moduleCode: 'INVOICE',
      subItems: [
        { name: 'Create Invoice', href: '/invoice/entry' },
        { name: 'Manage Invoice', href: '/invoice/list' },
      ],
    },
    { name: 'GRN', href: '/grn', icon: Package, moduleCode: 'GRN' },
    {
      name: 'Master Configuration',
      href: '/master',
      icon: Cog,
      moduleCode: 'MASTER',
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      moduleCode: 'REPORTS',
      subItems: [
        { name: 'PR Reports', href: '/reports/pr' },
        { name: 'PO Reports', href: '/reports/po' },
        { name: 'GRN Reports', href: '/reports/grn' },
        { name: 'Invoice Reports', href: '/reports/invoices' },
        { name: 'Vendor Reports', href: '/reports/vendor' },
        { name: '3-Way Match', href: '/reports/three-way-match' },
        { name: 'RFP Float', href: '/reports/rfp-float' },
        { name: 'RFP Submitted', href: '/reports/rfp-submitted' },
      ],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      moduleCode: 'SETTINGS',
    },
  ];

  /**
   * Filter static navigation based on permissions
   */
  const filteredStaticNavigation = useMemo(() => {
    if (!isLoaded) return staticNavigation;

    return staticNavigation.filter(item => {
      const moduleCode = item.moduleCode || getModuleCode(item.href);
      if (!moduleCode || !hasModule(moduleCode)) {
        return false;
      }

      if (item.subItems) {
        item.subItems = item.subItems.filter(subItem => {
          if (subItem.isHeader) return true;
          const subModuleCode = getModuleCode(subItem.href);
          return subModuleCode ? hasModule(subModuleCode) : false;
        });
      }

      return true;
    });
  }, [isLoaded, hasModule, staticNavigation]);

  const displayNavigation =
    navigation.length > 0 ? navigation : filteredStaticNavigation;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden transition-all duration-300'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-64 flex-shrink-0 lg:block transition-transform duration-300 bg-white border-r border-gray-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className='flex flex-col h-full'>
          {/* Navigation */}
          <nav className='flex-1 px-4 py-4 overflow-y-auto'>
            <div className='space-y-1'>
              {displayNavigation.map((item, index) => (
                <div key={item.name}>
                  {item.subItems ? (
                    <div className='mb-1'>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className='sidebar-btn group flex items-center justify-between w-full px-2 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200'
                      >
                        <div className='flex items-center gap-3'>
                          <item.icon className='w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-200' />
                          <span>{item.name}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                            expandedItems.includes(item.name)
                              ? 'rotate-180 text-gray-600'
                              : ''
                          }`}
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedItems.includes(item.name)
                            ? 'max-h-[3000px] opacity-100'
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className='ml-4 mt-1 border-l-[3px] border-gray-200 pl-2'>
                          {item.subItems.map(subItem =>
                            subItem.isHeader ? (
                              <div
                                key={subItem.name}
                                className='flex items-center gap-2 py-2 mt-2 mb-1'
                              >
                                <div className='h-px flex-1 bg-gray-200'></div>
                                <span className='text-[10px] font-semibold text-gray-400 uppercase tracking-wider'>
                                  {subItem.name.replace(/─/g, '').trim()}
                                </span>
                                <div className='h-px flex-1 bg-gray-200'></div>
                              </div>
                            ) : (
                              <NavLink
                                key={subItem.name}
                                to={subItem.href}
                                className={({ isActive }) =>
                                  `sidebar-link block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                    isActive
                                      ? 'sidebar-link-active'
                                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                  }`
                                }
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    onClose();
                                  }
                                }}
                              >
                                {subItem.name}
                              </NavLink>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `sidebar-link group flex items-center gap-3 px-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'sidebar-link-active'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
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
                          <item.icon
                            className={`w-5 h-5 transition-colors duration-200 ${
                              isActive
                                ? 'text-gray-700'
                                : 'text-gray-500 group-hover:text-gray-700'
                            }`}
                          />
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className='ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full'>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  )}

                  {/* Add subtle divider after certain sections */}
                  {(index === 0 || index === 5 || index === 6) && (
                    <div className='h-px bg-gray-100 my-2'></div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className='p-4 border-t border-gray-100'>
            <div className='text-center'>
              <div className='text-[10px] text-gray-400 font-medium'>
                © 2025 ProcLeo P2P
              </div>
              <div className='text-[9px] text-gray-300 mt-0.5'>
                Version 1.0.0
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        * {
          outline: none !important;
        }
        .sidebar-link,
        .sidebar-btn {
          position: relative;
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .sidebar-link:hover,
        .sidebar-link:focus,
        .sidebar-link:focus-visible,
        .sidebar-link:active,
        .sidebar-btn:hover,
        .sidebar-btn:focus,
        .sidebar-btn:focus-visible,
        .sidebar-btn:active {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .sidebar-link-active {
          color: #111827 !important;
          font-weight: 600 !important;
          background-color: #f3f4f6 !important;
          position: relative;
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .sidebar-link-active::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 70%;
          background-color: #5C2FC2;
          border-radius: 0 2px 2px 0;
        }
        button:focus,
        button:focus-visible,
        a:focus,
        a:focus-visible {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
};

export default DynamicSidebar;
