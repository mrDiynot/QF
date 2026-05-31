/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * Media & Content Display Components
 * Image galleries, video players, and document previews
 * Note: Uses <img> instead of Next.js Image for dynamic external images
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Modal,
  ModalContent,
} from '@/components/modals';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Download,
  Maximize2,
  Play,
  Pause,
  FileText,
  File,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Image Gallery
interface GalleryImage {
  id: string;
  src: string;
  alt?: string;
  thumbnail?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  aspectRatio?: 'square' | 'video' | 'auto';
  className?: string;
}

export function ImageGallery({ images, columns = 3, aspectRatio = 'square', className }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const gridCols = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };
  const aspectClasses = { square: 'aspect-square', video: 'aspect-video', auto: '' };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const navigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex(i => (i - 1 + images.length) % images.length);
    } else {
      setCurrentIndex(i => (i + 1) % images.length);
    }
  };

  return (
    <>
      <div className={cn(`grid gap-2 ${gridCols[columns]}`, className)}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className={cn(
              "relative overflow-hidden rounded-lg bg-muted/40 cursor-pointer group",
              aspectClasses[aspectRatio]
            )}
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.thumbnail || image.src}
              alt={image.alt || ''}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="size-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Modal open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <ModalContent size="2xl" className="p-0 bg-black/95 border-none">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20 z-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="size-6" />
            </Button>

            <div className="flex items-center justify-center min-h-[60vh] p-8">
              <img
                src={images[currentIndex]?.src}
                alt={images[currentIndex]?.alt || ''}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => navigate('prev')}
                >
                  <ChevronLeft className="size-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => navigate('next')}
                >
                  <ChevronRight className="size-8" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}

// Single Image with Lightbox
interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ImagePreview({ src, alt, className }: ImagePreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn("relative overflow-hidden rounded-lg bg-muted/40 cursor-pointer group", className)}
        onClick={() => setOpen(true)}
      >
        <img src={src} alt={alt || ''} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Maximize2 className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent size="2xl" className="p-0 bg-black/95 border-none">
          <div className="relative p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={() => setOpen(false)}
            >
              <X className="size-6" />
            </Button>
            <img src={src} alt={alt || ''} className="max-w-full max-h-[80vh] mx-auto object-contain" />
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}

// Video Player
interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, title, className }: VideoPlayerProps) {
  const [, setPlaying] = useState(false);
  // Muted state reserved for future volume controls
  const [, ] = useState(false);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="relative aspect-video bg-black">
        <video
          src={src}
          poster={poster}
          className="w-full h-full object-contain"
          controls
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </div>
      {title && (
        <div className="p-3 border-t">
          <p className="font-medium text-foreground">{title}</p>
        </div>
      )}
    </Card>
  );
}

// Audio Player
interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  duration?: string;
  className?: string;
}

export function AudioPlayer({ src, title, artist, duration, className }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="size-12 rounded-full"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause className="size-5" /> : <Play className="size-5 ml-0.5" />}
        </Button>
        <div className="flex-1 min-w-0">
          {title && <p className="font-medium text-foreground truncate">{title}</p>}
          {artist && <p className="text-sm text-muted-foreground truncate">{artist}</p>}
        </div>
        {duration && <span className="text-sm text-muted-foreground/60">{duration}</span>}
      </div>
      <audio src={src} className="hidden" />
    </Card>
  );
}

// Document Preview Card
interface DocumentPreviewProps {
  name: string;
  type: string;
  size?: string;
  url?: string;
  thumbnail?: string;
  onView?: () => void;
  onDownload?: () => void;
  className?: string;
}

// Document type icons use neutral color - file type is identified by icon shape, not color
const DOC_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="size-8 text-error" />,
  doc: <FileText className="size-8 text-muted-foreground" />,
  docx: <FileText className="size-8 text-muted-foreground" />,
  xls: <FileText className="size-8 text-muted-foreground" />,
  xlsx: <FileText className="size-8 text-muted-foreground" />,
  ppt: <FileText className="size-8 text-muted-foreground" />,
  pptx: <FileText className="size-8 text-muted-foreground" />,
  image: <ImageIcon className="size-8 text-muted-foreground" />,
  video: <Film className="size-8 text-muted-foreground" />,
  audio: <Music className="size-8 text-muted-foreground" />,
  zip: <Archive className="size-8 text-amber-500" />,
  default: <File className="size-8 text-muted-foreground" />,
};

