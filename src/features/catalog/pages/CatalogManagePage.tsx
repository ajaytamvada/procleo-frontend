import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCatalogSearch, useCreateCatalogItem, useUpdateCatalogItem, useDeleteCatalogItem, useToggleCatalogItem } from '../hooks/useCatalog';
import { CatalogItemForm } from '../components/CatalogItemForm';
import type { CatalogProduct } from '../types';

const CatalogManagePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CatalogProduct | null>(null);

    const { data: catalogPage, isLoading } = useCatalogSearch({
        query: searchQuery || undefined,
        page,
        size: 15,
    });

    const createMutation = useCreateCatalogItem();
    const updateMutation = useUpdateCatalogItem();
    const deleteMutation = useDeleteCatalogItem();
    const toggleMutation = useToggleCatalogItem();

    const handleCreate = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: CatalogProduct) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleSubmit = async (data: Partial<CatalogProduct>) => {
        try {
            if (editingItem?.id) {
                await updateMutation.mutateAsync({ id: editingItem.id, product: data });
                toast.success('Catalog item updated');
            } else {
                await createMutation.mutateAsync(data);
                toast.success('Catalog item created');
            }
            setIsFormOpen(false);
            setEditingItem(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Item deleted');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to delete');
        }
    };

    const handleToggle = async (id: number) => {
        try {
            const result = await toggleMutation.mutateAsync(id);
            toast.success(`Item ${result.isActive ? 'activated' : 'deactivated'}`);
        } catch (err: any) {
            toast.error('Failed to toggle status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Manage Catalog</h1>
                            <p className="text-xs text-gray-500">{catalogPage?.totalElements || 0} items</p>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            Add Item
                        </button>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search catalog items..."
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Item Name</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Make / Model</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Vendor</th>
                                    <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                                    <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                                    <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td>
                                    </tr>
                                ) : catalogPage?.content && catalogPage.content.length > 0 ? (
                                    catalogPage.content.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs text-indigo-600">{item.catalogCode}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{item.itemName}</td>
                                            <td className="px-4 py-3 text-gray-500">
                                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                                    {item.category || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {item.make} {item.model && `/ ${item.model}`}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs max-w-[150px] truncate">{item.vendorName}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                ₹{item.unitPrice.toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => handleToggle(item.id!)} title="Toggle active">
                                                    {item.isActive ? (
                                                        <ToggleRight size={22} className="text-green-500 hover:text-green-600 mx-auto" />
                                                    ) : (
                                                        <ToggleLeft size={22} className="text-gray-300 hover:text-gray-400 mx-auto" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id!)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12 text-gray-400">
                                            No catalog items found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {catalogPage && catalogPage.totalPages > 1 && (
                        <div className="border-t px-4 py-3 flex items-center justify-between bg-gray-50">
                            <span className="text-xs text-gray-500">
                                Showing {page * catalogPage.size + 1}–{Math.min((page + 1) * catalogPage.size, catalogPage.totalElements)} of {catalogPage.totalElements}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-3 py-1.5 text-xs font-medium bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={page >= catalogPage.totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-3 py-1.5 text-xs font-medium bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Dialog */}
            <CatalogItemForm
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
                onSubmit={handleSubmit}
                initialData={editingItem}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
};

export default CatalogManagePage;
