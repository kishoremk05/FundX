import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormHeader from "@/components/forms/FormHeader";
import { useAuth } from "@/contexts/AuthContext";
import { submitForm, uploadFormPDF } from "@/services/formsService";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";
import UnderlinedInput from "@/components/forms/UnderlinedInput";

interface LoanAgreementFormData {
    // Date
    tarehe: string;
    mwezi: string;
    mwaka: string;
    fedha_1_1_Network: string;

    // Borrower (NA section)
    mkopajiJina: string;
    mkopajiNamba: string;
    mkopajiMakazi: string;

    // KWAMBA section  
    kwambaJina: string;
    kwambaLengo: string;

    // 1. FEDHA INAYOKOPESHWA sections
    fedha_1_1_Amount: string;
    fedha_1_1_Account: string;
    fedha_1_2_Riba: string;
    fedha_1_3_MudaAmount: string;
    fedha_1_4_BankAccount: string;
    fedha_1_5_Mpango: string;
    fedha_1_6_Marejesho: string;
    fedha_1_7_Faini: string;

    // 2. MARIDHIANO YA MKOPO
    dhamana_description: string;
    dhamana_location: string;
}

const LoanAgreementForm = () => {
    const [isCapturing, setIsCapturing] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm<LoanAgreementFormData>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const onSubmit = async (data: LoanAgreementFormData) => {
        if (!currentUser) {
            toast({
                title: "Error",
                description: "You must be logged in to submit forms",
                variant: "destructive",
            });
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const appId = urlParams.get('appId');

        setIsSubmitting(true);
        try {
            const formId = await submitForm(currentUser.uid, "loan_agreement", data, appId || undefined);
            const pdfBlob = await generatePDF();
            await uploadFormPDF(formId, currentUser.uid, pdfBlob, "loan_agreement");

            toast({
                title: "Success",
                description: "Mkataba umewasilishwa kikamilifu!",
            });

            // Navigate back to forms list
            navigate("/customer/forms");
        } catch (error) {
            console.error("Error submitting form:", error);
            toast({
                title: "Error",
                description: "Failed to submit form. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const generatePDF = async (): Promise<Blob> => {
        if (!formRef.current) throw new Error("Form ref not found");
        setIsCapturing(true);
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const canvas = await html2canvas(formRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const ratio = pdfWidth / canvasWidth;
            const scaledHeight = canvasHeight * ratio;
            const totalPages = Math.ceil(scaledHeight / pdfHeight);

            for (let i = 0; i < totalPages; i++) {
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, -i * pdfHeight, pdfWidth, scaledHeight);
            }

            return pdf.output("blob");
        } finally {
            setIsCapturing(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const pdfBlob = await generatePDF();
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `mkataba_wa_kukopesha_fedha_${Date.now()}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
            toast({ title: "Success", description: "PDF imepakuliwa!" });
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ title: "Error", description: "Failed to download PDF", variant: "destructive" });
        }
    };

    const handlePrint = () => window.print();

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container-custom max-w-4xl">
                {/* Actions Bar */}
                <div className="flex items-center justify-between mb-6 print:hidden">
                    <Link to="/customer/forms">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Rudi
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Button onClick={handlePrint} variant="outline" size="sm">
                            <Printer className="w-4 h-4 mr-2" />
                            Chapisha
                        </Button>
                        <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Pakua PDF
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div ref={formRef} className="bg-white rounded-lg shadow-lg p-8">
                        <FormHeader className="mb-6" />
                        <h2 className="text-2xl font-bold text-center mb-6">MKATABA WA KUKOPESHA FEDHA</h2>

                        <div className="space-y-6">
                            <div className="text-sm">
                                <p>
                                    <span className="font-bold">MAKUBALIANO</span> haya yameingiwa hapa <span className="font-bold">MBEYA</span> leo tarehe{" "}
                                    <UnderlinedInput register={register} name="tarehe" watch={watch} isCapturing={isCapturing} minWidth="3.5rem" /> mwezi wa{" "}
                                    <UnderlinedInput register={register} name="mwezi" watch={watch} isCapturing={isCapturing} minWidth="3.5rem" />{" "}
                                    <UnderlinedInput register={register} name="mwaka" watch={watch} isCapturing={isCapturing} minWidth="5rem" className="ml-2" />
                                </p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <p className="font-bold">KATI YA</p>
                                <p>
                                    <span className="font-bold">KEP MICROCREDIT LTD</span> wa 19 Old Forest, Mpuguso RD MBEYA JIJI - Tanzania mwenye Simu Namba{" "}
                                    <span className="font-bold">+255 789 670 696 / +255 754 469 917</span>, (hapa anajulikana kama <span className="font-bold">"MKOPESHAJI"</span> kwa upande mmoja)
                                </p>
                            </div>

                            <div className="space-y-4 text-sm">
                                <p className="font-bold text-base underline">NA</p>
                                <p className="leading-relaxed">
                                    <UnderlinedInput register={register} name="mkopajiJina" watch={watch} isCapturing={isCapturing} minWidth="15rem" /> mwenye Simu Namba{" "}
                                    <UnderlinedInput register={register} name="mkopajiNamba" watch={watch} isCapturing={isCapturing} minWidth="12rem" />, wa Mbeya Jiji Tanzania, (ambaye hapa anajulikana kama <span className="font-bold">"Mkopaji"</span>) kwa upande mwingine wa Mkataba.
                                </p>
                            </div>

                            <div className="space-y-2 text-sm">
                                <p className="font-bold">KWAMBA</p>
                                <p>imebalika kuwa <span className="font-bold">Mkopeshaji</span> ni mwenye vipaji halali kisheria na anahaki zote za kumkopesha fedha <span className="font-bold">Mkopaji</span> na <span className="font-bold">Mkopaji</span> kwa ridhaa yake mwenyewe kakubali kukopeshwa fedha na Mkopeshaji.</p>
                            </div>

                            <div className="space-y-6 border-t-2 border-black pt-4">
                                <h3 className="font-bold text-center">MKATABA HUU UNASHUHUDIA KAMA IFUATAVYO:</h3>

                                <div className="space-y-3">
                                    <p className="font-bold">1. FEDHA INAYOKOPESHWA</p>
                                    <div className="pl-6 space-y-4 text-sm">
                                        <p className="leading-relaxed">
                                            <span className="font-bold">1.1. Kwamba,</span> Mkopeshaji anumkopesha Mkopaji kiasi cha <span className="font-bold">Shilingi za Kitanzania</span>{" "}
                                            <UnderlinedInput register={register} name="fedha_1_1_Amount" watch={watch} isCapturing={isCapturing} minWidth="10rem" /> pesa ambazo Mkopeshaji ameumungizia Mkopaji kupitia <span className="italic">(jina la benki au mtandao wa kifesha)</span>{" "}
                                            <UnderlinedInput register={register} name="fedha_1_1_Network" watch={watch} isCapturing={isCapturing} minWidth="12rem" /> akaunt namba / namba ya simu <UnderlinedInput register={register} name="fedha_1_1_Account" watch={watch} isCapturing={isCapturing} minWidth="12rem" /> yenye jina la Mkopaji.
                                        </p>
                                        <p className="leading-relaxed"><span className="font-bold">1.2. Kwamba,</span> Mkopeshaji kawaaidiana Mkopaji kiasi cha <span className="font-bold">Shling za Kitanzania</span> <UnderlinedInput register={register} name="fedha_1_2_Riba" watch={watch} isCapturing={isCapturing} minWidth="4rem" /> % kwa miezi, hivyo uldikwa kwa mkopo huu takuwa <span className="font-bold">Shilingi za Kitanzania</span> (kwa ora kwa maelezo)</p>
                                        <p className="leading-relaxed"><span className="font-bold">1.3. Kwamba,</span> Mkpo mkuushu anataruia kutoa kwa kila siku cha <span className="font-bold">Shilingi za Ki-tanzania</span> <UnderlinedInput register={register} name="fedha_1_3_MudaAmount" watch={watch} isCapturing={isCapturing} minWidth="10rem" /> (kwa jumla ya miaka na kwa kazi wewi)</p>
                                        <p className="leading-relaxed"><span className="font-bold">1.4. Kwamba,</span> kiasi ambacho kinatakiwa kulipwa ifikapo tarehe <span className="italic">(tarehe ya marejesho)</span> <UnderlinedInput register={register} name="fedha_1_6_Marejesho" watch={watch} isCapturing={isCapturing} minWidth="12rem" /></p>
                                        <p className="leading-relaxed"><span className="font-bold">1.5. Kwamba,</span> marejesho haya yatafanyika kupitia akaunti ya Mkopeshaji ambayo ni <span className="font-bold">CRDB Bank</span> Akaunti Namba <span className="font-bold">0150560053300</span> yenye jina <span className="font-bold">KEP MICROCREDIT LTD</span>.</p>
                                        <p className="leading-relaxed font-bold">1.6. Kwamba, Mkopaji anawajibika wakutumana kama kumkabidhi mkopeshaji nyaraka inayoshuhudu malipo/ marejesho (mf. Risiti/ payinslip/ nk) mkopeshaji punde baada ya kufanya malipo.</p>
                                        <p className="leading-relaxed font-bold">1.7. Kwamba, mkopaji anawajibika kulipa kiasi cha asilimia hamsini (50%) ya kiasi cha riba iliyotozwa endapo atachelewa kufanya marejesho siku anayotakiwa kurejesha kimkataba.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="font-bold">2. MARIDHIANO YA MKOPO</p>
                                    <div className="pl-6 space-y-4 text-sm">
                                        <p className="leading-relaxed"><span className="font-bold">2.1. Kwamba,</span> Mkataba huu ni wa muda wa mwezi mmoja ambapo mkopaji atatakiwa kulipa mkopo pamoja na riba yake.</p>
                                        <p className="leading-relaxed"><span className="font-bold">2.2. Kwamba,</span> mkopaji anaweza kulipa kiasi hicho cha mkopo au sehemu wakati wowote katika kipindi cha mkopo wake.</p>
                                        <div className="space-y-4 pt-2">
                                            <p className="leading-relaxed"><span className="font-bold">2.3. Kwamba,</span> pande zote wameridhia kuwa dhamana ya mkopo kwenye mkataba huu ni <span className="italic">(ainisha dhamana iliyowekwa rehani na mteja kama ilivyo kwenye fomu ya makabidiano)</span></p>
                                            <div className="w-full"><UnderlinedInput register={register} name="dhamana_description" watch={watch} isCapturing={isCapturing} minWidth="100%" className="w-full" /></div>
                                            <p className="leading-relaxed">ambavyo vipo/ vimefungwa/ kufanya kazi/ vimehifadhiwa <span className="italic">(taja mahali vilipo na jina la muangalizi wake)</span></p>
                                            <div className="w-full"><UnderlinedInput register={register} name="dhamana_location" watch={watch} isCapturing={isCapturing} minWidth="100%" className="w-full" /></div>
                                        </div>
                                        <p className="leading-relaxed mt-10 p-4 bg-slate-50 rounded italic border-l-4 border-slate-300">
                                            <span className="font-bold">2.4. Kwamba,</span> nimakubaliano ya pande zote mbili kuwa dhamana iliyokubaliwa na kuwekwa rehani kama iliyoinishwa katika kifungu cha 2 kifungu kidogo cha 2.3 cha mkataba huu itatumika kufidia kiasi cha deni wakati huo bila kufuata taratibu zingine zozote.
                                        </p>
                                        <p className="leading-relaxed"><span className="font-bold">2.5. Kwamba,</span> ni kosa na kinyume cha makubaliano kwa upande wowote kuuza, kuhamisha, kutengeneza, kuharibu, kubadilisha dhamana au sehemu ya dhamana au kutoa vifaa vya ufuatiliaji (trackers) wa dhamana hiyo katika kipindi chote cha mkopo.</p>
                                        <p className="leading-relaxed"><span className="font-bold">2.6. Kwamba,</span> kutokulipwa kwa fedha hizo kwa kufuata makubaliano haya ni ukiukwaji wa makubaliano haya.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 print:hidden max-w-4xl mx-auto">
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? "Inawasilisha..." : "Wasilisha Mkataba (Submit Agreement)"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanAgreementForm;
