'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  File,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress?: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
}

interface FileAttachmentUploaderProps {
  conversationId: string;
  onAttachmentsChange?: (attachments: FileAttachment[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
}

export function FileAttachmentUploader({
  conversationId,
  onAttachmentsChange,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
}: FileAttachmentUploaderProps) {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);

      // Simulate upload with progress
      return new Promise<{ id: string; url: string }>((resolve) => {
        setTimeout(() => {
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
          });
        }, 2000);
      });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (attachments.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of files) {
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${maxFileSize}MB limit`);
        continue;
      }

      const newAttachment: FileAttachment = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        status: 'uploading',
      };

      setAttachments(prev => {
        const updated = [...prev, newAttachment];
        onAttachmentsChange?.(updated);
        return updated;
      });

      try {
        const result = await uploadMutation.mutateAsync(file);
        
        setAttachments(prev => {
          const updated = prev.map(att =>
            att.id === newAttachment.id
              ? { ...att, url: result.url, uploadProgress: 100, status: 'complete' as const }
              : att
          );
          onAttachmentsChange?.(updated);
          return updated;
        });
        
        toast.success(`${file.name} uploaded successfully`);
      } catch {
        setAttachments(prev => {
          const updated = prev.map(att =>
            att.id === newAttachment.id
              ? { ...att, status: 'error' as const }
              : att
          );
          onAttachmentsChange?.(updated);
          return updated;
        });
        
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const updated = prev.filter(att => att.id !== id);
      onAttachmentsChange?.(updated);
      return updated;
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="size-4" />;
    if (type.includes('pdf')) return <FileText className="size-4" />;
    return <File className="size-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={attachments.length >= maxFiles}
        >
          <Paperclip className="size-4 mr-2" />
          Attach Files ({attachments.length}/{maxFiles})
        </Button>
        <p className="text-xs text-text-secondary mt-1">
          Max {maxFileSize}MB per file • {acceptedTypes.join(', ')}
        </p>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border"
            >
              {/* File Icon */}
              <div className="p-2 bg-white rounded-lg border">
                {getFileIcon(attachment.type)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  {attachment.status === 'complete' && (
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                  )}
                  {attachment.status === 'error' && (
                    <AlertCircle className="size-4 text-red-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-text-secondary">{formatFileSize(attachment.size)}</p>
                
                {/* Upload Progress */}
                {attachment.status === 'uploading' && (
                  <div className="mt-2">
                    <Progress value={attachment.uploadProgress || 0} className="h-1" />
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(attachment.id)}
                disabled={attachment.status === 'uploading'}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
