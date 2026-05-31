'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Loader2, Play, RefreshCw } from 'lucide-react';
import { testAdminEndpoint, checkAdminAuth, type TestResult } from '@/lib/test-api';

interface EndpointTest {
  name: string;
  endpoint: string;
  method?: string;
  description: string;
}

const COMING_SOON_ENDPOINTS: EndpointTest[] = [
  {
    name: 'Overview',
    endpoint: '/api/v1/admin/coming-soon-analytics/overview',
    description: 'Get overview metrics (sessions, messages, waitlist)',
  },
  {
    name: 'Chat Sessions',
    endpoint: '/api/v1/admin/coming-soon-analytics/sessions?page=1&pageSize=5',
    description: 'Get paginated list of chat sessions',
  },
  {
    name: 'Waitlist Entries',
    endpoint: '/api/v1/admin/coming-soon-analytics/waitlist/entries?page=1&pageSize=5',
    description: 'Get paginated list of waitlist signups',
  },
  {
    name: 'AI Usage',
    endpoint: '/api/v1/admin/coming-soon-analytics/ai-usage',
    description: 'Get AI token usage and costs',
  },
  {
    name: 'Intent Distribution',
    endpoint: '/api/v1/admin/coming-soon-analytics/intents',
    description: 'Get detected intent distribution',
  },
  {
    name: 'Conversion Funnel',
    endpoint: '/api/v1/admin/coming-soon-analytics/funnel',
    description: 'Get conversion funnel metrics',
  },
];

export default function APITestPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<{ hasToken: boolean; hasUser: boolean } | null>(null);

  const checkAuth = () => {
    const status = checkAdminAuth();
    setAuthStatus(status);
  };

  const testEndpoint = async (test: EndpointTest) => {
    setTesting(test.name);
    const result = await testAdminEndpoint(test.endpoint, { method: test.method || 'GET' });
    setResults(prev => ({ ...prev, [test.name]: result }));
    setTesting(null);
  };

  const testAll = async () => {
    setTesting('all');
    const newResults: Record<string, TestResult> = {};
    
    for (const test of COMING_SOON_ENDPOINTS) {
      const result = await testAdminEndpoint(test.endpoint, { method: test.method || 'GET' });
      newResults[test.name] = result;
    }
    
    setResults(newResults);
    setTesting(null);
  };

  const clearResults = () => {
    setResults({});
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-admin-foreground">API Testing Console</h1>
          <p className="text-admin-muted-foreground mt-1">
            Test Coming Soon Analytics API endpoints
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkAuth}
            className="border-admin-border text-admin-foreground hover:bg-admin-muted"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Auth
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearResults}
            className="border-admin-border text-admin-foreground hover:bg-admin-muted"
          >
            Clear Results
          </Button>
          <Button
            size="sm"
            onClick={testAll}
            disabled={testing === 'all'}
            className="bg-[#FF6900] hover:bg-orange-600 text-white"
          >
            {testing === 'all' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Test All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Auth Status */}
      {authStatus && (
        <Alert className={authStatus.hasToken ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}>
          <AlertDescription className="flex items-center gap-2">
            {authStatus.hasToken ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-green-400">Authenticated - Token found in localStorage</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-400">Not authenticated - Please log in at /admin/login</span>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Endpoints */}
      <div className="grid gap-4">
        {COMING_SOON_ENDPOINTS.map((test) => {
          const result = results[test.name];
          const isLoading = testing === test.name;

          return (
            <Card key={test.name} className="bg-admin-card border-admin-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-admin-foreground">{test.name}</CardTitle>
                      {result && (
                        <Badge
                          variant="outline"
                          className={
                            result.success
                              ? 'border-green-500/30 bg-green-500/10 text-green-400'
                              : 'border-red-500/30 bg-red-500/10 text-red-400'
                          }
                        >
                          {result.success ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {result.status}
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              {result.status || 'Error'}
                            </>
                          )}
                        </Badge>
                      )}
                      {result && (
                        <Badge variant="outline" className="border-admin-border text-admin-muted-foreground">
                          {result.duration.toFixed(0)}ms
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-admin-muted-foreground mt-1">
                      {test.description}
                    </CardDescription>
                    <code className="text-xs text-admin-muted-foreground mt-2 block">
                      {test.method || 'GET'} {test.endpoint}
                    </code>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testEndpoint(test)}
                    disabled={isLoading}
                    className="border-admin-border text-admin-foreground hover:bg-admin-muted"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {result && (
                <CardContent>
                  <Tabs defaultValue="data" className="w-full">
                    <TabsList className="bg-admin-muted">
                      <TabsTrigger value="data">Response Data</TabsTrigger>
                      <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                    </TabsList>
                    <TabsContent value="data" className="mt-4">
                      {result.success ? (
                        <div className="space-y-2">
                          {result.data && typeof result.data === 'object' && result.data !== null && !Array.isArray(result.data) ? (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {Object.entries(result.data as Record<string, unknown>).slice(0, 10).map(([key, value]) => (
                                <div key={key} className="flex justify-between p-2 bg-admin-muted rounded">
                                  <span className="text-admin-muted-foreground">{key}:</span>
                                  <span className="text-admin-foreground font-mono">
                                    {typeof value === 'object' ? JSON.stringify(value).substring(0, 50) + '...' : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <Alert className="border-red-500/30 bg-red-500/10">
                          <AlertDescription className="text-red-400">
                            <pre className="text-xs overflow-auto">{JSON.stringify(result.error, null, 2)}</pre>
                          </AlertDescription>
                        </Alert>
                      )}
                    </TabsContent>
                    <TabsContent value="raw" className="mt-4">
                      <pre className="text-xs bg-admin-muted p-4 rounded overflow-auto max-h-96 text-admin-foreground">
                        {JSON.stringify(result.success ? result.data : result.error, null, 2)}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
