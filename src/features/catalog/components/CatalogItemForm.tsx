import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { CatalogProduct } from '../types';

interface CatalogItemFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Partial<CatalogProduct>) => void;
    initialData?: CatalogProduct | null;
    isSubmitting?: boolean;
}

export const CatalogItemForm: React.FC<CatalogItemFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isSubmitting = false,
}) => {
    const [formData, setFormData] = useState<Partial<CatalogProduct>>({
        itemName: '',
        description: '',
        category: '',
        subCategory: '',
        make: '',
        model: '',
        uom: 'Each',
        vendorId: 0,
        vendorName: '',
        unitPrice: 0,
        currency: 'INR',
        minOrderQty: 1,
        leadTimeDays: undefined,
        isActive: true,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData });
        } else {
            setFormData({
                itemName: '',
                description: '',
                category: '',
                subCategory: '',
                make: '',
                model: '',
                uom: 'Each',
                vendorId: 0,
                vendorName: '',
                unitPrice: 0,
                currency: 'INR',
                minOrderQty: 1,
                leadTimeDays: undefined,
                isActive: true,
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {initialData ? 'Edit Catalog Item' : 'Add Catalog Item'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Item Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.itemName || ''}
                            onChange={e => handleChange('itemName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="e.g. 3-Axis CNC Milling Machine"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows={2}
                            value={formData.description || ''}
                            onChange={e => handleChange('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>

                    {/* Category + Sub Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                                type="text"
                                value={formData.category || ''}
                                onChange={e => handleChange('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="e.g. Machinery"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                            <input
                                type="text"
                                value={formData.subCategory || ''}
                                onChange={e => handleChange('subCategory', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="e.g. CNC Machines"
                            />
                        </div>
                    </div>

                    {/* Make + Model */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                            <input
                                type="text"
                                value={formData.make || ''}
                                onChange={e => handleChange('make', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="e.g. Haas"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                            <input
                                type="text"
                                value={formData.model || ''}
                                onChange={e => handleChange('model', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder="e.g. VF-2SS"
                            />
                        </div>
                    </div>

                    {/* Vendor ID + Vendor Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor ID *</label>
                            <input
                                type="number"
                                required
                                value={formData.vendorId || ''}
                                onChange={e => handleChange('vendorId', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                            <input
                                type="text"
                                value={formData.vendorName || ''}
                                onChange={e => handleChange('vendorName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Price + UOM + Currency */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                value={formData.unitPrice || ''}
                                onChange={e => handleChange('unitPrice', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                            <input
                                type="text"
                                value={formData.uom || 'Each'}
                                onChange={e => handleChange('uom', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                            <input
                                type="text"
                                value={formData.currency || 'INR'}
                                onChange={e => handleChange('currency', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Min Order Qty + Lead Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Qty</label>
                            <input
                                type="number"
                                min={1}
                                value={formData.minOrderQty || 1}
                                onChange={e => handleChange('minOrderQty', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (days)</label>
                            <input
                                type="number"
                                min={0}
                                value={formData.leadTimeDays || ''}
                                onChange={e => handleChange('leadTimeDays', e.target.value ? Number(e.target.value) : 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
