import React, { useState } from 'react';
import { Search, Filter, ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCatalogSearch, useCatalogCategories } from '../hooks/useCatalog';
import { CatalogCard } from '../components/CatalogCard';
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
            updateCart({ ...cart, [product.id!]: { ...existing, quantity: existing.quantity + 1 } });
        } else {
            updateCart({ ...cart, [product.id!]: { ...product, quantity: product.minOrderQty || 1 } });
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
    const cartTotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    return { cart, cartItems, cartCount, cartTotal, addToCart, updateQuantity, clearCart };
};

const CatalogBrowsePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [page, setPage] = useState(0);

    const { data: catalogPage, isLoading } = useCatalogSearch({
        query: searchQuery || undefined,
        category: selectedCategory || undefined,
        page,
        size: 24,
    });

    const { data: categories = [] } = useCatalogCategories();
    const { cart, cartCount, cartTotal, addToCart, updateQuantity } = useCatalogCart();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-white border-b sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Browse Catalog</h1>
                            <p className="text-xs text-gray-500">
                                {catalogPage?.totalElements || 0} items available
                            </p>
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={() => navigate('/catalog/cart')}
                            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm ${cartCount > 0
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            <ShoppingCart size={18} />
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <>
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                                        {cartCount} items · ₹{cartTotal.toLocaleString('en-IN')}
                                    </span>
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name, make, model, vendor..."
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={selectedCategory}
                            onChange={e => { setSelectedCategory(e.target.value); setPage(0); }}
                            className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none shadow-sm min-w-[180px]"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                        <span className="ml-3 text-gray-500">Loading catalog...</span>
                    </div>
                ) : catalogPage?.content && catalogPage.content.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {catalogPage.content.map(product => (
                                <CatalogCard
                                    key={product.id}
                                    product={product}
                                    cartQuantity={cart[product.id!]?.quantity || 0}
                                    onAddToCart={() => addToCart(product)}
                                    onUpdateQuantity={delta => updateQuantity(product.id!, delta)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {catalogPage.totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-4 py-2 text-sm font-medium bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {page + 1} of {catalogPage.totalPages}
                                </span>
                                <button
                                    disabled={page >= catalogPage.totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-4 py-2 text-sm font-medium bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 mb-1">No items found</h3>
                        <p className="text-sm text-gray-400">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CatalogBrowsePage;
