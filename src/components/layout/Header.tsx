import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Microfinance", href: "#microfinance" },
    { label: "Business Loans", href: "#business-loans" },
    { label: "Personal Loans", href: "#personal-loans" },
    { label: "Consulting", href: "#consulting" },
    { label: "CPA Services", href: "#cpa" },
    { label: "Business Registration", href: "#registration" },
  ];

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
            <div className="w-12 h-12 bg-kep-blue rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">KEP</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-heading font-bold text-lg text-foreground">KEP Microcredit</h1>
              <p className="text-xs text-muted-foreground">The Lender of Your Next Hope</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search for services, loans, consulting..."
                className="w-full pl-4 pr-12 h-11 border-border rounded-lg"
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 bg-kep-blue hover:bg-kep-blue-dark"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right Nav */}
          <div className="hidden md:flex items-center gap-6">
            {mainNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Link to="/register">
              <Button variant="nav-cta" size="lg">
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

        {/* Secondary Nav */}
        <nav className="hidden lg:flex items-center gap-6 py-3 border-t border-border">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container-custom px-4 py-4 space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search..."
                className="w-full pl-4 pr-12"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {[...mainNavItems, ...navItems].map((item) => (
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
