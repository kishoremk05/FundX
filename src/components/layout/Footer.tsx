import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-kep-blue text-white">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white/95 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-white/20 group hover:scale-105 transition-transform duration-300">
                                <img src="/kep-logo-new.png" alt="KEP Microcredit" className="h-9 w-auto object-contain" />
                            </div>
                            <span className="font-heading font-bold text-lg tracking-tight">KEP Microcredit</span>
                        </div>
                        <p className="text-white/80 text-sm mb-4">
                            Mikopo ya Haraka - Quick loans to help you achieve your financial goals.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><a href="#services" className="hover:text-white transition-colors">Our Services</a></li>
                            <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
                            <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-heading font-semibold mb-4">Our Services</h4>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li>Emergency Loans (DHARURA)</li>
                            <li>Business Loans (BIASHARA)</li>
                            <li>Salary Advance (MISHAHARA)</li>
                            <li>Consulting Services</li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-heading font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-3 text-sm text-white/80">
                            <li className="flex items-start gap-2">
                                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p>+255 787 188 323</p>
                                    <p>+255 656 415 727</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span>kopwe9546@gmail.com</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>P.O. Box 6559, Mbeya, Tanzania</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="container-custom py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-white/60">
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
