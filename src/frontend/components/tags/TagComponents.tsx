'use client';

/**
 * Tags & Labels Components
 * Tag inputs, label managers, and color pickers
 */

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  X,
  Plus,
  Tag,
  Check,
  Edit,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tag type
interface TagItem {
  id: string;
  label: string;
  color?: string;
}

// Tag Input Component
interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
  allowCustom?: boolean;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Add tag...',
  maxTags = 10,
  suggestions = [],
  allowCustom = true,
  className,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
      onChange([...value, trimmed]);
      setInput('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input && allowCustom) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className="flex flex-wrap gap-2 p-2 border rounded-lg bg-white min-h-[42px] focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="ml-1 rounded-full hover:bg-muted p-0.5"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        {value.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
          />
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted/20 flex items-center gap-2"
            >
              <Tag className="size-4 text-muted-foreground/60" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {value.length >= maxTags && (
        <p className="text-xs text-muted-foreground/60 mt-1">Maximum {maxTags} tags reached</p>
      )}
    </div>
  );
}

// Colored Tag
interface ColoredTagProps {
  label: string;
  color?: string;
  onRemove?: () => void;
  onClick?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  success: { bg: 'bg-success/10', text: 'text-success' },
  warning: { bg: 'bg-warning/10', text: 'text-warning' },
  error: { bg: 'bg-error/10', text: 'text-error' },
  info: { bg: 'bg-info/10', text: 'text-info' },
  neutral: { bg: 'bg-muted', text: 'text-muted-foreground' },
  gray: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

export function ColoredTag({ label, color = 'gray', onRemove, onClick, size = 'md', className }: ColoredTagProps) {
  const colors = TAG_COLORS[color] || TAG_COLORS.gray;

  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        colors.bg,
        colors.text,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 rounded-full hover:bg-black/10 p-0.5"
        >
          <X className={size === 'sm' ? 'size-2.5' : 'size-3'} />
        </button>
      )}
    </span>
  );
}

// Label Manager
interface Label {
  id: string;
  name: string;
  color: string;
  count?: number;
}

interface LabelManagerProps {
  labels: Label[];
  onAdd?: (label: Omit<Label, 'id'>) => void;
  onEdit?: (id: string, label: Partial<Label>) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function LabelManager({ labels, onAdd, onDelete, className }: LabelManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState({ name: '', color: 'purple' });
  const [, setEditingId] = useState<string | null>(null);
  void setEditingId; // Reserved for inline editing

  const handleAdd = () => {
    if (newLabel.name.trim()) {
      onAdd?.({ name: newLabel.name.trim(), color: newLabel.color });
      setNewLabel({ name: '', color: 'purple' });
      setIsAdding(false);
    }
  };

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Labels</h3>
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="gap-1">
          <Plus className="size-4" />
          Add Label
        </Button>
      </div>

      {/* Add New Label */}
      {isAdding && (
        <div className="flex gap-2 mb-4 p-3 bg-muted/20 rounded-lg">
          <Input
            value={newLabel.name}
            onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
            placeholder="Label name"
            className="flex-1"
            autoFocus
          />
          <ColorPicker
            value={newLabel.color}
            onChange={(color) => setNewLabel({ ...newLabel, color })}
          />
          <Button size="sm" onClick={handleAdd} className="bg-primary hover:bg-purple-700">
            <Check className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
            <X className="size-4" />
          </Button>
        </div>
      )}

      {/* Label List */}
      <div className="space-y-2">
        {labels.map((label) => (
          <div
            key={label.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 group"
          >
            <div className="flex items-center gap-2">
              <ColoredTag label={label.name} color={label.color} />
              {label.count !== undefined && (
                <span className="text-xs text-muted-foreground/60">{label.count}</span>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setEditingId(label.id)}
              >
                <Edit className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-red-600"
                onClick={() => onDelete?.(label.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {labels.length === 0 && !isAdding && (
        <div className="text-center py-6">
          <Tag className="size-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No labels yet</p>
        </div>
      )}
    </Card>
  );
}

// Label Select (for assigning labels)
interface LabelSelectProps {
  labels: Label[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function LabelSelect({ labels, selected, onChange, className }: LabelSelectProps) {
  const toggleLabel = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <Tag className="size-4" />
          Labels
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {labels.map((label) => (
          <DropdownMenuItem
            key={label.id}
            onClick={() => toggleLabel(label.id)}
            className="gap-2"
          >
            <div className={cn(
              "size-4 rounded border-2 flex items-center justify-center",
              selected.includes(label.id) ? "bg-primary border-purple-600" : "border-border"
            )}>
              {selected.includes(label.id) && <Check className="size-3 text-white" />}
            </div>
            <ColoredTag label={label.name} color={label.color} size="sm" />
          </DropdownMenuItem>
        ))}
        {labels.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No labels available
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Color Picker
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green',
  'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
  'violet', 'purple', 'fuchsia', 'pink', 'rose', 'gray',
];

export function ColorPicker({
  value,
  onChange,
  colors = DEFAULT_COLORS,
  className,
}: ColorPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={cn("size-9", className)}>
          <div className={cn("size-5 rounded-full", TAG_COLORS[value]?.bg || 'bg-muted')} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-2 w-auto">
        <div className="grid grid-cols-6 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={cn(
                "size-6 rounded-full transition-transform hover:scale-110",
                TAG_COLORS[color]?.bg,
                value === color && "ring-2 ring-offset-2 ring-purple-500"
              )}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Inline Color Picker (without dropdown)
interface InlineColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
  size?: 'sm' | 'md';
  className?: string;
}

export function InlineColorPicker({
  value,
  onChange,
  colors = DEFAULT_COLORS.slice(0, 12),
  size = 'md',
  className,
}: InlineColorPickerProps) {
  const sizes = { sm: 'size-4', md: 'size-6' };

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "rounded-full transition-transform hover:scale-110",
            sizes[size],
            TAG_COLORS[color]?.bg,
            value === color && "ring-2 ring-offset-1 ring-purple-500"
          )}
        />
      ))}
    </div>
  );
}

// Tag Group (display only)
interface TagGroupProps {
  tags: TagItem[];
  max?: number;
  onTagClick?: (tag: TagItem) => void;
  className?: string;
}

export function TagGroup({ tags, max = 5, onTagClick, className }: TagGroupProps) {
  const displayed = tags.slice(0, max);
  const remaining = tags.length - max;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayed.map((tag) => (
        <ColoredTag
          key={tag.id}
          label={tag.label}
          color={tag.color}
          size="sm"
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
        />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground/60 px-2 py-0.5">+{remaining} more</span>
      )}
    </div>
  );
}
