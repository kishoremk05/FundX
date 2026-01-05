import { Link } from "react-router-dom";
import { Clock, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-16 lg:py-24 bg-primary">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="text-primary-foreground">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Ready to Take Your Business to the Next Level?
            </h2>
            <p className="opacity-90 max-w-2xl mb-6">
              Apply for a loan today and get approved within 24 hours. Our competitive rates and professional service make us the trusted choice
              for thousands of entrepreneurs across Tanzania.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>24-Hour Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>BOT Licensed</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <Button variant="lime" size="xl">
                Apply for a Loan <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#contact">
              <Button variant="lime-outline" size="xl" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
