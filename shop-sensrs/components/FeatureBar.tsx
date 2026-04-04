export default function FeatureBar() {
  const features = [
    {
      icon: "🚚",
      title: "Fast Shipping",
      desc: "Quick delivery across India",
    },
    {
      icon: "🔄",
      title: "Easy Returns",
      desc: "Hassle-free returns policy",
    },
    {
      icon: "🔒",
      title: "Secure Payments",
      desc: "100% secure transactions",
    },
    {
      icon: "📞",
      title: "24/7 Support",
      desc: "We’re here to help anytime",
    },
  ];

  return (
    <section className="feature-bar">
      <div className="feature-container">
        {features.map((feature, index) => (
          <div className="feature-item" key={index}>
            <div className="feature-icon">{feature.icon}</div>
            <div>
              <h4>{feature.title}</h4>
              <p>{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}