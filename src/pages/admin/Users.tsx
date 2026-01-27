import { useState, useMemo } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/database.types';
import { createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { secondaryAuth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Users() {
  const { toast } = useToast();
  const queryOptions = useMemo(() => ({
    orderByField: 'created_at',
    orderDirection: 'desc' as const
  }), []);

  const { data: allProfiles = [], loading, add, update, remove } = useFirestore<Profile>('profiles', queryOptions);

  // Filter for staff only
  const users = allProfiles.filter(p => p.role !== 'customer');

  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'loan_officer' as string,
    custom_role: '',
    assigned_stage: 1,
  });

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-orange-100 text-orange-700',
      loan_officer: 'bg-blue-100 text-blue-700',
      branch_manager: 'bg-green-100 text-green-700',
      customer: 'bg-gray-100 text-gray-600',
    };

    const labels: Record<string, string> = {
      admin: 'Admin',
      loan_officer: 'Loan Officer',
      branch_manager: 'Branch Manager',
      customer: 'Customer',
    };

    return (
      <Badge className={cn("font-medium text-xs", styles[role] || styles.customer)}>
        {labels[role] || role}
      </Badge>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setIsSubmitting(true);
    try {
      if (editingUser) {
        const finalRole = formData.role === 'custom' ? formData.custom_role : formData.role;
        await update(editingUser.id, {
          full_name: formData.full_name,
          role: finalRole,
          assigned_stage: formData.assigned_stage,
        });
        toast({
          title: 'User Updated',
          description: `${formData.full_name} has been updated.`,
        });
      } else {
        // Create Firebase Auth user first
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        // Use secondary auth to create user without affecting current session
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
        const userId = userCredential.user.uid;

        // Sign out from secondary auth immediately (doesn't affect main auth)
        await firebaseSignOut(secondaryAuth);

        // Determine final role (use custom_role if role is 'custom')
        const finalRole = formData.role === 'custom' ? formData.custom_role : formData.role;

        // Create profile in Firestore
        const newProfile: Partial<Profile> = {
          id: userId,
          email: formData.email,
          full_name: formData.full_name,
          role: finalRole,
          assigned_stage: formData.assigned_stage,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await setDoc(doc(db, 'profiles', userId), newProfile);

        toast({
          title: 'User Created',
          description: `${formData.full_name} can now login with their credentials.`,
        });
      }
      setDialogOpen(false);
      setEditingUser(null);
      setFormData({ email: '', password: '', full_name: '', role: 'loan_officer', custom_role: '', assigned_stage: 1 });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      password: '',
      full_name: user.full_name || '',
      role: user.role || 'loan_officer',
      custom_role: '',
      assigned_stage: user.assigned_stage || 1,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (user: Profile) => {
    if (!confirm(`Are you sure you want to remove ${user.full_name}?`)) return;
    try {
      await remove(user.id);
      toast({ title: 'User Removed', description: `${user.full_name} has been removed.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Users & Roles</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingUser(null);
            setFormData({ email: '', password: '', full_name: '', role: 'loan_officer', custom_role: '', assigned_stage: 1 });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user information' : 'Add a new staff member'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  disabled={!!editingUser}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Full name"
                  required
                />
              </div>

              {/* Password - only for new users */}
              {!editingUser && (
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value, custom_role: '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="loan_officer">Stage 1 - Loan Officer</SelectItem>
                    <SelectItem value="ops_director">Stage 2 - Operational Director</SelectItem>
                    <SelectItem value="md_finance">Stage 3 - MD/Finance Director</SelectItem>
                    <SelectItem value="ceo">Stage 4 - CEO</SelectItem>
                    <SelectItem value="finance_officer">Stage 5 - Finance Disbursement</SelectItem>
                    <SelectItem value="branch_manager">Branch Manager</SelectItem>
                    <SelectItem value="custom">Custom Role...</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Role Input */}
              {formData.role === 'custom' && (
                <div className="space-y-2">
                  <Label>Custom Role Name</Label>
                  <Input
                    value={formData.custom_role}
                    onChange={(e) => setFormData({ ...formData, custom_role: e.target.value })}
                    placeholder="Enter custom role name"
                    required
                  />
                </div>
              )}

              {/* Assigned Stage - for officer roles */}
              {['loan_officer', 'ops_director', 'md_finance', 'ceo', 'finance_officer', 'custom'].includes(formData.role) && (
                <div className="space-y-2">
                  <Label>Assigned Approval Stage</Label>
                  <Select
                    value={formData.assigned_stage.toString()}
                    onValueChange={(value) => setFormData({ ...formData, assigned_stage: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Stage 1 - Loan Officer</SelectItem>
                      <SelectItem value="2">Stage 2 - Operational Director</SelectItem>
                      <SelectItem value="3">Stage 3 - MD/Finance Director</SelectItem>
                      <SelectItem value="4">Stage 4 - CEO Approval</SelectItem>
                      <SelectItem value="5">Stage 5 - Finance Disbursement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingUser ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingUser ? 'Update User' : 'Add User'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border">
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Name</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Email</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Role</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Status</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Created</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/10 border-b border-border">
                    <TableCell className="py-4 font-medium text-foreground">{user.full_name || 'Unnamed'}</TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="py-4">{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="py-4">
                      <Badge className={cn(
                        "font-medium text-xs",
                        user.is_active !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      )}>
                        {user.is_active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(user)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
