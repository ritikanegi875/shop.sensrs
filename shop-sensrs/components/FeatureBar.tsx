import React from 'react';

export default function FeatureBar() {
  const features = [
    {
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      ),
      title: "Free Shipping",
      desc: "On orders over $50",
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      ),
      title: "Secure Payment",
      desc: "100% secure checkout",
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
        </svg>
      ),
      title: "Easy Returns",
      desc: "30-day return policy",
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      ),
      title: "24/7 Support",
      desc: "Customer service",
    },
  ];

  return (
    <section className="bg-white py-12 px-6 md:px-12">
      <div className="mx-auto max-w-[1400px] grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <div 
            className="flex flex-col items-center text-center p-8 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-shadow duration-200 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]" 
            key={index}
          >
            {/* Mint Green Rounding Icon Frame */}
            <div className="flex items-center justify-center w-14 h-14 bg-[#e2f7ed] text-[#0c1c18] rounded-2xl mb-5">
              {feature.icon}
            </div>
            
            <h4 className="font-serif text-lg font-bold text-[#00241b] mb-1.5">
              {feature.title}
            </h4>
            <p className="text-sm text-slate-500 font-normal">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}