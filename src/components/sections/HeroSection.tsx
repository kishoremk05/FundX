import { Link } from "react-router-dom";
import { Clock, Shield, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const features = [
    { icon: Clock, title: "24 Hour", subtitle: "Fast Processing" },
    { icon: Shield, title: "Licensed", subtitle: "BOT Regulated" },
    { icon: TrendingDown, title: "Affordable", subtitle: "Low Interest" },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-slide-up">
            <span className="badge-lime mb-6">
              Licensed by Bank of Tanzania • MSP2-0976
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Your Trusted Partner in{" "}
              <span className="text-primary">Microfinance</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              The Lender of Your Next Hope. Fast loan processing within 24 hours,
              competitive interest rates, and professional consulting services to help your
              business grow.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/register">
                <Button variant="default" size="lg">
                  Apply for a Loan
                </Button>
              </Link>
              <a href="#services">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </a>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-3 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-4 rounded-xl border border-border bg-card hover:shadow-card transition-shadow"
                >
                  <feature.icon className="w-6 h-6 text-primary mb-2" />
                  <p className="font-semibold text-foreground text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="/hero-image.jpg"
                alt="KEP Microcredit team meeting"
                className="w-full h-auto rounded-2xl"
              />
              {/* Stats Overlay */}
              <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg">
                <p className="text-3xl font-bold">1,352+</p>
                <p className="text-sm opacity-90">Licensed Institutions</p>
                <p className="text-xs opacity-75">in Tanzania</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
