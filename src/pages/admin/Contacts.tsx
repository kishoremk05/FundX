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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Phone, Mail, Loader2, Trash2, MessageSquare, Users, Eye, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Contact {
    id: string;
    name: string;
    company: string;
    contact_type: 'supplier' | 'partner' | 'other';
    phone: string;
    email: string;
    created_at: string;
}

interface Inquiry {
    id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
    status: 'new' | 'viewed' | 'responded';
    created_at: string;
}

export default function Contacts() {
    const { data: contacts = [], loading: contactsLoading, add, remove } = useFirestore<Contact>('contacts');
    const { data: inquiries = [], loading: inquiriesLoading, remove: removeInquiry } = useFirestore<Inquiry>('contact_inquiries');
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('contacts');
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

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

    const filteredInquiries = inquiries.filter(inquiry =>
        inquiry.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;

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

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            new: 'bg-green-100 text-green-700',
            viewed: 'bg-blue-100 text-blue-700',
            responded: 'bg-gray-100 text-gray-600',
        };

        return (
            <Badge className={cn("font-medium text-xs capitalize", styles[status] || styles.new)}>
                {status === 'new' ? 'New' : status === 'viewed' ? 'Viewed' : 'Responded'}
            </Badge>
        );
    };

    const getServiceLabel = (service: string) => {
        const labels: Record<string, string> = {
            emergency: 'Emergency Loans (DHARURA)',
            business: 'Business Loans (BIASHARA)',
            salary: 'Salary Advance (MISHAHARA)',
            consulting: 'Consulting Services',
            other: 'Other',
        };
        return labels[service] || service || 'Not specified';
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

    const markAsViewed = async (inquiry: Inquiry) => {
        try {
            await updateDoc(doc(db, 'contact_inquiries', inquiry.id), { status: 'viewed' });
            toast({ title: 'Status Updated', description: 'Inquiry marked as viewed.' });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const loading = contactsLoading || inquiriesLoading;

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
                <h1 className="text-2xl font-bold text-foreground">Contacts & Inquiries</h1>
                {activeTab === 'contacts' && (
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
                )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="contacts" className="gap-2">
                        <Users className="w-4 h-4" />
                        Business Contacts
                    </TabsTrigger>
                    <TabsTrigger value="inquiries" className="gap-2 relative">
                        <MessageSquare className="w-4 h-4" />
                        Customer Inquiries
                        {newInquiriesCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {newInquiriesCount}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Search */}
                <Card className="bg-card border shadow-sm mt-4">
                    <CardContent className="p-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={activeTab === 'contacts' ? "Search contacts..." : "Search inquiries..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-background"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Business Contacts Tab */}
                <TabsContent value="contacts">
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
                </TabsContent>

                {/* Customer Inquiries Tab */}
                <TabsContent value="inquiries">
                    <Card className="bg-card border shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Status</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Name</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Contact</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Service</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Message</TableHead>
                                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Date</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInquiries.length > 0 ? (
                                        filteredInquiries.map((inquiry) => (
                                            <TableRow key={inquiry.id} className={cn("hover:bg-muted/10", inquiry.status === 'new' && "bg-green-50/50")}>
                                                <TableCell className="py-4">
                                                    {getStatusBadge(inquiry.status)}
                                                </TableCell>
                                                <TableCell className="py-4 font-medium">{inquiry.name}</TableCell>
                                                <TableCell className="py-4 text-sm">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3 text-muted-foreground" />
                                                            {inquiry.email}
                                                        </div>
                                                        {inquiry.phone && (
                                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                                <Phone className="w-3 h-3" />
                                                                {inquiry.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-sm">
                                                    <Badge variant="outline">{getServiceLabel(inquiry.service)}</Badge>
                                                </TableCell>
                                                <TableCell className="py-4 text-sm max-w-[200px]">
                                                    <p className="truncate text-muted-foreground">{inquiry.message}</p>
                                                </TableCell>
                                                <TableCell className="py-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(inquiry.created_at).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedInquiry(inquiry);
                                                                if (inquiry.status === 'new') {
                                                                    markAsViewed(inquiry);
                                                                }
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => {
                                                                if (window.confirm('Are you sure you want to delete this inquiry?')) {
                                                                    removeInquiry(inquiry.id);
                                                                    toast({
                                                                        title: "Inquiry deleted",
                                                                        description: "The inquiry has been successfully removed."
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                                                No inquiries found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Inquiry Detail Dialog */}
            <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Customer Inquiry</DialogTitle>
                        <DialogDescription>
                            From {selectedInquiry?.name} on {selectedInquiry && new Date(selectedInquiry.created_at).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedInquiry && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs">Email</Label>
                                    <p className="font-medium">{selectedInquiry.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Phone</Label>
                                    <p className="font-medium">{selectedInquiry.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Service Interest</Label>
                                <p className="font-medium">{getServiceLabel(selectedInquiry.service)}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Message</Label>
                                <p className="p-3 bg-muted rounded-lg mt-1">{selectedInquiry.message}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                            Close
                        </Button>
                        <Button onClick={() => {
                            if (selectedInquiry) {
                                window.location.href = `mailto:${selectedInquiry.email}?subject=Re: Your Inquiry at KEP Microcredit`;
                            }
                        }}>
                            <Mail className="w-4 h-4 mr-2" />
                            Reply via Email
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

