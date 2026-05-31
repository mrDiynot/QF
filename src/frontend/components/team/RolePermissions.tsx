'use client';

/**
 * Role & Permissions Configuration Component
 * Define and manage role-based access control
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Shield,
  Crown,
  Users,
  Eye,
  Settings,
  Save,
  Plus,
  Lock,
  FileText,
  MessageSquare,
  Phone,
  BarChart3,
  Zap,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  isSystem: boolean;
  permissions: string[];
}

const PERMISSIONS: Permission[] = [
  // Leads
  { id: 'leads.view', name: 'View Leads', description: 'View lead information', category: 'Leads' },
  { id: 'leads.create', name: 'Create Leads', description: 'Add new leads', category: 'Leads' },
  { id: 'leads.edit', name: 'Edit Leads', description: 'Modify lead details', category: 'Leads' },
  { id: 'leads.delete', name: 'Delete Leads', description: 'Remove leads', category: 'Leads' },
  { id: 'leads.export', name: 'Export Leads', description: 'Export lead data', category: 'Leads' },
  
  // Conversations
  { id: 'conversations.view', name: 'View Conversations', description: 'Read messages', category: 'Conversations' },
  { id: 'conversations.reply', name: 'Reply to Conversations', description: 'Send messages', category: 'Conversations' },
  { id: 'conversations.assign', name: 'Assign Conversations', description: 'Assign to team members', category: 'Conversations' },
  
  // Voice
  { id: 'voice.view', name: 'View Calls', description: 'View call history', category: 'Voice' },
  { id: 'voice.make', name: 'Make Calls', description: 'Initiate outbound calls', category: 'Voice' },
  { id: 'voice.config', name: 'Configure Voice Agent', description: 'Modify AI agent settings', category: 'Voice' },
  
  // Forms
  { id: 'forms.view', name: 'View Forms', description: 'View form submissions', category: 'Forms' },
  { id: 'forms.create', name: 'Create Forms', description: 'Build new forms', category: 'Forms' },
  { id: 'forms.edit', name: 'Edit Forms', description: 'Modify existing forms', category: 'Forms' },
  
  // Automations
  { id: 'automations.view', name: 'View Automations', description: 'View workflows', category: 'Automations' },
  { id: 'automations.create', name: 'Create Automations', description: 'Build new workflows', category: 'Automations' },
  { id: 'automations.edit', name: 'Edit Automations', description: 'Modify workflows', category: 'Automations' },
  { id: 'automations.activate', name: 'Activate Automations', description: 'Enable/disable workflows', category: 'Automations' },
  
  // Analytics
  { id: 'analytics.view', name: 'View Analytics', description: 'Access reports', category: 'Analytics' },
  { id: 'analytics.export', name: 'Export Reports', description: 'Download analytics', category: 'Analytics' },
  
  // Billing
  { id: 'billing.view', name: 'View Billing', description: 'View invoices', category: 'Billing' },
  { id: 'billing.manage', name: 'Manage Billing', description: 'Update payment methods', category: 'Billing' },
  
  // Team
  { id: 'team.view', name: 'View Team', description: 'See team members', category: 'Team' },
  { id: 'team.invite', name: 'Invite Members', description: 'Send invitations', category: 'Team' },
  { id: 'team.manage', name: 'Manage Team', description: 'Update roles', category: 'Team' },
  
  // Settings
  { id: 'settings.view', name: 'View Settings', description: 'Access settings', category: 'Settings' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Modify settings', category: 'Settings' },
];

const DEFAULT_ROLES: Role[] = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to everything',
    color: 'bg-primary/10 text-primary',
    icon: <Crown className="size-4" />,
    isSystem: true,
    permissions: PERMISSIONS.map(p => p.id),
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Manage team and settings',
    color: 'bg-muted/50 text-info',
    icon: <Shield className="size-4" />,
    isSystem: true,
    permissions: PERMISSIONS.filter(p => !p.id.includes('billing.manage')).map(p => p.id),
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Standard team member',
    color: 'bg-green-100 text-green-700',
    icon: <Users className="size-4" />,
    isSystem: true,
    permissions: PERMISSIONS.filter(p => 
      !p.id.includes('billing') && 
      !p.id.includes('team.manage') && 
      !p.id.includes('settings.edit')
    ).map(p => p.id),
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    color: 'bg-muted/40 text-foreground/80',
    icon: <Eye className="size-4" />,
    isSystem: true,
    permissions: PERMISSIONS.filter(p => p.id.includes('.view')).map(p => p.id),
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Leads: <Users className="size-4" />,
  Conversations: <MessageSquare className="size-4" />,
  Voice: <Phone className="size-4" />,
  Forms: <FileText className="size-4" />,
  Automations: <Zap className="size-4" />,
  Analytics: <BarChart3 className="size-4" />,
  Billing: <CreditCard className="size-4" />,
  Team: <Users className="size-4" />,
  Settings: <Settings className="size-4" />,
};

interface RolePermissionsProps {
  className?: string;
}

export function RolePermissions({ className }: RolePermissionsProps) {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<string>('member');
  // Editing role state reserved for inline editing
  useState<string | null>(null);

  const currentRole = roles.find(r => r.id === selectedRole);

  // Toggle permission
  const togglePermission = (permissionId: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id !== selectedRole || role.isSystem && role.id === 'owner') return role;
      
      const hasPermission = role.permissions.includes(permissionId);
      return {
        ...role,
        permissions: hasPermission
          ? role.permissions.filter(p => p !== permissionId)
          : [...role.permissions, permissionId],
      };
    }));
  };

  // Check if role has permission
  const hasPermission = (permissionId: string) => {
    return currentRole?.permissions.includes(permissionId) || false;
  };

  // Group permissions by category
  const permissionsByCategory = PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Save changes
  const handleSave = () => {
    toast.success('Permissions saved');
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Roles & Permissions</h2>
          <p className="text-sm text-muted-foreground">
            Configure what each role can access
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-purple-700">
          <Save className="size-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Role List */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">Roles</h3>
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                  selectedRole === role.id
                    ? "bg-primary/5 border-2 border-primary/20"
                    : "hover:bg-muted/20 border-2 border-transparent"
                )}
              >
                <div className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  role.color
                )}>
                  {role.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{role.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{role.description}</p>
                </div>
                {role.isSystem && (
                  <Lock className="size-3 text-muted-foreground/60" />
                )}
              </button>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4 gap-2">
            <Plus className="size-4" />
            Create Role
          </Button>
        </Card>

        {/* Permissions Grid */}
        <Card className="lg:col-span-3 p-6">
          {currentRole && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    currentRole.color
                  )}>
                    {currentRole.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{currentRole.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentRole.description}</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {currentRole.permissions.length} / {PERMISSIONS.length} permissions
                </Badge>
              </div>

              <div className="space-y-6">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex size-6 items-center justify-center rounded bg-muted/40 text-muted-foreground">
                        {CATEGORY_ICONS[category]}
                      </div>
                      <h4 className="font-medium text-foreground">{category}</h4>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {permissions.map((permission) => {
                        const enabled = hasPermission(permission.id);
                        const isOwner = currentRole.id === 'owner';

                        return (
                          <div
                            key={permission.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border transition-colors",
                              enabled ? "bg-green-50 border-green-200" : "bg-muted/20 border-border"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {permission.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {permission.description}
                              </p>
                            </div>
                            <Switch
                              checked={enabled}
                              onCheckedChange={() => togglePermission(permission.id)}
                              disabled={isOwner}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {currentRole.id === 'owner' && (
                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex gap-3">
                    <Lock className="size-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Owner Role</p>
                      <p className="text-xs text-primary mt-1">
                        The Owner role has full access to all features and cannot be modified.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
