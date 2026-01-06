import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import EmployeeList from './EmployeeList';
import EmployeeForm from './EmployeeForm';
import ExcelImportDialog from '@/components/ExcelImportDialog';
import type { Employee } from '../../hooks/useEmployeeAPI';

const EmployeePage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const handleAdd = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  // Show form view
  if (showForm) {
    return (
      <EmployeeForm
        employee={selectedEmployee}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
      />
    );
  }

  // Show list view
  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>
            Employee Master
          </h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            Manage employee records and information
          </p>
        </div>
        <button
          onClick={handleAdd}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
        >
          <Plus size={15} />
          Add Employee
        </button>
      </div>

      {/* Employee List */}
      <EmployeeList
        onEdit={handleEdit}
        onImport={() => setShowImportDialog(true)}
      />

      {/* Excel Import Dialog */}
      <ExcelImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        entityName='Employee'
        importEndpoint='/master/employees/import'
        templateEndpoint='/master/employees/template'
        onImportSuccess={() => {}}
      />
    </div>
  );
};

export default EmployeePage;
