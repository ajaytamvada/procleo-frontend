import React from 'react';

// Simple test component to verify basic functionality
const CompanyFormTest: React.FC = () => {
  return (
    <div className='p-4'>
      <h2>Company Form Test</h2>
      <p>If you can see this, the basic React component rendering works.</p>

      <form className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Company Name
          </label>
          <input
            type='text'
            className='w-full px-3 py-2 border border-gray-300 rounded-md'
            placeholder='Test input'
          />
        </div>

        <button
          type='button'
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
        >
          Test Button
        </button>
      </form>
    </div>
  );
};

export default CompanyFormTest;
