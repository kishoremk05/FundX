import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainNavItems = [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/kep-logo-new.png" alt="KEP Microcredit" className="h-14 w-auto object-contain" />
            <div className="hidden sm:block">
              <h1 className="font-heading font-bold text-lg text-foreground">KEP Microcredit</h1>
              <p className="text-xs text-muted-foreground">The Lender of Your Next Hope</p>
            </div>
          </div>

          {/* Right Nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 ml-auto">
            {mainNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
            <Link to="/register" className="shrink-0">
              <Button variant="nav-cta" size="sm" className="lg:h-10 lg:px-6">
                Apply Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container-custom px-4 py-4 space-y-4">
            <div className="space-y-2">
              {mainNavItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block py-2 text-sm text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <Link to="/register" className="w-full">
              <Button variant="nav-cta" className="w-full">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
