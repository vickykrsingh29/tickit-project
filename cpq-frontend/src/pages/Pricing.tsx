import React from 'react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: "TickIT Sales",
      description: "Stand out from your competition with branded and personalized digital sales proposals.",
      features: [
        "Digital Sales Proposals",
        "Contract Management (CLM)",
        "Online Forms",
        "Dynamic Document Generation",
        "TickIT eSignature",
        "DocuSign Integration",
        "Buyer Engagement Insights",
        "Enterprise-grade security"
      ],
      highlight: false
    },
    {
      name: "TickIT CPQ",
      description: "Deliver quick time-to-value and seamlessly address changing business needs with Zero-code CPQ.",
      features: [
        "Configure Price Quote (CPQ)",
        "Guided Selling Playbook",
        "Multi-dimensional Pricing Models",
        "Subscription, Renewal & Order Management",
        "Team Collaboration",
        "Advanced Parallel Approval Workflows",
        "Digital Sales Proposal",
        "Contract Management (CLM)",
        "Dynamic Document Generation",
        "TickIT eSignature",
        "DocuSign Integration",
        "Buyer Engagement Insights",
        "Enterprise-grade security"
      ],
      highlight: true
    },
    {
      name: "TickIT Billing",
      description: "Empower finance teams to easily and effectively manage their entire revenue stream.",
      features: [
        "Subscription Management",
        "Billing Scheduling and Invoicing",
        "Recurring, One-time and Milestone Pricing",
        "Complex Usage-Based / Consumption Models",
        "API Connectivity with Operational Systems",
        "Bi-directional CRM to ERP Connectivity",
        "Sales Commission Calculation"
      ],
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pick your best plan for growth
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect solution for your business needs
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden transform transition-transform hover:scale-105 
                ${plan.highlight ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Plan Header */}
              <div className={`px-6 py-8 ${plan.highlight ? 'bg-blue-50' : ''}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              {/* Features List */}
              <div className="px-6 py-8 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Features include:</h4>
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call to Action */}
              <div className="px-6 py-8">
                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors
                    ${plan.highlight 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-800 hover:bg-gray-900'}`}
                >
                  Contact Sales
                </button>
                <p className="text-sm text-gray-500 text-center mt-4">
                  Custom pricing for your needs
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Need help choosing the right plan?
          </p>
          <button className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            Schedule a Demo
            <svg
              className="ml-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
