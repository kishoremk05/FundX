import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import type { Coupon, CouponInsert } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Copy, Ticket, Calendar } from 'lucide-react';

export default function Coupons() {
    const { toast } = useToast();
    const { data: coupons, loading, add, update, remove } = useFirestore<Coupon>('coupons', { orderByField: 'created_at', orderDirection: 'desc' });

    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const emptyForm = { code: '', discount_type: 'percentage' as const, discount_value: 0, max_uses: 100, expires_at: '', is_active: true };
    const [formData, setFormData] = useState(emptyForm);

    const filteredCoupons = coupons.filter(c => c.code?.toLowerCase().includes(searchQuery.toLowerCase()));

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormData({ ...formData, code });
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: 'Copied', description: 'Coupon code copied' });
    };

    const isExpired = (date: string | null) => date ? new Date(date) < new Date() : false;

    const handleCreate = async () => {
        if (!formData.code || formData.discount_value <= 0) {
            toast({ title: 'Validation Error', description: 'Fill required fields.', variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        try {
            const data: CouponInsert = { ...formData, expires_at: formData.expires_at || null, used_count: 0 };
            await add(data);
            toast({ title: 'Coupon Created' });
            setFormData(emptyForm);
            setIsCreateOpen(false);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedCoupon) return;
        setIsSubmitting(true);
        try {
            await update(selectedCoupon.id, { ...formData, expires_at: formData.expires_at || null });
            toast({ title: 'Coupon Updated' });
            setIsEditOpen(false);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (coupon: Coupon) => {
        if (!confirm('Delete this coupon?')) return;
        try {
            await remove(coupon.id);
            toast({ title: 'Coupon Deleted' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const openEditDialog = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setFormData({ code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value, max_uses: coupon.max_uses || 100, expires_at: coupon.expires_at?.split('T')[0] || '', is_active: coupon.is_active });
        setIsEditOpen(true);
    };

    if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const CouponForm = () => (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Coupon Code *</Label><div className="flex gap-2"><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="SAVE20" /><Button type="button" variant="outline" onClick={generateCode}>Generate</Button></div></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Discount Type</Label><Select value={formData.discount_type} onValueChange={(v: 'percentage' | 'fixed') => setFormData({ ...formData, discount_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage (%)</SelectItem><SelectItem value="fixed">Fixed Amount ($)</SelectItem></SelectContent></Select></div>
                <div className="grid gap-2"><Label>Discount Value *</Label><Input type="number" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Max Uses</Label><Input type="number" value={formData.max_uses} onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) || 100 })} /></div>
                <div className="grid gap-2"><Label>Expires At</Label><Input type="date" value={formData.expires_at} onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })} /></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-heading font-bold">Coupon Management</h1><p className="text-muted-foreground mt-1">Manage discount coupons</p></div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}><DialogTrigger asChild><Button onClick={() => setFormData(emptyForm)}><Plus className="w-4 h-4 mr-2" />Add Coupon</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader><CouponForm /><DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create'}</Button></DialogFooter></DialogContent></Dialog>
            </div>

            <Card>
                <CardHeader><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" /><Input placeholder="Search coupons..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 max-w-md" /></div></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Usage</TableHead><TableHead>Expires</TableHead><TableHead>Status</TableHead><TableHead className="w-[70px]"></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredCoupons.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8">No coupons found</TableCell></TableRow> : (
                                filteredCoupons.map((coupon) => (
                                    <TableRow key={coupon.id}>
                                        <TableCell><div className="flex items-center gap-2"><Ticket className="w-4 h-4 text-primary" /><code className="bg-muted px-2 py-1 rounded font-mono">{coupon.code}</code><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(coupon.code)}><Copy className="w-3 h-3" /></Button></div></TableCell>
                                        <TableCell><Badge variant="secondary">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}</Badge></TableCell>
                                        <TableCell>{coupon.used_count || 0} / {coupon.max_uses || '∞'}</TableCell>
                                        <TableCell>{coupon.expires_at ? <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(coupon.expires_at).toLocaleDateString()}</div> : 'Never'}</TableCell>
                                        <TableCell><Badge variant={!coupon.is_active ? 'secondary' : isExpired(coupon.expires_at) ? 'destructive' : 'default'}>{!coupon.is_active ? 'Inactive' : isExpired(coupon.expires_at) ? 'Expired' : 'Active'}</Badge></TableCell>
                                        <TableCell>
                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(coupon)}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(coupon)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}><DialogContent><DialogHeader><DialogTitle>Edit Coupon</DialogTitle></DialogHeader><CouponForm /><DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleUpdate} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button></DialogFooter></DialogContent></Dialog>
        </div>
    );
}
