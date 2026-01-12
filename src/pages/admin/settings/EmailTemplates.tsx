import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import type { EmailTemplate, EmailTemplateInsert } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Mail, Copy } from 'lucide-react';

const templateTypes = [
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'password_reset', label: 'Password Reset' },
    { value: 'loan_approved', label: 'Loan Approved' },
    { value: 'loan_rejected', label: 'Loan Rejected' },
    { value: 'payment_reminder', label: 'Payment Reminder' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'payment_overdue', label: 'Payment Overdue' },
    { value: 'account_verification', label: 'Account Verification' },
    { value: 'custom', label: 'Custom Template' },
];

const variables = [
    { key: '{{user_name}}', desc: 'User full name' },
    { key: '{{user_email}}', desc: 'User email address' },
    { key: '{{loan_amount}}', desc: 'Loan principal amount' },
    { key: '{{due_date}}', desc: 'Payment due date' },
    { key: '{{payment_amount}}', desc: 'Payment amount due' },
    { key: '{{company_name}}', desc: 'Company name' },
    { key: '{{reset_link}}', desc: 'Password reset link' },
    { key: '{{verify_link}}', desc: 'Email verification link' },
];

export default function EmailTemplates() {
    const { toast } = useToast();
    const { data: templates, loading, add, update, remove } = useFirestore<EmailTemplate>('email_templates', { orderByField: 'created_at', orderDirection: 'desc' });

    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const emptyForm = { name: '', type: 'custom', subject: '', body: '', is_active: true };
    const [formData, setFormData] = useState(emptyForm);

    const filteredTemplates = templates.filter(t => t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || t.type?.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleCreate = async () => {
        if (!formData.name || !formData.subject || !formData.body) {
            toast({ title: 'Validation Error', description: 'Fill all required fields.', variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        try {
            const data: EmailTemplateInsert = { ...formData };
            await add(data);
            toast({ title: 'Template Created' });
            setFormData(emptyForm);
            setIsCreateOpen(false);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedTemplate) return;
        setIsSubmitting(true);
        try {
            await update(selectedTemplate.id, formData);
            toast({ title: 'Template Updated' });
            setIsEditOpen(false);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (template: EmailTemplate) => {
        if (!confirm('Delete this template?')) return;
        try {
            await remove(template.id);
            toast({ title: 'Template Deleted' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const openEditDialog = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setFormData({ name: template.name, type: template.type, subject: template.subject, body: template.body, is_active: template.is_active });
        setIsEditOpen(true);
    };

    const copyVariable = (v: string) => {
        navigator.clipboard.writeText(v);
        toast({ title: 'Copied', description: `${v} copied to clipboard` });
    };

    if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const TemplateForm = () => (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Template Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Welcome Email" /></div>
                <div className="grid gap-2"><Label>Type *</Label><Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{templateTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label>Subject *</Label><Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Welcome to {{company_name}}" /></div>
            <div className="grid gap-2"><Label>Body *</Label><Textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows={8} placeholder="Hello {{user_name}},..." /></div>
            <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-2">{variables.map(v => <Badge key={v.key} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground" onClick={() => copyVariable(v.key)}><Copy className="w-3 h-3 mr-1" />{v.key}</Badge>)}</div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-heading font-bold">Email Templates</h1><p className="text-muted-foreground mt-1">Manage email notification templates</p></div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}><DialogTrigger asChild><Button onClick={() => setFormData(emptyForm)}><Plus className="w-4 h-4 mr-2" />Add Template</Button></DialogTrigger><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Create Template</DialogTitle></DialogHeader><TemplateForm /><DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create'}</Button></DialogFooter></DialogContent></Dialog>
            </div>

            <Card>
                <CardHeader><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" /><Input placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 max-w-md" /></div></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Template</TableHead><TableHead>Type</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead className="w-[70px]"></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredTemplates.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8">No templates found</TableCell></TableRow> : (
                                filteredTemplates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell><div className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /><span className="font-medium">{template.name}</span></div></TableCell>
                                        <TableCell><Badge variant="secondary">{templateTypes.find(t => t.value === template.type)?.label || template.type}</Badge></TableCell>
                                        <TableCell className="max-w-[200px] truncate">{template.subject}</TableCell>
                                        <TableCell><Badge variant={template.is_active ? 'default' : 'secondary'}>{template.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                                        <TableCell>
                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => { setSelectedTemplate(template); setIsPreviewOpen(true); }}><Eye className="w-4 h-4 mr-2" />Preview</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditDialog(template)}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(template)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
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

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Edit Template</DialogTitle></DialogHeader><TemplateForm /><DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleUpdate} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button></DialogFooter></DialogContent></Dialog>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle></DialogHeader><div className="space-y-4"><div className="p-2 bg-muted rounded"><strong>Subject:</strong> {selectedTemplate?.subject}</div><div className="p-4 border rounded-lg whitespace-pre-wrap">{selectedTemplate?.body}</div></div><DialogFooter><Button onClick={() => setIsPreviewOpen(false)}>Close</Button></DialogFooter></DialogContent></Dialog>
        </div>
    );
}
