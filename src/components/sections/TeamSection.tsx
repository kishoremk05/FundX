const TeamSection = () => {
  const leaders = [
    {
      title: "CEO",
      role: "Chief Executive Officer",
      description: "Leading KEP Microcredit's vision to provide accessible financial services and empower entrepreneurs.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop",
    },
    {
      title: "Managing Director",
      role: "Managing Director",
      description: "Overseeing daily operations and strategic initiatives to ensure excellent service delivery.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
    },
    {
      title: "Head of HR",
      role: "Head of Human Resources",
      description: "Building and nurturing a talented team committed to exceptional customer service.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop",
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
            Our Leadership Team
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet the experienced professionals dedicated to making financial services accessible and
            empowering businesses across Tanzania.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {leaders.map((leader) => (
            <div key={leader.title} className="group">
              <div className="relative overflow-hidden rounded-xl mb-4">
                <img
                  src={leader.image}
                  alt={leader.title}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {leader.title}
              </h3>
              <p className="text-primary text-sm mb-2">{leader.role}</p>
              <p className="text-muted-foreground text-sm">{leader.description}</p>
            </div>
          ))}
        </div>

        {/* Join Team CTA */}
        <div className="bg-kep-lime-light p-8 rounded-xl text-center max-w-2xl mx-auto">
          <h3 className="text-kep-lime font-semibold text-lg mb-2">Join Our Team</h3>
          <p className="text-muted-foreground">
            We're always looking for talented individuals who share our passion for financial inclusion.
            If you're interested in joining the KEP Microcredit family, get in touch with our HR department.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
