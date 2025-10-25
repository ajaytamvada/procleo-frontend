import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
  maxItems?: number;
}

export function Breadcrumbs({
  items,
  className,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4 text-gray-400" />,
  maxItems = 5,
}: BreadcrumbsProps) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from URL if not provided
  const generatedItems = React.useMemo(() => {
    if (items) return items;
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Path mappings for better labels
    const pathLabels: Record<string, string> = {
      purchases: 'Purchase Orders',
      vendors: 'Vendor Management',
      assets: 'Asset Management',
      users: 'User Management',
      reports: 'Reports & Analytics',
      settings: 'Settings',
      dashboard: 'Dashboard',
      'purchase-orders': 'Purchase Orders',
      'vendor-management': 'Vendors',
      'asset-management': 'Assets',
      'user-management': 'Users',
    };
    
    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        href: isLast ? undefined : href,
        isActive: isLast,
      });
    });
    
    return breadcrumbs;
  }, [items, location.pathname]);
  
  // Truncate breadcrumbs if too many
  const displayItems = React.useMemo(() => {
    if (generatedItems.length <= maxItems) return generatedItems;
    
    const firstItem = generatedItems[0];
    const lastItems = generatedItems.slice(-2);
    
    return [
      firstItem,
      { label: '...', href: undefined, isActive: false },
      ...lastItems,
    ];
  }, [generatedItems, maxItems]);
  
  return (
    <nav
      className={cn(
        'flex items-center space-x-1 text-sm font-medium text-gray-500',
        className
      )}
      aria-label="Breadcrumb"
    >
      {showHome && (
        <>
          <Link
            to="/"
            className="flex items-center hover:text-gray-700 transition-colors"
            title="Home"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
          {displayItems.length > 0 && (
            <span className="flex items-center">{separator}</span>
          )}
        </>
      )}
      
      {displayItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="flex items-center">{separator}</span>
          )}
          
          <div className="flex items-center">
            {item.icon && (
              <span className="mr-1.5 flex items-center">{item.icon}</span>
            )}
            
            {item.href ? (
              <Link
                to={item.href}
                className={cn(
                  'hover:text-gray-700 transition-colors',
                  'max-w-[150px] truncate'
                )}
                title={item.label}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'max-w-[150px] truncate',
                  item.isActive
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-500'
                )}
                title={item.label}
              >
                {item.label}
              </span>
            )}
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
}

// Hook for managing breadcrumbs
export function useBreadcrumbs() {
  const [items, setItems] = React.useState<BreadcrumbItem[]>([]);
  
  const updateBreadcrumbs = React.useCallback((newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  }, []);
  
  const addBreadcrumb = React.useCallback((item: BreadcrumbItem) => {
    setItems(prev => [...prev, item]);
  }, []);
  
  const removeBreadcrumb = React.useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const clearBreadcrumbs = React.useCallback(() => {
    setItems([]);
  }, []);
  
  return {
    items,
    updateBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    clearBreadcrumbs,
  };
}