import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, ShoppingCart, Info, Plus, Minus } from 'lucide-react';
import { useCatalogSearch } from '../hooks/useCatalog';
import { PurchaseRequestItem } from '../types';
import { CatalogItemDto } from '../api/catalogApi';

interface CatalogBrowserProps {
    isOpen: boolean;
    onClose: () => void;
    onAddItems: (items: PurchaseRequestItem[]) => void;
}

interface CartItem extends CatalogItemDto {
    quantity: number;
}

export const CatalogBrowser: React.FC<CatalogBrowserProps> = ({
    isOpen,
    onClose,
    onAddItems,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<Record<number, CartItem>>({});

    const { data: catalogPage, isLoading } = useCatalogSearch({
        query: searchQuery,
        page: 0,
        size: 50, // Fetch more for browser feel
    });

    const handleAddToCart = (item: CatalogItemDto) => {
        setCart(prev => {
            const existing = prev[item.id];
            if (existing) {
                return { ...prev, [item.id]: { ...existing, quantity: existing.quantity + 1 } };
            }
            return { ...prev, [item.id]: { ...item, quantity: 1 } };
        });
    };

    const handleUpdateQuantity = (itemId: number, delta: number) => {
        setCart(prev => {
            const existing = prev[itemId];
            if (!existing) return prev;

            const newQuantity = existing.quantity + delta;
            if (newQuantity <= 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: { ...existing, quantity: newQuantity } };
        });
    };

    const handleCheckout = () => {
        const items: PurchaseRequestItem[] = Object.values(cart).map(cartItem => ({
            itemId: cartItem.itemId,
            modelName: cartItem.modelName,
            make: cartItem.make,
            categoryId: cartItem.categoryId,
            categoryName: cartItem.categoryName,
            displayName: cartItem.itemName,
            subCategoryId: cartItem.subCategoryId || 0,
            subCategoryName: cartItem.subCategoryName || '',
            uomId: cartItem.uomId || 0,
            uomName: cartItem.uomName || 'Each',
            quantity: cartItem.quantity,
            unitPrice: cartItem.price,
            description: cartItem.itemDescription,
            vendorId: cartItem.vendorId, // Important for PO
            catalogItemId: cartItem.id,
            contractId: cartItem.contractId,
            // Default empty for others
            id: undefined
        }));

        onAddItems(items);
        onClose();
        setCart({});
    };

    const cartTotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle>Browse Catalog</DialogTitle>
                        <div className="flex items-center gap-2">
                            {cartItemCount > 0 && (
                                <Button
                                    size="sm"
                                    onClick={handleCheckout}
                                    className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2"
                                >
                                    <ShoppingCart size={16} />
                                    <span>Add {cartItemCount} Items (₹{cartTotal.toLocaleString('en-IN')})</span>
                                </Button>
                            )}
                            {!cartItemCount && (
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md text-gray-500 text-sm font-medium">
                                    <ShoppingCart size={16} />
                                    <span>Empty Cart</span>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-4 border-b bg-gray-50 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search by item name, model, make or vendor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {isLoading ? (
                        <div className="flex justify-center p-8">Loading...</div>
                    ) : catalogPage?.content && catalogPage.content.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {catalogPage.content.map(item => {
                                const cartItem = cart[item.id];
                                return (
                                    <div key={item.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 line-clamp-1" title={item.modelName}>{item.modelName}</h4>
                                                <p className="text-sm text-gray-500">{item.make}</p>
                                            </div>
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                ₹{item.price}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={item.itemDescription}>
                                            {item.itemDescription || item.itemName}
                                        </p>
                                        <div className="mt-auto pt-3 border-t flex items-center justify-between">
                                            <div className="text-xs text-gray-500">
                                                Vendor: <span className="font-medium text-gray-700">{item.vendorName.substring(0, 15)}...</span>
                                            </div>

                                            {cartItem ? (
                                                <div className="flex items-center gap-3 bg-gray-100 rounded-md px-2 py-1">
                                                    <button onClick={() => handleUpdateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm">
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="text-sm font-semibold w-4 text-center">{cartItem.quantity}</span>
                                                    <button onClick={() => handleUpdateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm">
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={() => handleAddToCart(item)} className="h-8 text-xs">
                                                    Add to Cart
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No items found matching your search.
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-gray-50 shrink-0">
                    <Button variant="outline" onClick={onClose} className="mr-2">Cancel</Button>
                    <Button onClick={handleCheckout} disabled={cartItemCount === 0} className="bg-violet-600 hover:bg-violet-700 min-w-[120px]">
                        OK (Add {cartItemCount} Items)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
