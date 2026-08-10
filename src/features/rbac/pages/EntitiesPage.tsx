import React, { useEffect, useState } from 'react';
import { Building2, Plus, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  RbacAdminService,
  type OrgEntity,
} from '../services/rbacAdmin.service';

const ENTITY_TYPES = ['PLANT', 'LEGAL_ENTITY', 'WAREHOUSE', 'OFFICE'];

const emptyForm = {
  entityCode: '',
  entityName: '',
  entityType: 'PLANT',
  gstin: '',
  addressLine1: '',
  addressLine2: '',
  pincode: '',
  isActive: true,
};

/**
 * Self-service entity (plant) administration. Entities are the data-
 * segregation dimension: role assignments and documents are scoped to them.
 */
const EntitiesPage: React.FC = () => {
  const [entities, setEntities] = useState<OrgEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OrgEntity | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      setEntities(await RbacAdminService.listEntities());
    } catch {
      toast.error('Failed to load entities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (entity: OrgEntity) => {
    setEditing(entity);
    setForm({
      entityCode: entity.entityCode,
      entityName: entity.entityName,
      entityType: entity.entityType || 'PLANT',
      gstin: entity.gstin || '',
      addressLine1: entity.addressLine1 || '',
      addressLine2: entity.addressLine2 || '',
      pincode: entity.pincode || '',
      isActive: entity.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.entityCode.trim() || !form.entityName.trim()) {
      toast.error('Code and name are required');
      return;
    }
    setIsSaving(true);
    try {
      if (editing) {
        await RbacAdminService.updateEntity(editing.id, {
          ...form,
          gstin: form.gstin || null,
          addressLine1: form.addressLine1 || null,
          addressLine2: form.addressLine2 || null,
          pincode: form.pincode || null,
        });
        toast.success('Entity updated');
      } else {
        await RbacAdminService.createEntity({
          ...form,
          gstin: form.gstin || null,
          addressLine1: form.addressLine1 || null,
          addressLine2: form.addressLine2 || null,
          pincode: form.pincode || null,
        });
        toast.success('Entity created');
      }
      setShowForm(false);
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save entity');
    } finally {
      setIsSaving(false);
    }
  };

  const input =
    'w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500';

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      <div className='mb-6 flex items-start justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>Entities</h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            Plants, legal entities and warehouses — data access and new
            documents are scoped to these
          </p>
        </div>
        <button
          onClick={openCreate}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
        >
          <Plus size={15} />
          Add Entity
        </button>
      </div>

      {showForm && (
        <div className='bg-white rounded-lg border border-gray-200 p-5 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-sm font-semibold text-gray-900'>
              {editing ? `Edit ${editing.entityCode}` : 'New Entity'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className='p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Code *
              </label>
              <input
                type='text'
                className={input}
                placeholder='e.g. CHN-PLANT1'
                value={form.entityCode}
                disabled={!!editing}
                onChange={e => setForm({ ...form, entityCode: e.target.value })}
              />
              {editing && (
                <p className='text-xs text-gray-400 mt-1'>
                  Codes are permanent once created
                </p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Name *
              </label>
              <input
                type='text'
                className={input}
                placeholder='e.g. Chennai Plant 1'
                value={form.entityName}
                onChange={e => setForm({ ...form, entityName: e.target.value })}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Type
              </label>
              <select
                className={input}
                value={form.entityType}
                onChange={e => setForm({ ...form, entityType: e.target.value })}
              >
                {ENTITY_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                GSTIN
              </label>
              <input
                type='text'
                className={input}
                maxLength={15}
                value={form.gstin}
                onChange={e => setForm({ ...form, gstin: e.target.value })}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Address Line 1
              </label>
              <input
                type='text'
                className={input}
                value={form.addressLine1}
                onChange={e =>
                  setForm({ ...form, addressLine1: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Pincode
              </label>
              <input
                type='text'
                className={input}
                maxLength={10}
                value={form.pincode}
                onChange={e => setForm({ ...form, pincode: e.target.value })}
              />
            </div>
            <div className='flex items-center gap-2 pt-6'>
              <input
                id='entity-active'
                type='checkbox'
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className='w-4 h-4 text-violet-600 rounded border-gray-300'
              />
              <label htmlFor='entity-active' className='text-sm text-gray-700'>
                Active
              </label>
            </div>
          </div>
          <div className='mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3'>
            <button
              onClick={() => setShowForm(false)}
              className='px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className='px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:opacity-50'
            >
              {isSaving ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
            </div>
          ) : entities.length > 0 ? (
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Code
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Name
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Type
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    GSTIN
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Status
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {entities.map(entity => (
                  <tr key={entity.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3.5 text-sm font-medium text-violet-600'>
                      {entity.entityCode}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-900'>
                      {entity.entityName}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {(entity.entityType || '').replace('_', ' ')}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {entity.gstin || '--'}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                          entity.isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        {entity.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-4 py-3.5'>
                      <button
                        onClick={() => openEdit(entity)}
                        className='p-1.5 rounded-lg text-gray-500 hover:text-violet-600 hover:bg-violet-50'
                        title='Edit'
                      >
                        <Pencil className='w-4 h-4' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                <Building2 className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-gray-600 font-medium'>No entities yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntitiesPage;
