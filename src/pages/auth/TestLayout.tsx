import React from 'react';

export function TestLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Half - Form Section */}
      <div className="w-full lg:w-1/2 bg-red-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Left Side - Form Area</h1>
          <p>This should be 50% width on large screens</p>
        </div>
      </div>
      
      {/* Right Half - Info Section */}
      <div className="hidden lg:block lg:w-1/2 bg-blue-100">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Right Side - Company Info</h1>
            <p>This should be 50% width on large screens</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestLayout;