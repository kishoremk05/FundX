import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import jsPDF from 'jspdf';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Loader2,
  CheckCircle,
  FileText,
  BarChart3,
  ThumbsUp,
  Banknote,
  Clock,
  Phone,
  Mail,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  RefreshCw,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Progress steps data
const PROGRESS_STEPS = [
  {
    id: 1,
    nameSwahili: 'Ombi Limewasilishwa',
    nameEnglish: 'Application Submitted',
    icon: CheckCircle,
    status: 'completed',
  },
  {
    id: 2,
    nameSwahili: 'Uhakiki wa Nyaraka',
    nameEnglish: 'Document Verification',
    icon: FileText,
    status: 'current',
    estimatedTime: 'Masaa 2-4',
  },
  {
    id: 3,
    nameSwahili: 'Tathmini ya Mkopo',
    nameEnglish: 'Credit Assessment',
    icon: BarChart3,
    status: 'pending',
    estimatedTime: 'Masaa 4-6',
  },
  {
    id: 4,
    nameSwahili: 'Idhini ya Mwisho',
    nameEnglish: 'Final Approval',
    icon: ThumbsUp,
    status: 'pending',
    estimatedTime: 'Saa 1-3',
  },
  {
    id: 5,
    nameSwahili: 'Malipo ya Mkopo',
    nameEnglish: 'Loan Disbursement',
    icon: Banknote,
    status: 'pending',
    estimatedTime: 'Dakika 30',
  },
];

// FAQ data
const FAQ_DATA = [
  {
    question: 'Kwa nini ombi langu linachukua muda mrefu?',
    questionEn: 'Why is my application taking a long time?',
    answer: 'Tunakagua kila ombi kwa makini ili kuhakikisha usalama na usahihi. Mchakato mzima wa kawaida unachukua masaa 6-12.',
    answerEn: 'We carefully review each application to ensure safety and accuracy. The entire normal process takes 6-12 hours.',
  },
  {
    question: 'Je, naweza kubadilisha kiasi cha mkopo?',
    questionEn: 'Can I change the loan amount?',
    answer: 'Baada ya ombi kuwasilishwa, mabadiliko hayawezekani. Tafadhali wasiliana na timu yetu kwa msaada.',
    answerEn: 'After the application is submitted, changes are not possible. Please contact our team for assistance.',
  },
  {
    question: 'Nitapokea pesa lini?',
    questionEn: 'When will I receive the money?',
    answer: 'Pesa zitatumwa kwenye M-Pesa yako ndani ya dakika 30 baada ya idhini ya mwisho.',
    answerEn: 'Money will be sent to your M-Pesa within 30 minutes after final approval.',
  },
];

