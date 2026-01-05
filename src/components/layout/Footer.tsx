import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const services = [
    "Emergency Loans (DHARURA)",
    "Business Loans (BIASHARA)",
    "Salary Advance (MISHAHARA)",
    "Vehicle Registration",
    "Property Documentation",
    "CPA Services",
  ];

  const quickLinks = [
    "About Us",
    "Our Services",
    "Apply for Loan",
    "Contact Us",
    "Careers",
    "FAQs",
  ];

  return (
    <footer className="bg-kep-navy text-primary-foreground">
      <div className="container-custom px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/kep-logo.jpg" alt="KEP Microcredit" className="h-12 w-auto object-contain" />
              <div>
                <h4 className="font-heading font-bold">KEP Microcredit</h4>
                <p className="text-xs opacity-75">The Lender of Your Next Hope</p>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Licensed Tanzanian microfinance institution providing accessible financial services
              under Bank of Tanzania regulation.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 opacity-80">
                <Phone className="w-4 h-4" />
                <span>+255 787 188 323</span>
              </div>
              <div className="flex items-center gap-2 opacity-80">
                <Mail className="w-4 h-4" />
                <span>kopwe9546@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 opacity-80">
                <MapPin className="w-4 h-4" />
                <span>Mbeya, Tanzania</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Our Services</h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service}>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Regulatory */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Regulatory Info</h4>
            <div className="bg-primary/20 p-4 rounded-lg">
              <p className="text-sm opacity-80 mb-2">License No:</p>
              <p className="font-semibold mb-3">MSP2-0976</p>
              <p className="text-sm opacity-80 mb-2">Regulated by:</p>
              <p className="font-semibold">Bank of Tanzania</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container-custom px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-80">
              © 2024 KEP Microcredit Limited. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm opacity-80">
              <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
