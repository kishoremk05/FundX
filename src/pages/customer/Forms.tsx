import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

const Forms = () => {
    const { user } = useAuth();
    const [activeAppId, setActiveAppId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActiveApp = async () => {
            if (!user) return;
            try {
                // REMOVED orderBy to prevent "Missing Index" errors in console.
                const q = query(
                    collection(db, "loan_applications"),
                    where("customer_id", "==", user.uid),
                    limit(10) // Fetch a few to ensure we find the latest
                );
                const snap = await getDocs(q);
                if (!snap.empty) {
                    // Manual sort by date - handle both Timestamps and strings
                    const docs = snap.docs.map(d => ({ id: d.id, data: d.data() as any }));

                    docs.sort((a, b) => {
                        const getVal = (item: any) => {
                            const val = item.applied_at || item.created_at;
                            if (val && typeof val.toMillis === 'function') return val.toMillis();
                            if (val && typeof val.seconds === 'number') return val.seconds * 1000;
                            if (typeof val === 'string') return new Date(val).getTime();
                            return 0;
                        };
                        return getVal(b.data) - getVal(a.data);
                    });

                    const id = docs[0].id;
                    console.log("Found active application:", id);
                    setActiveAppId(id);
                } else {
                    console.log("No applications found for user.");
                }
            } catch (error: any) {
                console.error("Error fetching active application:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveApp();
    }, [user]);

    const getFormLink = (basePath: string) => {
        return activeAppId ? `${basePath}?appId=${activeAppId}` : basePath;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container-custom py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/customer">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-foreground">
                            Fomu za Mikopo
                        </h1>
                        <p className="text-muted-foreground">
                            Jaza na kusafirisha fomu zako za mikopo
                        </p>
                    </div>
                </div>

                {!activeAppId && (
                    <Card className="p-6 mb-8 border-amber-200 bg-amber-50 text-amber-800">
                        <p className="text-sm font-medium">
                            Tahadhari: Hujatuma ombi la mkopo bado. Fomu utakazojaza hazitaunganishwa na ombi lolote.
                        </p>
                    </Card>
                )}

                {/* Forms Grid */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
                    {/* Loan Agreement Form Card */}
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-heading font-semibold text-lg mb-2">
                                    MKATABA WA KUKOPESHA FEDHA
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Mkataba wa mkopo kati ya wewe na KEP Microcredit
                                </p>
                            </div>
                            <Link to={getFormLink("/customer/forms/loan-agreement")} className="w-full">
                                <Button className="w-full" size="lg">
                                    Fungua Fomu
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Guarantee Form Card */}
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <Shield className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-heading font-semibold text-lg mb-2">
                                    FOMU YA UDHAMINI
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Fomu ya mdhamini wa mkopo
                                </p>
                            </div>
                            <Link to={getFormLink("/customer/forms/guarantee")} className="w-full">
                                <Button className="w-full" size="lg">
                                    Fungua Fomu
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Info Box */}
                <div className="mt-8 max-w-4xl bg-muted/50 rounded-lg p-6">
                    <h4 className="font-semibold mb-2">Maelezo:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Jaza fomu kwa makini na uhakika taarifa zote ni sahihi</li>
                        <li>• Unaweza kuchapisha (Print) au kupakua (Download) fomu baada ya kujaza</li>
                        <li>• Fomu zitahifadhiwa otomatiki baada ya kuwasilisha</li>
                        <li>• Fomu zilizosafirisha zinaweza kuonwa na msimamizi (Admin)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Forms;
