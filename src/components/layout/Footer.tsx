import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer>
            {/* Main Footer - Business Card Style */}
            <div className="relative">
                {/* Green background bar */}
                <div className="bg-[#72bc09] h-40 relative">
                    {/* Blue KEP Card - overlapping on left */}
                    <div className="absolute left-8 md:left-16 lg:left-24 top-1/2 -translate-y-1/2">
                        <div className="bg-[#4a7cfa] w-40 h-52 md:w-44 md:h-56 flex flex-col items-center justify-center shadow-lg">
                            {/* Golden Mountain Logo - 3 peaks like the image */}
                            <div className="mb-6">
                                <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Outer large mountain - 3 peaks */}
                                    <path d="M10 45 L25 20 L40 45" stroke="#d4a84b" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M25 20 L40 45 L55 20" stroke="#d4a84b" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M40 45 L55 20 L70 45" stroke="#d4a84b" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    {/* Inner smaller mountain */}
                                    <path d="M20 50 L32 32 L44 50" stroke="#d4a84b" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M36 50 L48 32 L60 50" stroke="#d4a84b" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="text-center text-white mt-2">
                                <p className="text-base font-normal tracking-[0.4em] mb-1">K E P</p>
                                <p className="text-sm font-normal tracking-widest">MICROCREDIT</p>
                                <p className="text-sm font-normal tracking-widest mt-3">LIMITED</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right side - Contact info and stripes */}
                    <div className="absolute right-0 top-0 h-full flex">
                        {/* Light green contact section */}
                        <div className="bg-[#c5e1a5] h-full flex items-center px-6 md:px-10">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-gray-800 flex-shrink-0 mt-1" />
                                    <div className="text-sm text-gray-900 space-y-1">
                                        <p>+255789670696 (CEO)</p>
                                        <p>0754469917 (MD)</p>
                                        <p>0755651526 (HR)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-800 flex-shrink-0" />
                                    <a href="mailto:support@kepmicrocredit.com" className="text-sm text-blue-600 underline">
                                        support@kepmicrocredit.com
                                    </a>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-gray-800 flex-shrink-0 mt-1" />
                                    <div className="text-sm text-gray-900">
                                        <p>S.L.P 1725</p>
                                        <p>Mbeya, Tanzania.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Bright lime stripe */}
                        <div className="w-6 bg-[#a8d86e]"></div>
                        
                        {/* Yellow-green stripe */}
                        <div className="w-6 bg-[#d4e157]"></div>
                        
                        {/* Orange/tan stripe */}
                        <div className="w-8 bg-[#d4a373]"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#1a2e44]">
                <div className="container-custom py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-white/60 ml-48 md:ml-56 lg:ml-64">
                            © {currentYear} KEP Microcredit Limited. All rights reserved.
                        </p>
                        <div className="flex gap-4 text-xs text-white/60">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
