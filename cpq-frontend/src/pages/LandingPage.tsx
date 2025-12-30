import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect } from "react";
import {
  FaChartLine,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaRocket,
} from "react-icons/fa";
import { useHistory } from "react-router-dom";

const LandingPage: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const history = useHistory();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      history.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, history]);

  useEffect(() => {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = "smooth";
    // Add scroll padding to account for fixed navbar
    document.documentElement.style.scrollPaddingTop = "64px";

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
      document.documentElement.style.scrollPaddingTop = "0";
    };
  }, []);

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        prompt: "select_account",
      },
    });
  };

  const handleSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        prompt: "select_account",
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return !isAuthenticated ? (
    <div className="min-h-screen font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#e8eef1] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-[#057dcd]">TickIT</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a
                href="#hero"
                className="text-gray-700 hover:text-[#057dcd] transition duration-200"
              >
                Home
              </a>
              <a
                href="#features"
                className="text-gray-700 hover:text-[#057dcd] transition duration-200"
              >
                Features
              </a>
              <a
                href="#cpq"
                className="text-gray-700 hover:text-[#057dcd] transition duration-200"
              >
                CPQ
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-[#057dcd] transition duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="bg-gradient-to-b from-[#e8eef1] to-white pt-24 pb-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight mb-4 transform hover:scale-105 transition duration-300">
            <span className="text-[#057dcd]">TickIT</span> - Simplifying Q2C for
            SMEs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform your quote-to-cash process with AI-powered automation.
            Free up valuable time and focus on what matters most - growing your
            business.
          </p>
          <div className="space-x-4">
            <button
              onClick={handleSignup}
              className="px-8 py-4 bg-[#057dcd] text-white rounded-lg text-lg font-semibold hover:bg-[#046baf] transform hover:scale-105 transition duration-200"
            >
              Start Free Trial
            </button>
            <button
              onClick={handleLogin}
              className="px-8 py-4 bg-white text-[#057dcd] border-2 border-[#057dcd] rounded-lg text-lg font-semibold hover:bg-[#e8eef1] transform hover:scale-105 transition duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#e8eef1] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Features</h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience powerful tools designed to automate your workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaRocket className="h-10 w-10 text-[#057dcd]" />}
              title="Automated Workflows"
              description="Streamline your entire quote-to-cash process with intelligent automation"
            />
            <FeatureCard
              icon={<FaClock className="h-10 w-10 text-[#057dcd]" />}
              title="Save Time"
              description="Reduce manual work by up to 80% with our AI-powered platform"
            />
            <FeatureCard
              icon={<FaChartLine className="h-10 w-10 text-[#057dcd]" />}
              title="Grow Faster"
              description="Focus on strategic growth while we handle your operational tasks"
            />
          </div>
        </div>
      </section>

      {/* CPQ Section */}
      <section
        id="cpq"
        className="bg-gradient-to-r from-[#046baf] to-[#057dcd] py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">CPQ Solutions</h2>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto mb-8">
            Our Configure, Price, Quote (CPQ) tool is designed to help SMEs
            create accurate quotes quickly, streamline approvals, and close
            deals faster.
          </p>
          <button
            onClick={handleSignup}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition duration-200"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#e8eef1] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              What Our Clients Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TestimonialCard
              name="Jane Doe"
              feedback="Tickit has revolutionized our quote-to-cash process. It's fast, efficient, and user-friendly!"
            />
            <TestimonialCard
              name="John Smith"
              feedback="The CPQ tool is a game-changer. It helped us close deals faster and improved our workflow tremendously."
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="bg-gradient-to-r from-[#057dcd] to-[#046baf] py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white">Get In Touch</h2>
            <p className="mt-4 text-lg text-gray-200">
              We'd love to hear from you. Drop us a message!
            </p>
          </div>
          <form className="max-w-xl mx-auto">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Your Message"
                className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                rows={5}
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-white text-[#057dcd] font-semibold rounded-lg transition duration-200 hover:bg-[#e8eef1]"
            >
              Send Message!
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#e8eef1] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} TickIT. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <a
              href="mailto:contact@tickit.com"
              className="text-gray-600 hover:text-[#057dcd] transition duration-200"
            >
              <FaEnvelope className="h-6 w-6" />
            </a>
            <a
              href="tel:+1234567890"
              className="text-gray-600 hover:text-[#057dcd] transition duration-200"
            >
              <FaPhone className="h-6 w-6" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  ) : null;
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 hover:bg-[#e8eef1]">
    <div className="flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const TestimonialCard: React.FC<{
  name: string;
  feedback: string;
}> = ({ name, feedback }) => (
  <div className="p-8 bg-white rounded-lg shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-105 hover:bg-[#e8eef1]">
    <p className="text-gray-700 italic mb-4">"{feedback}"</p>
    <div className="text-right">
      <p className="text-gray-900 font-bold">{name}</p>
    </div>
  </div>
);

export default LandingPage;
