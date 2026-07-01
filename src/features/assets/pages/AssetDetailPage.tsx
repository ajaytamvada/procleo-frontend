import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  FileText,
  Wrench,
  ArrowRightLeft,
  Trash2,
  Download,
  Upload,
  Printer,
  QrCode,
  Barcode,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useAssetById,
  useInstallAsset,
  useUninstallAsset,
  useDisposeAsset,
  useCreateTransfer,
  useCreateMaintenance,
  useMaintenanceByAsset,
  useTransfersByAsset,
} from '../hooks/useAssets';
import type {
  InstallAssetRequest,
  CreateTransferRequest,
  CreateMaintenanceRequest,
  DisposeAssetRequest,
  AssetMaintenance,
  AssetTransfer,
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

const AssetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const assetId = id ? parseInt(id) : 0;

  const { data: asset, isLoading } = useAssetById(assetId || null);
  const { data: maintenanceHistory = [] } = useMaintenanceByAsset(assetId);
  const { data: transferHistory = [] } = useTransfersByAsset(assetId);

  const { data: employees = [], isLoading: employeesLoading } =
    useWorkingEmployees();
  const { data: departments = [], isLoading: departmentsLoading } =
    useDepartmentsList();
  const { data: locations = [], isLoading: locationsLoading } = useCities();

  const installMutation = useInstallAsset();
  const uninstallMutation = useUninstallAsset();
  const disposeMutation = useDisposeAsset();
  const transferMutation = useCreateTransfer();
  const maintenanceMutation = useCreateMaintenance();

  // Dialog states
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showDisposeDialog, setShowDisposeDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [isPrintingTag, setIsPrintingTag] = useState(false);

  // Install form
  const [installForm, setInstallForm] = useState<InstallAssetRequest>({
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

  // Dispose form
  const [disposeForm, setDisposeForm] = useState<DisposeAssetRequest>({
    disposalMethod: 'SCRAPPED',
    disposalValue: undefined,
    remarks: '',
  });

  const handleInstall = () => {
    if (!assetId || !installForm.employeeId) return;
    installMutation.mutate(
      { id: assetId, data: installForm },
      {
        onSuccess: () => {
          setShowInstallDialog(false);
          setInstallForm({
            employeeId: 0,
            installDate: new Date().toISOString().split('T')[0],
            remarks: '',
          });
        },
      }
    );
  };

  const handleUninstall = () => {
    if (!assetId) return;
    if (
      window.confirm(
        'Are you sure you want to uninstall this asset? It will be returned to store.'
      )
    ) {
      uninstallMutation.mutate(assetId);
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

  const handleDispose = () => {
    if (!assetId) return;
    if (
      window.confirm(
        'Are you sure you want to dispose of this asset? This action cannot be undone.'
      )
    ) {
      disposeMutation.mutate(
        { id: assetId, data: disposeForm },
        {
          onSuccess: () => {
            setShowDisposeDialog(false);
            setDisposeForm({
              disposalMethod: 'SCRAPPED',
              disposalValue: undefined,
              remarks: '',
            });
          },
        }
      );
    }
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
            <h2 className='text-base font-semibold text-gray-900 mb-4 flex items-center gap-2'>
              <Package className='h-5 w-5 text-violet-600' />
              Asset Information
            </h2>
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
            <h2 className='text-base font-semibold text-gray-900 mb-4 flex items-center gap-2'>
              <MapPin className='h-5 w-5 text-violet-600' />
              Location & Assignment
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <InfoRow
                label='Warehouse Location'
                value={asset.warehouseLocation}
              />
              <InfoRow label='Storage Location' value={asset.storageLocation} />
              <InfoRow label='Department' value={asset.departmentName} />
              <InfoRow label='Assigned To' value={asset.assignedToName} />
              <InfoRow
                label='Install Date'
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
                    onClick={() => setShowInstallDialog(true)}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors'
                  >
                    <Download className='h-4 w-4' />
                    Install
                  </button>
                  <button
                    onClick={() => setShowDisposeDialog(true)}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors'
                  >
                    <Trash2 className='h-4 w-4' />
                    Dispose
                  </button>
                </>
              )}
              {(asset.status === AssetStatus.IN_USE ||
                asset.status === AssetStatus.INSTALLED) && (
                <>
                  <button
                    onClick={handleUninstall}
                    disabled={uninstallMutation.isPending}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors'
                  >
                    <Upload className='h-4 w-4' />
                    Uninstall
                  </button>
                  <button
                    onClick={() => setShowTransferDialog(true)}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'
                  >
                    <ArrowRightLeft className='h-4 w-4' />
                    Transfer
                  </button>
                  <button
                    onClick={() => setShowMaintenanceDialog(true)}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors'
                  >
                    <Wrench className='h-4 w-4' />
                    Maintenance
                  </button>
                  <button
                    onClick={() => setShowDisposeDialog(true)}
                    className='w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors'
                  >
                    <Trash2 className='h-4 w-4' />
                    Dispose
                  </button>
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

      {/* Install Dialog */}
      {showInstallDialog && (
        <DialogOverlay onClose={() => setShowInstallDialog(false)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Install Asset
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Assign To Employee
              </label>
              <select
                value={installForm.employeeId || ''}
                onChange={e =>
                  setInstallForm(prev => ({
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
                Install Date
              </label>
              <Input
                type='date'
                value={installForm.installDate || ''}
                onChange={e =>
                  setInstallForm(prev => ({
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
                value={installForm.remarks || ''}
                onChange={e =>
                  setInstallForm(prev => ({ ...prev, remarks: e.target.value }))
                }
                placeholder='Optional remarks'
              />
            </div>
            <div className='flex justify-end gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() => setShowInstallDialog(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleInstall}
                disabled={!installForm.employeeId || installMutation.isPending}
                className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {installMutation.isPending ? 'Installing...' : 'Install'}
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

      {/* Dispose Dialog */}
      {showDisposeDialog && (
        <DialogOverlay onClose={() => setShowDisposeDialog(false)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Dispose Asset
          </h3>
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
                <option value='SOLD'>Sold</option>
                <option value='SCRAPPED'>Scrapped</option>
                <option value='DONATED'>Donated</option>
                <option value='WRITTEN_OFF'>Written Off</option>
              </select>
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
                placeholder='Reason for disposal'
              />
            </div>
            <div className='flex justify-end gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() => setShowDisposeDialog(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleDispose}
                disabled={disposeMutation.isPending}
                className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {disposeMutation.isPending ? 'Disposing...' : 'Dispose Asset'}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}
    </div>
  );
};

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
