
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Play, RefreshCw } from 'lucide-react';
import { MicroserviceTestRunner, TestSection, TestResult } from '@/utils/testScript';

export function MicroserviceTestDashboard() {
  const [testResults, setTestResults] = useState<TestSection[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const runTests = async () => {
    setIsRunning(true);
    try {
      const runner = new MicroserviceTestRunner();
      const results = await runner.runAllTests();
      setTestResults(results);
      runner.printResults(); // Also log to console
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleSection = (sectionName: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionName)) {
      newOpenSections.delete(sectionName);
    } else {
      newOpenSections.add(sectionName);
    }
    setOpenSections(newOpenSections);
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pass: 'default' as const,
      pending: 'secondary' as const,
      not_implemented: 'outline' as const,
      fail: 'destructive' as const
    };

    const labels = {
      pass: 'Working',
      pending: 'Pending',
      not_implemented: 'Not Implemented',
      fail: 'Failed'
    };

    return (
      <Badge variant={variants[status]} className="ml-2">
        {labels[status]}
      </Badge>
    );
  };

  const getSummary = () => {
    const allTests = testResults.flatMap(section => section.tests);
    return {
      total: allTests.length,
      working: allTests.filter(t => t.status === 'pass').length,
      pending: allTests.filter(t => t.status === 'pending').length,
      notImplemented: allTests.filter(t => t.status === 'not_implemented').length,
      failed: allTests.filter(t => t.status === 'fail').length
    };
  };

  const summary = testResults.length > 0 ? getSummary() : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Microservice Test Dashboard
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This dashboard tests all microservice connections in your application. 
            Use this to identify which services are working and which need implementation.
          </p>
          
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                <div className="text-sm text-gray-500">Total Tests</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{summary.working}</div>
                <div className="text-sm text-gray-500">Working</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{summary.notImplemented}</div>
                <div className="text-sm text-gray-500">Not Implemented</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {testResults.map((section, index) => (
        <Card key={index}>
          <Collapsible
            open={openSections.has(section.section)}
            onOpenChange={() => toggleSection(section.section)}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    {openSections.has(section.section) ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    {section.section}
                  </div>
                  <div className="flex space-x-2">
                    {section.tests.map((test, testIndex) => (
                      <div key={testIndex} className="w-3 h-3 rounded-full" style={{
                        backgroundColor: test.status === 'pass' ? '#22c55e' :
                                        test.status === 'pending' ? '#eab308' :
                                        test.status === 'not_implemented' ? '#6b7280' : '#ef4444'
                      }} />
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  {section.tests.map((test, testIndex) => (
                    <div key={testIndex} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{test.feature}</h4>
                        {getStatusBadge(test.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{test.message}</p>
                      {test.error && (
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <p className="text-sm text-red-700">
                            <strong>Error:</strong> {test.error}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}

      {testResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">No test results yet. Click "Run All Tests" to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
