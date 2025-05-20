import Link from "next/link"
import { Button } from "@repo/ui/Button"
import { Badge } from "@repo/ui/Badge"
import { Card, CardContent } from "@repo/ui/Card"

import {
  ShieldCheck,
  Zap,
  BarChart3,
  Globe,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  LineChart,
  Network,
  Fingerprint,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              FraudShield
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-purple-600 transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Testimonials
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:text-purple-600 transition-colors">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/signin">
              <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-purple-50 py-20 mx-[100px]">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1">
                  Next-Gen Fraud Protection
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Protect Your Business from{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                    Advanced Fraud
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-lg">
                  FraudShield uses AI-powered detection to identify and prevent fraud in real-time, saving your business
                  money and protecting your reputation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                    Schedule Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-r from-purple-400 to-indigo-400"
                      ></div>
                    ))}
                  </div>
                  <p>
                    <span className="font-semibold">500+</span> businesses protected
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-30"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-xl">
                  <div className="aspect-[4/3] bg-gradient-to-br from-purple-50 to-indigo-50 rounded-md flex items-center justify-center mb-4">
                    <div className="w-3/4 h-3/4 bg-white rounded-md shadow-lg p-4 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <span className="font-semibold text-red-500">Fraud Alert</span>
                        </div>
                        <Badge className="bg-red-100 text-red-800">High Risk</Badge>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-2 bg-gray-200 rounded-full w-full"></div>
                        <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded-full w-1/2"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="h-8 bg-purple-100 rounded flex items-center justify-center text-xs font-medium text-purple-800">
                          Investigate
                        </div>
                        <div className="h-8 bg-red-100 rounded flex items-center justify-center text-xs font-medium text-red-800">
                          Block
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">Legitimate Transactions</span>
                      </div>
                      <span className="text-sm font-bold">98.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "98.2%" }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium">Fraudulent Transactions</span>
                      </div>
                      <span className="text-sm font-bold">1.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: "1.8%" }}></div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Detection Accuracy</span>
                        <span className="font-bold text-green-600">99.7%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-12 bg-white">
          <div className="container">
            <h2 className="text-center text-gray-400 text-sm font-medium uppercase tracking-wider mb-6">
              Trusted by industry leaders
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
              {["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"].map((company, i) => (
                <div
                  key={i}
                  className="h-8 w-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-medium"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white mx-[100px] ">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1 mb-4">
                Powerful Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Fraud Detection for Modern Businesses</h2>
              <p className="text-gray-600">
                Our comprehensive suite of tools helps you identify, prevent, and manage fraud across your entire
                organization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-6 w-6 text-purple-600" />,
                  title: "Real-Time Detection",
                  description:
                    "Identify suspicious activities as they happen with our real-time monitoring and alert system.",
                },
                {
                  icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
                  title: "Advanced Analytics",
                  description:
                    "Gain insights into fraud patterns with comprehensive analytics and customizable dashboards.",
                },
                {
                  icon: <Globe className="h-6 w-6 text-purple-600" />,
                  title: "Geospatial Analysis",
                  description:
                    "Track and analyze transaction locations to identify geographic fraud patterns and anomalies.",
                },
                {
                  icon: <Network className="h-6 w-6 text-purple-600" />,
                  title: "Network Visualization",
                  description:
                    "Visualize connections between entities to uncover hidden fraud rings and relationships.",
                },
                {
                  icon: <Fingerprint className="h-6 w-6 text-purple-600" />,
                  title: "Behavioral Biometrics",
                  description: "Analyze user behavior patterns to detect account takeovers and suspicious activities.",
                },
                {
                  icon: <LineChart className="h-6 w-6 text-purple-600" />,
                  title: "Predictive Modeling",
                  description: "Anticipate potential fraud before it happens with AI-powered predictive models.",
                },
              ].map((feature, i) => (
                <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gradient-to-b from-purple-50 to-white mx-[100px] ">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1 mb-4">Simple Process</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How FraudShield Works</h2>
              <p className="text-gray-600">
                Our platform seamlessly integrates with your existing systems to provide comprehensive fraud protection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Connect Your Data",
                  description:
                    "Easily integrate with your existing systems through our secure API or use our pre-built connectors.",
                },
                {
                  step: "02",
                  title: "AI Analysis",
                  description:
                    "Our advanced algorithms analyze transactions and user behavior to identify suspicious patterns.",
                },
                {
                  step: "03",
                  title: "Take Action",
                  description:
                    "Receive alerts, block fraudulent activities, and generate reports to improve your security posture.",
                },
              ].map((item, i) => (
                <div key={i} className="relative">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-20 right-0 w-full h-0.5 bg-gradient-to-r from-purple-200 to-transparent z-0"></div>
                  )}
                  <div className="relative z-10 bg-white rounded-lg p-8 shadow-lg border border-purple-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold mb-6">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: "99.7%", label: "Detection Accuracy" },
                { value: "$2.8M", label: "Average Savings Per Client" },
                { value: "500+", label: "Businesses Protected" },
                { value: "3.2B+", label: "Transactions Analyzed" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-purple-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white mx-[100px] ">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1 mb-4">
                Flexible Pricing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Plans for Businesses of All Sizes</h2>
              <p className="text-gray-600">
                Choose the plan that fits your needs. All plans include our core fraud detection features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Starter",
                  price: "$299",
                  description: "Perfect for small businesses just getting started with fraud prevention.",
                  features: [
                    "Up to 10,000 transactions/month",
                    "Real-time fraud detection",
                    "Basic analytics dashboard",
                    "Email alerts",
                    "Standard support",
                  ],
                  cta: "Get Started",
                  popular: false,
                },
                {
                  name: "Professional",
                  price: "$799",
                  description: "Ideal for growing businesses with moderate transaction volumes.",
                  features: [
                    "Up to 50,000 transactions/month",
                    "Advanced fraud detection rules",
                    "Full analytics suite",
                    "API access",
                    "Priority support",
                    "Custom rule creation",
                  ],
                  cta: "Get Started",
                  popular: true,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  description: "Tailored solutions for large organizations with complex needs.",
                  features: [
                    "Unlimited transactions",
                    "Dedicated account manager",
                    "Custom integration support",
                    "Advanced API access",
                    "24/7 premium support",
                    "On-premise deployment options",
                    "Custom ML model training",
                  ],
                  cta: "Contact Sales",
                  popular: false,
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`rounded-lg overflow-hidden border ${plan.popular
                    ? "border-purple-200 shadow-lg shadow-purple-100 relative"
                    : "border-gray-200 shadow-md"
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.price !== "Custom" && <span className="text-gray-500 ml-1">/month</span>}
                    </div>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    <Button
                      className={`w-full ${plan.popular
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        : "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
                        }`}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-6">
                    <h4 className="font-medium mb-4">What's included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-purple-50">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1 mb-4">
                Success Stories
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-gray-600">
                Hear from businesses that have transformed their fraud prevention with FraudShield.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "FraudShield has reduced our fraud losses by 82% in just three months. The real-time alerts have been a game-changer for our team.",
                  author: "Sarah Johnson",
                  role: "Head of Security, E-commerce Inc.",
                },
                {
                  quote:
                    "The behavioral analytics feature caught sophisticated fraud attempts that our previous solution missed completely. Well worth the investment.",
                  author: "Michael Chen",
                  role: "CTO, FinTech Solutions",
                },
                {
                  quote:
                    "Implementation was seamless, and the support team was exceptional. We've seen ROI within the first month of using FraudShield.",
                  author: "Jessica Williams",
                  role: "Fraud Manager, Global Payments",
                },
              ].map((testimonial, i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 text-purple-600">
                      {[...Array(5)].map((_, j) => (
                        <span key={j} className="inline-block mr-1">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 mr-3"></div>
                      <div>
                        <div className="font-medium">{testimonial.author}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-white">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1 mb-4">
                Common Questions
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">
                Find answers to common questions about FraudShield and our fraud detection platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  question: "How long does it take to integrate FraudShield?",
                  answer:
                    "Most customers are up and running within 1-2 weeks. Our team provides comprehensive onboarding support to ensure a smooth integration with your existing systems.",
                },
                {
                  question: "Is FraudShield compliant with industry regulations?",
                  answer:
                    "Yes, FraudShield is compliant with PCI DSS, GDPR, CCPA, and other major regulatory frameworks. We regularly undergo security audits to maintain compliance.",
                },
                {
                  question: "Can I customize the fraud detection rules?",
                  answer:
                    "Our Professional and Enterprise plans allow for custom rule creation and modification to match your specific business needs and risk tolerance.",
                },
                {
                  question: "How does the pricing work for larger transaction volumes?",
                  answer:
                    "For businesses with large transaction volumes, we offer custom pricing based on your specific needs. Contact our sales team for a personalized quote.",
                },
                {
                  question: "Do you offer a free trial?",
                  answer:
                    "Yes, we offer a 14-day free trial with full access to all features. No credit card required to start your trial.",
                },
                {
                  question: "What kind of support is included?",
                  answer:
                    "All plans include email support. Professional plans include priority support with faster response times, while Enterprise plans include 24/7 phone and email support with a dedicated account manager.",
                },
              ].map((faq, i) => (
                <div key={i} className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                Contact Support
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Protect Your Business from Fraud?</h2>
              <p className="text-xl text-purple-100 mb-8">
                Join 500+ businesses that trust FraudShield for their fraud prevention needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-purple-300 text-white hover:bg-purple-700">
                  Schedule Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 ml-[100px]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-6 w-6 text-purple-400" />
                <span className="text-lg font-bold text-white">FraudShield</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Advanced fraud detection and prevention for modern businesses.
              </p>
              <div className="flex gap-4">
                {["twitter", "linkedin", "facebook", "github"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-purple-600 transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                {["Features", "Pricing", "Case Studies", "Reviews", "Updates"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-purple-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                {["About", "Team", "Careers", "Press", "Contact"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-purple-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                {["Blog", "Documentation", "Help Center", "API", "Status"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-purple-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center mx-[100px]">
            <p className="text-sm text-gray-500">© 2023 FraudShield. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
