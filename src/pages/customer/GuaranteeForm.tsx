import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Printer, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormHeader from "@/components/forms/FormHeader";
import UnderlinedInput from "@/components/forms/UnderlinedInput";
import { useAuth } from "@/contexts/AuthContext";
import { submitForm, uploadFormPDF } from "@/services/formsService";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface GuaranteeFormData {
    // 1.0 TAARIFA BINAFSI
    jina: string;
    jinsi: string;
    umri: string;
    kazi: string;
    anuani: string;
    makazi: string;
    picha?: string;

    // 2.0 TAARIFA YA MKOPO
    mkopojinaAmbaye: string;
    mkopojinaKwa: string;
    mkopoLeoTarehe: string;
    mkopoKiasiAmbacho: string;
    mkopoKwamiMwezi: string;

    // 3.0 TAMKO LA UDHAMINI
    tamkoJina: string;
    tamkoKwaRidhaaYangu: string;
    tamkoMimiKuhusu: string;
    tamkoKutumika: string;

    // NINAMDHAMINI hapa MBEYA
    ninamdhaminTarehe: string;
    ninamdhaminMwezi: string;
    ninamdhaminMwaka: string;

    // JINA NA SAHIHI YA MDHAMINI
    jinaNaSahihi: string;
}

const GuaranteeForm = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<GuaranteeFormData>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string>("");
    const formRef = useRef<HTMLDivElement>(null);
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const onSubmit = async (data: GuaranteeFormData) => {
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
            // Submit form data to Firestore
            const formId = await submitForm(currentUser.uid, "guarantee", data, appId || undefined);

            // Generate PDF
            const pdfBlob = await generatePDF();

            // Upload PDF
            await uploadFormPDF(formId, currentUser.uid, pdfBlob, "guarantee");

            toast({
                title: "Success",
                description: "Fomu imewasilishwa kikamilifu!",
            });

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
        // Brief delay to allow React to hide inputs and show text
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
                pdf.addImage(
                    imgData,
                    "PNG",
                    0,
                    -i * pdfHeight,
                    pdfWidth,
                    scaledHeight
                );
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
            link.download = `fomu_ya_udhamini_${Date.now()}.pdf`;
            link.click();
            URL.revokeObjectURL(url);

            toast({
                title: "Success",
                description: "PDF imepakuliwa!",
            });
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({
                title: "Error",
                description: "Failed to download PDF",
                variant: "destructive",
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container-custom max-w-4xl">
                {/* Actions Bar */}
                <div className="flex items-center justify-between mb-6 print:hidden" data-html2canvas-ignore="true">
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

                {/* Form */}
                <div ref={formRef} className="bg-white rounded-lg shadow-lg p-8">
                    <FormHeader className="mb-6" />

                    <h2 className="text-2xl font-bold text-center mb-8 underline">
                        FOMU YA UDHAMINI
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* 1.0 TAARIFA BINAFSI */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg">1.0 TAARIFA BINAFSI</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-4">
                                    <div>
                                        <Label>a) JINA:</Label>
                                        <UnderlinedInput register={register} name="jina" watch={watch} isCapturing={isCapturing} minWidth="100%" className="w-full" />
                                    </div>

                                    <div>
                                        <Label>b) JINSI:</Label>
                                        <UnderlinedInput register={register} name="jinsi" watch={watch} isCapturing={isCapturing} minWidth="100%" className="w-full" placeholder="Chagua jinsi" />
                                    </div>

                                    <div>
                                        <Label>c) UMRI:</Label>
                                        <UnderlinedInput register={register} name="umri" watch={watch} isCapturing={isCapturing} minWidth="100%" className="w-full" />
                                    </div>

                                    <div>
                                        <Label>d) KAZI:</Label>
                                        <UnderlinedInput register={register} name="kazi" watch={watch} isCapturing={isCapturing} minWidth="100%" className="w-full" />
                                    </div>

                                    <div>
                                        <Label>e) ANUANI:</Label>
                                        <UnderlinedInput register={register} name="anuani" watch={watch} isCapturing={isCapturing} minWidth="100%" className="w-full" />
                                    </div>

                                    <div>
                                        <Label>f) MAKAZI:</Label>
                                        <UnderlinedInput register={register} name="makazi" watch={watch} isCapturing={isCapturing} minWidth="100%" className="w-full" />
                                    </div>
                                </div>

                                {/* Photo Section */}
                                <div className="flex flex-col items-center">
                                    <Label className="mb-2">PICHA</Label>
                                    <div className="w-32 h-40 border-2 border-gray-300 flex items-center justify-center bg-gray-50">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center text-xs text-gray-400 p-2">
                                                Bonyeza hapa kupakia picha
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                        id="photo-upload"
                                    />
                                    <div className="mt-2 print:hidden" data-html2canvas-ignore="true">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="cursor-pointer"
                                            onClick={() => document.getElementById('photo-upload')?.click()}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Pakia Picha
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2.0 TAARIFA YA MKOPO */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-bold text-lg">2.0 TAARIFA YA MKOPO</h3>

                            <div className="space-y-2">
                                <p className="text-sm">
                                    Mimi{" "}
                                    <UnderlinedInput register={register} name="mkopojinaAmbaye" watch={watch} isCapturing={isCapturing} minWidth="12rem" />
                                    ambaye nikiwa na utimamu wote,{" "}
                                    <span className="font-bold">NINAMDHAMINI,</span> Ndugu{" "}
                                    <UnderlinedInput register={register} name="mkopojinaKwa" watch={watch} isCapturing={isCapturing} minWidth="12rem" />
                                    ninafahamu binafsi na ninandha kumdhamini ili achukuwe mkopo katika kampuni ya{" "}
                                    <span className="font-bold">KEP MICROCREDIT LTD</span> kiasi cha Shilingi za Kitanzania{" "}
                                    <UnderlinedInput register={register} name="mkopoKiasiAmbacho" watch={watch} isCapturing={isCapturing} minWidth="12rem" />
                                    leo tarehe{" "}
                                    <UnderlinedInput register={register} name="mkopoLeoTarehe" watch={watch} isCapturing={isCapturing} minWidth="8rem" />
                                    Kiasi ambacho kitatozwa riba ya asilimia{" "}
                                    <UnderlinedInput register={register} name="mkopoKwamiMwezi" watch={watch} isCapturing={isCapturing} minWidth="5rem" />
                                    kwa mwezi.
                                </p>
                            </div>
                        </div>

                        {/* 3.0 TAMKO LA UDHAMINI */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-bold text-lg">3.0 TAMKO LA UDHAMINI</h3>

                            <div className="space-y-2">
                                <p className="text-sm">
                                    Mimi,{" "}
                                    <UnderlinedInput register={register} name="tamkoJina" watch={watch} isCapturing={isCapturing} minWidth="12rem" />
                                    kwa ridhaa yangu mwenyewe nikiwa na akili timamu, bila kushutushwa na mtu yoyote ninamdha kumdhamini. Ndugu{" "}
                                    <UnderlinedInput register={register} name="tamkoKwaRidhaaYangu" watch={watch} isCapturing={isCapturing} minWidth="12rem" />
                                    ili kukopeshwa Fedha na kampuni ya{" "}
                                    <span className="font-bold">KEP MICROCREDIT LTD</span> na ninshidi kutoa ushirikiano wakumpata wakati wowote atakapo hitajika na ninaliahali mali yangu ambayo ni{" "}
                                    <UnderlinedInput register={register} name="tamkoMimiKuhusu" watch={watch} isCapturing={isCapturing} minWidth="16rem" />
                                    kutumika kudhamini upatikanji wa mkopaji asipopatiikana au fedha aliyokopa atakoposhindwa kulipa mkopo wote.
                                </p>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm font-bold">
                                    NINAMDHAMINI hapa MBEYA leo tarehe{" "}
                                    <UnderlinedInput register={register} name="ninamdhaminTarehe" watch={watch} isCapturing={isCapturing} minWidth="5rem" />
                                    Mwezi{" "}
                                    <UnderlinedInput register={register} name="ninamdhaminMwezi" watch={watch} isCapturing={isCapturing} minWidth="5rem" />
                                    Mwaka{" "}
                                    <UnderlinedInput register={register} name="ninamdhaminMwaka" watch={watch} isCapturing={isCapturing} minWidth="6rem" />
                                </p>
                            </div>
                        </div>

                        {/* JINA NA SAHIHI YA MDHAMINI */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-bold text-lg text-center">JINA NA SAHIHI YA MDHAMINI</h3>

                            <div className="h-24 border-b-2 border-black">
                                <Textarea
                                    {...register("jinaNaSahihi")}
                                    className="h-full border-none resize-none bg-transparent"
                                    placeholder="Weka sahihi yako hapa..."
                                />
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6 print:hidden" data-html2canvas-ignore="true">
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Inawasilisha..." : "Wasilisha Fomu (Submit Form)"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GuaranteeForm;
