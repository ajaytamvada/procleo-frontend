import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVendorContracts, useAcknowledgeContract } from '../hooks/useVendorPortal';
import { ArrowLeft, FileText, Calendar, DollarSign, Building, CheckCircle, XCircle, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';

const VendorContractDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // We can reuse the list hook and find the specific contract, 
    // or implement a specific 'getContract' hook. 
    // For now, filtering from list is easier as we don't have a specific endpoint yet in frontend hook
    // But better to use a specific hook if possible.
    // VendorPortalController.java has `getVendorContracts` which returns list.
    // It doesn't seem to have `getContractById` specifically for vendor in the *Controller* snippet I saw earlier?
    // Wait, step 2165 showed `getVendorContracts`. 
    // It did NOT show `getContract(id)` for vendor specially, but `contractService.getContractById(id)` is available in `ContractController` but that's for internal users mainly?
    // Actually `ContractController` has `@GetMapping("/{id}")`. If vendor has permission, they can use it.
    // But `VendorPortalController` is preferred.
    // I I will use `useVendorContracts` and find the item for now to avoid backend changes if possible.

    const { data: contracts = [], isLoading } = useVendorContracts();
    const contract = contracts.find(c => c.id === Number(id));

    const acknowledgeMutation = useAcknowledgeContract();
    const [actionType, setActionType] = useState<'Accept' | 'Reject' | null>(null);
    const [remarks, setRemarks] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (isLoading) return <div className="p-8 text-center">Loading contract details...</div>;
    if (!contract) return <div className="p-8 text-center text-red-500">Contract not found</div>;

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'expired': return 'bg-red-100 text-red-800 border-red-200';
            case 'terminated': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const handleAction = (type: 'Accept' | 'Reject') => {
        setActionType(type);
        setRemarks('');
        setIsDialogOpen(true);
    };

    const confirmAction = () => {
        if (!actionType) return;

        const status = actionType === 'Accept' ? 'Accepted' : 'Rejected';

        acknowledgeMutation.mutate({
            id: contract.id,
            status: status,
            remarks: remarks
        }, {
            onSuccess: () => {
                setIsDialogOpen(false);
                // Ideally refetch or navigate
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate('/vendor/contracts')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{contract.contractNumber}</h1>
                    <p className="text-gray-500">Contract Details</p>
                </div>
                <div className="ml-auto flex gap-2">
                    {contract.vendorAcceptanceStatus?.toLowerCase() === 'pending' && (
                        <>
                            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction('Accept')}>
                                <Check className="w-4 h-4 mr-2" /> Accept Contract
                            </Button>
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction('Reject')}>
                                <X className="w-4 h-4 mr-2" /> Reject Contract
                            </Button>
                        </>
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
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-gray-500">Description</label>
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
                                <label className="text-sm font-medium text-gray-500">Duration</label>
                                <p className="mt-1 text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {contract.startDate} - {contract.endDate}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Total Value</label>
                                <p className="mt-1 text-xl font-bold text-gray-900">
                                    {contract.totalValue?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Acceptance Status</label>
                                <div className="mt-1">
                                    {contract.vendorAcceptanceStatus === 'Accepted' && <Badge className="bg-green-100 text-green-800">Accepted</Badge>}
                                    {contract.vendorAcceptanceStatus === 'Rejected' && <Badge className="bg-red-100 text-red-800">Rejected</Badge>}
                                    {contract.vendorAcceptanceStatus === 'Pending' && <Badge className="bg-amber-100 text-amber-800">Pending</Badge>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionType} Contract</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p>Are you sure you want to <strong>{actionType?.toLowerCase()}</strong> contract <strong>{contract.contractNumber}</strong>?</p>
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
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
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

export default VendorContractDetails;