const getDocIcon = (type: string) => {
  const ext = type.toLowerCase().split('/').pop() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return DOC_ICONS.image;
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return DOC_ICONS.video;
  if (['mp3', 'wav', 'ogg'].includes(ext)) return DOC_ICONS.audio;
  if (['zip', 'rar', '7z'].includes(ext)) return DOC_ICONS.zip;
  return DOC_ICONS[ext] || DOC_ICONS.default;
};

export function DocumentPreview({ name, type, size, url, thumbnail, onView, onDownload, className }: DocumentPreviewProps) {
  return (
    <Card className={cn("p-4 hover:shadow-md transition-shadow", className)}>
      <div className="flex items-start gap-4">
        {thumbnail ? (
          <div className="size-16 rounded-lg overflow-hidden bg-muted/40 flex-shrink-0">
            <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="size-16 rounded-lg bg-muted/40 flex items-center justify-center flex-shrink-0">
            {getDocIcon(type)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">{type.split('/').pop()?.toUpperCase()}</Badge>
            {size && <span className="text-xs text-muted-foreground/60">{size}</span>}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {onView && (
          <Button variant="outline" size="sm" onClick={onView} className="flex-1 gap-1">
            <Eye className="size-4" /> View
          </Button>
        )}
        {onDownload && (
          <Button variant="outline" size="sm" onClick={onDownload} className="flex-1 gap-1">
            <Download className="size-4" /> Download
          </Button>
        )}
        {url && (
          <Button variant="outline" size="sm" asChild className="flex-1 gap-1">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" /> Open
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
}

// File List
interface FileItem {
  id: string;
  name: string;
  type: string;
  size?: string;
  url?: string;
}

interface FileListProps {
  files: FileItem[];
  onFileClick?: (file: FileItem) => void;
  className?: string;
}

export function FileList({ files, onFileClick, className }: FileListProps) {
  return (
    <div className={cn("divide-y rounded-lg border", className)}>
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-3 p-3 hover:bg-muted/20 cursor-pointer"
          onClick={() => onFileClick?.(file)}
        >
          <div className="flex-shrink-0">{getDocIcon(file.type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{file.size}</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground/60" />
        </div>
      ))}
    </div>
  );
}

// Attachment Badge
interface AttachmentBadgeProps {
  name: string;
  type: string;
  onRemove?: () => void;
  className?: string;
}

export function AttachmentBadge({ name, type, onRemove, className }: AttachmentBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 text-sm",
      className
    )}>
      <span className="flex-shrink-0">{getDocIcon(type)}</span>
      <span className="truncate max-w-[150px]">{name}</span>
      {onRemove && (
        <button onClick={onRemove} className="flex-shrink-0 text-muted-foreground/60 hover:text-muted-foreground">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

// Media Grid (mixed content)
interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  src: string;
  thumbnail?: string;
  name?: string;
}

interface MediaGridProps {
  items: MediaItem[];
  columns?: 2 | 3 | 4;
  onItemClick?: (item: MediaItem) => void;
  className?: string;
}

export function MediaGrid({ items, columns = 3, onItemClick, className }: MediaGridProps) {
  const gridCols = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };

  return (
    <div className={cn(`grid gap-2 ${gridCols[columns]}`, className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className="relative aspect-square rounded-lg overflow-hidden bg-muted/40 cursor-pointer group"
          onClick={() => onItemClick?.(item)}
        >
          {item.type === 'image' && (
            <img
              src={item.thumbnail || item.src}
              alt={item.name || ''}
              className="w-full h-full object-cover"
            />
          )}
          {item.type === 'video' && (
            <>
              <img
                src={item.thumbnail || ''}
                alt={item.name || ''}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-12 rounded-full bg-black/60 flex items-center justify-center">
                  <Play className="size-6 text-white ml-1" />
                </div>
              </div>
            </>
          )}
          {item.type === 'document' && (
            <div className="w-full h-full flex items-center justify-center">
              {getDocIcon(item.name?.split('.').pop() || '')}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </div>
      ))}
    </div>
  );
}
