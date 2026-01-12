import { useState } from 'react';
import { useFirestore } from '@/hooks/useFirestore';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Plus,
    Search,
    Calendar,
    User,
    StickyNote,
    Bookmark,
    Bell,
    Briefcase,
    Users,
    Clock,
    MoreVertical,
    Edit3,
    Trash2,
    Loader2,
    History,
    Tag,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Note {
    id: string;
    title: string;
    content: string;
    category: 'general' | 'borrower' | 'loan' | 'reminder';
    created_by: string;
    created_at: string;
}

export default function Notes() {
    const { data: notes = [], loading, add } = useFirestore<Note>('notes');
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general' as 'general' | 'borrower' | 'loan' | 'reminder',
    });

    const filteredNotes = notes.filter(note =>
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryBadge = (category: string) => {
        const variants: Record<string, { bg: string, text: string, icon: any }> = {
            general: { bg: 'bg-slate-500/10', text: 'text-slate-600', icon: Bookmark },
            borrower: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: Users },
            loan: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: Briefcase },
            reminder: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: Bell },
        };

        const style = variants[category] || variants.general;
        const Icon = style.icon;

        return (
            <Badge variant="outline" className={cn("font-black uppercase tracking-widest text-[10px] py-1 px-3 rounded-full flex items-center gap-1.5", style.bg, style.text, "border-transparent")}>
                <Icon className="w-3 h-3" />
                {category}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) return;

        setIsSubmitting(true);
        try {
            await add({
                ...formData,
                created_by: 'Admin Command',
                created_at: new Date().toISOString(),
            });
            toast({
                title: 'Intelligence Recorded',
                description: 'New memorandum has been synchronized with the institutional knowledge base.',
                className: "bg-emerald-500 text-white border-none shadow-xl shadow-emerald-500/20"
            });
            setDialogOpen(false);
            setFormData({ title: '', content: '', category: 'general' });
        } catch (error: any) {
            toast({ title: 'Synchronization Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-ping absolute"></div>
                    <div className="h-16 w-16 rounded-full border-4 border-t-primary animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <StickyNote className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Intelligence Repository</h1>
                    </div>
                    <p className="text-muted-foreground text-lg ml-11">Institutional knowledge base for operational notes, memos, and critical reminders.</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold px-8 h-12 transition-all active:scale-95">
                            <Plus className="w-5 h-5 mr-2" />
                            New Memorandum
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] bg-card border-border shadow-2xl p-0 overflow-hidden">
                        <div className="bg-primary/5 p-8 border-b border-border">
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Edit3 className="w-6 h-6 text-primary" />
                                    </div>
                                    <DialogTitle className="text-2xl font-black tracking-tight uppercase">Draft Intel Report</DialogTitle>
                                </div>
                                <DialogDescription className="text-muted-foreground font-medium">
                                    Capture operational intelligence or set a reminder for institutional follow-up.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-3 gap-8">
                                    <div className="col-span-2 grid gap-3">
                                        <Label htmlFor="title" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5">
                                            <Tag className="w-3 h-3 opacity-60" /> Report Title
                                        </Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Q4 Institutional Review..."
                                            className="h-12 bg-muted/30 border-border focus:bg-background transition-all font-bold"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="category" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3 opacity-60" /> Intel Class
                                        </Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                                        >
                                            <SelectTrigger className="h-12 bg-muted/30 border-border focus:bg-background transition-all font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="general">General Intel</SelectItem>
                                                <SelectItem value="borrower">Entity Specific</SelectItem>
                                                <SelectItem value="loan">Facility Focused</SelectItem>
                                                <SelectItem value="reminder">Urgent Reminder</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="content" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5">
                                        <History className="w-3 h-3 opacity-60" /> Field Content
                                    </Label>
                                    <Textarea
                                        id="content"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Enter detailed intelligence report or memorandum content here..."
                                        className="min-h-[160px] bg-muted/30 border-border focus:bg-background transition-all resize-none leading-relaxed"
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter className="p-8 bg-muted/30 border-t border-border flex sm:justify-between items-center gap-3">
                                <Button variant="ghost" type="button" onClick={() => setDialogOpen(false)} className="px-8 font-bold hover:bg-muted">
                                    Discard Draft
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 font-black h-12"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Synchronizing...
                                        </div>
                                    ) : (
                                        "Publish Memorandum"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Control Strip */}
            <Card className="border-border/50 shadow-sm bg-card border-l-4 border-l-primary overflow-hidden">
                <CardContent className="p-6">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 opacity-40" />
                        <Input
                            placeholder="Search through intelligence ledger..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 bg-muted/20 border-border h-12 focus:bg-background transition-all rounded-xl placeholder:text-muted-foreground/40 font-medium"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Intelligence Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => (
                        <Card key={note.id} className="bg-card border-border overflow-hidden hover:shadow-2xl transition-all group relative border-t-2 border-t-transparent hover:border-t-primary/50">
                            <CardContent className="p-8">
                                <div className="flex items-start justify-between mb-8">
                                    {getCategoryBadge(note.category)}
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(note.created_at)}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-black text-foreground text-xl leading-tight group-hover:text-primary transition-colors tracking-tight">
                                        {note.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed font-medium">
                                        {note.content}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Analyst</span>
                                            <span className="text-xs font-bold text-foreground/80">{note.created_by}</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="col-span-full bg-muted/10 border-dashed border-2 border-border/50 py-32 rounded-3xl">
                        <CardContent className="flex flex-col items-center gap-6">
                            <div className="p-8 bg-background/50 rounded-full border border-border shadow-inner">
                                <StickyNote className="w-12 h-12 text-muted-foreground/20" />
                            </div>
                            <div className="text-center space-y-2 max-w-xs mx-auto">
                                <h3 className="text-2xl font-black text-foreground tracking-tight">Ledger Silent</h3>
                                <p className="text-sm text-muted-foreground font-medium">
                                    No institutional memorandums found matching your search. Try adjusting the parameters or adding new intelligence.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setDialogOpen(true)}
                                className="mt-4 border-primary text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] h-10 px-8 rounded-full"
                            >
                                + Initialize Memo
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
