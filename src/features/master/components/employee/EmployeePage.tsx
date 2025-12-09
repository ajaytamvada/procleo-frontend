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

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Employee Master</h1>
          <p className='text-sm text-gray-600 mt-1'>
            Manage employee records and information
          </p>
        </div>
        <button
          onClick={handleAdd}
          className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm'
        >
          <Plus size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Employee List */}
      <EmployeeList
        onEdit={handleEdit}
        onImport={() => setShowImportDialog(true)}
      />

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeForm
          employee={selectedEmployee}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}

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
