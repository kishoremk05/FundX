import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Pencil, Trash2, MapPin, Phone, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Available permissions for branch managers
const BRANCH_PERMISSIONS = [
  { id: 'view_dashboard', label: 'View Dashboard', description: 'Access branch dashboard' },
  { id: 'manage_borrowers', label: 'Manage Borrowers', description: 'Add, edit, view borrowers' },
  { id: 'view_loans', label: 'View Loans', description: 'View loan applications' },
  { id: 'approve_loans', label: 'Approve Loans', description: 'Approve/reject loan applications' },
  { id: 'manage_repayments', label: 'Manage Repayments', description: 'Record and manage repayments' },
  { id: 'view_reports', label: 'View Reports', description: 'Access branch reports' },
  { id: 'manage_staff', label: 'Manage Staff', description: 'Manage branch staff' },
  { id: 'view_accounts', label: 'View Accounts', description: 'View branch accounts' },
  { id: 'manage_expenses', label: 'Manage Expenses', description: 'Record and manage expenses' },
];

interface Branch {
    id: string;
    name: string;
    code: string;
    manager: string;
    phone: string;
    address: string;
    is_active: boolean;
    created_at: string;
    permissions?: string[];
}

export default function Branches() {
    const { data: branches = [], loading, add, update, remove } = useFirestore<Branch>('branches');
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        manager: '',
        phone: '',
        address: '',
        permissions: ['view_dashboard', 'manage_borrowers', 'view_loans', 'manage_repayments', 'view_reports'] as string[],
    });

    const filteredBranches = branches.filter(branch =>
        branch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.manager?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePermissionToggle = (permissionId: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingBranch) {
                await update(editingBranch.id, { ...formData });
                toast({ title: 'Branch Updated', description: `${formData.name} has been updated.` });
            } else {
                await add({
                    ...formData,
                    is_active: true,
                    created_at: new Date().toISOString(),
                });
                toast({ title: 'Branch Created', description: `${formData.name} has been added.` });
            }
            setDialogOpen(false);
            resetForm();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (branch: Branch) => {
        setEditingBranch(branch);
        setFormData({
            name: branch.name,
            code: branch.code,
            manager: branch.manager || '',
            phone: branch.phone || '',
            address: branch.address || '',
            permissions: branch.permissions || ['view_dashboard', 'manage_borrowers', 'view_loans', 'manage_repayments', 'view_reports'],
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await remove(id);
                toast({ title: 'Branch Deleted', description: `${name} has been removed.` });
            } catch (error: any) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            }
        }
    };

    const resetForm = () => {
        setEditingBranch(null);
        setFormData({ name: '', code: '', manager: '', phone: '', address: '', permissions: ['view_dashboard', 'manage_borrowers', 'view_loans', 'manage_repayments', 'view_reports'] });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-foreground">Branches</h1>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Branch
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
                            <DialogDescription>
                                {editingBranch ? 'Update branch details and permissions' : 'Add a new branch location and set manager permissions'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Branch Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Main Branch"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Branch Code</Label>
                                    <Input
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="e.g. MB-001"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Manager Name</Label>
                                    <Input
                                        value={formData.manager}
                                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                        placeholder="Manager name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+255..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Branch address"
                                />
                            </div>

                            {/* Branch Manager Permissions */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Branch Manager Permissions</Label>
                                <p className="text-xs text-muted-foreground">
                                    Select which features the branch manager can access
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg bg-muted/30">
                                    {BRANCH_PERMISSIONS.map((permission) => (
                                        <div key={permission.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`branch-${permission.id}`}
                                                checked={formData.permissions.includes(permission.id)}
                                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                            />
                                            <label
                                                htmlFor={`branch-${permission.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {permission.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        editingBranch ? 'Update Branch' : 'Add Branch'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <Card className="bg-card border border-border shadow-sm mb-6">
                <CardContent className="p-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search branches..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-background border-border"
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
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Name</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Code</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Manager</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Contact</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Status</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBranches.length > 0 ? (
                                filteredBranches.map((branch) => (
                                    <TableRow key={branch.id} className="hover:bg-gray-50 border-b border-gray-100">
                                        <TableCell className="py-4 px-6">
                                            <div>
                                                <p className="font-medium text-foreground">{branch.name}</p>
                                                {branch.address && (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <MapPin className="w-3 h-3" />
                                                        {branch.address}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <code className="text-xs font-mono bg-muted text-muted-foreground px-2 py-1 rounded">
                                                {branch.code}
                                            </code>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-sm text-foreground">
                                            {branch.manager || '-'}
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-sm text-foreground">
                                            {branch.phone ? (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {branch.phone}
                                                </span>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <Badge className={cn(
                                                "font-medium text-xs",
                                                branch.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-500"
                                            )}>
                                                {branch.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(branch)}
                                                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(branch.id, branch.name)}
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                        No branches found
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
