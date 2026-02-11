import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, CheckCircle, XCircle, Clock, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useVendorContracts, useAcknowledgeContract, VendorContract } from '../hooks/useVendorPortal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';

const VendorContractList: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const { data: contracts = [], isLoading } = useVendorContracts();
    const acknowledgeMutation = useAcknowledgeContract();

    const [selectedContract, setSelectedContract] = useState<VendorContract | null>(null);
    const [actionType, setActionType] = useState<'Accept' | 'Reject' | null>(null);
    const [remarks, setRemarks] = useState('');

    const filteredContracts = contracts.filter((c) =>
        c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAction = (contract: VendorContract, type: 'Accept' | 'Reject') => {
        setSelectedContract(contract);
        setActionType(type);
        setRemarks('');
    };

    const confirmAction = () => {
        if (!selectedContract || !actionType) return;

        // Status to send: 'Accepted' or 'Rejected'
        const status = actionType === 'Accept' ? 'Accepted' : 'Rejected';

        acknowledgeMutation.mutate({
            id: selectedContract.id,
            status: status,
            remarks: remarks
        }, {
            onSuccess: () => {
                setSelectedContract(null);
                setActionType(null);
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'expired': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getAcceptanceStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'accepted':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
            default:
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending Action</Badge>;
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading contracts...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Contracts</h1>
                    <p className="text-gray-500">View and acknowledge your contracts</p>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search contracts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Response</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredContracts.map((contract) => (
                            <tr key={contract.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-violet-600">
                                    {contract.contractNumber}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                    <div className="line-clamp-1" title={contract.description}>{contract.description}</div>
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
                                    {getAcceptanceStatusBadge(contract.vendorAcceptanceStatus)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/vendor/contracts/${contract.id}`)}>
                                            <FileText className="w-4 h-4 mr-1" /> View
                                        </Button>
                                        {contract.vendorAcceptanceStatus?.toLowerCase() === 'pending' && (
                                            <>
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleAction(contract, 'Accept')}>
                                                    <Check className="w-4 h-4 mr-1" /> Accept
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction(contract, 'Reject')}>
                                                    <X className="w-4 h-4 mr-1" /> Reject
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredContracts.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No contracts found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContract(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionType} Contract</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p>Are you sure you want to <strong>{actionType?.toLowerCase()}</strong> contract <strong>{selectedContract?.contractNumber}</strong>?</p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Remarks (Optional)</label>
                            <Input
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Enter any remarks..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedContract(null)}>Cancel</Button>
                        <Button
                            onClick={confirmAction}
                            className={actionType === 'Accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            disabled={acknowledgeMutation.isPending}
                        >
                            {acknowledgeMutation.isPending ? 'Processing...' : `Confirm ${actionType}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VendorContractList;
