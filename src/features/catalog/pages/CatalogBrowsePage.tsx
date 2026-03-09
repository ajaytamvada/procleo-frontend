import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShoppingCart,
  Package,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCatalogSearch, useCatalogCategories } from '../hooks/useCatalog';
import type { CatalogProduct, CartItem } from '../types';

// Cart persisted via module-level state (survives page re-renders within the SPA)
let globalCart: Record<number, CartItem> = {};

export const useCatalogCart = () => {
  const [cart, setCart] = useState<Record<number, CartItem>>(globalCart);

  const updateCart = (newCart: Record<number, CartItem>) => {
    globalCart = newCart;
    setCart(newCart);
  };

  const addToCart = (product: CatalogProduct) => {
    const existing = cart[product.id!];
    if (existing) {
      updateCart({
        ...cart,
        [product.id!]: { ...existing, quantity: existing.quantity + 1 },
      });
    } else {
      updateCart({
        ...cart,
        [product.id!]: { ...product, quantity: product.minOrderQty || 1 },
      });
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    const existing = cart[productId];
    if (!existing) return;
    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      const { [productId]: _, ...rest } = cart;
      updateCart(rest);
    } else {
      updateCart({ ...cart, [productId]: { ...existing, quantity: newQty } });
    }
  };

  const clearCart = () => {
    globalCart = {};
    setCart({});
  };

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );

  return {
    cart,
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    clearCart,
  };
};

interface CatalogBrowsePageProps {
  onBack?: () => void;
  onSubmit?: (catalogItems: any[], sendForApproval: boolean) => void;
  headerData?: any;
  isSubmitting?: boolean;
}

const CatalogBrowsePage: React.FC<CatalogBrowsePageProps> = ({
  onBack,
  onSubmit,
  headerData,
  isSubmitting,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState(0);
  const pageSize = 24;

  const { data: catalogPage, isLoading } = useCatalogSearch({
    query: searchQuery || undefined,
    category: selectedCategory || undefined,
    page,
    size: pageSize,
  });

  const { data: categories = [] } = useCatalogCategories();
  const { cart, cartCount, cartTotal, addToCart, updateQuantity } =
    useCatalogCart();

  const getPageNumbers = () => {
    const totalPages = catalogPage?.totalPages || 0;
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push('...');
      for (
        let i = Math.max(1, page - 1);
        i <= Math.min(totalPages - 2, page + 1);
        i++
      ) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (page < totalPages - 3) pages.push('...');
      if (!pages.includes(totalPages - 1)) pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      {/* Page Header */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                Browse Catalog
              </h1>
              <p className='text-xs text-gray-500'>
                {catalogPage?.totalElements || 0} items available
              </p>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => navigate('/catalog/cart')}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm ${cartCount > 0
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
            >
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cartCount > 0 && (
                <>
                  <span className='bg-white/20 px-2 py-0.5 rounded text-xs'>
                    {cartCount} items · ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                  <span className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold'>
                    {cartCount}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-1 py-4'>
        <div className='bg-white rounded-lg border border-gray-200 p-4'>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search by name, make, model, vendor...'
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
              />
            </div>
            <div className='relative'>
              <Filter className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
              <select
                value={selectedCategory}
                onChange={e => {
                  setSelectedCategory(e.target.value);
                  setPage(0);
                }}
                className='pl-10 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 appearance-none min-w-[180px] bg-white'
              >
                <option value=''>All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-1 pb-8'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
            <p className='text-sm text-gray-500 mt-3'>Loading catalog...</p>
          </div>
        ) : catalogPage?.content && catalogPage.content.length > 0 ? (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {catalogPage.content.map(product => {
                const cartItem = cart[product.id!];
                return (
                  <div
                    key={product.id}
                    className='bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all'
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <div className='flex-1 min-w-0'>
                        <h4
                          className='font-semibold text-gray-900 text-sm line-clamp-1'
                          title={product.model}
                        >
                          {product.model}
                        </h4>
                        <p className='text-xs text-gray-500 mt-0.5'>
                          {product.make}
                        </p>
                      </div>
                      <span className='bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold ml-2 flex-shrink-0'>
                        ₹{product.unitPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p
                      className='text-xs text-gray-600 mb-3 line-clamp-2 min-h-[32px]'
                      title={product.description}
                    >
                      {product.description || product.itemName}
                    </p>

                    <div className='flex items-center justify-between text-xs text-gray-500 mb-3'>
                      <span className='truncate' title={product.vendorName}>
                        {product.vendorName?.substring(0, 20)}
                        {(product.vendorName?.length || 0) > 20 && '...'}
                      </span>
                      <span className='text-gray-400'>
                        {product.uom || 'Each'}
                      </span>
                    </div>

                    <div className='pt-3 border-t border-gray-100'>
                      {cartItem ? (
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2 bg-violet-50 rounded-lg px-2 py-1'>
                            <button
                              onClick={() => updateQuantity(product.id!, -1)}
                              className='p-1.5 text-violet-600 hover:bg-violet-100 rounded transition-colors'
                            >
                              <Minus size={14} />
                            </button>
                            <span className='text-sm font-semibold text-violet-700 min-w-[24px] text-center'>
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id!, 1)}
                              className='p-1.5 text-violet-600 hover:bg-violet-100 rounded transition-colors'
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className='text-sm font-semibold text-gray-900'>
                            ₹
                            {(
                              cartItem.quantity * cartItem.unitPrice
                            ).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          className='w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-violet-600 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors'
                        >
                          <Plus size={14} />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {catalogPage.totalPages > 1 && (
              <div className='mt-8 flex items-center justify-center gap-1'>
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                  className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                  <ChevronLeft size={16} />
                </button>
                {getPageNumbers().map((pageNum, idx) => (
                  <React.Fragment key={idx}>
                    {pageNum === '...' ? (
                      <span className='px-3 py-2 text-sm text-gray-400'>
                        ...
                      </span>
                    ) : (
                      <button
                        onClick={() => setPage(pageNum as number)}
                        className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${page === pageNum
                          ? 'bg-violet-600 text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {(pageNum as number) + 1}
                      </button>
                    )}
                  </React.Fragment>
                ))}
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= catalogPage.totalPages - 1}
                  className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
              <Package className='w-8 h-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-600 mb-1'>
              No items found
            </h3>
            <p className='text-sm text-gray-400'>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogBrowsePage;
