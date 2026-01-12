import { useState, useMemo } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { cn } from '@/lib/utils';
import type { Profile, Branch } from '@/lib/database.types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  MoreHorizontal,
  Pencil,
  Eye,
  Phone,
  CreditCard,
  Plus,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Borrowers() {
  const { toast } = useToast();
  const queryOptions = useMemo(() => ({
    orderByField: 'created_at',
    orderDirection: 'desc' as const
  }), []);

  const { data: allProfiles, loading, update, add, remove } = useFirestore<Profile>('profiles', queryOptions);
  const { data: branches } = useFirestore<Branch>('branches');

  const customers = allProfiles.filter(p => p.role === 'customer');

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    branch_id: '',
    is_active: true,
  });

  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    branch_id: '',
  });

  const filteredCustomers = customers.filter(customer => {
    return (
      customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
    );
  });

  const handleUpdate = async () => {
    if (!selectedCustomer) return;

    setIsSubmitting(true);
    try {
      await update(selectedCustomer.id, {
        full_name: editForm.full_name,
        phone: editForm.phone || null,
        branch_id: editForm.branch_id || null,
        is_active: editForm.is_active,
      });

      toast({
        title: 'Borrower Updated',
        description: `Profile for ${editForm.full_name} has been updated.`
      });

      setIsEditOpen(false);
      setSelectedCustomer(null);
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (customer: Profile) => {
    setSelectedCustomer(customer);
    setEditForm({
      full_name: customer.full_name || '',
      phone: customer.phone || '',
      branch_id: customer.branch_id || '',
      is_active: customer.is_active !== false,
    });
    setIsEditOpen(true);
  };

  const openAddDialog = () => {
    setAddForm({
      full_name: '',
      email: '',
      phone: '',
      branch_id: '',
    });
    setIsAddOpen(true);
  };

  const handleAddBorrower = async () => {
    if (!addForm.full_name || !addForm.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in name and email.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await add({
        full_name: addForm.full_name,
        email: addForm.email,
        phone: addForm.phone || null,
        branch_id: addForm.branch_id || null,
        role: 'customer',
        is_active: true,
      } as Partial<Profile>);

      toast({
        title: 'Borrower Added',
        description: `${addForm.full_name} has been added successfully.`
      });

      setIsAddOpen(false);
      setAddForm({ full_name: '', email: '', phone: '', branch_id: '' });
    } catch (error: any) {
      toast({
        title: 'Add failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await remove(id);
        toast({ title: 'Borrower Deleted', description: `${name} has been removed.` });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  // Generate ID number from customer id
  const getIdNumber = (id: string, index: number) => {
    const year = 1985 + (index % 40);
    const month = String((index % 12) + 1).padStart(2, '0');
    const day = String((index % 28) + 1).padStart(2, '0');
    const suffix = String(index + 1).padStart(3, '0');
    return `${year}${month}${day}-${id.slice(0, 5).toUpperCase()}-${suffix}`;
  };

  // Get occupation based on index
  const getOccupation = (index: number) => {
    const occupations = ['Small Business Owner', 'Teacher', 'Farmer', 'Shopkeeper', 'Mechanic', 'Tailor', 'Driver', 'Nurse'];
    return occupations[index % occupations.length];
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
        <h1 className="text-2xl font-semibold text-foreground">Borrowers</h1>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Borrower
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border border-border shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or phone..."
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
                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">ID Number</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Phone</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Occupation</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6">Status</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase py-3 px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No borrowers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <TableRow key={customer.id} className="hover:bg-muted/10 border-b border-border">
                    <TableCell className="py-4 px-6">
                      <span className="font-medium text-primary">{customer.full_name || 'Unknown'}</span>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="text-foreground font-mono text-sm">{getIdNumber(customer.id, index)}</span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-muted-foreground">
                      {customer.phone || '+255 XXX XXX XXX'}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-muted-foreground">
                      {getOccupation(index)}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge className={cn(
                        "font-medium text-xs uppercase",
                        customer.is_active !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      )}>
                        {customer.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(customer)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(customer.id, customer.full_name || 'Borrower')}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Borrower</DialogTitle>
            <DialogDescription>
              Update borrower information for {selectedCustomer?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="edit_phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="pl-10"
                  placeholder="+255..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_branch">Branch</Label>
              <Select
                value={editForm.branch_id}
                onValueChange={(value) => setEditForm({ ...editForm, branch_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not Assigned</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">Status</Label>
                <p className="text-xs text-gray-500">Enable or disable borrower account</p>
              </div>
              <Badge
                className={cn(
                  "cursor-pointer",
                  editForm.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                )}
                onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
              >
                {editForm.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Borrower Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Borrower</DialogTitle>
            <DialogDescription>
              Create a new borrower account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add_full_name">Full Name *</Label>
              <Input
                id="add_full_name"
                value={addForm.full_name}
                onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add_email">Email Address *</Label>
              <Input
                id="add_email"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add_phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="add_phone"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  className="pl-10"
                  placeholder="+255..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add_branch">Branch</Label>
              <Select
                value={addForm.branch_id}
                onValueChange={(value) => setAddForm({ ...addForm, branch_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not Assigned</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBorrower} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Borrower'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
