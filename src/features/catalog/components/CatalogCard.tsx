import React from 'react';
import { ShoppingCart, Package, Building2 } from 'lucide-react';
import type { CatalogProduct } from '../types';

interface CatalogCardProps {
    product: CatalogProduct;
    cartQuantity: number;
    onAddToCart: () => void;
    onUpdateQuantity: (delta: number) => void;
}

export const CatalogCard: React.FC<CatalogCardProps> = ({
    product,
    cartQuantity,
    onAddToCart,
    onUpdateQuantity,
}) => {
    return (
        <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col">
            {/* Image / Gradient Header */}
            <div className="relative h-36 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 flex items-center justify-center">
                <Package className="w-12 h-12 text-indigo-300 group-hover:text-indigo-400 transition-colors" />
                {product.category && (
                    <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-xs font-medium text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                        {product.category}
                    </span>
                )}
                <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 px-2 py-0.5 rounded-full shadow-sm">
                    {product.catalogCode}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-indigo-700 transition-colors">
                    {product.itemName}
                </h3>
                {product.make && product.model && (
                    <p className="text-xs text-gray-500 mb-2">
                        {product.make} · {product.model}
                    </p>
                )}
                {product.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                        {product.description}
                    </p>
                )}

                {/* Price + Vendor */}
                <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-gray-900">
                                ₹{product.unitPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-gray-400">/{product.uom}</span>
                        </div>
                        {product.minOrderQty > 1 && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                Min: {product.minOrderQty}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                        <Building2 size={12} className="mr-1 text-gray-400" />
                        <span className="truncate">{product.vendorName}</span>
                    </div>

                    {product.leadTimeDays && (
                        <p className="text-xs text-gray-400">
                            Lead time: {product.leadTimeDays} days
                        </p>
                    )}
                </div>
            </div>

            {/* Footer — Add to Cart */}
            <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                {cartQuantity > 0 ? (
                    <div className="flex items-center justify-between bg-indigo-50 rounded-lg px-3 py-2">
                        <button
                            onClick={() => onUpdateQuantity(-1)}
                            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-bold"
                        >
                            −
                        </button>
                        <span className="font-semibold text-indigo-700 text-sm">
                            {cartQuantity} in cart
                        </span>
                        <button
                            onClick={() => onUpdateQuantity(1)}
                            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-green-50 hover:text-green-600 transition-colors text-sm font-bold"
                        >
                            +
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onAddToCart}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <ShoppingCart size={14} />
                        Add to Cart
                    </button>
                )}
            </div>
        </div>
    );
};
