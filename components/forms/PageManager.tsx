'use client';

import { FormPage } from '@/types/multi-page-forms';
import { FormField } from '@/types/form-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, FileText } from 'lucide-react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PageManagerProps {
  pages: FormPage[];
  fields: FormField[];
  onPagesChange: (pages: FormPage[]) => void;
}

function SortablePageItem({ page, fields, onUpdate, onDelete }: {
  page: FormPage;
  fields: FormField[];
  onUpdate: (page: FormPage) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const availableFields = fields.filter(f => !page.fieldIds.includes(f.id));
  const pageFields = fields.filter(f => page.fieldIds.includes(f.id));

  const addField = (fieldId: string) => {
    onUpdate({ ...page, fieldIds: [...page.fieldIds, fieldId] });
  };

  const removeField = (fieldId: string) => {
    onUpdate({ ...page, fieldIds: page.fieldIds.filter(id => id !== fieldId) });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4">
        <div className="space-y-4">
          {/* Page Header */}
          <div className="flex items-center gap-3">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="size-5 text-text-muted" />
            </div>
            <div className="flex-1 space-y-2">
              <Input
                value={page.title}
                onChange={(e) => onUpdate({ ...page, title: e.target.value })}
                placeholder="Page title"
                className="font-medium"
              />
              <Textarea
                value={page.description || ''}
                onChange={(e) => onUpdate({ ...page, description: e.target.value })}
                placeholder="Page description (optional)"
                rows={2}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {/* Page Fields */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Fields on this page ({pageFields.length})</Label>
            {pageFields.length === 0 ? (
              <p className="text-sm text-text-secondary">No fields added yet</p>
            ) : (
              <div className="space-y-1">
                {pageFields.map(field => (
                  <div key={field.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{field.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      className="size-6 p-0"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Fields */}
          {availableFields.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Available fields</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableFields.map(field => (
                  <button
                    key={field.id}
                    onClick={() => addField(field.id)}
                    className="w-full text-left p-2 text-sm hover:bg-muted rounded transition-colors"
                  >
                    + {field.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function PageManager({ pages, fields, onPagesChange }: PageManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const addPage = () => {
    const newPage: FormPage = {
      id: `page-${Date.now()}`,
      title: `Page ${pages.length + 1}`,
      description: '',
      order: pages.length,
      fieldIds: [],
    };
    onPagesChange([...pages, newPage]);
  };

  const updatePage = (pageId: string, updates: Partial<FormPage>) => {
    onPagesChange(
      pages.map(page => (page.id === pageId ? { ...page, ...updates } : page))
    );
  };

  const deletePage = (pageId: string) => {
    const updatedPages = pages
      .filter(page => page.id !== pageId)
      .map((page, index) => ({ ...page, order: index }));
    onPagesChange(updatedPages);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pages.findIndex(p => p.id === active.id);
    const newIndex = pages.findIndex(p => p.id === over.id);

    const reorderedPages = arrayMove(pages, oldIndex, newIndex).map((page, index) => ({
      ...page,
      order: index,
    }));

    onPagesChange(reorderedPages);
  };

  const unassignedFields = fields.filter(
    field => !pages.some(page => page.fieldIds.includes(field.id))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-brand-purple" />
          <div>
            <h3 className="text-lg font-semibold text-text-navy">Form Pages</h3>
            <p className="text-xs text-text-secondary">
              Split your form into multiple pages
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addPage}
          className="gap-2"
        >
          <Plus className="size-4" />
          Add Page
        </Button>
      </div>

      {pages.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-text-secondary mb-4">
            No pages yet. Add pages to split your form into multiple steps.
          </p>
          <Button variant="outline" size="sm" onClick={addPage} className="gap-2">
            <Plus className="size-4" />
            Create First Page
          </Button>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pages.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {pages.map(page => (
                <SortablePageItem
                  key={page.id}
                  page={page}
                  fields={fields}
                  onUpdate={(updated) => updatePage(page.id, updated)}
                  onDelete={() => deletePage(page.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Unassigned Fields Warning */}
      {unassignedFields.length > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <p className="text-sm text-orange-800">
            <strong>Warning:</strong> {unassignedFields.length} field(s) not assigned to any page:
            {' '}{unassignedFields.map(f => f.label).join(', ')}
          </p>
        </Card>
      )}
    </div>
  );
}
