import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Search, Phone, Mail, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Contact {
    id: string;
    name: string;
    company: string;
    contact_type: 'supplier' | 'partner' | 'other';
    phone: string;
    email: string;
    created_at: string;
}

export default function Contacts() {
    const { data: contacts = [], loading, add, remove } = useFirestore<Contact>('contacts');
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        contact_type: 'supplier' as 'supplier' | 'partner' | 'other',
        phone: '',
        email: '',
    });

    const filteredContacts = contacts.filter(contact =>
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTypeBadge = (type: string) => {
        const styles: Record<string, string> = {
            supplier: 'bg-purple-100 text-purple-700',
            partner: 'bg-blue-100 text-blue-700',
            other: 'bg-gray-100 text-gray-600',
        };

        return (
            <Badge className={cn("font-medium text-xs capitalize", styles[type] || styles.other)}>
                {type}
            </Badge>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setIsSubmitting(true);
        try {
            await add({
                ...formData,
                created_at: new Date().toISOString(),
            });
            toast({
                title: 'Contact Added',
                description: `${formData.name} has been added to your contacts.`,
            });
            setDialogOpen(false);
            setFormData({ name: '', company: '', contact_type: 'supplier', phone: '', email: '' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
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
                <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4" />
                            Add Contact
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Contact</DialogTitle>
                            <DialogDescription>Add a new supplier, partner, or contact.</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contact name"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company</Label>
                                    <Input
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        placeholder="Company name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={formData.contact_type}
                                        onValueChange={(value) => setFormData({ ...formData, contact_type: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="supplier">Supplier</SelectItem>
                                            <SelectItem value="partner">Partner</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+255 XXX XXX XXX"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Contact'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <Card className="bg-card border shadow-sm">
                <CardContent className="p-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-background"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="bg-card border shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Name</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Company</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Type</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Phone</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Email</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredContacts.length > 0 ? (
                                filteredContacts.map((contact) => (
                                    <TableRow key={contact.id} className="hover:bg-muted/10">
                                        <TableCell className="py-4 font-medium">{contact.name}</TableCell>
                                        <TableCell className="py-4 text-sm text-muted-foreground">
                                            {contact.company || '-'}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {getTypeBadge(contact.contact_type)}
                                        </TableCell>
                                        <TableCell className="py-4 text-sm">
                                            {contact.phone ? (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-muted-foreground" />
                                                    {contact.phone}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="py-4 text-sm text-muted-foreground">
                                            {contact.email ? (
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {contact.email}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="py-4 text-sm">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this contact?')) {
                                                        remove(contact.id);
                                                        toast({
                                                            title: "Contact deleted",
                                                            description: "The contact has been successfully removed."
                                                        });
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                        No contacts found
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
