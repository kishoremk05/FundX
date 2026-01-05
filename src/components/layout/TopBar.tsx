import { Mail, Phone } from "lucide-react";

const TopBar = () => {
  return (
    <div className="bg-kep-gray border-b border-border py-2">
      <div className="container-custom px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>License No: MSP2-0976</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Regulated by Bank of Tanzania</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="mailto:kopwe9546@gmail.com" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Contact</span>
          </a>
          <a href="tel:+255787188323" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Call Us</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
