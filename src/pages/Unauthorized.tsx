import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <p className="text-gray-500">
            If you believe this is an error, please contact your administrator or try logging in with a different account.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/dashboard">
            <Button className="w-full" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </Link>
          
          <Link to="/settings">
            <Button variant="outline" className="w-full" size="lg">
              Contact Administrator
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Error Code: 403 - Forbidden</p>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;