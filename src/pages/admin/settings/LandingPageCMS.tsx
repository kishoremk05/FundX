import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
import type { LandingPageContent, LandingPageContentInsert } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, MoreHorizontal, GripVertical, Eye, Layout, Type, Image } from 'lucide-react';

const sectionTypes = [
    { value: 'hero', label: 'Hero Section', icon: Layout },
    { value: 'features', label: 'Features Section', icon: Layout },
    { value: 'services', label: 'Services Section', icon: Layout },
    { value: 'testimonials', label: 'Testimonials', icon: Type },
    { value: 'pricing', label: 'Pricing Section', icon: Layout },
    { value: 'cta', label: 'Call to Action', icon: Type },
    { value: 'faq', label: 'FAQ Section', icon: Type },
    { value: 'contact', label: 'Contact Section', icon: Layout },
    { value: 'custom', label: 'Custom HTML', icon: Type },
];

export default function LandingPageCMS() {
    const { toast } = useToast();
    const { data: sections, loading, add, update, remove } = useFirestore<LandingPageContent>('landing_page_content', { orderByField: 'order', orderDirection: 'asc' });

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<LandingPageContent | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const emptyForm = { section_type: 'hero', title: '', subtitle: '', content: '', button_text: '', button_link: '', image_url: '', order: sections.length, is_active: true };
    const [formData, setFormData] = useState(emptyForm);

    const handleCreate = async () => {
        if (!formData.section_type) {
            toast({ title: 'Validation Error', description: 'Select section type.', variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        try {
            const data: LandingPageContentInsert = { ...formData, order: sections.length };
            await add(data);
            toast({ title: 'Section Created' });
            setFormData({ ...emptyForm, order: sections.length + 1 });
            setIsCreateOpen(false);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedSection) return;
        setIsSubmitting(true);
        try {
            await update(selectedSection.id, formData);
            toast({ title: 'Section Updated' });
            setIsEditOpen(false);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (section: LandingPageContent) => {
        if (!confirm('Delete this section?')) return;
        try {
            await remove(section.id);
            toast({ title: 'Section Deleted' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleToggle = async (section: LandingPageContent) => {
        try {
            await update(section.id, { is_active: !section.is_active });
            toast({ title: section.is_active ? 'Section Hidden' : 'Section Visible' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const openEditDialog = (section: LandingPageContent) => {
        setSelectedSection(section);
        setFormData({
            section_type: section.section_type,
            title: section.title || '',
            subtitle: section.subtitle || '',
            content: section.content || '',
            button_text: section.button_text || '',
            button_link: section.button_link || '',
            image_url: section.image_url || '',
            order: section.order,
            is_active: section.is_active,
        });
        setIsEditOpen(true);
    };

    if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const SectionForm = () => (
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2"><Label>Section Type *</Label><Select value={formData.section_type} onValueChange={(v) => setFormData({ ...formData, section_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{sectionTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2"><Label>Title</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Section title" /></div>
            <div className="grid gap-2"><Label>Subtitle</Label><Input value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} placeholder="Section subtitle" /></div>
            <div className="grid gap-2"><Label>Content</Label><Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} placeholder="Main content or HTML" /></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Button Text</Label><Input value={formData.button_text} onChange={(e) => setFormData({ ...formData, button_text: e.target.value })} placeholder="Get Started" /></div>
                <div className="grid gap-2"><Label>Button Link</Label><Input value={formData.button_link} onChange={(e) => setFormData({ ...formData, button_link: e.target.value })} placeholder="/register" /></div>
            </div>
            <div className="grid gap-2"><Label>Image URL</Label><Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." /></div>
            <div className="grid gap-2"><Label>Display Order</Label><Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} /></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-heading font-bold">Landing Page CMS</h1><p className="text-muted-foreground mt-1">Manage landing page sections</p></div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild><a href="/" target="_blank"><Eye className="w-4 h-4 mr-2" />Preview</a></Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}><DialogTrigger asChild><Button onClick={() => setFormData({ ...emptyForm, order: sections.length })}><Plus className="w-4 h-4 mr-2" />Add Section</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add Section</DialogTitle></DialogHeader><SectionForm /><DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create'}</Button></DialogFooter></DialogContent></Dialog>
                </div>
            </div>

            <div className="grid gap-4">
                {sections.length === 0 ? (
                    <Card><CardContent className="text-center py-12 text-muted-foreground">No sections added yet. Click "Add Section" to get started.</CardContent></Card>
                ) : (
                    sections.map((section) => {
                        const typeInfo = sectionTypes.find(t => t.value === section.section_type);
                        const Icon = typeInfo?.icon || Layout;
                        return (
                            <Card key={section.id} className={!section.is_active ? 'opacity-50' : ''}>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{section.title || typeInfo?.label || 'Untitled Section'}</CardTitle>
                                            <CardDescription>{typeInfo?.label} · Order: {section.order}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={section.is_active ? 'default' : 'secondary'}>{section.is_active ? 'Visible' : 'Hidden'}</Badge>
                                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditDialog(section)}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggle(section)}><Eye className="w-4 h-4 mr-2" />{section.is_active ? 'Hide' : 'Show'}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(section)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                {(section.subtitle || section.content) && (
                                    <CardContent className="pt-0"><p className="text-sm text-muted-foreground line-clamp-2">{section.subtitle || section.content}</p></CardContent>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}><DialogContent><DialogHeader><DialogTitle>Edit Section</DialogTitle></DialogHeader><SectionForm /><DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={handleUpdate} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button></DialogFooter></DialogContent></Dialog>
        </div>
    );
}
