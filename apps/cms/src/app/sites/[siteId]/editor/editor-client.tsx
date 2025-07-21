'use client';

import { useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Sparkles, Save, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { SectionCard } from '@/components/content-editor/section-card';
import { SectionEditorModal } from '@/components/content-editor/section-editor-modal';
import { AddSectionModal } from '@/components/content-editor/add-section-modal';
import type { Prisma } from '@tourism/database';

interface EditorClientProps {
  site: {
    id: string;
    domain?: string | null;
    subdomain: string;
  };
  homePage: {
    id: string;
    type: string;
    status: string;
    sections?: Array<{
      id: string;
      pageId: string;
      templateId: string;
      order: number;
      visibility: Prisma.JsonValue;
      customStyles: Prisma.JsonValue;
      createdAt: Date;
      updatedAt: Date;
      template: { 
        name: string;
        category: string;
      };
      content: Array<{ 
        id: string;
        data: Prisma.JsonValue; 
        sectionId: string;
        language: string;
        imageUrls: string[];
        generatedBy: string;
        generatedAt: Date;
        version: number;
      }>;
    }>;
  } | undefined;
}

export function EditorClient({ site, homePage }: EditorClientProps) {
  const [sections, setSections] = useState(homePage?.sections || []);
  const [editingSection, setEditingSection] = useState<typeof sections[0] | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const siteUrl = site.domain || `https://${site.subdomain}.tourism-platform.com`;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSections((items: typeof sections) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveContent = async (sectionId: string, content: unknown) => {
    try {
      const response = await fetch(`/api/sections/${sectionId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language: 'en' }),
      });

      if (response.ok) {
        const result = await response.json();
        setSections((prevSections: typeof sections) =>
          prevSections.map((section) => {
            if (section.id === sectionId) {
              // Update the content, keeping existing structure
              const existingContent = section.content[0];
              if (existingContent) {
                return {
                  ...section,
                  content: [{
                    ...existingContent,
                    data: content as Prisma.JsonValue,
                  }]
                };
              } else {
                // Create new content object with all required fields
                return {
                  ...section,
                  content: [{
                    id: result.id || `temp-${Date.now()}`,
                    data: content as Prisma.JsonValue,
                    sectionId: sectionId,
                    language: 'en',
                    imageUrls: [],
                    generatedBy: 'manual',
                    generatedAt: new Date(),
                    version: 1
                  }]
                };
              }
            }
            return section;
          })
        );
        toast.success('Content updated successfully');
      } else {
        throw new Error('Failed to save content');
      }
    } catch {
      toast.error('Failed to save content');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSections((prevSections: typeof sections) =>
          prevSections.filter((section) => section.id !== sectionId)
        );
        toast.success('Section deleted');
      } else {
        throw new Error('Failed to delete section');
      }
    } catch {
      toast.error('Failed to delete section');
    }
  };

  const handleRegenerateSection = async (sectionId: string) => {
    try {
      toast.loading('Regenerating content with AI...', { id: sectionId });

      const response = await fetch(`/api/sections/${sectionId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: site.id }),
      });

      if (response.ok) {
        const result = await response.json();
        setSections((prevSections: typeof sections) =>
          prevSections.map((s) => {
            if (s.id === sectionId) {
              const existingContent = s.content[0];
              if (existingContent) {
                return {
                  ...s,
                  content: [{
                    ...existingContent,
                    data: result.content as Prisma.JsonValue,
                    generatedAt: new Date(),
                    version: existingContent.version + 1
                  }]
                };
              } else {
                return {
                  ...s,
                  content: [{
                    id: result.id || `temp-${Date.now()}`,
                    data: result.content as Prisma.JsonValue,
                    sectionId: sectionId,
                    language: 'en',
                    imageUrls: result.imageUrls || [],
                    generatedBy: 'gemini-2.5-pro',
                    generatedAt: new Date(),
                    version: 1
                  }]
                };
              }
            }
            return s;
          })
        );
        toast.success('Content regenerated successfully', { id: sectionId });
      } else {
        throw new Error('Failed to regenerate content');
      }
    } catch {
      toast.error('Failed to regenerate content', { id: sectionId });
    }
  };

  const handleAddSection = async (templateId: string) => {
    if (!homePage) {
      toast.error('No page found to add section to');
      return;
    }
    
    try {
      toast.loading('Adding section...', { id: 'add-section' });

      const response = await fetch(`/api/pages/${homePage.id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          order: sections.length,
        }),
      });

      if (response.ok) {
        const newSection = await response.json();
        setSections([...sections, newSection]);
        toast.success('Section added successfully', { id: 'add-section' });
      } else {
        throw new Error('Failed to add section');
      }
    } catch {
      toast.error('Failed to add section', { id: 'add-section' });
    }
  };

  const handleSaveOrder = async () => {
    if (!homePage) {
      toast.error('No page found to save order for');
      return;
    }
    
    setIsSaving(true);
    try {
      const updates = sections.map((section, index) => ({
        id: section.id,
        order: index,
      }));

      const response = await fetch(`/api/pages/${homePage.id}/sections/order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast.success('Order saved successfully');
      } else {
        throw new Error('Failed to save order');
      }
    } catch {
      toast.error('Failed to save order');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAllContent = async () => {
    if (!homePage) {
      toast.error('No page found to generate content for');
      return;
    }
    
    if (!confirm('This will regenerate content for all sections. Continue?')) return;

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/sites/${site.id}/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageIds: [homePage.id] }),
      });

      if (response.ok) {
        toast.success('Content generation started. This may take a few moments...');
        // Refresh sections after a delay
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        throw new Error('Failed to generate content');
      }
    } catch {
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      // Open preview in new tab with section highlighted
      window.open(`${siteUrl}#section-${section.template.name}`, '_blank');
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sections List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Page Sections</h2>
            <div className="flex items-center gap-2">
              {sections.length > 0 && (
                <button
                  onClick={handleSaveOrder}
                  disabled={isSaving}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save Order'}
                </button>
              )}
            </div>
          </div>

          {sections.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sections.map((section) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      onEdit={(sectionId) => {
                        const sectionToEdit = sections.find((s) => s.id === sectionId);
                        setEditingSection(sectionToEdit || null);
                      }}
                      onDelete={handleDeleteSection}
                      onRegenerate={handleRegenerateSection}
                      onPreview={handlePreviewSection}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 mb-4">No sections yet. Add your first section to get started.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </button>
            </div>
          )}
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Page Settings</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Page Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{homePage?.type || 'HOME'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {homePage?.status || 'DRAFT'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Sections</dt>
                <dd className="mt-1 text-sm text-gray-900">{sections.length} sections</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </button>
              <button
                onClick={handleGenerateAllContent}
                disabled={isGenerating || sections.length === 0}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate All Content'}
              </button>
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Site
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SectionEditorModal
        isOpen={!!editingSection}
        section={editingSection}
        onClose={() => setEditingSection(null)}
        onSave={handleSaveContent}
      />

      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSection}
      />
    </>
  );
}