export default function MyLoans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1); // Default to step 1

  // Generate reference number
  const generateReferenceNumber = () => {
    if (applicationData?.id) {
      return `KEP-${applicationData.id.substring(0, 8).toUpperCase()}`;
    }
    return 'KEP-42826550';
  };

  useEffect(() => {
    if (!user) return;

    const applicationsRef = collection(db, 'loan_applications');
    // REMOVED orderBy to prevent "Missing Index" errors in console.
    // We will sort the results in memory in the snapshot handler.
    const q = query(
      applicationsRef,
      where('customer_id', '==', user.uid),
      limit(10) // Fetch a few to ensure we find the latest
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // Manual sort to find the latest application
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() as any }));
        docs.sort((a, b) => {
          const getVal = (item: any) => {
            const val = item.applied_at || item.created_at;
            if (val && typeof val.toMillis === 'function') return val.toMillis();
            if (val && typeof val.seconds === 'number') return val.seconds * 1000;
            if (typeof val === 'string') return new Date(val).getTime();
            return 0;
          };
          return getVal(b) - getVal(a);
        });

        const data = docs[0];
        setApplicationData(data);

        // Handle rejected status
        if (data.status === 'rejected') {
          setCurrentStep(0); // Special step for rejected
        }
        // Use dynamic step if available, otherwise fallback to status mapping
        else if (data.current_step !== undefined) {
          setCurrentStep(data.current_step);
        } else {
          const status = data.status;
          if (status === 'pending') setCurrentStep(1);
          else if (status === 'reviewing') setCurrentStep(2);
          else if (status === 'approved') setCurrentStep(4);
          else if (status === 'disbursed') setCurrentStep(5);
        }
      } else {
        setApplicationData(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching application snapshot:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStepContent = (stepId: number) => {
    const contents: Record<number, any> = {
      0: {
        title: 'Ombi Limekataliwa',
        titleEn: 'Application Rejected',
        message: applicationData?.rejection_reason || 'Ombi lako limekataliwa baada ya tathmini. Tafadhali wasiliana na ofisi yetu kwa maelezo zaidi.',
        messageEn: applicationData?.rejection_reason || 'Your application has been rejected after assessment. Please contact our office for more details.',
        icon: X,
        color: 'text-red-600',
        bg: 'bg-red-100',
        border: 'border-l-red-500',
        time: 'N/A'
      },
      1: {
        title: 'Ombi Limewasilishwa',
        titleEn: 'Application Submitted',
        message: 'Ombi lako limepokelewa na linashughulikiwa na Afisa Mikopo.',
        messageEn: 'Your application has been received and is being processed by the Loan Officer.',
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100',
        border: 'border-l-green-500',
        time: 'Masaa 1-2'
      },
      2: {
        title: 'Uhakiki wa Nyaraka',
        titleEn: 'Document Verification',
        message: 'Nyaraka zako zinahakikiwa na Mkurugenzi wa Operesheni. Tafadhali subiri.',
        messageEn: 'Your documents are being verified by the Director of Operational. Please wait.',
        icon: FileText,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        border: 'border-l-blue-500',
        time: 'Masaa 2-4'
      },
      3: {
        title: 'Tathmini ya Mkopo',
        titleEn: 'Credit Assessment',
        message: 'Mkopo wako unafanyiwa tathmini ya mwisho na Mkurugenzi wa Fedha.',
        messageEn: 'Your loan is undergoing final assessment by the Director of Finance.',
        icon: BarChart3,
        color: 'text-amber-600',
        bg: 'bg-amber-100',
        border: 'border-l-amber-500',
        time: 'Masaa 4-6'
      },
      4: {
        title: 'Idhini ya Mwisho',
        titleEn: 'Final Approval',
        message: 'Ombi lako linasubiri idhini ya mwisho kutoka kwa CEO.',
        messageEn: 'Your application is awaiting final approval from the CEO.',
        icon: ThumbsUp,
        color: 'text-purple-600',
        bg: 'bg-purple-100',
        border: 'border-l-purple-500',
        time: 'Saa 1-3'
      },
      5: {
        title: 'Malipo ya Mkopo',
        titleEn: 'Loan Disbursement',
        message: 'Idhini imetolewa! Idara ya Fedha inatuma pesa kwenye akaunti yako.',
        messageEn: 'Approval granted! Finance Department is sending funds to your account.',
        icon: Banknote,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100',
        border: 'border-l-emerald-500',
        time: 'Dakika 30'
      }
    };
    return contents[stepId] || contents[1];
  };

  const currentStepData = getStepContent(currentStep);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const copyReferenceNumber = () => {
    navigator.clipboard.writeText(generateReferenceNumber());
    toast({
      title: 'Imenakiliwa!',
      description: 'Nambari ya ombi imenakiliwa.',
    });
  };

  const openWhatsApp = () => {
    const phoneNumber = '255700000000';
    const message = encodeURIComponent(`Habari, nina swali kuhusu ombi langu la mkopo: ${generateReferenceNumber()}`);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank');
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  // Default loan data (if no application found)
  const loanAmount = applicationData?.amount || 0;
  const interestRate = applicationData?.interest_rate || 15;
  const duration = applicationData?.duration_months || applicationData?.duration || 0;
  const monthlyPayment = applicationData?.monthly_payment || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/customer">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 px-2">
                  <ArrowLeft className="w-5 h-5 mr-1" />
                  Rudi
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Hali ya Ombi la Mkopo</h1>
                <p className="text-blue-100 text-sm mt-1">Loan Application Status</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-200">Nambari ya Kuthibitisha</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono font-bold text-lg">{generateReferenceNumber()}</span>
                <button
                  onClick={copyReferenceNumber}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Nakili"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Progress Tracker */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <h2 className="font-bold text-gray-900 mb-6">
              Maendeleo ya Ombi / <span className="text-gray-500 font-normal">Application Progress</span>
            </h2>

            {/* Progress Steps */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / (PROGRESS_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {PROGRESS_STEPS.map((step) => {
                  const isRejected = applicationData?.status === 'rejected';
                  const status = getStepStatus(step.id);
                  const Icon = step.icon;

                  // If rejected at a specific stage, show that stage as red? 
                  // For now, let's just keep the tracker but show the current state below.
                  // Or if rejected, we color the active step red if it's the rejection stage.
                  const isRejectionStage = isRejected && applicationData.rejection_stage === step.id;

                  return (
                    <div key={step.id} className="flex flex-col items-center" style={{ width: '18%' }}>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${status === 'completed'
                          ? 'bg-green-500 text-white'
                          : isRejectionStage
                            ? 'bg-red-500 text-white ring-4 ring-red-100'
                            : status === 'current'
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                      >
                        {status === 'completed' ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : isRejectionStage ? (
                          <X className="w-6 h-6" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <p className={`text-xs font-medium mt-2 text-center ${isRejectionStage ? 'text-red-600' : status === 'current' ? 'text-blue-600' : status === 'completed' ? 'text-green-600' : 'text-gray-400'
                        }`}>
                        {step.nameSwahili}
                      </p>
                      <p className="text-[10px] text-gray-400 text-center">{step.nameEnglish}</p>
                      {step.estimatedTime && status === 'current' && !isRejected && (
                        <p className="text-[10px] text-blue-500 mt-1">{step.estimatedTime}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Status Card */}
        <Card className={`border-l-4 ${currentStepData.border}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 ${currentStepData.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <currentStepData.icon className={`w-5 h-5 ${currentStepData.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{currentStepData.title}</h3>
                <p className="text-sm text-gray-500">{currentStepData.titleEn}</p>
                <p className={`text-sm mt-2 font-medium ${currentStepData.color}`}>
                  {currentStepData.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {currentStepData.messageEn}
                </p>
                {currentStep !== 0 && (
                  <div className={`flex items-center gap-2 mt-3 text-sm ${currentStepData.color}`}>
                    <Clock className="w-4 h-4" />
                    <span>Muda uliobaki: {currentStepData.time}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-5 gap-6">
          {/* Loan Summary - Left Column (3/5) */}
          <Card className="md:col-span-3">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Muhtasari wa Mkopo / <span className="text-gray-500 font-normal">Loan Summary</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Kiasi Kilichohitajika</span>
                  <span className="font-bold text-gray-900">TZS {formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Riba</span>
                  <span className="font-bold text-blue-600">{interestRate}% kwa mwaka</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Muda wa Kulipa</span>
                  <span className="font-bold text-gray-900">Miezi {duration}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Malipo ya Kila Mwezi</span>
                  <span className="font-bold text-green-600">TZS {formatCurrency(monthlyPayment)}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-6 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  // Generate professional PDF
                  const doc = new jsPDF();
                  const pageWidth = doc.internal.pageSize.getWidth();
                  const margin = 20;
                  let yPos = 20;

                  // Header background
                  doc.setFillColor(37, 99, 235); // Blue
                  doc.rect(0, 0, pageWidth, 45, 'F');

                  // Company Logo placeholder (K)
                  doc.setFillColor(255, 255, 255);
                  doc.roundedRect(margin, 10, 15, 15, 3, 3, 'F');
                  doc.setTextColor(37, 99, 235);
                  doc.setFontSize(14);
                  doc.setFont('helvetica', 'bold');
                  doc.text('K', margin + 5, 20);

                  // Company name
                  doc.setTextColor(255, 255, 255);
                  doc.setFontSize(18);
                  doc.setFont('helvetica', 'bold');
                  doc.text('KEP MICROCREDIT LIMITED', margin + 20, 18);
                  doc.setFontSize(10);
                  doc.setFont('helvetica', 'normal');
                  doc.text('Mikopo ya Haraka | Fast Loans', margin + 20, 26);

                  // Reference number on right
                  doc.setFontSize(9);
                  doc.text(`Ref: ${generateReferenceNumber()}`, pageWidth - margin - 30, 18);
                  doc.text(new Date().toLocaleDateString('en-GB'), pageWidth - margin - 30, 26);

                  // Title
                  yPos = 60;
                  doc.setTextColor(0, 0, 0);
                  doc.setFontSize(16);
                  doc.setFont('helvetica', 'bold');
                  doc.text('MKATABA WA MKOPO / LOAN AGREEMENT', pageWidth / 2, yPos, { align: 'center' });

                  // Loan Details Section
                  yPos = 80;
                  doc.setFillColor(245, 247, 250);
                  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 60, 'F');

                  doc.setFontSize(12);
                  doc.setFont('helvetica', 'bold');
                  doc.setTextColor(37, 99, 235);
                  doc.text('MAELEZO YA MKOPO / LOAN DETAILS', margin + 5, yPos + 5);

                  doc.setFont('helvetica', 'normal');
                  doc.setTextColor(60, 60, 60);
                  doc.setFontSize(10);

                  const details = [
                    ['Kiasi Kilichohitajika / Loan Amount:', `TZS ${formatCurrency(loanAmount)}`],
                    ['Kiwango cha Riba / Interest Rate:', `${interestRate}% kwa mwaka`],
                    ['Muda wa Kulipa / Repayment Period:', `Miezi ${duration}`],
                    ['Malipo ya Kila Mwezi / Monthly Payment:', `TZS ${formatCurrency(monthlyPayment)}`],
                    ['Jumla ya Kulipa / Total Repayment:', `TZS ${formatCurrency(monthlyPayment * duration)}`],
                  ];

                  yPos += 15;
                  details.forEach(([label, value]) => {
                    doc.setFont('helvetica', 'normal');
                    doc.text(label, margin + 5, yPos);
                    doc.setFont('helvetica', 'bold');
                    doc.text(value, pageWidth - margin - 5, yPos, { align: 'right' });
                    yPos += 8;
                  });

                  // Terms Section
                  yPos = 155;
                  doc.setFontSize(12);
                  doc.setFont('helvetica', 'bold');
                  doc.setTextColor(37, 99, 235);
                  doc.text('MASHARTI NA VIGEZO / TERMS AND CONDITIONS', margin, yPos);

                  doc.setFont('helvetica', 'normal');
                  doc.setTextColor(60, 60, 60);
                  doc.setFontSize(9);

                  const terms = [
                    `1. Mkopaji anakubali kulipa mkopo huu kwa miezi ${duration} kama ilivyoainishwa.`,
                    `   The borrower agrees to repay this loan over ${duration} months as stated.`,
                    '',
                    '2. Riba inakokotolewa kwa mwaka na inagawanywa kwa mwezi.',
                    '   Interest is calculated annually and divided monthly.',
                    '',
                    '3. Malipo ya kuchelewa yatashtakiwa ada ya ziada ya 2% ya malipo ya kila mwezi.',
                    '   Late payments will incur a penalty of 2% of the monthly payment.',
                    '',
                    '4. Mkopaji anaweza kulipa mkopo mapema bila ada za ziada.',
                    '   Early repayment is permitted without additional fees.',
                    '',
                    '5. Mkopo huu umeidhinishwa na Benki Kuu ya Tanzania (BOT).',
                    '   This loan is regulated by the Bank of Tanzania (BOT).',
                  ];

                  yPos += 10;
                  terms.forEach((term) => {
                    doc.text(term, margin, yPos);
                    yPos += 5;
                  });

                  // Signature Section
                  yPos = 240;
                  doc.setDrawColor(200, 200, 200);
                  doc.line(margin, yPos, margin + 60, yPos);
                  doc.line(pageWidth - margin - 60, yPos, pageWidth - margin, yPos);

                  doc.setFontSize(8);
                  doc.text('Saini ya Mkopaji / Borrower Signature', margin, yPos + 5);
                  doc.text('Saini ya KEP / KEP Signature', pageWidth - margin - 60, yPos + 5);

                  // Footer
                  const footerY = 270;
                  doc.setFillColor(245, 247, 250);
                  doc.rect(0, footerY - 5, pageWidth, 30, 'F');

                  doc.setFontSize(8);
                  doc.setTextColor(100, 100, 100);
                  doc.text('KEP Microcredit Limited | Leseni ya BOT: MFI-2024-001', pageWidth / 2, footerY + 5, { align: 'center' });
                  doc.text('Simu: +255 700 000 000 | Email: support@kepmicrocredit.co.tz', pageWidth / 2, footerY + 10, { align: 'center' });
                  doc.text(`© ${new Date().getFullYear()} KEP Microcredit Limited. Haki zote zimehifadhiwa.`, pageWidth / 2, footerY + 15, { align: 'center' });

                  // Save PDF
                  doc.save(`KEP_Mkataba_${generateReferenceNumber()}.pdf`);

                  toast({
                    title: 'Mkataba Umepakuliwa!',
                    description: 'Mkataba wa mkopo wako umepakuliwa kwa mafanikio (PDF).',
                  });
                }}
              >
                <Download className="w-4 h-4" />
                Pakua Mkataba / Download Agreement
              </Button>
            </CardContent>
          </Card>

          {/* Right Column (2/5) */}
          <div className="md:col-span-2 space-y-6">
            {/* Notifications */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Arifa / <span className="text-gray-500 font-normal">Notifications</span>
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Arifa za SMS</p>
                    <p className="text-xs text-gray-500">SMS Notifications</p>
                  </div>
                  <Switch
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Wasiliana Nasi / <span className="text-gray-500 font-normal">Contact Us</span>
                </h3>

                <Button
                  onClick={openWhatsApp}
                  className="w-full bg-green-500 hover:bg-green-600 text-white gap-2 mb-4"
                >
                  <MessageCircle className="w-4 h-4" />
                  Tuma Ujumbe WhatsApp
                </Button>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>+255 700 000 000</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>support@kepmicrocredit.co.tz</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                  <RefreshCw className="w-3 h-3" />
                  <span>Imesasishwa: {new Date().toLocaleDateString('sw-TZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-6">
              Maswali Yanayoulizwa Mara kwa Mara / <span className="text-gray-500 font-normal">FAQ</span>
            </h3>

            <div className="space-y-3">
              {FAQ_DATA.map((faq, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg overflow-hidden transition-all ${openFaq === idx ? 'border-blue-300' : 'border-gray-200'
                    }`}
                >
                  <button
                    className={`w-full p-4 text-left flex items-center justify-between transition-colors ${openFaq === idx ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <div>
                      <span className={`font-medium ${openFaq === idx ? 'text-blue-700' : 'text-gray-900'}`}>
                        {faq.question}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">{faq.questionEn}</span>
                    </div>
                    {openFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700">{faq.answer}</p>
                      <p className="text-sm text-gray-500 italic mt-2">{faq.answerEn}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
