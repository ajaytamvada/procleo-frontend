import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, CheckCircle, XCircle, Clock, FileSignature, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useContracts, useApprovedRFPsForContract, useCreateContractFromRFP } from '../hooks/useContract';
import { Contract } from '../types';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export const ContractList: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'contracts' | 'rfps'>('contracts');

    const { data: contracts = [], isLoading: contractsLoading, error: contractsError } = useContracts();
    const { data: approvedRFPs = [], isLoading: rfpsLoading, error: rfpsError } = useApprovedRFPsForContract();
    const createContractMutation = useCreateContractFromRFP();

    const filteredContracts = contracts.filter((c: Contract) =>
        c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.vendorName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRFPs = approvedRFPs.filter((rfp: any) =>
        !searchTerm ||
        rfp.rfpNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfp.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfp.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'expired': return 'bg-red-100 text-red-800 border-red-200';
            case 'terminated': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getAcceptanceIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-amber-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), 'dd MMM yyyy');
        } catch {
            return dateString;
        }
    };

    const handleCreateContract = async (rfpId: number) => {
        try {
            const result = await createContractMutation.mutateAsync(rfpId);
            toast.success('Contract created successfully!');
            navigate(`/contracts/${result.id}`);
        } catch (error) {
            toast.error('Failed to create contract. Please try again.');
        }
    };

    const isLoading = contractsLoading || rfpsLoading;

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            <span className="ml-2 text-gray-600">Loading...</span>
        </div>
    );

    if (contractsError || rfpsError) return (
        <div className="p-8 text-center text-red-500">Error loading data</div>
    );

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contract Management</h1>
                    <p className="text-gray-500">Manage vendor contracts and create new contracts from approved RFPs</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('contracts')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'contracts'
                            ? 'border-violet-500 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        All Contracts ({contracts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('rfps')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'rfps'
                            ? 'border-violet-500 text-violet-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <FileSignature className="w-4 h-4 inline mr-2" />
                        Create from RFP ({approvedRFPs.length})
                    </button>
                </nav>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder={activeTab === 'contracts' ? "Search contracts..." : "Search approved RFPs..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {activeTab === 'contracts' ? (
                /* Contracts Table */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Acceptance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredContracts.map((contract) => (
                                <tr key={contract.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-violet-600">
                                        {contract.contractNumber}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 line-clamp-1">{contract.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {contract.vendorName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {contract.startDate} - {contract.endDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge className={getStatusColor(contract.status)}>
                                            {contract.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {getAcceptanceIcon(contract.vendorAcceptanceStatus)}
                                            <span className="text-sm text-gray-700">{contract.vendorAcceptanceStatus}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(contract.totalValue || 0))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredContracts.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No contracts found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Approved RFPs for Contract Creation */
                <div className="space-y-4">
                    {/* Info Banner */}
                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 flex items-start">
                        <AlertCircle className="w-5 h-5 text-violet-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-violet-800 font-medium">Create Contract from Approved RFP</h3>
                            <p className="text-violet-600 text-sm mt-1">
                                These are approved RFPs of type "Purchase Agreement" that are ready for contract creation.
                                The contract will use the selected vendor quotation from the RFP.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFP Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PR Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRFPs.map((rfp: any) => (
                                    <tr key={rfp.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-violet-600">
                                            {rfp.rfpNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {rfp.prNumber || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {rfp.requestDate ? formatDate(rfp.requestDate) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {rfp.requestedBy}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {rfp.department}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(rfp.totalAmount || 0))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Button
                                                onClick={() => handleCreateContract(rfp.id)}
                                                disabled={createContractMutation.isPending}
                                                className="bg-violet-600 hover:bg-violet-700 text-white"
                                                size="sm"
                                            >
                                                {createContractMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <FileSignature className="w-4 h-4 mr-2" />
                                                )}
                                                Create Contract
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRFPs.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No approved RFPs available for contract creation
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
