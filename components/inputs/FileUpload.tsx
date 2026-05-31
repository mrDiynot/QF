/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * File Upload Components
 * Drag-and-drop file upload with preview
 * Note: Uses <img> for dynamic file previews
 */

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  X,
  File,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onUpload?: (files: File[]) => Promise<string[]>;
  onChange?: (files: UploadedFile[]) => void;
  value?: UploadedFile[];
  disabled?: boolean;
  className?: string;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon className="size-5 text-info" />,
  video: <Film className="size-5 text-primary" />,
  audio: <Music className="size-5 text-green-500" />,
  application: <FileText className="size-5 text-amber-500" />,
  default: <File className="size-5 text-muted-foreground" />,
};

const getFileIcon = (type: string) => {
  const category = type.split('/')[0];
  return FILE_ICONS[category] || FILE_ICONS.default;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileUpload({
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  onUpload,
  onChange,
  value = [],
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(value);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFiles = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) return;

    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Check max files
      if (files.length + newFiles.length >= maxFiles) break;
      
      // Check file size
      if (file.size > maxSize) {
        newFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: 'error',
          error: `File exceeds ${formatFileSize(maxSize)} limit`,
        });
        continue;
      }

      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'pending',
      });
    }

    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);
    onChange?.(updatedFiles);

    // Simulate upload
    if (onUpload) {
      for (const uploadFile of newFiles.filter(f => f.status === 'pending')) {
        const fileIndex = updatedFiles.findIndex(f => f.id === uploadFile.id);
        
        // Set uploading
        updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], status: 'uploading' };
        setFiles([...updatedFiles]);

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(r => setTimeout(r, 200));
          updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], progress };
          setFiles([...updatedFiles]);
        }

        // Mark complete
        updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], status: 'success', progress: 100 };
        setFiles([...updatedFiles]);
        onChange?.(updatedFiles);
      }
    }
  }, [files, maxFiles, maxSize, multiple, disabled, onUpload, onChange]);

  // Drag handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Remove file
  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };

  // Clear all
  const clearAll = () => {
    setFiles([]);
    onChange?.([]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        <Upload className={cn("size-10 mx-auto mb-4", isDragging ? "text-primary" : "text-muted-foreground/60")} />
        <p className="font-medium text-foreground">
          {isDragging ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          or <span className="text-primary">browse</span> to upload
        </p>
        <p className="text-xs text-muted-foreground/60 mt-2">
          {accept ? `Accepted: ${accept}` : 'All file types'} • Max {formatFileSize(maxSize)}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{files.length} file(s)</span>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-600 h-7">
              <Trash2 className="size-3 mr-1" />
              Clear all
            </Button>
          </div>
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                file.status === 'error' && "border-red-200 bg-red-50"
              )}
            >
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatFileSize(file.size)}</span>
                  {file.status === 'uploading' && (
                    <span className="text-primary">{file.progress}%</span>
                  )}
                  {file.status === 'error' && (
                    <span className="text-red-600">{file.error}</span>
                  )}
                </div>
                {file.status === 'uploading' && (
                  <Progress value={file.progress} className="h-1 mt-2" />
                )}
              </div>
              <div className="flex items-center gap-1">
                {file.status === 'uploading' && <Loader2 className="size-4 animate-spin text-primary" />}
                {file.status === 'success' && <CheckCircle className="size-4 text-green-500" />}
                {file.status === 'error' && <AlertCircle className="size-4 text-red-500" />}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Avatar/Image Upload variant
interface ImageUploadProps {
  value?: string;
  onChange?: (url: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  size = 'md',
  shape = 'circle',
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const sizes = { sm: 'size-16', md: 'size-24', lg: 'size-32' };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
      onChange?.(url);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex items-center justify-center bg-muted/40 border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors overflow-hidden",
          sizes[size],
          shape === 'circle' ? 'rounded-full' : 'rounded-lg'
        )}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <Upload className="size-6 text-muted-foreground/60" />
        )}
      </div>
      {preview && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 size-6 rounded-full"
          onClick={(e) => { e.stopPropagation(); handleRemove(); }}
        >
          <X className="size-3" />
        </Button>
      )}
    </div>
  );
}
