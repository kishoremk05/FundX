import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LoanProduct {
  id: string;
  name: string;
  description: string;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  is_active: boolean;
  created_at: string;
}

export default function Products() {
  const { data: products = [], loading, add, update, remove } = useFirestore<LoanProduct>('loan_products');
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    interest_rate: 10,
    min_amount: 50000,
    max_amount: 10000000,
    min_duration: 1,
    max_duration: 24,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await update(editingProduct.id, { ...formData });
        toast({ title: 'Loan Type Updated', description: `${formData.name} has been updated.` });
      } else {
        await add({
          ...formData,
          is_active: true,
          created_at: new Date().toISOString(),
        });
        toast({ title: 'Loan Type Created', description: `${formData.name} has been added.` });
      }
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: LoanProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      interest_rate: product.interest_rate,
      min_amount: product.min_amount,
      max_amount: product.max_amount,
      min_duration: product.min_duration,
      max_duration: product.max_duration,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await remove(id);
        toast({ title: 'Loan Type Deleted', description: `${name} has been removed.` });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      interest_rate: 10,
      min_amount: 50000,
      max_amount: 10000000,
      min_duration: 1,
      max_duration: 24,
    });
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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Loan Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure loan types, interest rates, and terms</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Loan Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Loan Type' : 'Add Loan Type'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update loan product details' : 'Create a new loan product'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Business Loan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Interest Rate (% / month)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({ ...formData, interest_rate: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (months)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={formData.min_duration}
                      onChange={(e) => setFormData({ ...formData, min_duration: parseInt(e.target.value) })}
                      placeholder="Min"
                      required
                    />
                    <span className="text-gray-400">-</span>
                    <Input
                      type="number"
                      value={formData.max_duration}
                      onChange={(e) => setFormData({ ...formData, max_duration: parseInt(e.target.value) })}
                      placeholder="Max"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Amount</Label>
                  <Input
                    type="number"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Amount</Label>
                  <Input
                    type="number"
                    value={formData.max_amount}
                    onChange={(e) => setFormData({ ...formData, max_amount: parseInt(e.target.value) })}
                    required
                  />
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
                    editingProduct ? 'Update' : 'Add Loan Type'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{product.description || 'For general purposes'}</p>
                  </div>
                  <Badge className={cn(
                    "text-xs font-medium",
                    product.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  )}>
                    {product.is_active ? 'active' : 'inactive'}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Interest Rate</span>
                    <span className="text-sm font-semibold text-foreground">{product.interest_rate}% / month</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount Range</span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-semibold text-foreground">
                      {product.min_duration} - {product.max_duration} months
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(product.id, product.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full bg-card border-2 border-dashed border-border">
            <CardContent className="p-12 text-center">
              <h3 className="font-semibold text-foreground mb-2">No loan products yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first loan product to get started</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Loan Type
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
