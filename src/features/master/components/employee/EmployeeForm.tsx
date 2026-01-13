import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Briefcase, Phone, Building2 } from 'lucide-react';
import type { Employee } from '../../hooks/useEmployeeAPI';
import {
  useCreateEmployee,
  useUpdateEmployee,
} from '../../hooks/useEmployeeAPI';
import { useDepartmentsList } from '../../hooks/useDepartmentAPI';
import { useDesignations } from '../../hooks/useDesignationAPI';
import { useStates } from '../../hooks/useStateAPI';
import { useWorkingEmployees } from '../../hooks/useEmployeeAPI';

interface EmployeeFormProps {
  employee?: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [designationId, setDesignationId] = useState<number | ''>('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [stateId, setStateId] = useState<number | ''>('');
  const [reportingManagerId, setReportingManagerId] = useState<number | ''>('');
  const [employeeType, setEmployeeType] = useState('');
  const [status, setStatus] = useState('');

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const { data: departments = [], isLoading: loadingDepartments } =
    useDepartmentsList();
  const { data: designations = [], isLoading: loadingDesignations } =
    useDesignations();
  const { data: states = [], isLoading: loadingStates } = useStates();
  const { data: employees = [], isLoading: loadingEmployees } =
    useWorkingEmployees();

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setCode(employee.code || '');
      setEmail(employee.email || '');
      setContactNumber(employee.contactNumber || '');
      setDesignationId(employee.designationId || '');
      setDepartmentId(employee.departmentId || '');
      setStateId(employee.stateId || '');
      setReportingManagerId(employee.reportingManagerId || '');
      setEmployeeType(employee.employeeType || '');
      setStatus(employee.status || '');
    }
  }, [employee]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validation
    if (!name.trim()) {
      alert('Employee name is required');
      return;
    }
    if (!code.trim()) {
      alert('Employee code is required');
      return;
    }
    if (!email.trim()) {
      alert('Email is required');
      return;
    }
    if (!employeeType) {
      alert('Employee type is required');
      return;
    }
    if (!status) {
      alert('Status is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    const employeeData: Employee = {
      name: name.trim(),
      code: code.trim(),
      email: email.trim(),
      contactNumber: contactNumber.trim() || undefined,
      designationId: designationId || undefined,
      departmentId: departmentId || undefined,
      stateId: stateId || undefined,
      reportingManagerId: reportingManagerId || undefined,
      employeeType,
      status,
    };

    try {
      if (employee?.id) {
        await updateMutation.mutateAsync({
          id: employee.id,
          employee: employeeData,
        });
        alert('Employee updated successfully!');
      } else {
        await createMutation.mutateAsync(employeeData);
        alert('Employee created successfully!');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'An error occurred';
      alert(errorMessage);
    }
  };

  const handleReset = () => {
    if (employee) {
      setName(employee.name || '');
      setCode(employee.code || '');
      setEmail(employee.email || '');
      setContactNumber(employee.contactNumber || '');
      setDesignationId(employee.designationId || '');
      setDepartmentId(employee.departmentId || '');
      setStateId(employee.stateId || '');
      setReportingManagerId(employee.reportingManagerId || '');
      setEmployeeType(employee.employeeType || '');
      setStatus(employee.status || '');
    } else {
      setName('');
      setCode('');
      setEmail('');
      setContactNumber('');
      setDesignationId('');
      setDepartmentId('');
      setStateId('');
      setReportingManagerId('');
      setEmployeeType('');
      setStatus('');
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    loadingDepartments ||
    loadingDesignations ||
    loadingStates ||
    loadingEmployees;

  // Filter out current employee from reporting managers list
  const reportingManagers = employee?.id
    ? employees.filter(emp => emp.id !== employee.id)
    : employees;

  const inputClassName =
    'w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500';

  const selectClassName =
    'w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500';

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <button
            onClick={onClose}
            className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              {employee ? 'Edit Employee' : 'Add New Employee'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {employee
                ? 'Update employee information'
                : 'Add a new employee to the system'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={handleReset}
            className='px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors'
            disabled={isLoading}
          >
            Reset
          </button>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors'
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit()}
            className='px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isLoading}
          >
            {isLoading
              ? 'Saving...'
              : employee
                ? 'Update Employee'
                : 'Create Employee'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='bg-[#fafbfc] px-5 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-2'>
              <User size={16} className='text-violet-600' />
              <h3 className='text-base font-semibold text-gray-900'>
                Basic Information
              </h3>
            </div>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Employee Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={e => setName(e.target.value.toUpperCase())}
                  className={inputClassName}
                  placeholder='Enter employee name'
                  maxLength={100}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Employee Code <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className={inputClassName}
                  placeholder='Enter employee code'
                  maxLength={50}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='bg-[#fafbfc] px-5 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-2'>
              <Phone size={16} className='text-violet-600' />
              <h3 className='text-base font-semibold text-gray-900'>
                Contact Information
              </h3>
            </div>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClassName}
                  placeholder='Enter email address'
                  maxLength={100}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Contact Number
                </label>
                <input
                  type='text'
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  className={inputClassName}
                  placeholder='Enter contact number'
                  maxLength={10}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Organization Details */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='bg-[#fafbfc] px-5 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-2'>
              <Building2 size={16} className='text-violet-600' />
              <h3 className='text-base font-semibold text-gray-900'>
                Organization Details
              </h3>
            </div>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Designation
                </label>
                <select
                  value={designationId}
                  onChange={e =>
                    setDesignationId(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                  className={selectClassName}
                  disabled={isLoading || loadingDesignations}
                >
                  <option value=''>Select Designation</option>
                  {designations.map(designation => (
                    <option key={designation.id} value={designation.id}>
                      {designation.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Department
                </label>
                <select
                  value={departmentId}
                  onChange={e =>
                    setDepartmentId(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                  className={selectClassName}
                  disabled={isLoading || loadingDepartments}
                >
                  <option value=''>Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  State
                </label>
                <select
                  value={stateId}
                  onChange={e =>
                    setStateId(e.target.value ? Number(e.target.value) : '')
                  }
                  className={selectClassName}
                  disabled={isLoading || loadingStates}
                >
                  <option value=''>Select State</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Reporting Manager
                </label>
                <select
                  value={reportingManagerId}
                  onChange={e =>
                    setReportingManagerId(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                  className={selectClassName}
                  disabled={isLoading || loadingEmployees}
                >
                  <option value=''>Select Reporting Manager</option>
                  {reportingManagers.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='bg-[#fafbfc] px-5 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-2'>
              <Briefcase size={16} className='text-violet-600' />
              <h3 className='text-base font-semibold text-gray-900'>
                Employment Details
              </h3>
            </div>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Employee Type <span className='text-red-500'>*</span>
                </label>
                <select
                  value={employeeType}
                  onChange={e => setEmployeeType(e.target.value)}
                  className={selectClassName}
                  disabled={isLoading}
                >
                  <option value=''>Select Employee Type</option>
                  <option value='Employee'>Employee</option>
                  <option value='Contract'>Contract</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Status <span className='text-red-500'>*</span>
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className={selectClassName}
                  disabled={isLoading}
                >
                  <option value=''>Select Status</option>
                  <option value='Working'>Working</option>
                  <option value='Non Working'>Non Working</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
