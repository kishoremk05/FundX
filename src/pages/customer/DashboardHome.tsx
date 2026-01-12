import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Calculator,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Lock,
  LogOut,
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Banknote,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Briefcase,
  CreditCard,
  Check,
  Quote,
} from 'lucide-react';

// Application form steps
const FORM_STEPS = [
  { id: 1, name: 'Taarifa Binafsi', englishName: 'Personal Info' },
  { id: 2, name: 'Taarifa za Kazi', englishName: 'Employment' },
  { id: 3, name: 'Maelezo ya Mkopo', englishName: 'Loan Details' },
  { id: 4, name: 'Uthibiti', englishName: 'Verification' },
];

// FAQ data
const FAQ_DATA = [
  {
    question: 'Je, ninaweza kupata mkopo kiasi gani?',
    questionEn: 'How much loan can I get?',
    answer: 'Unaweza kupata mkopo kuanzia TZS 50,000 hadi TZS 5,000,000 kulingana na mapato yako na historia ya mkopo.',
    answerEn: 'You can get a loan from TZS 50,000 to TZS 5,000,000 depending on your income and credit history.',
  },
  {
    question: 'Mchakato wa ombi unachukua muda gani?',
    questionEn: 'How long does the application process take?',
    answer: 'Mchakato wa ombi unachukua chini ya dakika 10 kujaza fomu. Idhini inatolewa ndani ya siku 1 ya kazi.',
    answerEn: 'The application process takes less than 10 minutes to fill the form. Approval is given within 1 business day.',
  },
  {
    question: 'Ni hati gani zinazohitajika?',
    questionEn: 'What documents are required?',
    answer: 'Unahitaji kitambulisho cha kitaifa (NIDA au Passport), hati ya mapato (payslip au bank statement), na picha ya biashara kwa wajiri binafsi.',
    answerEn: 'You need national ID (NIDA or Passport), proof of income (payslip or bank statement), and business photo for self-employed.',
  },
  {
    question: 'Je, kuna ada za ziada?',
    questionEn: 'Are there any additional fees?',
    answer: 'Hakuna ada za kufungua akaunti. Riba ni 15% kwa mwaka na hakuna ada za ziada za kufichwa.',
    answerEn: 'No account opening fees. Interest rate is 15% per annum with no hidden charges.',
  },
  {
    question: 'Ninaweza kulipa mapema bila adhabu?',
    questionEn: 'Can I pay early without penalty?',
    answer: 'Ndiyo! Unaweza kulipa mkopo wako mapema bila ada yoyote ya ziada. Hii itakusaidia kupunguza riba.',
    answerEn: 'Yes! You can pay your loan early without any additional fees. This will help you reduce interest.',
  },
  {
    question: 'Je, data yangu ni salama?',
    questionEn: 'Is my data secure?',
    answer: 'Ndiyo, tunatumia usimbaji wa 256-bit SSL na tunafuata sheria za ulinzi wa data za Tanzania. Taarifa zako ni salama kabisa.',
    answerEn: 'Yes, we use 256-bit SSL encryption and comply with Tanzanian data protection laws. Your information is completely secure.',
  },
];

// Testimonials data
const TESTIMONIALS = [
  {
    name: 'Fatuma Hassan',
    business: 'Duka la Nguo',
    location: 'Dar es Salaam',
    amount: '2,500,000',
    quote: 'KEP Microcredit wamenisaidia kupanua biashara yangu. Mchakato ulikuwa rahisi na haraka. Sasa nina duka kubwa zaidi!',
    quoteEn: 'KEP Microcredit helped me expand my business. The process was easy and fast. Now I have a bigger shop!',
    image: '/shop-image.jpg',
    rating: 5,
  },
  {
    name: 'John Mwangi',
    business: 'Bodaboda',
    location: 'Arusha',
    amount: '1,800,000',
    quote: 'Nilinunua pikipiki mpya kwa mkopo wa KEP. Sasa napata mapato zaidi na maisha yangu yamebadilika!',
    quoteEn: 'I bought a new motorcycle with KEP loan. Now I earn more and my life has changed!',
    image: '/shop-image.jpg',
    rating: 4,
  },
  {
    name: 'Grace Kimaro',
    business: 'Salon ya Nywele',
    location: 'Mwanza',
    amount: '3,200,000',
    quote: 'Mkopo wa KEP uliniwezesha kununua vifaa vya kisasa. Wateja wangu wamezidi na biashara inaendelea vizuri!',
    quoteEn: 'KEP loan enabled me to buy modern equipment. My customers have increased and business is going well!',
    image: '/shop-image.jpg',
    rating: 5,
  },
];

