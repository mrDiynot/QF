'use client';

/**
 * Social & Sharing Components
 * Share buttons, comments, reactions
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Share2,
  Link,
  Mail,
  Copy,
  Check,
  MessageCircle,
  ThumbsUp,
  Heart,
  MoreVertical,
  Send,
  Trash2,
  Flag,
  Edit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Share Button
interface ShareButtonProps {
  url: string;
  title?: string;
  description?: string;
  className?: string;
}

export function ShareButton({ url, title, description, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: <Link className="size-4" />,
      action: async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
      },
    },
    {
      name: 'Email',
      icon: <Mail className="size-4" />,
      action: () => {
        const subject = encodeURIComponent(title || 'Check this out');
        const body = encodeURIComponent(`${description || ''}\n\n${url}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
      },
    },
    {
      name: 'Twitter',
      icon: <span className="text-sm font-bold">𝕏</span>,
      action: () => {
        const text = encodeURIComponent(title || '');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
      },
    },
    {
      name: 'LinkedIn',
      icon: <span className="text-sm font-bold">in</span>,
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
      },
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <Share2 className="size-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {shareOptions.map((option) => (
          <DropdownMenuItem key={option.name} onClick={option.action} className="gap-2">
            {option.name === 'Copy Link' && copied ? <Check className="size-4 text-green-500" /> : option.icon}
            {option.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Social Share Row
interface SocialShareRowProps {
  url: string;
  title?: string;
  platforms?: ('twitter' | 'linkedin' | 'facebook' | 'email' | 'copy')[];
  className?: string;
}

export function SocialShareRow({
  url,
  title,
  platforms = ['twitter', 'linkedin', 'email', 'copy'],
  className,
}: SocialShareRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrls: Record<string, string> = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || '')}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title || '')}&body=${encodeURIComponent(url)}`,
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {platforms.map((platform) => (
        platform === 'copy' ? (
          <Button
            key={platform}
            variant="outline"
            size="icon"
            className="size-9"
            onClick={handleCopy}
          >
            {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
          </Button>
        ) : (
          <Button
            key={platform}
            variant="outline"
            size="icon"
            className="size-9"
            asChild
          >
            <a href={shareUrls[platform]} target="_blank" rel="noopener noreferrer">
              {platform === 'twitter' && <span className="font-bold">𝕏</span>}
              {platform === 'linkedin' && <span className="font-bold text-sm">in</span>}
              {platform === 'facebook' && <span className="font-bold text-sm">f</span>}
              {platform === 'email' && <Mail className="size-4" />}
            </a>
          </Button>
        )
      ))}
    </div>
  );
}

// Comment
interface Comment {
  id: string;
  author: { name: string; avatar?: string };
  content: string;
  createdAt: Date;
  likes?: number;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  onReply?: (commentId: string) => void;
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onEdit?: (commentId: string) => void;
  isOwner?: boolean;
  depth?: number;
}

export function CommentItem({
  comment,
  onReply,
  onLike,
  onDelete,
  onEdit,
  isOwner = false,
  depth = 0,
}: CommentItemProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className={cn("flex gap-3", depth > 0 && "ml-10")}>
      <Avatar className="size-8 flex-shrink-0">
        <AvatarImage src={comment.author.avatar} />
        <AvatarFallback className="text-xs">
          {comment.author.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-foreground">{comment.author.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6">
                  <MoreVertical className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(comment.id)} className="gap-2">
                      <Edit className="size-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete?.(comment.id)} className="gap-2 text-red-600">
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
                {!isOwner && (
                  <DropdownMenuItem className="gap-2">
                    <Flag className="size-4" /> Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-foreground/80 mt-1">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(comment.createdAt, { addSuffix: true })}</span>
          <button
            onClick={() => { setLiked(!liked); onLike?.(comment.id); }}
            className={cn("flex items-center gap-1 hover:text-primary", liked && "text-primary")}
          >
            <ThumbsUp className="size-3" /> {(comment.likes || 0) + (liked ? 1 : 0)}
          </button>
          {onReply && (
            <button onClick={() => onReply(comment.id)} className="hover:text-primary">
              Reply
            </button>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onLike={onLike}
                onDelete={onDelete}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Comment Thread
interface CommentThreadProps {
  comments: Comment[];
  onAddComment?: (content: string) => void;
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  currentUserId?: string;
  className?: string;
}

export function CommentThread({
  comments,
  onAddComment,
  onLike,
  onDelete,
  onReply,
  currentUserId,
  className,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment?.(newComment);
    setNewComment('');
  };

  const handleReply = (commentId: string) => {
    if (!replyContent.trim()) return;
    onReply?.(commentId, replyContent);
    setReplyingTo(null);
    setReplyContent('');
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Add Comment */}
      {onAddComment && (
        <div className="flex gap-3">
          <Avatar className="size-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newComment.trim()}
                className="gap-2 bg-primary hover:bg-purple-700"
              >
                <Send className="size-4" />
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              onLike={onLike}
              onDelete={onDelete}
              onReply={(id) => setReplyingTo(id)}
              isOwner={comment.author.name === currentUserId}
            />
            {replyingTo === comment.id && (
              <div className="ml-10 mt-2 flex gap-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="resize-none"
                />
                <div className="flex flex-col gap-1">
                  <Button size="sm" onClick={() => handleReply(comment.id)} className="bg-primary hover:bg-purple-700">
                    <Send className="size-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="size-10 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No comments yet</p>
        </div>
      )}
    </div>
  );
}

// Reaction Picker
type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

interface ReactionPickerProps {
  selected?: ReactionType;
  counts?: Partial<Record<ReactionType, number>>;
  onSelect?: (reaction: ReactionType | null) => void;
  className?: string;
}

const REACTIONS: Array<{ type: ReactionType; emoji: string; label: string }> = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'laugh', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😠', label: 'Angry' },
];

export function ReactionPicker({ selected, counts = {}, onSelect, className }: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const totalCount = Object.values(counts).reduce((sum, c) => sum + (c || 0), 0);

  const handleSelect = (type: ReactionType) => {
    onSelect?.(selected === type ? null : type);
    setShowPicker(false);
  };

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <div
        className="relative"
        onMouseEnter={() => setShowPicker(true)}
        onMouseLeave={() => setShowPicker(false)}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-2", selected && "text-primary")}
        >
          {selected ? (
            <span className="text-lg">{REACTIONS.find(r => r.type === selected)?.emoji}</span>
          ) : (
            <ThumbsUp className="size-4" />
          )}
          {totalCount > 0 && <span>{totalCount}</span>}
        </Button>

        {/* Picker */}
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-full shadow-lg border flex gap-1 z-10">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => handleSelect(reaction.type)}
                className={cn(
                  "text-xl p-1 rounded-full hover:bg-muted/40 transition-transform hover:scale-125",
                  selected === reaction.type && "bg-primary/10"
                )}
                title={reaction.label}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reaction Summary */}
      {totalCount > 0 && (
        <div className="flex -space-x-1 ml-2">
          {Object.entries(counts)
            .filter(([, count]) => count && count > 0)
            .slice(0, 3)
            .map(([type]) => (
              <span key={type} className="text-sm">
                {REACTIONS.find(r => r.type === type)?.emoji}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

// Like Button (simple)
interface LikeButtonProps {
  liked?: boolean;
  count?: number;
  onToggle?: () => void;
  className?: string;
}

export function LikeButton({ liked = false, count = 0, onToggle, className }: LikeButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className={cn("gap-2", liked && "text-red-500", className)}
    >
      <Heart className={cn("size-4", liked && "fill-current")} />
      {count > 0 && <span>{count}</span>}
    </Button>
  );
}

// Engagement Bar
interface EngagementBarProps {
  likes?: number;
  comments?: number;
  shares?: number;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  liked?: boolean;
  className?: string;
}

export function EngagementBar({
  likes = 0,
  comments = 0,
  shares = 0,
  onLike,
  onComment,
  onShare,
  liked = false,
  className,
}: EngagementBarProps) {
  return (
    <div className={cn("flex items-center justify-between py-2 border-t border-b", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onLike}
        className={cn("flex-1 gap-2", liked && "text-primary")}
      >
        <ThumbsUp className={cn("size-4", liked && "fill-current")} />
        {likes > 0 ? likes : 'Like'}
      </Button>
      <Button variant="ghost" size="sm" onClick={onComment} className="flex-1 gap-2">
        <MessageCircle className="size-4" />
        {comments > 0 ? comments : 'Comment'}
      </Button>
      <Button variant="ghost" size="sm" onClick={onShare} className="flex-1 gap-2">
        <Share2 className="size-4" />
        {shares > 0 ? shares : 'Share'}
      </Button>
    </div>
  );
}
