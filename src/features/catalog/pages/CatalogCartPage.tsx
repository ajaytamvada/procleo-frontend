import React, { useState } from 'react';
import { ArrowLeft, Trash2, ShoppingCart, Minus, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCatalogCart } from './CatalogBrowsePage';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import AuthService from '@/services/auth';

const CatalogCartPage: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, cartCount, cartTotal, updateQuantity, clearCart } = useCatalogCart();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreatePR = async () => {
        if (cartItems.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        // Check if all items from same vendor
        const vendorIds = [...new Set(cartItems.map(i => i.vendorId))];
        if (vendorIds.length > 1) {
            toast.error('Catalog PR requires all items from the same vendor. Please remove items from different vendors.');
            return;
        }

        setIsCreating(true);
        try {
            const user = AuthService.getStoredUser();
            const prPayload = {
                requestDate: new Date().toISOString().split('T')[0],
                requestedBy: user?.name || user?.username || 'System',
                departmentId: user?.departmentId || 1,
                locationId: user?.locationId || 1,
                purchaseType: 'CATALOG',
                projectCode: '',
                projectName: 'Catalog Purchase',
                budgetHeadId: 0,
                remarks: `Auto-created from Catalog Cart (${cartItems.length} items)`,
                items: cartItems.map(item => ({
                    itemId: 0,
                    categoryId: 0,
                    categoryName: item.category || '',
                    subCategoryId: 0,
                    subCategoryName: item.subCategory || '',
                    modelName: item.model || item.itemName,
                    make: item.make || '',
                    uomId: 0,
                    uomName: item.uom || 'Each',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    description: item.description || item.itemName,
                    vendorId: item.vendorId,
                    catalogItemId: item.id,
                    contractId: item.contractId || null,
                })),
            };

            const { data } = await apiClient.post('/purchase-requests', prPayload);
            clearCart();
            toast.success(`Purchase Request ${data.requestNumber || ''} created successfully!`);
            navigate('/purchase-requisition/manage');
        } catch (err: any) {
            console.error('Failed to create PR:', err);
            toast.error(err?.response?.data?.message || 'Failed to create Purchase Request');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/catalog/browse')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={18} className="text-gray-500" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
                                <p className="text-xs text-gray-500">{cartCount} items</p>
                            </div>
                        </div>
                        {cartItems.length > 0 && (
                            <button
                                onClick={() => { if (confirm('Clear all items from cart?')) clearCart(); }}
                                className="text-sm text-red-500 hover:text-red-700 font-medium"
                            >
                                Clear Cart
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {cartItems.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 mb-1">Your cart is empty</h3>
                        <p className="text-sm text-gray-400 mb-4">Browse the catalog to add items.</p>
                        <button
                            onClick={() => navigate('/catalog/browse')}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Browse Catalog
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-3">
                            {cartItems.map(item => (
                                <div
                                    key={item.id}
                                    className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                                >
                                    {/* Item Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm truncate">{item.itemName}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {item.catalogCode} · {item.make} {item.model && `/ ${item.model}`}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">Vendor: {item.vendorName}</p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                                        <button
                                            onClick={() => updateQuantity(item.id!, -1)}
                                            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id!, 1)}
                                            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-green-50 hover:text-green-600 transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right shrink-0 w-28">
                                        <p className="font-bold text-gray-900 text-sm">
                                            ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-xs text-gray-400">₹{item.unitPrice.toLocaleString('en-IN')} × {item.quantity}</p>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => updateQuantity(item.id!, -item.quantity)}
                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-20">
                                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Items ({cartCount})</span>
                                        <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-3">
                                        <div className="flex justify-between font-bold text-gray-900 text-base">
                                            <span>Total</span>
                                            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Vendor check */}
                                {[...new Set(cartItems.map(i => i.vendorId))].length > 1 && (
                                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                                        ⚠️ Items from multiple vendors. Catalog PRs require single vendor.
                                    </div>
                                )}

                                <button
                                    onClick={handleCreatePR}
                                    disabled={isCreating || [...new Set(cartItems.map(i => i.vendorId))].length > 1}
                                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    {isCreating ? (
                                        'Creating PR...'
                                    ) : (
                                        <>
                                            Create Purchase Request
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => navigate('/catalog/browse')}
                                    className="w-full mt-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CatalogCartPage;
