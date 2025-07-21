'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Sparkles, Eye } from 'lucide-react';
import { Section } from '@tourism/database';

interface SectionCardProps {
  section: Section & {
    template: { name: string; category: string };
    content: { data: any; language: string }[];
  };
  onEdit: (sectionId: string) => void;
  onDelete: (sectionId: string) => void;
  onRegenerate: (sectionId: string) => void;
  onPreview: (sectionId: string) => void;
}

export function SectionCard({
  section,
  onEdit,
  onDelete,
  onRegenerate,
  onPreview
}: SectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatTitle = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getContentPreview = () => {
    const content = section.content[0]?.data;
    if (!content) return 'No content generated yet';
    
    // Extract preview text based on template type
    if (content.title) return content.title;
    if (content.heading) return content.heading;
    if (content.text) return content.text.substring(0, 100) + '...';
    if (content.items && Array.isArray(content.items)) {
      return `${content.items.length} items`;
    }
    
    return 'Content available';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border ${
        isDragging ? 'border-indigo-500 shadow-lg' : 'border-gray-200'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab hover:bg-gray-100 rounded p-1"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {formatTitle(section.template.name)}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {section.template.category}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {getContentPreview()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPreview(section.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEdit(section.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onRegenerate(section.id)}
                  className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                  title="Regenerate with AI"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(section.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}