import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContract } from '../hooks/useContract';
import { ArrowLeft, FileText, Calendar, DollarSign, Building, CheckCircle, XCircle, Clock, Shield, Scale, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const ContractDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: contract, isLoading, error } = useContract(Number(id));

    if (isLoading) return <div className="p-8 text-center">Loading contract details...</div>;
    if (error || !contract) return <div className="p-8 text-center text-red-500">Error loading contract details</div>;

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'expired': return 'bg-red-100 text-red-800 border-red-200';
            case 'terminated': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate('/contracts/list')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{contract.contractNumber}</h1>
                    <p className="text-gray-500">Contract Details</p>
                </div>
                <div className="ml-auto flex gap-2">
                    {contract.vendorAcceptanceStatus === 'Accepted' ? (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate(`/purchase-orders/create?contractId=${contract.id}`)}
                        >
                            Raise PO
                        </Button>
                    ) : (
                        <span className="text-sm text-amber-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {contract.vendorAcceptanceStatus === 'Pending'
                                ? 'Awaiting vendor acknowledgement'
                                : 'Vendor rejected this contract'}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            Contract Information
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Subject / Description</label>
                                <p className="mt-1 text-gray-900">{contract.description}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <div className="mt-1">
                                    <Badge className={getStatusColor(contract.status)}>
                                        {contract.status}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Start Date</label>
                                <p className="mt-1 text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {contract.startDate}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">End Date</label>
                                <p className="mt-1 text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {contract.endDate}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-gray-400" />
                            Financials
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Total Value</label>
                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(contract.totalValue || 0))}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Payment Terms</label>
                                <p className="mt-1 text-gray-900">{contract.paymentTerms || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-gray-400" />
                        Key Terms & Legal
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Contract Type</label>
                            <p className="mt-1 text-gray-900">{contract.contractType || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Signed Date</label>
                            <p className="mt-1 text-gray-900 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {contract.signedDate || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Renewal Date</label>
                            <p className="mt-1 text-gray-900 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {contract.renewalDate || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Termination Notice</label>
                            <p className="mt-1 text-gray-900">{contract.terminationNoticeDays ? `${contract.terminationNoticeDays} Days` : 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Governing Law</label>
                            <p className="mt-1 text-gray-900 flex items-center gap-2">
                                <Gavel className="w-4 h-4 text-gray-400" />
                                {contract.governingLaw || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Jurisdiction</label>
                            <p className="mt-1 text-gray-900 flex items-center gap-2">
                                <Scale className="w-4 h-4 text-gray-400" />
                                {contract.jurisdiction || 'N/A'}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-500">Liability Limit</label>
                            <p className="mt-1 text-gray-900">{contract.liabilityLimit || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5 text-gray-400" />
                        Vendor Details
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Vendor Name</label>
                            <p className="mt-1 text-gray-900 font-medium">{contract.vendorName}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Vendor Code</label>
                            <p className="mt-1 text-gray-900">{contract.vendorCode}</p>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <label className="text-sm font-medium text-gray-500">Acceptance Status</label>
                            <div className="mt-2 flex items-center gap-2">
                                {contract.vendorAcceptanceStatus === 'Accepted' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                {contract.vendorAcceptanceStatus === 'Rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                                {contract.vendorAcceptanceStatus === 'Pending' && <Clock className="w-5 h-5 text-amber-500" />}
                                <span className="text-sm font-medium text-gray-900">{contract.vendorAcceptanceStatus}</span>
                            </div>
                            {contract.vendorAcceptanceDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Last updated: {new Date(contract.vendorAcceptanceDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
