'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationNotesService } from '@/services/api/conversation-notes.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  StickyNote,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Lock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface InternalNote {
  id: string;
  conversationId: string;
  content: string;
  createdByUserId: string;
  createdByUserName?: string;
  createdAt: string;
  updatedAt?: string;
  isPinned: boolean;
}

interface InternalNotesPanelProps {
  conversationId: string;
  leadId?: string;
}

export function InternalNotesPanel({ conversationId, leadId: _leadId }: InternalNotesPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const queryClient = useQueryClient();

  // Fetch notes from API
  const { data: notes = [], isLoading } = useQuery<InternalNote[]>({
    queryKey: ['internal-notes', conversationId],
    queryFn: async () => {
      const apiNotes = await conversationNotesService.getNotes(conversationId);
      return apiNotes.map(note => ({
        id: note.id,
        conversationId: note.conversationId,
        content: note.content,
        createdByUserId: note.createdByUserId,
        createdByUserName: note.createdByUserName,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        isPinned: note.isPinned,
      }));
    },
    retry: 1,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      return await conversationNotesService.createNote(conversationId, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-notes', conversationId] });
      setNoteContent('');
      setIsAdding(false);
      toast.success('Note added successfully');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      return await conversationNotesService.updateNote(conversationId, id, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-notes', conversationId] });
      setEditingId(null);
      setNoteContent('');
      toast.success('Note updated successfully');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await conversationNotesService.deleteNote(conversationId, id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-notes', conversationId] });
      toast.success('Note deleted successfully');
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id }: { id: string; isPinned: boolean }) => {
      return await conversationNotesService.togglePin(conversationId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-notes', conversationId] });
    },
  });

  const handleSaveNote = () => {
    if (!noteContent.trim()) return;

    if (editingId) {
      updateNoteMutation.mutate({ id: editingId, content: noteContent });
    } else {
      createNoteMutation.mutate(noteContent);
    }
  };

  const handleEditNote = (note: InternalNote) => {
    setEditingId(note.id);
    setNoteContent(note.content);
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNoteContent('');
    setIsAdding(false);
  };

  const pinnedNotes = notes.filter(n => n.isPinned);
  const regularNotes = notes.filter(n => !n.isPinned);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="size-5 text-orange-600" />
            <div>
              <CardTitle className="text-lg">Internal Notes</CardTitle>
              <p className="text-xs text-text-secondary mt-1">
                Private team notes • Not visible to customers
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setNoteContent('');
            }}
            disabled={isAdding || editingId !== null}
          >
            <Plus className="size-4 mr-2" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Note Form */}
        {(isAdding || editingId) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
            <Textarea
              placeholder="Add internal note (visible only to your team)..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="min-h-[100px] bg-white"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                <X className="size-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNote}
                disabled={!noteContent.trim() || createNoteMutation.isPending || updateNoteMutation.isPending}
              >
                <Save className="size-4 mr-2" />
                {editingId ? 'Update' : 'Save'} Note
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8 text-text-secondary">
            Loading notes...
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notes.length === 0 && !isAdding && (
          <div className="text-center py-8">
            <StickyNote className="size-12 mx-auto mb-4 text-muted-foreground/60" />
            <p className="text-text-secondary mb-2">No internal notes yet</p>
            <p className="text-xs text-text-secondary">
              Add notes to track important details about this conversation
            </p>
          </div>
        )}

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Pinned
              </Badge>
            </div>
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={() => deleteNoteMutation.mutate(note.id)}
                onTogglePin={() => togglePinMutation.mutate({ id: note.id, isPinned: note.isPinned })}
                isDeleting={deleteNoteMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Regular Notes */}
        {regularNotes.length > 0 && (
          <div className="space-y-3">
            {pinnedNotes.length > 0 && (
              <div className="border-t pt-4">
                <Badge variant="outline" className="text-xs">
                  All Notes
                </Badge>
              </div>
            )}
            {regularNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={() => deleteNoteMutation.mutate(note.id)}
                onTogglePin={() => togglePinMutation.mutate({ id: note.id, isPinned: note.isPinned })}
                isDeleting={deleteNoteMutation.isPending}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface NoteCardProps {
  note: InternalNote;
  onEdit: (note: InternalNote) => void;
  onDelete: () => void;
  onTogglePin: () => void;
  isDeleting: boolean;
}

function NoteCard({ note, onEdit, onDelete, onTogglePin, isDeleting }: NoteCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="size-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
              {(note.createdByUserName || 'U').split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold">{note.createdByUserName || 'Unknown'}</p>
              {note.isPinned && (
                <Badge variant="secondary" className="text-xs">
                  Pinned
                </Badge>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onTogglePin}>
            <StickyNote className={`size-4 ${note.isPinned ? 'text-orange-600' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(note)}>
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="size-4 text-red-600" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{note.content}</p>
    </div>
  );
}
