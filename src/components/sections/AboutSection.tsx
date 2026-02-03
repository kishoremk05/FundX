import { CheckCircle2, MapPin } from "lucide-react";

const AboutSection = () => {
  const features = [
    "Fast loan processing within 24 hours",
    "Affordable interest rates (Riba nafuu)",
    "Licensed and regulated by Bank of Tanzania",
    "Multiple service offerings beyond microfinance",
    "Professional consulting services",
    "Active presence in Mbeya and Dar es Salaam",
    "Focus on financial inclusion and empowerment",
    "Tier 2 Microfinance Service Provider",
  ];

  const targetMarket = [
    "Small business owners and entrepreneurs",
    "Salaried employees seeking personal loans",
    "Individuals with limited access to traditional banking",
    "Micro, small, and medium enterprises (MSMEs)",
    "People in urgent need of financial assistance",
  ];

  const locations = [
    {
      name: "Headquarters - Dar es Salaam",
      address: "S.L.P 1725",
      city: "",
      isPrimary: true,
    },
    {
      name: "Branch Office",
      address: "MBEYA, DODOMA, MWANZA",
      city: "SONGWE and IRINGA",
      isPrimary: false,
    },
  ];

  return (
    <section id="about" className="section-padding bg-kep-light-blue">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              About KEP Microcredit Limited
            </h2>
            <p className="text-muted-foreground mb-8">
              KEP Microcredit Limited is a licensed Tanzanian microfinance institution providing
              accessible financial services to individuals and businesses with limited access to
              traditional banking. We operate as a Tier 2 Microfinance Service Provider under the
              regulation of the Bank of Tanzania.{" "}
              <a 
                href="https://fra.cloud.appwrite.io/v1/storage/buckets/697a13d40022363d79cc/files/More_About_KEP/view?project=697a047200383024c46b&mode=admin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                more
              </a>
            </p>

            {/* Mission Box */}
            <div className="bg-card border-l-4 border-primary p-6 rounded-r-xl mb-8">
              <h3 className="text-primary font-semibold mb-2">Our Mission</h3>
              <p className="text-muted-foreground">
                To provide hope and financial support to those seeking to start or expand their
                businesses, serving as "The Lender of Your Next Hope" for entrepreneurs and individuals
                across Tanzania.
              </p>
            </div>

            {/* Mass Market */}
            <div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                Mass Market
              </h3>
              <ul className="space-y-2">
                {targetMarket.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
              Loan Details
            </h3>
            <div className="space-y-3 mb-8">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Locations */}
            <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
              Our Locations
            </h3>
            <div className="space-y-3 mb-6">
              {locations.map((location) => (
                <div
                  key={location.name}
                  className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border"
                >
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{location.name}</span>
                      {location.isPrimary && (
                        <span className="badge-primary text-xs">Primary</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                    <p className="text-sm text-muted-foreground">{location.city}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Regulatory Info */}
            <div className="bg-kep-lime p-6 rounded-xl">
              <h4 className="font-semibold text-kep-navy mb-4">Regulatory Information</h4>
              <div className="grid grid-cols-2 gap-4 text-kep-navy">
                <div>
                  <p className="text-sm opacity-80">License Type</p>
                  <p className="font-semibold">Tier 2 MSP</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">License No.</p>
                  <p className="font-semibold">MSP2-0976</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm opacity-80">Regulatory Body</p>
                  <p className="font-semibold">Bank of Tanzania (BOT)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
