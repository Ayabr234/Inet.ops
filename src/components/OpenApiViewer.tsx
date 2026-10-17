import React, { useState } from 'react';
import { phase2Architecture } from '../data/phase2Data';
import { CodeBlock } from './CodeBlock';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';

export const OpenApiViewer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/sites');
  const [selectedMethod, setSelectedMethod] = useState<string>('post');
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const paths = phase2Architecture.openApiSpec.paths as Record<string, Record<string, any>>;
  const currentPathData = paths[selectedEndpoint] || {};
  const currentOperation = currentPathData[selectedMethod] || Object.values(currentPathData)[0] || {};

  const handleSimulateCall = () => {
    let mockResponse = {};
    if (selectedEndpoint === '/api/v1/sites' && selectedMethod === 'post') {
      mockResponse = {
        status: 201,
        message: 'Tenant site provisioned successfully',
        site: {
          id: 'site-test-99',
          domain: 'civic-news.org',
          runtime: 'static-caddy',
          port: 8099,
          cgroups: {
            memoryMax: '256M',
            cpuShares: 512,
            pidsMax: 64
          },
          dns: {
            record: 'civic-news.org 300 IN A 198.51.100.42'
          },
          tls: {
            status: 'issuing',
            provider: 'Let\'s Encrypt ACME'
          }
        }
      };
    } else if (selectedEndpoint === '/api/v1/certificates/ask') {
      mockResponse = {
        status: 200,
        authorized: true,
        domain: 'civic-news.org',
        rateLimitRemaining: 98
      };
    } else if (selectedEndpoint === '/api/v1/health') {
      mockResponse = {
        status: 200,
        node: {
          uptimeSeconds: 849201,
          caddy: 'nominal',
          coredns: 'nominal',
          activeSandboxes: 4,
          memoryUsedMb: 1240,
          memoryTotalMb: 8192
        }
      };
    } else {
      mockResponse = {
        status: 200,
        data: 'Simulation completed'
      };
    }
    setTestResult(JSON.stringify(mockResponse, null, 2));
  };

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-2xs">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider">
            OpenAPI 3.1.0 Specification
          </span>
          <span className="text-neutral-400">·</span>
          <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
            inet.org Node Agent & Control Plane
          </span>
        </div>

        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          {showRawJson ? 'Show Interactive Explorer' : 'View Full Raw Spec (JSON)'}
        </button>
      </div>

      {showRawJson ? (
        <div className="p-4">
          <CodeBlock
            code={JSON.stringify(phase2Architecture.openApiSpec, null, 2)}
            language="json"
            filename="openapi.json"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
          {/* Endpoint Sidebar */}
          <div className="lg:col-span-4 border-r border-neutral-200 dark:border-neutral-800 p-3 space-y-1 overflow-y-auto">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1 block">
              Control Plane Endpoints
            </span>
            {Object.entries(paths).map(([path, methods]) => {
              return Object.keys(methods).map((method) => {
                const isSelected = selectedEndpoint === path && selectedMethod === method;
                return (
                  <button
                    key={`${path}-${method}`}
                    onClick={() => {
                      setSelectedEndpoint(path);
                      setSelectedMethod(method);
                      setTestResult(null);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          method === 'get'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : method === 'post'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {method}
                      </span>
                      <span className="font-mono text-[11px] truncate">{path}</span>
                    </div>
                    {isSelected ? (
                      <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                    )}
                  </button>
                );
              });
            })}
          </div>

          {/* Endpoint Details View */}
          <div className="lg:col-span-8 p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold uppercase text-neutral-500">
                  {selectedMethod}
                </span>
                <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                  {selectedEndpoint}
                </span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">
                {currentOperation.summary || 'Endpoint Details'}
              </p>
              {currentOperation.description && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  {currentOperation.description}
                </p>
              )}
            </div>

            {/* Request Schema if available */}
            {currentOperation.requestBody && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Request Payload (application/json):
                </span>
                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-xs">
                  <pre className="text-neutral-700 dark:text-neutral-300 overflow-x-auto">
                    {JSON.stringify(
                      currentOperation.requestBody.content?.['application/json']?.schema?.properties || {},
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            )}

            {/* Responses */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Responses:
              </span>
              <div className="space-y-1.5">
                {Object.entries(currentOperation.responses || {}).map(([code, resp]: any) => (
                  <div
                    key={code}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800 text-xs"
                  >
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {code}
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-300">
                      {resp.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Try Out Simulation Button */}
            <div className="pt-2">
              <button
                onClick={handleSimulateCall}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
              >
                Simulate Agent Response
              </button>
            </div>

            {testResult && (
              <div className="space-y-1 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Mock Response Received (HTTP 200/201)</span>
                </div>
                <CodeBlock code={testResult} language="json" filename="response.json" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
