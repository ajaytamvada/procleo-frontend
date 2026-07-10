import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  PackageCheck,
  MapPin,
  FileText,
  Wrench,
  Truck,
  CheckCircle,
  ArrowRightLeft,
  Trash2,
  Download,
  Upload,
  Printer,
  QrCode,
  Barcode,
  History,
  AlertTriangle,
  ClipboardCheck,
  Search,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import {
  useAssetById,
  useUpdateAsset,
  useAllocateAsset,
  useDeallocateAsset,
  useRequestDisposal,
  useApproveDisposal,
  useRejectDisposal,
  useCreateTransfer,
  useApproveTransfer,
  useRejectTransfer,
  useReceiveTransfer,
  useCreateMaintenance,
  useMaintenanceByAsset,
  useTransfersByAsset,
  useAssetHistory,
  useReportDamage,
  useDamageByAsset,
  useReportMissing,
  useRecoverAsset,
  useRecordAudit,
} from '../hooks/useAssets';
import type {
  AllocateAssetRequest,
  CreateTransferRequest,
  CreateMaintenanceRequest,
  DisposeAssetRequest,
  RequestDisposalRequest,
  UpdateAssetRequest,
  ReportDamageRequest,
  AssetMaintenance,
  AssetTransfer,
  AssetHistory,
  AssetDamageReport,
} from '../types';
import {
  AssetStatus,
  ASSET_STATUS_COLORS,
  ASSET_STATUS_LABELS,
} from '../types';
import { useWorkingEmployees } from '@/features/master/hooks/useEmployeeAPI';
import { useDepartmentsList } from '@/features/master/hooks/useDepartmentAPI';
import { useCities } from '@/features/master/hooks/useCityAPI';
import { printAssetTags } from '../utils/printAssetTag';

const formatCurrency = (amount?: number) => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN');
};

const formatDateTime = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ASSET_EVENT_LABELS: Record<string, string> = {
  CREATED: 'Created',
  UPDATED: 'Updated',
  ALLOCATED: 'Allocated',
  DEALLOCATED: 'Deallocated',
  TRANSFER_INITIATED: 'Transfer requested',
  TRANSFER_APPROVED: 'Transfer approved',
  TRANSFER_REJECTED: 'Transfer rejected',
  TRANSFER_RECEIVED: 'Transfer received',
  MAINTENANCE_STARTED: 'Maintenance started',
  MAINTENANCE_COMPLETED: 'Maintenance completed',
  MAINTENANCE_CANCELLED: 'Maintenance cancelled',
  MAINTENANCE_SCHEDULED: 'Maintenance scheduled',
  REPORTED_MISSING: 'Reported missing',
  RECOVERED: 'Recovered',
  AUDIT_VERIFIED: 'Audit verified',
  DISPOSAL_REQUESTED: 'Disposal requested',
  DISPOSAL_REJECTED: 'Disposal rejected',
  DISPOSED: 'Disposed',
};

const eventLabel = (type: string) => ASSET_EVENT_LABELS[type] || type;

const eventDotColor = (type: string): string => {
  if (type === 'CREATED') return 'bg-blue-500';
  if (type === 'ALLOCATED' || type === 'TRANSFER_RECEIVED')
    return 'bg-green-500';
  if (type === 'DISPOSED') return 'bg-gray-500';
  if (type === 'TRANSFER_REJECTED' || type === 'MAINTENANCE_CANCELLED')
    return 'bg-red-500';
  if (type.startsWith('MAINTENANCE')) return 'bg-yellow-500';
  if (type.startsWith('TRANSFER')) return 'bg-purple-500';
  return 'bg-violet-500';
};

const AssetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const assetId = id ? parseInt(id) : 0;

  const { data: asset, isLoading } = useAssetById(assetId || null);
  const { data: maintenanceHistory = [] } = useMaintenanceByAsset(assetId);
  const { data: transferHistory = [] } = useTransfersByAsset(assetId);
  const { data: history = [], isLoading: historyLoading } =
    useAssetHistory(assetId);
  const { data: damageReports = [] } = useDamageByAsset(assetId);

  const { data: employees = [], isLoading: employeesLoading } =
    useWorkingEmployees();
  const { data: departments = [], isLoading: departmentsLoading } =
    useDepartmentsList();
  const { data: locations = [], isLoading: locationsLoading } = useCities();

  const { user } = useAuth();

  const allocateMutation = useAllocateAsset();
  const deallocateMutation = useDeallocateAsset();
  const updateMutation = useUpdateAsset();
  const requestDisposalMutation = useRequestDisposal();
  const approveDisposalMutation = useApproveDisposal();
  const rejectDisposalMutation = useRejectDisposal();
  const transferMutation = useCreateTransfer();
  const approveTransferMutation = useApproveTransfer();
  const rejectTransferMutation = useRejectTransfer();
  const receiveTransferMutation = useReceiveTransfer();
  const maintenanceMutation = useCreateMaintenance();
  const reportDamageMutation = useReportDamage();
  const reportMissingMutation = useReportMissing();
  const recoverMutation = useRecoverAsset();
  const auditMutation = useRecordAudit();

  // Dialog states
  const [showAllocateDialog, setShowAllocateDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showRequestDisposalDialog, setShowRequestDisposalDialog] =
    useState(false);
  const [showApproveDisposalDialog, setShowApproveDisposalDialog] =
    useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [isPrintingTag, setIsPrintingTag] = useState(false);
  const [showDamageDialog, setShowDamageDialog] = useState(false);

  // Damage form
  const [damageForm, setDamageForm] = useState<ReportDamageRequest>({
    severity: 'MINOR',
    description: '',
    reportedIssue: '',
    estimatedCost: undefined,
  });

  // Allocate form
  const [allocateForm, setAllocateForm] = useState<AllocateAssetRequest>({
    employeeId: 0,
    installDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  // Transfer form
  const [transferForm, setTransferForm] = useState<
    Omit<CreateTransferRequest, 'assetId'>
  >({
    transferType: 'DEPARTMENT',
    remarks: '',
  });

  // Maintenance form
  const [maintenanceForm, setMaintenanceForm] = useState<
    Omit<CreateMaintenanceRequest, 'assetId'>
  >({
    maintenanceType: 'PREVENTIVE',
    description: '',
    cost: undefined,
    vendorName: '',
    remarks: '',
  });

  // Financial / contracts edit
  const [showFinancialDialog, setShowFinancialDialog] = useState(false);
  const [financialForm, setFinancialForm] = useState<UpdateAssetRequest>({});

  const openFinancialDialog = () => {
    if (!asset) return;
    setFinancialForm({
      depreciationMethod: asset.depreciationMethod || 'NONE',
      usefulLifeYears: asset.usefulLifeYears,
      salvageValue: asset.salvageValue,
      depreciationRate: asset.depreciationRate,
      depreciationStartDate: asset.depreciationStartDate?.split('T')[0],
      warrantyProvider: asset.warrantyProvider,
      warrantyExpiryDate: asset.warrantyExpiryDate?.split('T')[0],
      amcVendor: asset.amcVendor,
      amcExpiryDate: asset.amcExpiryDate?.split('T')[0],
      leaseExpiryDate: asset.leaseExpiryDate?.split('T')[0],
      maintenanceIntervalDays: asset.maintenanceIntervalDays,
    });
    setShowFinancialDialog(true);
  };

  const handleSaveFinancial = () => {
    if (!assetId) return;
    updateMutation.mutate(
      { id: assetId, data: financialForm },
      { onSuccess: () => setShowFinancialDialog(false) }
    );
  };

  // Location edit. Department / Assigned To are deliberately absent: those are
  // custody transitions and move only via Allocate / Deallocate / Transfer.
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [locationForm, setLocationForm] = useState<UpdateAssetRequest>({});

  const openLocationDialog = () => {
    if (!asset) return;
    setLocationForm({
      warehouseLocation: asset.warehouseLocation || '',
      storageLocation: asset.storageLocation || '',
      binNumber: asset.binNumber || '',
    });
    setShowLocationDialog(true);
  };

  const handleSaveLocation = () => {
    if (!assetId) return;
    updateMutation.mutate(
      { id: assetId, data: locationForm },
      { onSuccess: () => setShowLocationDialog(false) }
    );
  };

  // Identity edit. Only the serial number is editable — item, category and
  // manufacturer descend from the GRN and must stay tied to that lineage.
  const [showIdentityDialog, setShowIdentityDialog] = useState(false);
  const [identityForm, setIdentityForm] = useState<UpdateAssetRequest>({});

  const openIdentityDialog = () => {
    if (!asset) return;
    setIdentityForm({ serialNumber: asset.serialNumber || '' });
    setShowIdentityDialog(true);
  };

  const handleSaveIdentity = () => {
    if (!assetId) return;
    updateMutation.mutate(
      { id: assetId, data: identityForm },
      { onSuccess: () => setShowIdentityDialog(false) }
    );
  };

  // Disposal request form (maker)
  const [requestDisposalForm, setRequestDisposalForm] =
    useState<RequestDisposalRequest>({ reason: '' });

  // Disposal approval form (checker)
  const [disposeForm, setDisposeForm] = useState<DisposeAssetRequest>({
    disposalMethod: 'SCRAPPED',
    sanitizationReference: '',
    disposalValue: undefined,
    remarks: '',
  });

  const handleAllocate = () => {
    if (!assetId || !allocateForm.employeeId) return;
    allocateMutation.mutate(
      { id: assetId, data: allocateForm },
      {
        onSuccess: () => {
          setShowAllocateDialog(false);
          setAllocateForm({
            employeeId: 0,
            installDate: new Date().toISOString().split('T')[0],
            remarks: '',
          });
        },
      }
    );
  };

  const handleDeallocate = () => {
    if (!assetId) return;
    if (
      window.confirm(
        'Are you sure you want to deallocate this asset? It will be returned to store.'
      )
    ) {
      deallocateMutation.mutate(assetId);
    }
  };

  // The transfer the asset is currently sitting in. An asset is IN_TRANSIT from
  // the moment the transfer is raised until it is received, so the open transfer
  // is the one still PENDING (awaiting approval) or APPROVED (awaiting receipt).
  const activeTransfer = transferHistory.find(
    (t: AssetTransfer) => t.status === 'PENDING' || t.status === 'APPROVED'
  );

  // The backend refuses a transfer approved by its own requester (segregation of
  // duties). Mirror that here so we never render a button that can only fail.
  // requestedBy comes from the JWT principal, which is upper-cased.
  const isOwnTransferRequest =
    !!activeTransfer?.requestedBy &&
    !!user?.loginName &&
    activeTransfer.requestedBy.toLowerCase() === user.loginName.toLowerCase();

  const handleApproveTransfer = () => {
    if (!activeTransfer) return;
    approveTransferMutation.mutate(activeTransfer.id);
  };

  const handleRejectTransfer = () => {
    if (!activeTransfer) return;
    const reason = window.prompt(
      'Reject this transfer? The asset will return to store. Optional reason:'
    );
    if (reason === null) return; // cancelled the prompt
    rejectTransferMutation.mutate({
      id: activeTransfer.id,
      reason: reason || undefined,
    });
  };

  const handleReceiveTransfer = () => {
    if (!activeTransfer) return;
    if (
      window.confirm(
        'Confirm receipt of this asset at its destination? This completes the transfer.'
      )
    ) {
      receiveTransferMutation.mutate(activeTransfer.id);
    }
  };

  const handlePrintTag = async (type: 'qrcode' | 'barcode') => {
    if (!asset) return;
    setIsPrintingTag(true);
    try {
      await printAssetTags([asset], type);
      setShowTagDialog(false);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Failed to print the asset tag.'
      );
    } finally {
      setIsPrintingTag(false);
    }
  };

  const handleReportDamage = () => {
    if (!assetId) return;
    reportDamageMutation.mutate(
      { id: assetId, data: damageForm },
      {
        onSuccess: () => {
          setShowDamageDialog(false);
          setDamageForm({
            severity: 'MINOR',
            description: '',
            reportedIssue: '',
            estimatedCost: undefined,
          });
        },
      }
    );
  };

  const handleTransfer = () => {
    if (!assetId) return;
    transferMutation.mutate(
      { assetId, ...transferForm },
      {
        onSuccess: () => {
          setShowTransferDialog(false);
          setTransferForm({ transferType: 'DEPARTMENT', remarks: '' });
        },
      }
    );
  };

  const handleMaintenance = () => {
    if (!assetId) return;
    maintenanceMutation.mutate(
      { assetId, ...maintenanceForm },
      {
        onSuccess: () => {
          setShowMaintenanceDialog(false);
          setMaintenanceForm({
            maintenanceType: 'PREVENTIVE',
            description: '',
            cost: undefined,
            vendorName: '',
            remarks: '',
          });
        },
      }
    );
  };

  const handleRequestDisposal = () => {
    if (!assetId || !requestDisposalForm.reason.trim()) return;
    requestDisposalMutation.mutate(
      { id: assetId, data: requestDisposalForm },
      {
        onSuccess: () => {
          setShowRequestDisposalDialog(false);
          setRequestDisposalForm({ reason: '' });
        },
      }
    );
  };

  const handleApproveDisposal = () => {
    if (!assetId || !disposeForm.sanitizationReference.trim()) return;
    if (
      window.confirm(
        'Approve disposal? This permanently writes the asset off and cannot be undone.'
      )
    ) {
      approveDisposalMutation.mutate(
        { id: assetId, data: disposeForm },
        {
          onSuccess: () => {
            setShowApproveDisposalDialog(false);
            setDisposeForm({
              disposalMethod: 'SCRAPPED',
              sanitizationReference: '',
              disposalValue: undefined,
              remarks: '',
            });
          },
        }
      );
    }
  };

  const handleRejectDisposal = () => {
    if (!assetId) return;
    const reason = window.prompt(
      'Reject this disposal request? The asset will return to store. Optional reason:'
    );
    // prompt returns null on cancel; empty string is an accepted (reason-less) confirm.
    if (reason === null) return;
    rejectDisposalMutation.mutate({ id: assetId, reason: reason || undefined });
  };

  const handleReportMissing = (type: 'LOST' | 'STOLEN') => {
    if (!assetId) return;
    const remarks = window.prompt(
      `Report this asset as ${type.toLowerCase()}? Optional remarks:`
    );
    if (remarks === null) return; // cancelled
    reportMissingMutation.mutate({
      id: assetId,
      type,
      remarks: remarks || undefined,
    });
  };

  const handleRecover = () => {
    if (!assetId) return;
    if (
      window.confirm(
        'Mark this asset as recovered? It returns to store, unassigned.'
      )
    ) {
      recoverMutation.mutate(assetId);
    }
  };

  const handleAudit = () => {
    if (!assetId) return;
    const remarks = window.prompt(
      'Confirm this asset is physically present. Optional remarks:'
    );
    if (remarks === null) return; // cancelled
    auditMutation.mutate({ id: assetId, remarks: remarks || undefined });
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='flex flex-col items-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
          <p className='text-sm text-gray-500 mt-3'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-600 font-medium'>Asset not found</p>
        <button
          onClick={() => navigate('/assets/list')}
          className='mt-4 text-violet-600 hover:text-violet-700 text-sm font-medium'
        >
          Back to Asset List
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => navigate('/assets/list')}
            className='text-gray-600 hover:text-gray-900 transition-colors'
          >
            <ArrowLeft className='h-5 w-5' />
          </button>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-xl font-semibold text-gray-900'>
                {asset.assetTag}
              </h1>
              <Badge
                className={
                  ASSET_STATUS_COLORS[asset.status] ||
                  'bg-gray-100 text-gray-800'
                }
              >
                {ASSET_STATUS_LABELS[asset.status] || asset.status}
              </Badge>
            </div>
            <p className='text-sm text-gray-500 mt-1'>{asset.itemName}</p>
          </div>
        </div>
        <button
          onClick={() => setShowTagDialog(true)}
          className='inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors'
        >
          <Printer className='h-4 w-4' />
          Print Tag
        </button>
      </div>

      {/* Two-column layout */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left column (2/3) */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Asset Information */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
                <Package className='h-5 w-5 text-violet-600' />
                Asset Information
              </h2>
              <button
                onClick={openIdentityDialog}
                className='text-sm font-medium text-violet-600 hover:text-violet-700'
              >
                Edit
              </button>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <InfoRow label='Item Name' value={asset.itemName} />
              <InfoRow label='Item Code' value={asset.itemCode} />
              <InfoRow label='Serial Number' value={asset.serialNumber} />
              <InfoRow label='Batch Number' value={asset.batchNumber} />
              <InfoRow label='Manufacturer' value={asset.manufacturer} />
              <InfoRow label='Category' value={asset.categoryName} />
              <InfoRow label='Sub Category' value={asset.subCategoryName} />
            </div>
          </div>

          {/* Location & Assignment */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
                <MapPin className='h-5 w-5 text-violet-600' />
                Location & Assignment
              </h2>
              <button
                onClick={openLocationDialog}
                className='text-sm font-medium text-violet-600 hover:text-violet-700'
              >
                Edit
              </button>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <InfoRow
                label='Warehouse Location'
                value={asset.warehouseLocation}
              />
              <InfoRow label='Storage Location' value={asset.storageLocation} />
              <InfoRow label='Bin Number' value={asset.binNumber} />
              <InfoRow label='Department' value={asset.departmentName} />
              <InfoRow label='Assigned To' value={asset.assignedToName} />
              <InfoRow
                label='Allocation Date'
                value={formatDate(asset.installDate)}
              />
            </div>
          </div>

          {/* Procurement Lineage */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-4 flex items-center gap-2'>
              <FileText className='h-5 w-5 text-violet-600' />
              Procurement Lineage
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <InfoRow label='GRN Number' value={asset.grnNumber} />
              <InfoRow label='PO Number' value={asset.poNumber} />
              <InfoRow label='PR Number' value={asset.prNumber} />
              <InfoRow label='Supplier' value={asset.supplierName} />
              <InfoRow label='Invoice Number' value={asset.invoiceNumber} />
              <InfoRow
                label='Received Date'
                value={formatDate(asset.receivedDate)}
              />
              <InfoRow
                label='Unit Price'
                value={formatCurrency(asset.unitPrice)}
              />
            </div>
          </div>

          {/* Financial & Depreciation */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
                <FileText className='h-5 w-5 text-violet-600' />
                Financial & Depreciation
              </h2>
              <button
                onClick={openFinancialDialog}
                className='text-sm font-medium text-violet-600 hover:text-violet-700'
              >
                Edit
              </button>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <InfoRow
                label='Acquisition Cost'
                value={formatCurrency(asset.unitPrice)}
              />
              <InfoRow
                label='Depreciation Method'
                value={
                  asset.depreciationMethod &&
                  asset.depreciationMethod !== 'NONE'
                    ? asset.depreciationMethod.replace(/_/g, ' ')
                    : 'Not configured'
                }
              />
              <InfoRow
                label='Useful Life'
                value={
                  asset.usefulLifeYears
                    ? `${asset.usefulLifeYears} years`
                    : undefined
                }
              />
              <InfoRow
                label='Salvage Value'
                value={formatCurrency(asset.salvageValue)}
              />
              <InfoRow
                label='Accumulated Depreciation'
                value={formatCurrency(asset.accumulatedDepreciation)}
              />
              <div className='flex flex-col'>
                <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                  Net Book Value
                </span>
                <span className='text-sm font-semibold text-gray-900 mt-0.5'>
                  {formatCurrency(asset.netBookValue)}
                </span>
              </div>
              {asset.gainLossOnDisposal != null && (
                <div className='flex flex-col'>
                  <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                    Gain / (Loss) on Disposal
                  </span>
                  <span
                    className={`text-sm font-semibold mt-0.5 ${
                      asset.gainLossOnDisposal >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(asset.gainLossOnDisposal)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Warranty & Contracts — edited through the same dialog as Financial,
              which is why both buttons open openFinancialDialog. */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
                <FileText className='h-5 w-5 text-violet-600' />
                Warranty & Contracts
              </h2>
              <button
                onClick={openFinancialDialog}
                className='text-sm font-medium text-violet-600 hover:text-violet-700'
              >
                Edit
              </button>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <InfoRow
                label='Warranty Provider'
                value={asset.warrantyProvider}
              />
              <ContractRow
                label='Warranty Expiry'
                date={asset.warrantyExpiryDate}
              />
              <InfoRow label='AMC Vendor' value={asset.amcVendor} />
              <ContractRow label='AMC Expiry' date={asset.amcExpiryDate} />
              <ContractRow label='Lease Expiry' date={asset.leaseExpiryDate} />
              <ContractRow
                label='Next Maintenance'
                date={asset.nextMaintenanceDate}
              />
              <InfoRow
                label='Maintenance Interval'
                value={
                  asset.maintenanceIntervalDays
                    ? `${asset.maintenanceIntervalDays} days`
                    : undefined
                }
              />
              <InfoRow
                label='Last Audited'
                value={
                  asset.lastAuditedDate
                    ? `${formatDate(asset.lastAuditedDate)}${
                        asset.lastAuditedBy ? ` · ${asset.lastAuditedBy}` : ''
                      }`
                    : 'Never'
                }
              />
            </div>
          </div>

          {/* Activity Timeline (audit trail) */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-4 flex items-center gap-2'>
              <History className='h-5 w-5 text-violet-600' />
              Activity Timeline
            </h2>
            {historyLoading ? (
              <p className='text-sm text-gray-500'>Loading history...</p>
            ) : history.length === 0 ? (
              <p className='text-sm text-gray-500'>No activity recorded yet.</p>
            ) : (
              <ol className='relative border-l border-gray-200 ml-1.5'>
                {history.map((event: AssetHistory) => (
                  <li key={event.id} className='mb-5 ml-5 last:mb-0'>
                    <span
                      className={`absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full ring-4 ring-white ${eventDotColor(
                        event.eventType
                      )}`}
                    />
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='text-sm font-medium text-gray-900'>
                        {eventLabel(event.eventType)}
                      </span>
                      {event.fromStatus && event.toStatus && (
                        <span className='text-xs text-gray-400'>
                          {event.fromStatus} → {event.toStatus}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className='text-sm text-gray-600 mt-0.5'>
                        {event.description}
                      </p>
                    )}
                    <p className='text-xs text-gray-400 mt-0.5'>
                      {formatDateTime(event.performedDate)}
                      {event.performedBy ? ` · ${event.performedBy}` : ''}
                      {event.referenceNumber
                        ? ` · ${event.referenceNumber}`
                        : ''}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Right column (1/3) */}
        <div className='space-y-6'>
          {/* Actions */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-4'>
              Actions
            </h2>
            <div className='space-y-3'>
              {asset.status === AssetStatus.IN_STORE && (
                <>
                  <button
                    onClick={() => setShowAllocateDialog(true)}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors'
                  >
                    <Download className='h-4 w-4' />
                    Allocate
                  </button>
                  <button
                    onClick={() => setShowTransferDialog(true)}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'
                  >
                    <ArrowRightLeft className='h-4 w-4' />
                    Transfer
                  </button>
                  <button
                    onClick={() => setShowDamageDialog(true)}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors'
                  >
                    <AlertTriangle className='h-4 w-4' />
                    Report Damage
                  </button>
                  <button
                    onClick={() => setShowRequestDisposalDialog(true)}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors'
                  >
                    <Trash2 className='h-4 w-4' />
                    Request Disposal
                  </button>
                  <AuditAndMissingActions
                    onAudit={handleAudit}
                    onMissing={handleReportMissing}
                    auditing={auditMutation.isPending}
                  />
                </>
              )}
              {asset.status === AssetStatus.IN_USE && (
                <>
                  <button
                    onClick={handleDeallocate}
                    disabled={deallocateMutation.isPending}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors'
                  >
                    <Upload className='h-4 w-4' />
                    Deallocate
                  </button>
                  <p className='text-xs text-gray-500 -mt-1 px-1'>
                    Deallocate to store before transferring or disposing this
                    asset.
                  </p>
                  <button
                    onClick={() => setShowMaintenanceDialog(true)}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors'
                  >
                    <Wrench className='h-4 w-4' />
                    Maintenance
                  </button>
                  <button
                    onClick={() => setShowDamageDialog(true)}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors'
                  >
                    <AlertTriangle className='h-4 w-4' />
                    Report Damage
                  </button>
                  <AuditAndMissingActions
                    onAudit={handleAudit}
                    onMissing={handleReportMissing}
                    auditing={auditMutation.isPending}
                  />
                </>
              )}
              {asset.status === AssetStatus.IN_TRANSIT && (
                <>
                  <div className='text-sm text-gray-600 bg-indigo-50 border border-indigo-200 rounded-lg p-3'>
                    <Truck className='h-5 w-5 text-indigo-500 mb-1' />
                    {activeTransfer ? (
                      <>
                        <p>
                          In transit on <b>{activeTransfer.transferNumber}</b>
                          {activeTransfer.status === 'PENDING'
                            ? ', awaiting approval.'
                            : ', approved and awaiting receipt.'}
                        </p>
                        {(activeTransfer.toEmployeeName ||
                          activeTransfer.toDepartmentName ||
                          activeTransfer.toLocationName) && (
                          <p className='mt-1 text-xs text-gray-500'>
                            Destination:{' '}
                            {activeTransfer.toEmployeeName ||
                              activeTransfer.toDepartmentName ||
                              activeTransfer.toLocationName}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>
                        This asset is in transit, but no open transfer record
                        was found. Check the Transfers page.
                      </p>
                    )}
                  </div>

                  {activeTransfer?.status === 'PENDING' && (
                    <>
                      {isOwnTransferRequest ? (
                        <p className='text-xs text-gray-500 px-1'>
                          You raised this transfer, so it must be approved by
                          someone else.
                        </p>
                      ) : (
                        <button
                          onClick={handleApproveTransfer}
                          disabled={approveTransferMutation.isPending}
                          className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        >
                          <CheckCircle className='h-4 w-4' />
                          Approve Transfer
                        </button>
                      )}
                      {/* Rejecting your own request is just a cancellation, so it
                          stays available to the requester. */}
                      <button
                        onClick={handleRejectTransfer}
                        disabled={rejectTransferMutation.isPending}
                        className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                      >
                        <X className='h-4 w-4' />
                        {isOwnTransferRequest
                          ? 'Cancel Transfer'
                          : 'Reject Transfer'}
                      </button>
                    </>
                  )}

                  {activeTransfer?.status === 'APPROVED' && (
                    <button
                      onClick={handleReceiveTransfer}
                      disabled={receiveTransferMutation.isPending}
                      className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    >
                      <PackageCheck className='h-4 w-4' />
                      Confirm Receipt
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/assets/transfers')}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
                  >
                    <ArrowRightLeft className='h-4 w-4' />
                    View All Transfers
                  </button>
                </>
              )}
              {(asset.status === AssetStatus.LOST ||
                asset.status === AssetStatus.STOLEN) && (
                <>
                  <div className='text-sm text-gray-600 bg-red-50 border border-red-200 rounded-lg p-3'>
                    <AlertTriangle className='h-5 w-5 text-red-500 mb-1' />
                    <p>
                      This asset is marked{' '}
                      <b>
                        {asset.status === AssetStatus.LOST ? 'lost' : 'stolen'}
                      </b>
                      . Recover it if found, or write it off via disposal.
                    </p>
                  </div>
                  <button
                    onClick={handleRecover}
                    disabled={recoverMutation.isPending}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors'
                  >
                    <Download className='h-4 w-4' />
                    Mark Recovered
                  </button>
                  <button
                    onClick={() => setShowRequestDisposalDialog(true)}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors'
                  >
                    <Trash2 className='h-4 w-4' />
                    Write Off (Request Disposal)
                  </button>
                </>
              )}
              {(asset.status === AssetStatus.DAMAGED ||
                asset.status === AssetStatus.UNDER_REPAIR ||
                asset.status === AssetStatus.READY_FOR_DISPOSAL) && (
                <>
                  <div className='text-sm text-gray-600 bg-rose-50 border border-rose-200 rounded-lg p-3'>
                    <AlertTriangle className='h-5 w-5 text-rose-500 mb-1' />
                    {asset.status === AssetStatus.DAMAGED && (
                      <p>
                        Damage reported. Review it in{' '}
                        <button
                          onClick={() => navigate('/assets/damage')}
                          className='text-rose-700 underline font-medium'
                        >
                          Damage &amp; Repair
                        </button>
                        .
                      </p>
                    )}
                    {asset.status === AssetStatus.UNDER_REPAIR && (
                      <p>
                        Under repair. Complete it in{' '}
                        <button
                          onClick={() => navigate('/assets/damage')}
                          className='text-rose-700 underline font-medium'
                        >
                          Damage &amp; Repair
                        </button>
                        .
                      </p>
                    )}
                    {asset.status === AssetStatus.READY_FOR_DISPOSAL && (
                      <p>
                        Flagged for disposal
                        {asset.disposalRequestedBy
                          ? ` by ${asset.disposalRequestedBy}`
                          : ''}
                        {asset.disposalReason
                          ? ` — “${asset.disposalReason}”`
                          : ''}
                        . Approval by a different user is required.
                      </p>
                    )}
                  </div>
                  {asset.status === AssetStatus.READY_FOR_DISPOSAL && (
                    <>
                      <button
                        onClick={() => setShowApproveDisposalDialog(true)}
                        className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors'
                      >
                        <Trash2 className='h-4 w-4' />
                        Approve Disposal
                      </button>
                      <button
                        onClick={handleRejectDisposal}
                        disabled={rejectDisposalMutation.isPending}
                        className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
                      >
                        <Upload className='h-4 w-4' />
                        Reject &amp; Return to Store
                      </button>
                    </>
                  )}
                </>
              )}
              {asset.status === AssetStatus.IN_MAINTENANCE && (
                <div className='text-sm text-gray-500 text-center py-4'>
                  <Wrench className='h-8 w-8 mx-auto mb-2 text-yellow-500' />
                  <p>Asset is currently under maintenance.</p>
                  {asset.nextMaintenanceDate && (
                    <p className='mt-1'>
                      Next maintenance: {formatDate(asset.nextMaintenanceDate)}
                    </p>
                  )}
                </div>
              )}
              {(asset.status === AssetStatus.DISPOSED ||
                asset.status === AssetStatus.SOLD) && (
                <div className='text-sm text-gray-500 text-center py-4'>
                  <p>This asset has been disposed.</p>
                  {asset.disposalDate && (
                    <p className='mt-1'>
                      Date: {formatDate(asset.disposalDate)}
                    </p>
                  )}
                  {asset.disposalMethod && (
                    <p>Method: {asset.disposalMethod}</p>
                  )}
                  {asset.disposalValue != null && (
                    <p>Value: {formatCurrency(asset.disposalValue)}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Maintenance History */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-4 flex items-center gap-2'>
              <Wrench className='h-5 w-5 text-yellow-600' />
              Maintenance History
            </h2>
            {maintenanceHistory.length === 0 ? (
              <p className='text-sm text-gray-400 text-center py-4'>
                No maintenance records
              </p>
            ) : (
              <div className='space-y-3'>
                {maintenanceHistory.map((m: AssetMaintenance) => (
                  <div
                    key={m.id}
                    className='border border-gray-100 rounded-lg p-3'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-700'>
                        {m.maintenanceType}
                      </span>
                      <Badge
                        className={
                          m.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : m.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {m.status}
                      </Badge>
                    </div>
                    {m.description && (
                      <p className='text-xs text-gray-500 mt-1'>
                        {m.description}
                      </p>
                    )}
                    <div className='flex items-center justify-between mt-2 text-xs text-gray-400'>
                      <span>
                        {formatDate(m.scheduledDate || m.createdDate)}
                      </span>
                      {m.cost != null && <span>{formatCurrency(m.cost)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transfer History */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-4 flex items-center gap-2'>
              <ArrowRightLeft className='h-5 w-5 text-blue-600' />
              Transfer History
            </h2>
            {transferHistory.length === 0 ? (
              <p className='text-sm text-gray-400 text-center py-4'>
                No transfer records
              </p>
            ) : (
              <div className='space-y-3'>
                {transferHistory.map((t: AssetTransfer) => (
                  <div
                    key={t.id}
                    className='border border-gray-100 rounded-lg p-3'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-700'>
                        {t.transferNumber}
                      </span>
                      <Badge
                        className={
                          t.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : t.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800'
                              : t.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {t.status}
                      </Badge>
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                      {t.transferType}:{' '}
                      {t.fromDepartmentName ||
                        t.fromEmployeeName ||
                        t.fromLocationName ||
                        '-'}{' '}
                      →{' '}
                      {t.toDepartmentName ||
                        t.toEmployeeName ||
                        t.toLocationName ||
                        '-'}
                    </p>
                    <p className='text-xs text-gray-400 mt-1'>
                      {formatDate(t.requestedDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Damage & Repair History */}
          {damageReports.length > 0 && (
            <div className='bg-white rounded-lg border border-gray-200 p-6'>
              <h2 className='text-base font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <AlertTriangle className='h-5 w-5 text-rose-500' />
                Damage &amp; Repair
              </h2>
              <div className='space-y-3'>
                {damageReports.map((d: AssetDamageReport) => (
                  <div
                    key={d.id}
                    className='border border-gray-100 rounded-lg p-3'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-700'>
                        {d.severity} damage
                      </span>
                      <Badge
                        className={
                          d.status === 'REPAIRED'
                            ? 'bg-green-100 text-green-800'
                            : d.status === 'REJECTED' ||
                                d.status === 'IRREPARABLE'
                              ? 'bg-red-100 text-red-800'
                              : d.status === 'UNDER_REPAIR'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {d.status}
                      </Badge>
                    </div>
                    {d.description && (
                      <p className='text-xs text-gray-600 mt-1'>
                        {d.description}
                      </p>
                    )}
                    <p className='text-xs text-gray-400 mt-1'>
                      {formatDate(d.reportedDate)}
                      {d.estimatedCost != null
                        ? ` · est. ${formatCurrency(d.estimatedCost)}`
                        : ''}
                      {d.actualCost != null
                        ? ` · actual ${formatCurrency(d.actualCost)}`
                        : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Tag Dialog */}
      {showTagDialog && (
        <DialogOverlay onClose={() => setShowTagDialog(false)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-1'>
            Print Asset Tag
          </h3>
          <p className='text-sm text-gray-500 mb-4'>
            Choose a tag format for{' '}
            <span className='font-medium'>{asset.assetTag}</span>. The tag opens
            in a new window ready to print.
          </p>
          <div className='grid grid-cols-2 gap-3'>
            <button
              onClick={() => handlePrintTag('qrcode')}
              disabled={isPrintingTag}
              className='flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 disabled:opacity-50 transition-colors'
            >
              <QrCode className='h-8 w-8 text-violet-600' />
              <span className='text-sm font-medium text-gray-900'>QR Code</span>
            </button>
            <button
              onClick={() => handlePrintTag('barcode')}
              disabled={isPrintingTag}
              className='flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 disabled:opacity-50 transition-colors'
            >
              <Barcode className='h-8 w-8 text-violet-600' />
              <span className='text-sm font-medium text-gray-900'>Barcode</span>
            </button>
          </div>
          {isPrintingTag && (
            <p className='text-sm text-gray-500 mt-3 text-center'>
              Generating tag...
            </p>
          )}
          <div className='flex justify-end pt-4'>
            <Button variant='outline' onClick={() => setShowTagDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogOverlay>
      )}

      {/* Report Damage Dialog */}
      {showDamageDialog && (
        <DialogOverlay onClose={() => setShowDamageDialog(false)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-rose-500' />
            Report Damage
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Severity
              </label>
              <select
                value={damageForm.severity}
                onChange={e =>
                  setDamageForm(prev => ({
                    ...prev,
                    severity: e.target.value as ReportDamageRequest['severity'],
                  }))
                }
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'
              >
                <option value='MINOR'>Minor</option>
                <option value='MAJOR'>Major</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Damage Description
              </label>
              <Input
                type='text'
                value={damageForm.description || ''}
                onChange={e =>
                  setDamageForm(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder='What is damaged?'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Reported Issue
              </label>
              <Input
                type='text'
                value={damageForm.reportedIssue || ''}
                onChange={e =>
                  setDamageForm(prev => ({
                    ...prev,
                    reportedIssue: e.target.value,
                  }))
                }
                placeholder='Symptom / how it happened (optional)'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Estimated Repair Cost
              </label>
              <Input
                type='number'
                value={damageForm.estimatedCost ?? ''}
                onChange={e =>
                  setDamageForm(prev => ({
                    ...prev,
                    estimatedCost: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder='Optional'
              />
            </div>
            <div className='flex justify-end gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() => setShowDamageDialog(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleReportDamage}
                disabled={reportDamageMutation.isPending}
                className='px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {reportDamageMutation.isPending
                  ? 'Reporting...'
                  : 'Report Damage'}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}

      {/* Allocate Dialog */}
      {showAllocateDialog && (
        <DialogOverlay onClose={() => setShowAllocateDialog(false)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Allocate Asset
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Assign To Employee
              </label>
              <select
                value={allocateForm.employeeId || ''}
                onChange={e =>
                  setAllocateForm(prev => ({
                    ...prev,
                    employeeId: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={employeesLoading}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100'
              >
                <option value=''>
                  {employeesLoading
                    ? 'Loading employees...'
                    : 'Select an employee'}
                </option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                    {emp.code ? ` (${emp.code})` : ''}
                    {emp.departmentName ? ` — ${emp.departmentName}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Allocation Date
              </label>
              <Input
                type='date'
                value={allocateForm.installDate || ''}
                onChange={e =>
                  setAllocateForm(prev => ({
                    ...prev,
                    installDate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Remarks
              </label>
              <Input
                type='text'
                value={allocateForm.remarks || ''}
                onChange={e =>
                  setAllocateForm(prev => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
                placeholder='Optional remarks'
              />
            </div>
            <div className='flex justify-end gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() => setShowAllocateDialog(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleAllocate}
                disabled={
                  !allocateForm.employeeId || allocateMutation.isPending
                }
                className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {allocateMutation.isPending ? 'Allocating...' : 'Allocate'}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}

      {/* Transfer Dialog */}
      {showTransferDialog && (
        <DialogOverlay onClose={() => setShowTransferDialog(false)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Transfer Asset
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Transfer Type
              </label>
              <select
                value={transferForm.transferType}
                onChange={e =>
                  setTransferForm(prev => ({
                    ...prev,
                    transferType: e.target
                      .value as CreateTransferRequest['transferType'],
                  }))
                }
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'
              >
                <option value='DEPARTMENT'>Department</option>
                <option value='LOCATION'>Location</option>
                <option value='EMPLOYEE'>Employee</option>
              </select>
            </div>
            {transferForm.transferType === 'DEPARTMENT' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  To Department
                </label>
                <select
                  value={transferForm.toDepartmentId || ''}
                  onChange={e =>
                    setTransferForm(prev => ({
                      ...prev,
                      toDepartmentId: parseInt(e.target.value) || undefined,
                    }))
                  }
                  disabled={departmentsLoading}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100'
                >
                  <option value=''>
                    {departmentsLoading
                      ? 'Loading departments...'
                      : 'Select a department'}
                  </option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                      {dept.code ? ` (${dept.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {transferForm.transferType === 'LOCATION' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  To Location
                </label>
                <select
                  value={transferForm.toLocationId || ''}
                  onChange={e =>
                    setTransferForm(prev => ({
                      ...prev,
                      toLocationId: parseInt(e.target.value) || undefined,
                    }))
                  }
                  disabled={locationsLoading}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100'
                >
                  <option value=''>
                    {locationsLoading
                      ? 'Loading locations...'
                      : 'Select a location'}
                  </option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                      {loc.stateName ? ` — ${loc.stateName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {transferForm.transferType === 'EMPLOYEE' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  To Employee
                </label>
                <select
                  value={transferForm.toEmployeeId || ''}
                  onChange={e =>
                    setTransferForm(prev => ({
                      ...prev,
                      toEmployeeId: parseInt(e.target.value) || undefined,
                    }))
                  }
                  disabled={employeesLoading}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100'
                >
                  <option value=''>
                    {employeesLoading
                      ? 'Loading employees...'
                      : 'Select an employee'}
                  </option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                      {emp.code ? ` (${emp.code})` : ''}
                      {emp.departmentName ? ` — ${emp.departmentName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Remarks
              </label>
              <Input
                type='text'
                value={transferForm.remarks || ''}
                onChange={e =>
                  setTransferForm(prev => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
                placeholder='Optional remarks'
              />
            </div>
            <div className='flex justify-end gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() => setShowTransferDialog(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleTransfer}
                disabled={
                  transferMutation.isPending ||
                  (transferForm.transferType === 'DEPARTMENT' &&
                    !transferForm.toDepartmentId) ||
                  (transferForm.transferType === 'LOCATION' &&
                    !transferForm.toLocationId) ||
                  (transferForm.transferType === 'EMPLOYEE' &&
                    !transferForm.toEmployeeId)
                }
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {transferMutation.isPending
                  ? 'Transferring...'
                  : 'Create Transfer'}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}

      {/* Maintenance Dialog */}
      {showMaintenanceDialog && (
        <DialogOverlay onClose={() => setShowMaintenanceDialog(false)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Schedule Maintenance
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Maintenance Type
              </label>
              <select
                value={maintenanceForm.maintenanceType}
                onChange={e =>
                  setMaintenanceForm(prev => ({
                    ...prev,
                    maintenanceType: e.target
                      .value as CreateMaintenanceRequest['maintenanceType'],
                  }))
                }
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'
              >
                <option value='PREVENTIVE'>Preventive</option>
                <option value='CORRECTIVE'>Corrective</option>
                <option value='REPAIR'>Repair</option>
                <option value='INSPECTION'>Inspection</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Description
              </label>
              <Input
                type='text'
                value={maintenanceForm.description || ''}
                onChange={e =>
                  setMaintenanceForm(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder='Describe the maintenance work'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Estimated Cost
              </label>
              <Input
                type='number'
                value={maintenanceForm.cost ?? ''}
                onChange={e =>
                  setMaintenanceForm(prev => ({
                    ...prev,
                    cost: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder='Enter estimated cost'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Vendor
              </label>
              <Input
                type='text'
                value={maintenanceForm.vendorName || ''}
                onChange={e =>
                  setMaintenanceForm(prev => ({
                    ...prev,
                    vendorName: e.target.value,
                  }))
                }
                placeholder='Enter vendor name'
              />
            </div>
            <div className='flex justify-end gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() => setShowMaintenanceDialog(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleMaintenance}
                disabled={maintenanceMutation.isPending}
                className='px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {maintenanceMutation.isPending
                  ? 'Creating...'
                  : 'Create Maintenance'}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}

      {/* Request Disposal Dialog (maker) */}
      {showRequestDisposalDialog && (
        <DialogOverlay onClose={() => setShowRequestDisposalDialog(false)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-1'>
            Request Disposal
          </h3>
          <p className='text-sm text-gray-500 mb-4'>
            Flags this asset for disposal. It must then be approved by a
            different user before it is written off.
          </p>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Reason <span className='text-red-500'>*</span>
              </label>
              <Input
                type='text'
                value={requestDisposalForm.reason}
                onChange={e =>
                  setRequestDisposalForm({ reason: e.target.value })
                }
                placeholder='Why is this asset being disposed?'
              />
            </div>
            <div className='flex justify-end gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() => setShowRequestDisposalDialog(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleRequestDisposal}
                disabled={
                  !requestDisposalForm.reason.trim() ||
                  requestDisposalMutation.isPending
                }
                className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {requestDisposalMutation.isPending
                  ? 'Submitting...'
                  : 'Submit Request'}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}

      {/* Approve Disposal Dialog (checker) */}
      {showApproveDisposalDialog && (
        <DialogOverlay onClose={() => setShowApproveDisposalDialog(false)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-1'>
            Approve Disposal
          </h3>
          <p className='text-sm text-gray-500 mb-4'>
            {asset.disposalReason
              ? `Requested reason: “${asset.disposalReason}”. `
              : ''}
            Confirm the disposal details. This permanently writes the asset off.
          </p>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Disposal Method
              </label>
              <select
                value={disposeForm.disposalMethod}
                onChange={e =>
                  setDisposeForm(prev => ({
                    ...prev,
                    disposalMethod: e.target
                      .value as DisposeAssetRequest['disposalMethod'],
                  }))
                }
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'
              >
                <option value='SCRAPPED'>Scrapped</option>
                <option value='SOLD'>Sold</option>
                <option value='DONATED'>Donated</option>
                <option value='RECYCLED'>Recycled</option>
                <option value='RETURNED_TO_VENDOR'>Returned to Vendor</option>
                <option value='WRITTEN_OFF'>Written Off</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Sanitization / Destruction Reference{' '}
                <span className='text-red-500'>*</span>
              </label>
              <Input
                type='text'
                value={disposeForm.sanitizationReference}
                onChange={e =>
                  setDisposeForm(prev => ({
                    ...prev,
                    sanitizationReference: e.target.value,
                  }))
                }
                placeholder='Certificate no. / wipe reference (enter N/A if no storage media)'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Disposal Value
              </label>
              <Input
                type='number'
                value={disposeForm.disposalValue ?? ''}
                onChange={e =>
                  setDisposeForm(prev => ({
                    ...prev,
                    disposalValue: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder='Enter disposal value'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Remarks
              </label>
              <Input
                type='text'
                value={disposeForm.remarks || ''}
                onChange={e =>
                  setDisposeForm(prev => ({ ...prev, remarks: e.target.value }))
                }
                placeholder='Optional remarks'
              />
            </div>
            <div className='flex justify-end gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() => setShowApproveDisposalDialog(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleApproveDisposal}
                disabled={
                  !disposeForm.sanitizationReference.trim() ||
                  approveDisposalMutation.isPending
                }
                className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {approveDisposalMutation.isPending
                  ? 'Disposing...'
                  : 'Approve &amp; Dispose'}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}

      {/* Financial & Contracts Edit Dialog */}
      {showFinancialDialog && (
        <DialogOverlay onClose={() => setShowFinancialDialog(false)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Edit Financial & Contracts
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Depreciation Method
              </label>
              <select
                value={financialForm.depreciationMethod || 'NONE'}
                onChange={e =>
                  setFinancialForm(prev => ({
                    ...prev,
                    depreciationMethod: e.target
                      .value as UpdateAssetRequest['depreciationMethod'],
                  }))
                }
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'
              >
                <option value='NONE'>None</option>
                <option value='STRAIGHT_LINE'>Straight Line</option>
                <option value='DECLINING_BALANCE'>Declining Balance</option>
              </select>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Useful Life (years)
                </label>
                <Input
                  type='number'
                  value={financialForm.usefulLifeYears ?? ''}
                  onChange={e =>
                    setFinancialForm(prev => ({
                      ...prev,
                      usefulLifeYears: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder='e.g. 5'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Salvage Value
                </label>
                <Input
                  type='number'
                  value={financialForm.salvageValue ?? ''}
                  onChange={e =>
                    setFinancialForm(prev => ({
                      ...prev,
                      salvageValue: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder='Residual value'
                />
              </div>
            </div>
            {financialForm.depreciationMethod === 'DECLINING_BALANCE' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Depreciation Rate (% / year)
                </label>
                <Input
                  type='number'
                  value={financialForm.depreciationRate ?? ''}
                  onChange={e =>
                    setFinancialForm(prev => ({
                      ...prev,
                      depreciationRate: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder='Leave blank to use 2 ÷ useful life'
                />
              </div>
            )}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Depreciation Start Date
              </label>
              <Input
                type='date'
                value={financialForm.depreciationStartDate || ''}
                onChange={e =>
                  setFinancialForm(prev => ({
                    ...prev,
                    depreciationStartDate: e.target.value,
                  }))
                }
              />
            </div>
            <hr className='border-gray-100' />
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Warranty Provider
                </label>
                <Input
                  type='text'
                  value={financialForm.warrantyProvider || ''}
                  onChange={e =>
                    setFinancialForm(prev => ({
                      ...prev,
                      warrantyProvider: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Warranty Expiry
                </label>
                <Input
                  type='date'
                  value={financialForm.warrantyExpiryDate || ''}
                  onChange={e =>
                    setFinancialForm(prev => ({
                      ...prev,
                      warrantyExpiryDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  AMC Vendor
                </label>
                <Input
                  type='text'
                  value={financialForm.amcVendor || ''}
                  onChange={e =>
                    setFinancialForm(prev => ({
                      ...prev,
                      amcVendor: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  AMC Expiry
                </label>
                <Input
                  type='date'
                  value={financialForm.amcExpiryDate || ''}
                  onChange={e =>
                    setFinancialForm(prev => ({
                      ...prev,
                      amcExpiryDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Lease Expiry
                </label>
                <Input
                  type='date'
                  value={financialForm.leaseExpiryDate || ''}
                  onChange={e =>
                    setFinancialForm(prev => ({
                      ...prev,
                      leaseExpiryDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Maintenance Interval (days)
                </label>
                <Input
                  type='number'
                  value={financialForm.maintenanceIntervalDays ?? ''}
                  onChange={e =>
                    setFinancialForm(prev => ({
                      ...prev,
                      maintenanceIntervalDays: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder='e.g. 180'
                />
              </div>
            </div>
            <div className='flex justify-end gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() => setShowFinancialDialog(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleSaveFinancial}
                disabled={updateMutation.isPending}
                className='px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}

      {/* Location Edit Dialog */}
      {showLocationDialog && (
        <DialogOverlay onClose={() => setShowLocationDialog(false)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-1'>
            Edit Location
          </h3>
          <p className='text-sm text-gray-500 mb-4'>
            To change who holds this asset, use Allocate, Deallocate or Transfer
            — those record an approved custody change.
          </p>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Warehouse Location
              </label>
              <Input
                value={locationForm.warehouseLocation || ''}
                onChange={e =>
                  setLocationForm(prev => ({
                    ...prev,
                    warehouseLocation: e.target.value,
                  }))
                }
                placeholder='e.g. Main Warehouse'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Storage Location
              </label>
              <Input
                value={locationForm.storageLocation || ''}
                onChange={e =>
                  setLocationForm(prev => ({
                    ...prev,
                    storageLocation: e.target.value,
                  }))
                }
                placeholder='e.g. Rack B, Shelf 3'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Bin Number
              </label>
              <Input
                value={locationForm.binNumber || ''}
                onChange={e =>
                  setLocationForm(prev => ({
                    ...prev,
                    binNumber: e.target.value,
                  }))
                }
                placeholder='e.g. B-014'
              />
            </div>
            <div className='flex justify-end gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() => setShowLocationDialog(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleSaveLocation}
                disabled={updateMutation.isPending}
                className='px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}

      {/* Asset Information Edit Dialog */}
      {showIdentityDialog && (
        <DialogOverlay onClose={() => setShowIdentityDialog(false)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-1'>
            Edit Asset Information
          </h3>
          <p className='text-sm text-gray-500 mb-4'>
            Item, category and manufacturer come from the GRN and cannot be
            changed here without breaking the procurement lineage.
          </p>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Serial Number
              </label>
              <Input
                value={identityForm.serialNumber || ''}
                onChange={e =>
                  setIdentityForm(prev => ({
                    ...prev,
                    serialNumber: e.target.value,
                  }))
                }
                placeholder='Manufacturer serial number'
              />
            </div>
            <div className='flex justify-end gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() => setShowIdentityDialog(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleSaveIdentity}
                disabled={updateMutation.isPending}
                className='px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}
    </div>
  );
};

// Audit-verify + report-lost/stolen actions (shared by the in-store and in-use blocks)
const AuditAndMissingActions: React.FC<{
  onAudit: () => void;
  onMissing: (type: 'LOST' | 'STOLEN') => void;
  auditing: boolean;
}> = ({ onAudit, onMissing, auditing }) => (
  <>
    <button
      onClick={onAudit}
      disabled={auditing}
      className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors'
    >
      <ClipboardCheck className='h-4 w-4' />
      Verify (Audit)
    </button>
    <div className='grid grid-cols-2 gap-2'>
      <button
        onClick={() => onMissing('LOST')}
        className='flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors'
      >
        <Search className='h-4 w-4' />
        Lost
      </button>
      <button
        onClick={() => onMissing('STOLEN')}
        className='flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors'
      >
        <AlertTriangle className='h-4 w-4' />
        Stolen
      </button>
    </div>
  </>
);

// Reusable info row
const InfoRow: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <div className='flex flex-col'>
    <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
      {label}
    </span>
    <span className='text-sm text-gray-900 mt-0.5'>{value || '-'}</span>
  </div>
);

// Contract date row with an expiry badge
const ContractRow: React.FC<{ label: string; date?: string | null }> = ({
  label,
  date,
}) => {
  const days = date
    ? Math.ceil(
        (new Date(date).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000
      )
    : null;
  const badge =
    days === null
      ? null
      : days < 0
        ? { cls: 'bg-red-100 text-red-700', text: `Expired ${-days}d ago` }
        : days <= 30
          ? {
              cls: 'bg-amber-100 text-amber-700',
              text: days === 0 ? 'Expires today' : `${days}d left`,
            }
          : { cls: 'bg-green-100 text-green-700', text: `${days}d left` };
  return (
    <div className='flex flex-col'>
      <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
        {label}
      </span>
      <span className='text-sm text-gray-900 mt-0.5 flex items-center'>
        {date ? new Date(date).toLocaleDateString() : '-'}
        {badge && (
          <span
            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${badge.cls}`}
          >
            {badge.text}
          </span>
        )}
      </span>
    </div>
  );
};

// Reusable dialog overlay
const DialogOverlay: React.FC<{
  children: React.ReactNode;
  onClose: () => void;
}> = ({ children, onClose }) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center'>
    <div className='fixed inset-0 bg-black/50' onClick={onClose} />
    <div className='relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
      <button
        onClick={onClose}
        className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
      >
        <X className='h-5 w-5' />
      </button>
      {children}
    </div>
  </div>
);

export default AssetDetailPage;
