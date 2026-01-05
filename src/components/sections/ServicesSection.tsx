import { Clock, Building2, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ServicesSection = () => {
  const services = [
    {
      icon: Clock,
      title: "DHARURA (Emergency Loans)",
      description: "Quick emergency loans for urgent financial needs with fast approval",
      badge: "24h Disbursement",
      badgeType: "lime",
    },
    {
      icon: Building2,
      title: "BIASHARA (Business Loans)",
      description: "Financing for business growth, expansion and working capital needs",
      badge: "Popular",
      badgeType: "lime",
    },
    {
      icon: CreditCard,
      title: "MISHAHARA (Salary Advance)",
      description: "Salary advance loans for salaried employees with competitive rates",
      badge: null,
      badgeType: null,
    },
  ];

  return (
    <section id="services" className="section-padding bg-background">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              Microfinance Services
            </h2>
            <p className="text-muted-foreground">
              Fast, reliable, and affordable financing solutions
            </p>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0">
            View All
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.title} className="card-service relative">
              {service.badge && (
                <span className={`absolute top-4 right-4 ${service.badgeType === 'lime' ? 'badge-lime' : 'badge-primary'}`}>
                  {service.badge}
                </span>
              )}
              <div className="icon-circle mb-4">
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
