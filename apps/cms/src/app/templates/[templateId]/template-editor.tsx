'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { TestTemplateSection } from '@/components/test-template-section';
import { ArrowLeft, Save, Code, FileText, Database } from 'lucide-react';
import { Template } from '@tourism/database';

interface TemplateEditorProps {
  template: Template;
  promptData: {
    systemInstruction?: string;
    userPromptExample?: string;
    responseSchema?: unknown;
  } | null;
}

export function TemplateEditor({ template, promptData }: TemplateEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'prompt'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: template.name,
    componentName: template.componentName,
    isActive: template.isActive,
    schema: (promptData?.responseSchema || template.schema || {}) as Record<string, unknown>,
    systemPrompt: template.systemPrompt || promptData?.systemInstruction || '',
    userPromptTemplate: template.userPromptTemplate || promptData?.userPromptExample || ''
  });
  
  // Track changes
  useEffect(() => {
    const hasChanges = 
      formData.name !== template.name ||
      formData.componentName !== template.componentName ||
      formData.isActive !== template.isActive ||
      JSON.stringify(formData.schema) !== JSON.stringify(template.schema || {}) ||
      formData.systemPrompt !== (template.systemPrompt || '') ||
      formData.userPromptTemplate !== (template.userPromptTemplate || '');
    
    setHasChanges(hasChanges);
  }, [formData, template]);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        router.refresh();
        setHasChanges(false);
        alert('Template saved successfully!');
      } else {
        alert('Failed to save template');
      }
    } catch {
      alert('Error saving template');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/templates"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Templates
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Component: {template.componentName}
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${
                hasChanges 
                  ? 'bg-indigo-600 hover:bg-indigo-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schema'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="h-4 w-4 inline mr-2" />
              Response Schema
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prompt'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Code className="h-4 w-4 inline mr-2" />
              AI Prompts
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Template Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Template Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="componentName" className="block text-sm font-medium text-gray-700">
                      Component Name
                    </label>
                    <input
                      type="text"
                      id="componentName"
                      value={formData.componentName}
                      onChange={(e) => setFormData({ ...formData, componentName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {promptData && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">From Prompt Configuration</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      This template has an AI prompt configuration defined. You can view and edit the schema and prompts in the other tabs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'schema' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Response Schema</h3>
              <p className="text-sm text-gray-600 mb-4">
                This schema defines what fields Gemini must return when generating content for this template. Edit the JSON below to modify the schema.
              </p>
              <div className="relative">
                <textarea
                  value={JSON.stringify(formData.schema, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData({ ...formData, schema: parsed });
                    } catch {
                      // Invalid JSON, just update the text
                      // You might want to show an error message here
                    }
                  }}
                  className="w-full h-96 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  spellCheck={false}
                />
              </div>
              
              <div className="mt-4 flex items-start space-x-2">
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const formatted = JSON.stringify(JSON.parse(JSON.stringify(formData.schema)), null, 2);
                        setFormData({ ...formData, schema: JSON.parse(formatted) });
                      } catch {
                        alert('Invalid JSON format');
                      }
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Format JSON
                  </button>
                </div>
                {promptData?.responseSchema ? (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, schema: promptData.responseSchema as Record<string, unknown> })}
                    className="inline-flex items-center px-3 py-1.5 border border-indigo-300 shadow-sm text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reset to Original
                  </button>
                ) : null}
              </div>
              
              {promptData?.responseSchema ? (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The original schema is defined in:
                    <br />
                    <code className="mt-1 block text-xs bg-blue-100 px-2 py-1 rounded">
                      packages/ai-engine/src/gemini/section-prompts.ts
                    </code>
                  </p>
                </div>
              ) : null}
            </div>
          )}
          
          {activeTab === 'prompt' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Instruction</h3>
                <p className="text-sm text-gray-600 mb-2">
                  This tells Gemini what role to play when generating content.
                </p>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter system instruction..."
                />
                {promptData?.systemInstruction && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, systemPrompt: promptData.systemInstruction || '' })}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Reset to original
                  </button>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Prompt Template</h3>
                <p className="text-sm text-gray-600 mb-2">
                  This is the actual request sent to Gemini. Use ${'{attraction}'} and ${'{location}'} as variables.
                </p>
                <textarea
                  value={formData.userPromptTemplate}
                  onChange={(e) => setFormData({ ...formData, userPromptTemplate: e.target.value })}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter user prompt template..."
                />
                {promptData?.userPromptExample && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userPromptTemplate: promptData.userPromptExample || '' })}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Reset to original
                  </button>
                )}
              </div>
              
              {/* Test Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Test Template</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Test your template configuration by generating sample content.
                </p>
                <TestTemplateSection 
                  templateId={template.id}
                  systemPrompt={formData.systemPrompt}
                  userPromptTemplate={formData.userPromptTemplate}
                  schema={formData.schema}
                />
              </div>
              
              {(promptData?.systemInstruction || promptData?.userPromptExample) && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The original prompts are defined in:
                    <br />
                    <code className="mt-1 block text-xs bg-blue-100 px-2 py-1 rounded">
                      packages/ai-engine/src/gemini/section-prompts.ts
                    </code>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}