export default function DashboardHome() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculator state
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanDuration, setLoanDuration] = useState(6);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: '',
    email: profile?.email || '',
    idNumber: '',
    birthDate: '',
    address: '',
    employer: '',
    jobTitle: '',
    monthlyIncome: '',
    employmentYears: '',
    loanPurpose: '',
  });

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Testimonial state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const interestRate = 0.15;
  const monthlyInterestRate = interestRate / 12;
  const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanDuration)) / (Math.pow(1 + monthlyInterestRate, loanDuration) - 1);
  const totalRepayment = monthlyPayment * loanDuration;

  // Calculate form completion percentage
  const getCompletionPercentage = () => {
    const step1Fields = ['fullName', 'phone', 'email', 'idNumber', 'birthDate', 'address'];
    const step2Fields = ['employer', 'jobTitle', 'monthlyIncome', 'employmentYears'];
    const step3Fields = ['loanPurpose'];

    let filled = 0;
    let total = 0;

    if (currentStep >= 1) {
      step1Fields.forEach(f => {
        total++;
        if (formData[f as keyof typeof formData]) filled++;
      });
    }
    if (currentStep >= 2) {
      step2Fields.forEach(f => {
        total++;
        if (formData[f as keyof typeof formData]) filled++;
      });
    }
    if (currentStep >= 3) {
      step3Fields.forEach(f => {
        total++;
        if (formData[f as keyof typeof formData]) filled++;
      });
    }

    return total > 0 ? Math.round((filled / total) * 100) : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitApplication = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'Please sign in first', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'loan_applications'), {
        customer_id: user.uid,
        ...formData,
        amount: loanAmount,
        duration: loanDuration,
        monthly_payment: Math.round(monthlyPayment),
        total_repayment: Math.round(totalRepayment),
        interest_rate: interestRate * 100,
        status: 'pending',
        created_at: serverTimestamp(),
      });

      toast({
        title: 'Ombi Limepokelewa!',
        description: 'Tutawasiliana nawe ndani ya saa 24.',
      });

      setShowForm(false);
      setCurrentStep(1);
      setFormData({
        fullName: profile?.full_name || '',
        phone: '',
        email: profile?.email || '',
        idNumber: '',
        birthDate: '',
        address: '',
        employer: '',
        jobTitle: '',
        monthlyIncome: '',
        employmentYears: '',
        loanPurpose: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">KEP Microcredit</p>
                <p className="text-[10px] text-gray-500">Mikopo ya Haraka</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#calculator" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <Calculator className="w-4 h-4" />
                Hesabu Mkopo
              </a>
              <a href="#testimonials" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <Users className="w-4 h-4" />
                Maoni ya Wateja
              </a>
              <a href="#faq" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <FileText className="w-4 h-4" />
                Maswali
              </a>
              <Link to="/customer/my-loans" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <CreditCard className="w-4 h-4" />
                Hali ya Ombi
              </Link>
            </nav>

            {/* Trust Badges & CTA */}
            <div className="flex items-center gap-3">
              <Badge className="hidden sm:flex bg-green-50 text-green-700 border-green-200 gap-1">
                <CheckCircle className="w-3 h-3" />
                BOT Licensed
              </Badge>
              <Badge className="hidden sm:flex bg-blue-50 text-blue-700 border-blue-200 gap-1">
                <Lock className="w-3 h-3" />
                Secure
              </Badge>

              <Button
                className="bg-green-500 hover:bg-green-600 text-white gap-2 rounded-full"
                onClick={() => setShowForm(true)}
              >
                <Play className="w-4 h-4" />
                Anza Ombi
              </Button>

              {/* User Menu */}
              <div className="flex items-center gap-2 border-l pl-3 ml-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-gray-600">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Imeidhibitishwa na BOT</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Maliza Makubaliano ya Mkopo Mtandaoni
              </h1>

              <p className="text-xl text-blue-100">
                Haraka, Salama, Kidijitali
              </p>

              <p className="text-blue-200">
                Dakika chache tu, hakuna karatasi, hakuna ziara ya benki
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white gap-2 rounded-full px-8"
                  onClick={() => setShowForm(true)}
                >
                  <Play className="w-5 h-5" />
                  Anza Ombi
                </Button>
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-gray-100 gap-2 rounded-full px-8 border-2 border-white"
                  onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Calculator className="w-5 h-5" />
                  Hesabu Mkopo
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 pt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-400" />
                  </div>
                  <span>Idhini siku moja</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <Lock className="w-4 h-4 text-green-400" />
                  </div>
                  <span>Usalama wa 256-bit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-400" />
                  </div>
                  <span>Simu yako tu</span>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="relative">
              <Card className="bg-white text-gray-900 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Fomu ya Mkopo</p>
                        <p className="text-xs text-gray-500">Kidijitali & Salama</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Mikopo Iliyokamilika</span>
                      <span className="text-2xl font-bold text-green-600">16,109+</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Muda wa Kuchakata</p>
                        <p className="font-semibold text-gray-900">&lt; 24 saa</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Kiasi cha Mkopo</p>
                        <p className="font-semibold text-gray-900">50K - 5M</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-green-700 font-medium flex items-center justify-center gap-2">
                      <Star className="w-4 h-4" />
                      Hakuna ziara za benki zinazohitajika
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Njia ya Zamani vs Njia Mpya</h2>
            <p className="text-gray-600 mt-2">Linganisha mchakato wa benki wa kawaida na ufanisi wa kidijitali</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Old Way */}
            <Card className="border-2 border-red-100 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Njia ya Benki ya Kawaida</h3>
                    <p className="text-sm text-gray-500">Mchakato wa kuchosha</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { step: 'Safiri kwenda benki', time: '1-2 saa', highlight: false },
                    { step: 'Subiri foleni', time: '30-60 dakika', highlight: true },
                    { step: 'Wasilisha karatasi', time: '20-30 dakika', highlight: false },
                    { step: 'Rudi kwa majibu', time: '3-7 siku', highlight: false },
                  ].map((item, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${item.highlight ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-sm font-bold">{idx + 1}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.step}</p>
                        <p className="text-xs text-red-500">⏱ {item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Jumla ya Muda:</span>
                  <span className="text-2xl font-bold text-red-500">4-10 siku</span>
                </div>
              </CardContent>
            </Card>

            {/* New Way */}
            <Card className="border-2 border-green-200 bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Njia ya KEP Kidijitali</h3>
                    <p className="text-sm text-gray-500">Haraka na rahisi</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { step: 'Fungua simu yako', time: '10 sekunde', highlight: false },
                    { step: 'Jaza fomu mtandaoni', time: '5 dakika', highlight: true },
                    { step: 'Pakia picha', time: '2 dakika', highlight: false },
                    { step: 'Pokea idhini papo hapo', time: 'Siku moja', highlight: false },
                  ].map((item, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${item.highlight ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${item.highlight ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}>{idx + 1}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.step}</p>
                        <p className="text-xs text-green-600">⚡ {item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-green-200 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Jumla ya Muda:</span>
                  <span className="text-2xl font-bold text-green-600">Siku 1</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-lg font-semibold text-green-600 flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              Okoa muda wa siku 9!
            </p>
          </div>
        </div>
      </section>

      {/* Loan Calculator Section */}
      <section id="calculator" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Hesabu Mkopo Wako</h2>
            <p className="text-gray-600 mt-2">Tumia kikokotoo chetu cha mkopo kupata makadirio ya papo hapo</p>
          </div>

          <Card className="shadow-xl rounded-3xl overflow-hidden border-0">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Loan Amount Slider */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">Kiasi cha Mkopo (TZS)</label>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(loanAmount)}</span>
                  </div>
                  <Slider
                    value={[loanAmount]}
                    onValueChange={(value) => setLoanAmount(value[0])}
                    min={50000}
                    max={5000000}
                    step={50000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>50K</span>
                    <span>1M</span>
                    <span>5M</span>
                  </div>
                </div>

                {/* Duration Slider */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">Muda wa Kulipa (Mesi)</label>
                    <span className="text-2xl font-bold text-blue-600">{loanDuration}</span>
                  </div>
                  <Slider
                    value={[loanDuration]}
                    onValueChange={(value) => setLoanDuration(value[0])}
                    min={3}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>3</span>
                    <span>12</span>
                    <span>24</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                <div className="text-center p-4 bg-blue-50 rounded-2xl">
                  <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                    <CreditCard className="w-5 h-5" />
                    <span className="text-sm font-medium">Malipo ya Kila Mwezi</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(monthlyPayment)} TZS</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-2xl">
                  <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
                    <Calculator className="w-5 h-5" />
                    <span className="text-sm font-medium">Jumla ya Malipo</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRepayment)} TZS</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-2xl">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Kiwango cha Riba</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">15% p.a.</p>
                </div>
              </div>

              {/* Validity Status */}
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Hali ya Usahihi</p>
                    <p className="text-sm text-green-600">Unastahiki Mkopo Huu</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <Button
                  className="bg-green-500 hover:bg-green-600 rounded-full px-8 gap-2"
                  onClick={() => setShowForm(true)}
                >
                  <Play className="w-4 h-4" />
                  Omba Mkopo Huu
                </Button>
                <Button variant="outline" className="rounded-full px-8" onClick={() => {
                  setLoanAmount(500000);
                  setLoanDuration(6);
                }}>
                  Weka Upya
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Loan Application Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl my-8">
            <CardContent className="p-6">
              {/* Form Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Fomu ya Ombi la Mkopo</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              {/* Stepper */}
              <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
                {FORM_STEPS.map((step, idx) => (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }`}>
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                    </div>
                    <p className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                      {step.name}
                    </p>
                  </div>
                ))}
                <div className="absolute right-0 top-0 text-xs text-gray-500">
                  Mwendelezo: <span className="font-bold text-blue-600">{getCompletionPercentage()}%</span>
                </div>
              </div>

              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Taarifa Binafsi
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Hatua 1 ya 4 - Taarifa za msingi</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Jina Kamili *</Label>
                      <Input
                        placeholder="Andika jina kamili"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Barua Pepe *</Label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Nambari ya Simu *</Label>
                      <Input
                        placeholder="+255712345678"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Tarehe ya Kuzaliwa *</Label>
                      <Input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Nambari ya Kitambulisho *</Label>
                      <Input
                        placeholder="NIDA/Passport"
                        value={formData.idNumber}
                        onChange={(e) => handleInputChange('idNumber', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Anwani *</Label>
                      <Input
                        placeholder="Anwani yako kamili"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Employment Info */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Taarifa za Kazi
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Hatua 2 ya 4 - Maelezo ya ajira</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Jina la Mwajiri *</Label>
                      <Input
                        placeholder="Kampuni/Biashara"
                        value={formData.employer}
                        onChange={(e) => handleInputChange('employer', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Cheo cha Kazi *</Label>
                      <Input
                        placeholder="Nafasi yako"
                        value={formData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Mapato ya Kila Mwezi (TZS) *</Label>
                      <Input
                        type="number"
                        placeholder="500000"
                        value={formData.monthlyIncome}
                        onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Miaka ya Kufanya Kazi *</Label>
                      <Input
                        type="number"
                        placeholder="2"
                        value={formData.employmentYears}
                        onChange={(e) => handleInputChange('employmentYears', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Loan Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Maelezo ya Mkopo
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Hatua 3 ya 4 - Taarifa za mkopo</p>

                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Kiasi</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(loanAmount)} TZS</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Muda</p>
                        <p className="text-lg font-bold text-blue-600">{loanDuration} Miezi</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Malipo/Mwezi</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(monthlyPayment)} TZS</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Sababu ya Mkopo *</Label>
                    <textarea
                      className="w-full p-3 border rounded-lg min-h-[100px]"
                      placeholder="Eleza sababu ya kuomba mkopo huu..."
                      value={formData.loanPurpose}
                      onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Verification */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Uthibiti
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Hatua 4 ya 4 - Thibitisha na wasilisha</p>

                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <h4 className="font-semibold text-gray-900">Muhtasari wa Ombi</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Jina:</span> <span className="font-medium">{formData.fullName}</span></div>
                      <div><span className="text-gray-500">Simu:</span> <span className="font-medium">{formData.phone}</span></div>
                      <div><span className="text-gray-500">Kiasi:</span> <span className="font-medium">{formatCurrency(loanAmount)} TZS</span></div>
                      <div><span className="text-gray-500">Muda:</span> <span className="font-medium">{loanDuration} Miezi</span></div>
                      <div><span className="text-gray-500">Malipo/Mwezi:</span> <span className="font-medium text-green-600">{formatCurrency(monthlyPayment)} TZS</span></div>
                      <div><span className="text-gray-500">Riba:</span> <span className="font-medium">15% p.a.</span></div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                    <input type="checkbox" className="mt-1" id="terms" />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      Ninakubali masharti na vigezo vya mkopo wa KEP Microcredit
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePrevStep}>
                    Rudi Nyuma
                  </Button>
                )}
                <div className="flex-1" />
                {currentStep < 4 ? (
                  <Button className="bg-green-500 hover:bg-green-600" onClick={handleNextStep}>
                    Endelea <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    className="bg-green-500 hover:bg-green-600"
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Wasilisha Ombi
                  </Button>
                )}
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">
                <FileText className="w-3 h-3 inline mr-1" />
                Picha ya Ustahiki Baadaye
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Maoni ya Wateja Wetu</h2>
            <p className="text-gray-600 mt-2">Sikia jinsi KEP Microcredit ilivyobadilisha maisha ya wafanyabiashara</p>
          </div>

          <div className="relative">
            <Card className="bg-white shadow-lg rounded-3xl overflow-hidden max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Image with overlay */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <img
                      src="/shop-image.jpg"
                      alt={TESTIMONIALS[activeTestimonial].name}
                      className="w-full h-full object-cover"
                    />
                    {/* Name overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white font-bold text-lg">{TESTIMONIALS[activeTestimonial].name}</p>
                      <p className="text-white/80 text-sm">{TESTIMONIALS[activeTestimonial].business}</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < TESTIMONIALS[activeTestimonial].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    {/* Quote Icon */}
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                      <Quote className="w-6 h-6 text-white" />
                    </div>

                    {/* Swahili Quote */}
                    <p className="text-lg text-gray-900 font-medium mb-4">
                      "{TESTIMONIALS[activeTestimonial].quote}"
                    </p>

                    {/* English Translation */}
                    <p className="text-sm text-gray-500 italic mb-6">
                      "{TESTIMONIALS[activeTestimonial].quoteEn}"
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{TESTIMONIALS[activeTestimonial].location}</span>
                    </div>

                    {/* Loan Amount */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Kiasi cha Mkopo:</p>
                        <p className="text-2xl font-bold text-green-600">{TESTIMONIALS[activeTestimonial].amount} TZS</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carousel Dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {TESTIMONIALS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestimonial(idx)}
                      className={`w-3 h-3 rounded-full transition-colors ${activeTestimonial === idx ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center p-6">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">15,000+</p>
              <p className="text-sm text-gray-500">Wateja Wenye Furaha</p>
            </Card>
            <Card className="text-center p-6">
              <Banknote className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">50B+</p>
              <p className="text-sm text-gray-500">TZS Zilizotolewa</p>
            </Card>
            <Card className="text-center p-6">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">4.9/5</p>
              <p className="text-sm text-gray-500">Ukadiriaji wa Wastani</p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Maswali Yanayoulizwa Mara kwa Mara</h2>
            <p className="text-gray-600 mt-2">Pata majibu ya maswali yako kuhusu mikopo ya KEP</p>
          </div>

          {/* Search Box */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tafuta swali..."
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            {FAQ_DATA.map((faq, idx) => (
              <Card key={idx} className={`overflow-hidden transition-all ${openFaq === idx ? 'ring-2 ring-blue-500' : ''}`}>
                <button
                  className={`w-full p-4 text-left flex items-center justify-between transition-colors ${openFaq === idx ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <div>
                    <span className={`font-medium ${openFaq === idx ? 'text-white' : 'text-gray-900'}`}>{faq.question}</span>
                    <span className={`block text-sm ${openFaq === idx ? 'text-blue-100' : 'text-gray-500'}`}>{faq.questionEn}</span>
                  </div>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <ChevronDown className={`w-5 h-5 flex-shrink-0 ${openFaq === idx ? 'text-white' : 'text-gray-500'}`} />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="p-4 bg-blue-50 border-t border-blue-200">
                    <p className="text-blue-900 font-medium">{faq.answer}</p>
                    <p className="text-blue-700 text-sm mt-2 italic">{faq.answerEn}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Banner */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Je, bado una maswali?</h3>
          <p className="text-blue-200 mb-6">Timu yetu iko tayari kukusaidia</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 gap-2">
              <Phone className="w-4 h-4" />
              Piga Simu
            </Button>
            <Button className="bg-white text-blue-700 hover:bg-gray-100 rounded-full px-6 gap-2 border-2 border-white">
              <Mail className="w-4 h-4" />
              Tuma Barua Pepe
            </Button>
          </div>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Usalama na Uaminifu</h2>
            <p className="text-gray-600 mt-2">
              Taarifa zako ni salama na zimehifadhiwa kwa <span className="text-green-600 font-semibold">kiwango cha juu</span>
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* SSL Encryption */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Usimbaji wa 256-bit SSL</h4>
              <p className="text-xs text-gray-500 mb-2">256-bit SSL Encryption</p>
              <p className="text-sm text-gray-600">Taarifa zako zinasimbwa kwa kiwango cha juu cha usalama</p>
            </Card>

            {/* BOT License */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Leseni ya BOT</h4>
              <p className="text-xs text-gray-500 mb-2">BOT Licensed</p>
              <p className="text-sm text-gray-600">Imethibitishwa na Benki Kuu ya Tanzania</p>
            </Card>

            {/* Biometric Verification */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Uthibitishaji wa Biometric</h4>
              <p className="text-xs text-gray-500 mb-2">Biometric Verification</p>
              <p className="text-sm text-gray-600">Uthibitishaji salama wa kitambulisho chako</p>
            </Card>

            {/* Data Protection */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Ulinzi wa Data</h4>
              <p className="text-xs text-gray-500 mb-2">Data Protection</p>
              <p className="text-sm text-gray-600">Tunafuata sheria na ulinzi wa data za Tanzania</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Mobile Money Partners */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Washirika Wetu wa Mitandao</h2>
            <p className="text-gray-600 mt-2">
              Tunashirikiana na mitandao mikubwa ya <span className="text-green-600 font-semibold">simu Tanzania</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Vodacom */}
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Vodacom</h4>
              <p className="text-sm text-gray-500 mt-1">Malipo na M-Pesa</p>
            </Card>

            {/* Airtel */}
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Airtel</h4>
              <p className="text-sm text-gray-500 mt-1">Malipo na Airtel Money</p>
            </Card>

            {/* Tigo */}
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Tigo</h4>
              <p className="text-sm text-gray-500 mt-1">Malipo na Tigo Pesa</p>
            </Card>
          </div>
        </div>
      </section>

      {/* BOT License Banner */}
      <section className="py-8 bg-green-50 border-y border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-bold text-green-800">Imethibitishwa na Benki Kuu ya Tanzania</h4>
              <p className="text-sm text-green-700">
                KEP Microcredit Limited ni taasisi ya fedha <span className="font-semibold">iliyoidhinishwa</span> na kudhibitishwa na Benki Kuu ya Tanzania (BOT). <span className="font-semibold">Leseni Namba: MFI-2024-001</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-4">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Hesabu Mkopo
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600 rounded-full px-6"
            onClick={() => setShowForm(true)}
          >
            <Play className="w-4 h-4 mr-2" />
            Anza Ombi
          </Button>
        </div>
      </div>

      {/* Footer Padding for floating bar */}
      <div className="h-20" />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">K</span>
                </div>
                <div>
                  <p className="font-bold">KEP Microcredit</p>
                  <p className="text-xs text-gray-400">Mikopo ya Haraka</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Tunakupa mikopo ya haraka na rahisi kwa wajiri wote kwa ada nafuu sana katika Tanzania.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-xs">&lt;</span>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-xs">&lt;</span>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-xs">&lt;</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-bold mb-4 text-green-400">Viungo vya Haraka</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Kuhusu Sisi</a></li>
                <li><a href="#" className="hover:text-white flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Huduma Zetu</a></li>
                <li><a href="#" className="hover:text-white flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Maswali</a></li>
                <li><a href="#" className="hover:text-white flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Wasiliana Nasi</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="font-bold mb-4 text-green-400">Kisheria</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Sera ya Faragha</a></li>
                <li><a href="#" className="hover:text-white flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Masharti na Hali</a></li>
                <li><a href="#" className="hover:text-white flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Sera ya Mkopo</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="font-bold mb-4 text-green-400">Wasiliana Nasi</h5>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-400" />
                  +255 222 456 789
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-400" />
                  info@kepmicrocredit.co.tz
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  Dar es Salaam, Tanzania
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">© 2024 KEP Microcredit Limited. Haki zote zimehifadhiwa.</p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Leseni ya BOT: MFI-2024-001</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

