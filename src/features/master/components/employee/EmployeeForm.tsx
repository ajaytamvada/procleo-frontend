import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Employee } from '../../hooks/useEmployeeAPI';
import { useCreateEmployee, useUpdateEmployee } from '../../hooks/useEmployeeAPI';
import { useDepartmentsList } from '../../hooks/useDepartmentAPI';
import { useDesignations } from '../../hooks/useDesignationAPI';
import { useLocations } from '../../hooks/useLocationAPI';
import { useWorkingEmployees } from '../../hooks/useEmployeeAPI';

interface EmployeeFormProps {
  employee?: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [designationId, setDesignationId] = useState<number | ''>('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [locationId, setLocationId] = useState<number | ''>('');
  const [reportingManagerId, setReportingManagerId] = useState<number | ''>('');
  const [employeeType, setEmployeeType] = useState('');
  const [status, setStatus] = useState('');

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const { data: departments = [], isLoading: loadingDepartments } = useDepartmentsList();
  const { data: designations = [], isLoading: loadingDesignations } = useDesignations();
  const { data: locations = [], isLoading: loadingLocations } = useLocations();
  const { data: employees = [], isLoading: loadingEmployees } = useWorkingEmployees();

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setCode(employee.code || '');
      setEmail(employee.email || '');
      setContactNumber(employee.contactNumber || '');
      setDesignationId(employee.designationId || '');
      setDepartmentId(employee.departmentId || '');
      setLocationId(employee.locationId || '');
      setReportingManagerId(employee.reportingManagerId || '');
      setEmployeeType(employee.employeeType || '');
      setStatus(employee.status || '');
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      locationId: locationId || undefined,
      reportingManagerId: reportingManagerId || undefined,
      employeeType,
      status,
    };

    try {
      if (employee?.id) {
        await updateMutation.mutateAsync({ id: employee.id, employee: employeeData });
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

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    loadingDepartments ||
    loadingDesignations ||
    loadingLocations ||
    loadingEmployees;

  // Filter out current employee from reporting managers list
  const reportingManagers = employee?.id
    ? employees.filter((emp) => emp.id !== employee.id)
    : employees;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Employee Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                maxLength={100}
                disabled={isLoading}
              />
            </div>

            {/* Employee Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Employee Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                maxLength={50}
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                maxLength={100}
                disabled={isLoading}
              />
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <input
                type="text"
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={10}
                disabled={isLoading}
              />
            </div>

            {/* Designation */}
            <div>
              <label htmlFor="designationId" className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              <select
                id="designationId"
                value={designationId}
                onChange={(e) => setDesignationId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || loadingDesignations}
              >
                <option value="">Select Designation</option>
                {designations.map((designation) => (
                  <option key={designation.id} value={designation.id}>
                    {designation.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                id="departmentId"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || loadingDepartments}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                id="locationId"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || loadingLocations}
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reporting Manager */}
            <div>
              <label htmlFor="reportingManagerId" className="block text-sm font-medium text-gray-700 mb-2">
                Reporting Manager
              </label>
              <select
                id="reportingManagerId"
                value={reportingManagerId}
                onChange={(e) => setReportingManagerId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || loadingEmployees}
              >
                <option value="">Select Reporting Manager</option>
                {reportingManagers.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Type */}
            <div>
              <label htmlFor="employeeType" className="block text-sm font-medium text-gray-700 mb-2">
                Employee Type <span className="text-red-500">*</span>
              </label>
              <select
                id="employeeType"
                value={employeeType}
                onChange={(e) => setEmployeeType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              >
                <option value="">Select Employee Type</option>
                <option value="Employee">Employee</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              >
                <option value="">Select Status</option>
                <option value="Working">Working</option>
                <option value="Non Working">Non Working</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : employee ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
