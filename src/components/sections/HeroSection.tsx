import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Clock, Shield, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const sliderImages = [
  { src: "/hero-image.jpg", alt: "KEP Microcredit team meeting" },
  { src: "/slider-1.jpg", alt: "Professional Financial Services" },
  { src: "/slider-2.jpg", alt: "Collaborative Excellence" },
  { src: "/slider-3.jpg", alt: "Personalized Consultation" },
];

const HeroSection = () => {
  const { ref, isVisible } = useScrollAnimation(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

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
          <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
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

          {/* Right Content - Hero Image Slider */}
          <div className="relative animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden bg-muted" style={{ aspectRatio: '4/3' }}>
              {/* Image Slider */}
              {sliderImages.map((slide, index) => (
                <img
                  key={index}
                  src={slide.src}
                  alt={slide.alt}
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                />
              ))}

              {/* Stats Overlay */}
              <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg z-10">
                <p className="text-3xl font-bold">1,352+</p>
                <p className="text-sm opacity-90">Licensed Institutions</p>
                <p className="text-xs opacity-75">in Tanzania</p>
              </div>

              {/* Dot Indicators */}
              <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                {sliderImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${index === currentSlide
                        ? "bg-primary"
                        : "bg-white/50 hover:bg-white/70"
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
