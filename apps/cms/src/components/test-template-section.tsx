'use client';

import { useState } from 'react';
import { PlayCircle, Loader2, Copy, Check } from 'lucide-react';

interface TestTemplateSectionProps {
  templateId: string;
  systemPrompt: string;
  userPromptTemplate: string;
  schema: unknown;
}

export function TestTemplateSection({
  templateId,
  systemPrompt,
  userPromptTemplate,
  schema
}: TestTemplateSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState({
    attraction: 'Prague Castle',
    location: 'Prague'
  });
  const [result, setResult] = useState<{ content: unknown; usage?: { promptTokens: number; completionTokens: number; totalTokens: number }; model?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Replace variables in the user prompt
      const processedPrompt = userPromptTemplate
        .replace(/\${attraction}/g, testData.attraction)
        .replace(/\${location}/g, testData.location);

      const response = await fetch('/api/templates/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          systemPrompt,
          userPrompt: processedPrompt,
          schema,
          testData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to test template');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Test Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="attraction" className="block text-sm font-medium text-gray-700">
            Attraction
          </label>
          <input
            type="text"
            id="attraction"
            value={testData.attraction}
            onChange={(e) => setTestData({ ...testData, attraction: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., Prague Castle"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={testData.location}
            onChange={(e) => setTestData({ ...testData, location: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., Prague"
          />
        </div>
      </div>

      {/* Test Button */}
      <button
        onClick={handleTest}
        disabled={isLoading || !systemPrompt || !userPromptTemplate}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <PlayCircle className="h-4 w-4 mr-2" />
            Test Template
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">Generated Content</h4>
              <button
                onClick={() => copyToClipboard(JSON.stringify(result.content, null, 2))}
                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{JSON.stringify(result.content, null, 2)}</code>
              </pre>
            </div>
          </div>

          {result.usage && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Usage Statistics</h4>
              <dl className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Prompt Tokens</dt>
                  <dd className="font-medium text-gray-900">{result.usage.promptTokens}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Completion Tokens</dt>
                  <dd className="font-medium text-gray-900">{result.usage.completionTokens}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Total Tokens</dt>
                  <dd className="font-medium text-gray-900">{result.usage.totalTokens}</dd>
                </div>
              </dl>
            </div>
          )}

          {result.model && (
            <p className="text-xs text-gray-500">
              Generated using: {result.model}
            </p>
          )}
        </div>
      )}
    </div>
  );
}