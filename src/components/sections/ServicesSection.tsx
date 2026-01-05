import { Banknote, TrendingUp, Users, Calendar, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";

const ServicesSection = () => {
  const { ref, isVisible } = useScrollAnimation(); // Retriggerable

  const services = [
    {
      icon: Banknote,
      title: "Microloans",
      description: "Quick access to capital for business growth with flexible repayment terms.",
    },
    {
      icon: TrendingUp,
      title: "Business Consulting",
      description: "Expert advice to help you make informed financial decisions.",
    },
    {
      icon: Users,
      title: "Group Lending",
      description: "Collaborative financing solutions for community groups.",
    },
    {
      icon: Calendar,
      title: "Flexible Terms",
      description: "Customized loan products that fit your business cycle.",
    },
  ];

  return (
    <section id="services" className="section-padding bg-muted/30">
      <div className="container-custom">
        <div
          ref={ref}
          className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
            Microfinance Services
          </h2>
          <p className="text-muted-foreground">
            Fast, reliable, and affordable financing solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.title} className="card-service group hover:shadow-lg transition-all duration-300">
              <div className="icon-circle mb-4 group-hover:scale-110 transition-transform">
                <service.icon className="w-6 h-6 text-kep-navy" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {service.description}
              </p>
              <a
                href="#"
                className="inline-flex items-center text-primary font-medium hover:underline"
              >
                Learn more <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
