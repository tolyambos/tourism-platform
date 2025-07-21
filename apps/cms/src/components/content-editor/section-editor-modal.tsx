'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface SectionEditorModalProps {
  isOpen: boolean;
  section: {
    id: string;
    template: {
      name: string;
      category: string;
    };
    content?: Array<{ data: unknown; language: string }>;
  } | null;
  onClose: () => void;
  onSave: (sectionId: string, content: unknown) => void;
}

export function SectionEditorModal({
  isOpen,
  section,
  onClose,
  onSave
}: SectionEditorModalProps) {
  const [content, setContent] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (section && section.content && section.content[0]) {
      setContent(JSON.stringify(section.content[0].data, null, 2));
    }
  }, [section]);

  if (!isOpen || !section || !section.template) return null;

  const handleContentChange = (value: string) => {
    setContent(value);
    try {
      JSON.parse(value);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  };

  const handleSave = () => {
    if (!isValid) {
      toast.error('Invalid JSON format');
      return;
    }

    try {
      const parsedContent = JSON.parse(content);
      onSave(section.id, parsedContent);
      toast.success('Content saved successfully');
      onClose();
    } catch {
      toast.error('Failed to save content');
    }
  };

  const formatTitle = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Edit {formatTitle(section.template.name)}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {section.template.category} section
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Editor */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content JSON
              </label>
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className={`w-full h-96 p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                    isValid
                      ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  }`}
                  spellCheck={false}
                />
                {!isValid && (
                  <p className="mt-2 text-sm text-red-600">
                    Invalid JSON format. Please check your syntax.
                  </p>
                )}
              </div>

              {/* Template Schema Guide */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Template Schema
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  {section.template.name.includes('hero') && (
                    <p>Expected fields: title, subtitle, backgroundImage, ctaButton</p>
                  )}
                  {section.template.name.includes('features') && (
                    <p>Expected fields: heading, items (array with title, description, icon)</p>
                  )}
                  {section.template.name.includes('gallery') && (
                    <p>Expected fields: title, images (array with url, alt, caption)</p>
                  )}
                  {section.template.name.includes('content') && (
                    <p>Expected fields: heading, text, image (optional)</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                isValid
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}