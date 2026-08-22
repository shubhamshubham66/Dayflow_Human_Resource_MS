import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Clock,
  Users,
  BarChart3,
  UserCircle,
  CalendarDays,
  DollarSign,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Star,
  Menu,
  X,
  Globe,
  MessageCircle,
  Heart,
} from 'lucide-react';
import Logo from '../components/ui/Logo';

// ============================================================
// PHASE 5: COMPLETE LANDING PAGE — 9 SECTIONS
// ============================================================

const Landing = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorksSection />
      <ForEveryoneSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

// ============================================================
// 1. NAVBAR — Sticky, transparent-to-white on scroll
// ============================================================
const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#footer' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-primary-500'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left: Logo */}
          <Logo size="sm" className={scrolled ? '' : '[&_span]:text-white'} />

          {/* Center: Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-bold relative pb-1 transition-all duration-200
                  after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:transition-all after:duration-300 hover:after:w-full
                  ${scrolled
                    ? 'text-gray-700 hover:text-primary-600 after:bg-primary-500'
                    : 'text-white hover:text-white/80 after:bg-white'
                  }
                `}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right: Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/signin"
              className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                scrolled
                  ? 'text-primary-600 border-2 border-primary-500 hover:bg-primary-50'
                  : 'text-white border-2 border-white hover:bg-white/10'
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className={`px-5 py-2.5 text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all ${
                scrolled
                  ? 'text-white bg-primary-500 hover:bg-primary-600'
                  : 'text-primary-600 bg-white hover:bg-gray-100'
              }`}
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 bg-white rounded-b-xl shadow-lg animate-slide-down">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 mt-3 px-4">
                <Link to="/signin" className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-primary-600 border-2 border-primary-500 rounded-lg">
                  Sign In
                </Link>
                <Link to="/signup" className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-lg">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// ============================================================
// 2. HERO SECTION
// ============================================================
const HeroSection = () => {
  return (
    <section id="home" className="relative pt-28 lg:pt-36 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-50 rounded-full -translate-y-1/2 translate-x-1/3 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-50 rounded-full translate-y-1/2 -translate-x-1/3 opacity-40" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <FadeIn>
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold mb-6">
                <Star className="w-3.5 h-3.5" />
                #1 HRMS Platform for Modern Teams
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="text-primary-500">Dayflow</span> — Every workday, perfectly aligned.
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                One platform for attendance, leave, payroll, and everything HR — built for modern teams.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/signin"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-primary-600 border-2 border-primary-500 rounded-xl hover:bg-primary-50 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Right: Dashboard Mockup - Real looking preview */}
          <FadeIn delay={200}>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-md h-6 flex items-center px-3">
                    <span className="text-[10px] text-gray-400">dayflow.app/dashboard</span>
                  </div>
                </div>

                {/* Realistic Dashboard Content */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Good Morning, Admin 👋</p>
                      <p className="text-[10px] text-gray-500">Friday, 22 Aug 2026</p>
                    </div>
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-600">AK</span>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100">
                      <p className="text-[9px] text-gray-500 font-medium">Present Today</p>
                      <p className="text-lg font-bold text-green-600">92%</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100">
                      <p className="text-[9px] text-gray-500 font-medium">Leave Requests</p>
                      <p className="text-lg font-bold text-amber-600">5</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100">
                      <p className="text-[9px] text-gray-500 font-medium">Employees</p>
                      <p className="text-lg font-bold text-primary-600">128</p>
                    </div>
                  </div>

                  {/* Attendance Chart */}
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-700 mb-2">Weekly Attendance</p>
                    <div className="flex gap-1.5 items-end h-20">
                      {[
                        { h: 75, label: 'Mon' },
                        { h: 90, label: 'Tue' },
                        { h: 60, label: 'Wed' },
                        { h: 95, label: 'Thu' },
                        { h: 80, label: 'Fri' },
                      ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-gradient-to-t from-primary-500 to-primary-300 rounded-t transition-all duration-500"
                            style={{ height: `${bar.h}%` }}
                          />
                          <span className="text-[8px] text-gray-400">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-700 mb-2">Recent Activity</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <p className="text-[9px] text-gray-600">Priya Sharma checked in at 9:02 AM</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <p className="text-[9px] text-gray-600">Marcus Chen applied for leave (2 days)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        <p className="text-[9px] text-gray-600">Payroll generated for July 2026</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-100 animate-float">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-gray-700">Checked In</span>
                </div>
              </div>
              <div className="absolute -bottom-3 -left-3 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-100 animate-float-delayed">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary-500" />
                  <span className="text-xs font-medium text-gray-700">Leave Approved</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// 3. TRUST / STATS BAR
// ============================================================
const StatsBar = () => {
  const stats = [
    { number: '500+', label: 'Companies Trust Us', icon: Shield },
    { number: '50k+', label: 'Employees Managed', icon: Users },
    { number: '99.9%', label: 'Uptime', icon: TrendingUp },
    { number: '24/7', label: 'Support', icon: Shield },
  ];

  return (
    <section className="py-10 border-y border-gray-100 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.number}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// 4. FEATURES SECTION
// ============================================================
const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'Secure Role-Based Access',
      description: 'Separate views and permissions for employees and admins.',
    },
    {
      icon: UserCircle,
      title: 'Employee Profile Management',
      description: 'Centralized records, documents, and job details.',
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Daily and weekly check-in/check-out with live status.',
    },
    {
      icon: CalendarDays,
      title: 'Leave & Time-Off Management',
      description: 'Apply, approve, and track leave in real time.',
    },
    {
      icon: DollarSign,
      title: 'Payroll Visibility',
      description: 'Transparent salary structure and downloadable slips.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Visual dashboards for attendance and leave trends.',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything your HR team needs
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Powerful modules designed to streamline every aspect of human resource management.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FadeIn key={index} delay={index * 80}>
              <div className="group p-6 bg-white rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-100 transition-all duration-300">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 group-hover:scale-110 transition-all">
                  <feature.icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// 5. HOW IT WORKS SECTION
// ============================================================
const HowItWorksSection = () => {
  const steps = [
    { number: '1', title: 'Sign up and create your account' },
    { number: '2', title: 'Get assigned your role (Employee or Admin)' },
    { number: '3', title: 'Track attendance, apply for leave, view payroll' },
    { number: '4', title: 'Admins approve, manage, and monitor the whole team' },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Get started in minutes
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Four simple steps to transform your HR workflow.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <FadeIn key={index} delay={index * 120}>
              <div className="relative text-center">
                {/* Connector line (desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] right-[-40%] h-0.5 bg-primary-200" />
                )}
                {/* Step circle */}
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg relative z-10">
                  <span className="text-xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-base font-semibold text-gray-800 leading-snug px-2">
                  {step.title}
                </h3>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// 6. FOR EMPLOYEES vs FOR ADMINS SECTION
// ============================================================
const ForEveryoneSection = () => {
  return (
    <section id="about" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Built for everyone on your team
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Tailored experiences for every role in your organization.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* For Employees */}
          <FadeIn delay={0}>
            <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-5">
                <UserCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Employees</h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                View profile, mark attendance, apply leave, check payroll — all in one place.
              </p>
              <ul className="space-y-2.5">
                {['View & edit personal profile', 'Check-in / check-out daily', 'Apply for leave online', 'Download salary slips'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* For Admins */}
          <FadeIn delay={150}>
            <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all">
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-5">
                <Shield className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Admins / HR</h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                Manage employees, approve leave requests, control payroll, view analytics — full control at your fingertips.
              </p>
              <ul className="space-y-2.5">
                {['Manage all employee records', 'Approve / reject leave requests', 'Generate & control payroll', 'View reports & analytics'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// 7. TESTIMONIALS SECTION
// ============================================================
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Dayflow transformed how our HR department operates. Attendance and leave tracking used to take hours — now it's effortless.",
      name: 'Priya Sharma',
      title: 'HR Director',
      company: 'TechNova Solutions',
    },
    {
      quote: "The analytics dashboard gives me instant visibility into team metrics. I can make data-driven decisions in seconds.",
      name: 'Marcus Chen',
      title: 'VP of People',
      company: 'ScaleUp Inc.',
    },
    {
      quote: "Our employees love how simple it is to apply for leave and check their payroll. The interface is clean and intuitive.",
      name: 'Sarah Johnson',
      title: 'Operations Manager',
      company: 'GreenLeaf Corp',
    },
  ];

  return (
    <section id="testimonials" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Loved by HR teams
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              See what people are saying about Dayflow.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={index} delay={index * 100}>
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-card h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-sm text-gray-600 leading-relaxed flex-1 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                {/* Author */}
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold text-sm flex items-center justify-center">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.title}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// 8. CTA SECTION (Bottom Banner)
// ============================================================
const CTASection = () => {
  return (
    <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-primary-500 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to simplify your HR?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join hundreds of teams already using Dayflow.
          </p>
          <div className="mt-8">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-primary-600 bg-white rounded-xl hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              Sign Up Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

// ============================================================
// 9. FOOTER
// ============================================================
const Footer = () => {
  return (
    <footer id="footer" className="bg-gray-900 text-gray-400 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.jpeg" alt="Dayflow" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-xl font-bold text-white">Dayflow</span>
            </div>
            <p className="text-sm leading-relaxed">
              Every workday, perfectly aligned.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Product</h4>
            <ul className="space-y-2.5">
              <li><a href="#features" className="text-sm hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-sm hover:text-white transition-colors">How it Works</a></li>
              <li><Link to="/signup" className="text-sm hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link to="/signin" className="text-sm hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Company</h4>
            <ul className="space-y-2.5">
              <li><a href="#how-it-works" className="text-sm hover:text-white transition-colors">About</a></li>
              <li><a href="#footer" className="text-sm hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal + Social */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2.5 mb-6">
              <li><a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Heart className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Dayflow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// ============================================================
// UTILITY: Scroll-triggered Fade-In Animation Component
// ============================================================
const FadeIn = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default Landing;
