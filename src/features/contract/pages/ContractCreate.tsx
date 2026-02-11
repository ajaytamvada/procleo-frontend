import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Toaster, toast } from 'react-hot-toast';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    FileText,
    Save,
    Search,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';
import { useCreateContract } from '../hooks/useContract';
import { useApprovedPRsForRFPCreation } from '@/features/rfp/hooks/useRFPFromPR';
import { useVendors } from '@/features/master/hooks/useVendorAPI';
import type { ContractDto } from '../types';

type ContractFormData = {
    description: string;
    vendorId: number;
    startDate: string;
    endDate: string;
    totalValue: number;
    paymentTerms: string;
    contractNumber?: string;
    prId?: number;
};

export const ContractCreate = () => {
    const navigate = useNavigate();
    const createMutation = useCreateContract();

    // Phase: 'select-pr' or 'create-form'
    const [phase, setPhase] = useState<'select-pr' | 'create-form'>('select-pr');
    const [selectedPR, setSelectedPR] = useState<any>(null);
    const [searchWord, setSearchWord] = useState('');

    // Data Fetching
    const { data: approvedPRs = [], isLoading: loadingPRs } = useApprovedPRsForRFPCreation(searchWord);
    const { data: vendors = [], isLoading: loadingVendors } = useVendors();

    // Filter for Purchase Agreement PRs
    const contractPRs = useMemo(() => {
        return approvedPRs.filter(pr => pr.purchaseType === 'PURCHASE_AGREEMENT');
    }, [approvedPRs]);

    // Form Setup
    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ContractFormData>({
        defaultValues: {
            totalValue: 0,
        },
    });

    // Handle PR Selection
    const handleSelectPR = (pr: any) => {
        setSelectedPR(pr);
        setPhase('create-form');

        // Pre-fill form data
        setValue('description', pr.remarks || `Contract for PR: ${pr.requestNumber}`);
        setValue('totalValue', pr.grandTotal);
        setValue('prId', pr.prId);

        // Attempt to match vendor if PR has one (though PRs usually don't at this stage)
        // If PR had a suggested vendor, we'd map it here.

        // Set default dates
        const today = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);

        setValue('startDate', today.toISOString().split('T')[0]);
        setValue('endDate', nextYear.toISOString().split('T')[0]);
    };

    const onSubmit = async (data: ContractFormData) => {
        try {
            // Find selected vendor for additional details if needed
            const validVendor = vendors.find(v => v.id === Number(data.vendorId));
            if (!validVendor) {
                toast.error("Please select a valid vendor");
                return;
            }

            const payload: Partial<ContractDto> = {
                ...data,
                vendorId: Number(data.vendorId),
                vendorName: validVendor.name,
                vendorCode: validVendor.code,
                status: 'Draft',
                vendorAcceptanceStatus: 'Pending',
                prId: selectedPR?.prId
                // contractNumber is handled by backend if empty
            };

            await createMutation.mutateAsync(payload as ContractDto);
            toast.success('Contract created successfully');
            navigate('/contracts/list');
        } catch (error) {
            console.error('Failed to create contract:', error);
            toast.error('Failed to create contract');
        }
    };

    // Vendor Search logic for custom dropdown
    const [vendorSearch, setVendorSearch] = useState('');
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const filteredVendors = useMemo(() => {
        if (!vendorSearch) return vendors;
        return vendors.filter(v =>
            v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
            v.code?.toLowerCase().includes(vendorSearch.toLowerCase())
        );
    }, [vendors, vendorSearch]);

    const selectedVendorId = watch('vendorId');
    const selectedVendorName = useMemo(() => {
        return vendors.find(v => v.id === Number(selectedVendorId))?.name || '';
    }, [vendors, selectedVendorId]);

    return (
        <div className='min-h-screen bg-[#f8f9fc] p-6'>
            <Toaster position="top-right" />

            {/* Header */}
            <div className='flex items-center gap-3 mb-6'>
                <button
                    onClick={() => phase === 'create-form' ? setPhase('select-pr') : navigate('/contracts')}
                    className='p-2 hover:bg-white rounded-lg transition-colors text-gray-500'
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>
                        {phase === 'select-pr' ? 'Select Purchase Request' : 'Create New Contract'}
                    </h1>
                    <p className='text-sm text-gray-500'>
                        {phase === 'select-pr'
                            ? 'Purchase Agreement PRs now go through RFP for vendor selection'
                            : 'Enter contract details and assign a vendor'
                        }
                    </p>

                </div>
            </div>

            {phase === 'select-pr' ? (
                <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                    {/* Workflow Info Banner */}
                    <div className='p-4 bg-blue-50 border-b border-blue-100'>
                        <div className='flex items-start gap-3'>
                            <FileText className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                            <div className='text-sm'>
                                <p className='font-medium text-blue-900'>New Contract Workflow</p>
                                <p className='text-blue-700 mt-1'>
                                    Purchase Agreement PRs now use the RFP process for vendor selection.
                                    Click "Create RFP for Contract" to start the bidding process.
                                    After RFP approval, use "Create Contract" from the Approved RFPs page.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* PR Selection Table */}
                    <div className='p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center'>
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search PRs..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                value={searchWord}
                                onChange={(e) => setSearchWord(e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-gray-500">
                            Showing {contractPRs.length} eligible PRs
                        </div>
                    </div>

                    <div className='overflow-x-auto'>

                        <table className='w-full text-sm text-left'>
                            <thead className='bg-gray-50 text-gray-600 font-medium border-b border-gray-200'>
                                <tr>
                                    <th className='px-6 py-4'>Request No</th>
                                    <th className='px-6 py-4'>Date</th>
                                    <th className='px-6 py-4'>Requested By</th>
                                    <th className='px-6 py-4'>Department</th>
                                    <th className='px-6 py-4'>Total Value</th>
                                    <th className='px-6 py-4 text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {loadingPRs ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading requests...</td></tr>
                                ) : contractPRs.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">No approved Purchase Agreements found.</td></tr>
                                ) : (
                                    contractPRs.map((pr) => (
                                        <tr key={pr.prId} className='hover:bg-gray-50 transition-colors'>
                                            <td className='px-6 py-4 font-medium text-violet-600'>{pr.requestNumber}</td>
                                            <td className='px-6 py-4 text-gray-600'>{new Date(pr.requestDate).toLocaleDateString()}</td>
                                            <td className='px-6 py-4 text-gray-600'>{pr.requestedByName || pr.requestedBy}</td>
                                            <td className='px-6 py-4 text-gray-600'>{pr.department}</td>
                                            <td className='px-6 py-4 font-medium text-gray-900'>
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(pr.grandTotal || 0))}
                                            </td>
                                            <td className='px-6 py-4 text-center'>
                                                <button
                                                    onClick={() => navigate('/rfp/create')}
                                                    className='px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-colors'
                                                >
                                                    Create RFP for Contract
                                                </button>
                                            </td>
                                        </tr>
                                    ))

                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className='max-w-4xl mx-auto'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        {/* Contract Details Card */}
                        <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                            <div className='px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center'>
                                <h3 className='font-semibold text-gray-900'>Contract Details</h3>
                                <div className='text-sm text-gray-500'>
                                    Source PR: <span className='font-medium text-violet-600'>{selectedPR?.requestNumber}</span>
                                </div>
                            </div>

                            <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
                                {/* Contract Number */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Contract Number</label>
                                    <input
                                        type="text"
                                        disabled
                                        placeholder="Auto-generated"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm"
                                    />
                                    <p className='mt-1 text-xs text-gray-400'>Generated automatically upon creation</p>
                                </div>

                                {/* Vendor Searchable Dropdown */}
                                <div className="relative">
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Vendor <span className='text-red-500'>*</span>
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${errors.vendorId ? 'border-red-300' : 'border-gray-200'}`}
                                            placeholder={selectedVendorName || "Search vendor..."}
                                            value={searchWord && !selectedVendorName ? searchWord : (selectedVendorName || vendorSearch)} // Display Logic
                                            // actually let's make it simpler: toggle dropdown
                                            onChange={(e) => {
                                                setVendorSearch(e.target.value);
                                                setShowVendorDropdown(true);
                                                if (selectedVendorId) setValue('vendorId', 0); // clear if typing
                                            }}
                                            onFocus={() => setShowVendorDropdown(true)}
                                        />
                                        {/* Overlay for display if selected */}
                                        {selectedVendorName && !showVendorDropdown && (
                                            <div
                                                className="absolute inset-0 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm flex items-center justify-between cursor-pointer"
                                                onClick={() => {
                                                    setVendorSearch('');
                                                    setShowVendorDropdown(true);
                                                }}
                                            >
                                                <span>{selectedVendorName}</span>
                                                <Search size={14} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Dropdown Menu */}
                                    {showVendorDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {loadingVendors ? (
                                                <div className="p-3 text-center text-xs text-gray-500">Loading...</div>
                                            ) : filteredVendors.length === 0 ? (
                                                <div className="p-3 text-center text-xs text-gray-500">No vendors found</div>
                                            ) : (
                                                filteredVendors.map(vendor => (
                                                    <div
                                                        key={vendor.id}
                                                        className="px-4 py-2 hover:bg-violet-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                                                        onClick={() => {
                                                            setValue('vendorId', vendor.id);
                                                            setShowVendorDropdown(false);
                                                            setVendorSearch('');
                                                        }}
                                                    >
                                                        <div className="font-medium text-gray-900">{vendor.name}</div>
                                                        <div className="text-xs text-gray-500">{vendor.code} • {vendor.cityId ? 'City ID: ' + vendor.cityId : 'No Location'}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                    {/* Click outside listener could be added here or just basic blur handling */}
                                    {/* For simplicity relying on selection to close */}
                                </div>

                                {/* Dates */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Start Date <span className='text-red-500'>*</span></label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="date"
                                            {...register('startDate', { required: 'Start date is required' })}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>End Date <span className='text-red-500'>*</span></label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="date"
                                            {...register('endDate', { required: 'End date is required' })}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>

                                {/* Values */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Total Value</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                        <input
                                            type="number"
                                            {...register('totalValue')}
                                            className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Payment Terms</label>
                                    <input
                                        type="text"
                                        {...register('paymentTerms')}
                                        placeholder="e.g. Net 30, Quarterly"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Description / Scope</label>
                                    <textarea
                                        {...register('description')}
                                        rows={4}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setPhase('select-pr')}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    {createMutation.isPending ? 'Creating...' : 'Create Contract'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ContractCreate;
