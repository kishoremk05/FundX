import { Users, DollarSign, Building, Award } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "5,000+",
      label: "Happy Clients",
      sublabel: "Served across Tanzania",
    },
    {
      icon: DollarSign,
      value: "TZS 2B+",
      label: "Loans Disbursed",
      sublabel: "To date",
    },
    {
      icon: Building,
      value: "2",
      label: "Offices",
      sublabel: "Mbeya & Dar es Salaam",
    },
    {
      icon: Award,
      value: "100%",
      label: "Licensed",
      sublabel: "Bank of Tanzania regulated",
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
            Trusted by Thousands
          </h2>
          <p className="text-muted-foreground">Our numbers speak for themselves</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="icon-circle-blue mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </p>
              <p className="font-semibold text-foreground">{stat.label}</p>
              <p className="text-sm text-muted-foreground">{stat.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
