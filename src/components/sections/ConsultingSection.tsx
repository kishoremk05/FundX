import { Car, Home, Shield, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ConsultingSection = () => {
  const services = [
    {
      icon: Car,
      title: "Vehicle Registration",
      description: "Kada ya Gari, Pikipiki au Bajaj - Vehicle, motorcycle and bajaj registration services",
    },
    {
      icon: Home,
      title: "Property Documentation",
      description: "Hatiya Nyumba / Kiwanja / Hatiya mauziano - House deeds, plot titles and sale agreements",
    },
    {
      icon: Shield,
      title: "Non-Traditional Collateral",
      description: "Dhamana nyinginezo - Accept household items as collateral (Sofa, TV, Fridge, Computer, etc.)",
    },
    {
      icon: FileText,
      title: "Document Processing",
      description: "Professional assistance with various business and personal documentation",
    },
  ];

  return (
    <section id="consulting" className="section-padding bg-kep-gray">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              Professional Consulting
            </h2>
            <p className="text-muted-foreground">
              Expert business advisory and professional services
            </p>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0">
            View All
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.title} className="card-service bg-card">
              <div className="icon-circle mb-4">
                <service.icon className="w-6 h-6 text-kep-navy" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {service.description}
              </p>
              <a
                href="#contact"
                className="inline-flex items-center text-primary text-sm font-medium hover:underline"
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

export default ConsultingSection;
