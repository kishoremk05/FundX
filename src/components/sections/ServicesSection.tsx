import { useState, useEffect } from "react";
import { Banknote, TrendingUp, Users, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface LoanProduct {
  id: string;
  name: string;
  description: string;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  min_duration?: number;
  max_duration?: number;
  is_active: boolean;
}

const ServicesSection = () => {
  const { ref, isVisible } = useScrollAnimation(); // Retriggerable
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use real-time listener for dynamic updates
    const productsRef = collection(db, 'loan_products');
    const q = query(productsRef, where('is_active', '==', true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LoanProduct[];
      setLoanProducts(products);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching loan products:', error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fallback static services when no loan products exist
  const defaultServices = [
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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : loanProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loanProducts.map((product) => (
              <div key={product.id} className="card-service group hover:shadow-lg transition-all duration-300 bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="icon-circle group-hover:scale-110 transition-transform">
                    <Banknote className="w-6 h-6 text-kep-navy" />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    active
                  </span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {product.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-semibold text-foreground">{product.interest_rate}% / month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Range</span>
                    <span className="font-semibold text-foreground">
                      TSh {formatCurrency(product.min_amount)} - TSh {formatCurrency(product.max_amount)}
                    </span>
                  </div>
                  {product.max_duration && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-semibold text-foreground">
                        {product.min_duration || 1} - {product.max_duration} months
                      </span>
                    </div>
                  )}
                </div>
                <a
                  href="#contact"
                  className="inline-flex items-center text-primary font-medium hover:underline mt-4"
                >
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {defaultServices.map((service) => (
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
                  href="#contact"
                  className="inline-flex items-center text-primary font-medium hover:underline"
                >
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
