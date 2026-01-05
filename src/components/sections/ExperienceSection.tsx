const ExperienceSection = () => {
  const stats = [
    { value: "15+", label: "Team Members" },
    { value: "2", label: "Office Locations" },
    { value: "24hrs", label: "Loan Processing" },
    { value: "100%", label: "Commitment" },
  ];

  return (
    <section className="py-16 lg:py-24 bg-primary">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="text-center text-primary-foreground">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Experience the KEP Difference
          </h2>
          <p className="max-w-3xl mx-auto opacity-90 mb-12">
            Our team of over 15+ dedicated professionals across Mbeya and Dar es Salaam is ready to help
            you access the financial services you need. With licensed expertise from the Bank of Tanzania, we
            deliver trusted solutions with a personal touch.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-bold text-kep-lime mb-1">
                  {stat.value}
                </p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
