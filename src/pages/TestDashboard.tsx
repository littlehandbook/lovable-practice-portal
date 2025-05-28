
import React from 'react';
import { MicroserviceTestDashboard } from '@/components/MicroserviceTestDashboard';

const TestDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Microservice Test Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Test and verify microservice connections across your application
          </p>
        </div>
      </div>
      <MicroserviceTestDashboard />
    </div>
  );
};

export default TestDashboard;
