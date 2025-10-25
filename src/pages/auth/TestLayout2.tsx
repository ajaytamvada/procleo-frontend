import React from 'react';

export function TestLayout2() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'row',
      margin: 0,
      padding: 0
    }}>
      {/* Left Half - Form Section */}
      <div style={{
        width: '50%',
        minHeight: '100vh',
        backgroundColor: '#FEE2E2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Left Side - Form Area</h1>
          <p>This should be exactly 50% width</p>
        </div>
      </div>
      
      {/* Right Half - Info Section */}
      <div style={{
        width: '50%',
        minHeight: '100vh',
        backgroundColor: '#DBEAFE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Right Side - Company Info</h1>
          <p>This should be exactly 50% width</p>
        </div>
      </div>
    </div>
  );
}

export default TestLayout2;