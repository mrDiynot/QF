'use client';

/**
 * User & Avatar Components
 * Avatar groups, user menus, and status indicators
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  Settings,
  LogOut,
  HelpCircle,
  CreditCard,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Avatar with Status
interface AvatarWithStatusProps {
  src?: string;
  name: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const STATUS_COLORS = {
  online: 'bg-success',
  offline: 'bg-muted-foreground/40',
  away: 'bg-warning',
  busy: 'bg-error',
};

const AVATAR_SIZES = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
  xl: 'size-16',
};

const STATUS_SIZES = {
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3',
  xl: 'size-4',
};

export function AvatarWithStatus({ src, name, status, size = 'md', className }: AvatarWithStatusProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={AVATAR_SIZES[size]}>
        <AvatarImage src={src} alt={name} />
        <AvatarFallback className={cn(size === 'sm' && 'text-xs', size === 'xl' && 'text-lg')}>
          {initials}
        </AvatarFallback>
      </Avatar>
      {status && (
        <span className={cn(
          "absolute bottom-0 right-0 rounded-full border-2 border-white",
          STATUS_COLORS[status],
          STATUS_SIZES[size]
        )} />
      )}
    </div>
  );
}

// Avatar Group (stacked avatars)
interface AvatarGroupProps {
  users: Array<{ name: string; avatar?: string }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({ users, max = 4, size = 'md', className }: AvatarGroupProps) {
  const displayed = users.slice(0, max);
  const remaining = users.length - max;

  const sizes = { sm: 'size-6', md: 'size-8', lg: 'size-10' };
  const overlaps = { sm: '-ml-2', md: '-ml-3', lg: '-ml-4' };

  return (
    <div className={cn("flex items-center", className)}>
      {displayed.map((user, index) => (
        <Avatar
          key={index}
          className={cn(sizes[size], "border-2 border-white", index > 0 && overlaps[size])}
        >
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className={cn(size === 'sm' && 'text-[10px]', size === 'lg' && 'text-sm')}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium border-2 border-white",
          sizes[size],
          overlaps[size],
          size === 'sm' && 'text-[10px]',
          size === 'lg' && 'text-sm'
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
}

// User Menu Dropdown
interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onSignOut?: () => void;
  className?: string;
}

export function UserMenu({ user, onSignOut, className }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("flex items-center gap-2 h-auto py-1.5 px-2", className)}>
          <AvatarWithStatus src={user.avatar} name={user.name} size="sm" status="online" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role || 'Member'}</p>
          </div>
          <ChevronDown className="size-4 text-muted-foreground/60 hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/settings/profile" className="cursor-pointer">
            <User className="size-4 mr-2" /> Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/settings" className="cursor-pointer">
            <Settings className="size-4 mr-2" /> Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/settings/subscription" className="cursor-pointer">
            <CreditCard className="size-4 mr-2" /> Billing
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/help" className="cursor-pointer">
            <HelpCircle className="size-4 mr-2" /> Help & Support
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="text-error cursor-pointer">
          <LogOut className="size-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// User Card
interface UserCardProps {
  user: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
    status?: 'online' | 'offline' | 'away' | 'busy';
  };
  actions?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export function UserCard({ user, actions, compact = false, className }: UserCardProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <AvatarWithStatus src={user.avatar} name={user.name} status={user.status} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          {user.role && <p className="text-xs text-muted-foreground">{user.role}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between p-4 rounded-lg border", className)}>
      <div className="flex items-center gap-3">
        <AvatarWithStatus src={user.avatar} name={user.name} status={user.status} size="md" />
        <div>
          <p className="font-medium text-foreground">{user.name}</p>
          {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
          {user.role && (
            <Badge variant="secondary" className="mt-1">{user.role}</Badge>
          )}
        </div>
      </div>
      {actions}
    </div>
  );
}

// Team Member List Item
interface TeamMemberProps {
  member: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    status?: 'online' | 'offline' | 'away' | 'busy';
  };
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

export function TeamMember({ member, onEdit, onRemove, className }: TeamMemberProps) {
  return (
    <div className={cn("flex items-center justify-between p-3 hover:bg-muted/20 rounded-lg", className)}>
      <div className="flex items-center gap-3">
        <AvatarWithStatus src={member.avatar} name={member.name} status={member.status} size="md" />
        <div>
          <p className="font-medium text-foreground">{member.name}</p>
          <p className="text-sm text-muted-foreground">{member.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="gap-1">
          <Shield className="size-3" />
          {member.role}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(member.id)}>
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onRemove?.(member.id)} className="text-red-600">
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Presence Indicator (dot only)
interface PresenceIndicatorProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function PresenceIndicator({ status, showLabel = false, size = 'md', className }: PresenceIndicatorProps) {
  const labels = { online: 'Online', offline: 'Offline', away: 'Away', busy: 'Busy' };
  const sizes = { sm: 'size-2', md: 'size-2.5' };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("rounded-full", STATUS_COLORS[status], sizes[size])} />
      {showLabel && <span className="text-xs text-muted-foreground">{labels[status]}</span>}
    </div>
  );
}

// User Select (for assignments)
interface UserSelectProps {
  users: Array<{ id: string; name: string; avatar?: string }>;
  value?: string;
  onChange?: (userId: string) => void;
  placeholder?: string;
  className?: string;
}

export function UserSelect({ users, value, onChange, placeholder = 'Select user', className }: UserSelectProps) {
  const selectedUser = users.find(u => u.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("justify-start gap-2", className)}>
          {selectedUser ? (
            <>
              <Avatar className="size-5">
                <AvatarImage src={selectedUser.avatar} />
                <AvatarFallback className="text-[10px]">
                  {selectedUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {selectedUser.name}
            </>
          ) : (
            <>
              <User className="size-4 text-muted-foreground/60" />
              {placeholder}
            </>
          )}
          <ChevronDown className="size-4 ml-auto text-muted-foreground/60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {users.map((user) => (
          <DropdownMenuItem key={user.id} onClick={() => onChange?.(user.id)} className="gap-2">
            <Avatar className="size-6">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-[10px]">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {user.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
