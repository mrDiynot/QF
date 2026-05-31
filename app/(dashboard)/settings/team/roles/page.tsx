'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Plus } from 'lucide-react';

export default function RolesManagementPage() {
  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-navy">Roles & Permissions</h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage team roles and access permissions
            </p>
          </div>
          <Button>
            <Plus className="size-4 mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {['Owner', 'Admin', 'Manager', 'Viewer'].map((role) => (
          <Card key={role}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="size-5 text-purple-600" />
                <CardTitle className="text-lg">{role}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">Full access to platform</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
