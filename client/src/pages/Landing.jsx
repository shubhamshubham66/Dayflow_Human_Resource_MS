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

// ============================================================
// LANDING PAGE — Inspired by BambooHR style
// Layout: Light bg, big headline left, dashboard mockup right
// Dayflow branding + blue (#2f5597) color scheme
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
// 1. NAVBAR — White bg, clean links, Sign In outline + Sign Up solid
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
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#footer' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-sm' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpeg" alt="Dayflow" className="w-9 h-9 rounded-lg object-cover" />
            <span className="text-xl font-bold text-primary-500 tracking-tight">Dayflow</span>
          </div>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/signin"
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#73b234] rounded-lg hover:bg-[#5a9a1f] shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-slide-down">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">{link.label}</a>
              ))}
              <div className="flex gap-3 mt-3 px-4">
                <Link to="/signin" className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-primary-600 border-2 border-primary-400 rounded-lg">Sign In</Link>
                <Link to="/signup" className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-lg">Sign Up</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// ============================================================
// 2. HERO — BambooHR inspired: Light bg, headline left, mockup right
// ============================================================
const HeroSection = () => {
  return (
    <section id="home" className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-[#e8f5e9] via-[#f1f8e9] to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Content */}
          <FadeIn>
            <div>
              {/* Big italic headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 leading-[1.15] italic">
                One Easy-to-Use{' '}
                <span className="text-[#73b234]">Platform</span> for Everything HR
              </h1>

              {/* Subheadline */}
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
                Simplify HR with award-winning solutions for everything from hire to retire.
              </p>

              {/* Bullet points with checkmarks */}
              <div className="mt-8 space-y-4">
                <BulletPoint text="Employee database and attendance tracking" />
                <BulletPoint text="Payroll, salary slips, and benefits" />
                <BulletPoint text="Leave management and approvals" />
              </div>

              {/* CTA Row — Email-style input + button */}
              <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md">
                <Link
                  to="/signup"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-[#73b234] rounded-xl hover:bg-[#5a9a1f] shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/signin"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-[#73b234] border-2 border-[#73b234] rounded-xl hover:bg-green-50 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Right: Overlapping Dashboard Cards (BambooHR style) */}
          <FadeIn delay={200}>
            <div className="relative lg:pl-8">
              {/* Main employee profile card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 relative z-10">
                {/* Tab bar */}
                <div className="flex gap-4 border-b border-gray-100 pb-3 mb-4">
                  <span className="text-xs font-semibold text-primary-600 border-b-2 border-primary-500 pb-3">Overview</span>
                  <span className="text-xs text-gray-400 pb-3">Attendance</span>
                  <span className="text-xs text-gray-400 pb-3">Leave</span>
                  <span className="text-xs text-gray-400 pb-3">Payroll</span>
                </div>

                {/* Employee header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-600">SK</span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-800">Shubham Kumar</p>
                    <p className="text-xs text-gray-500">Senior Software Engineer • Engineering</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-green-600">92%</p>
                    <p className="text-[10px] text-green-700">Attendance</p>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-primary-600">18</p>
                    <p className="text-[10px] text-primary-700">Leave Balance</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-amber-600">$6.2K</p>
                    <p className="text-[10px] text-amber-700">Net Salary</p>
                  </div>
                </div>

                {/* Mini chart */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-gray-600 mb-2">Weekly Hours</p>
                  <div className="flex gap-1.5 items-end h-12">
                    {[65, 80, 55, 90, 72, 85, 40].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-[#73b234] to-[#a4d65e] rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating card: Leave status */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-20 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Leave Approved</p>
                    <p className="text-[10px] text-gray-500">2 days • Casual leave</p>
                  </div>
                </div>
              </div>

              {/* Floating card: Payroll */}
              <div className="absolute -top-2 -right-2 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-20 animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Payroll Ready</p>
                    <p className="text-[10px] text-gray-500">August 2026 • $6,200</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

/** Bullet point component with green checkmark */
const BulletPoint = ({ text }) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
      <CheckCircle className="w-4 h-4 text-green-600" />
    </div>
    <p className="text-base text-gray-700">{text}</p>
  </div>
);

// ============================================================
// 3. STATS BAR
// ============================================================
const StatsBar = () => {
  const stats = [
    { number: '500+', label: 'Companies Trust Us', icon: Shield },
    { number: '50k+', label: 'Employees Managed', icon: Users },
    { number: '99.9%', label: 'Uptime', icon: TrendingUp },
    { number: '24/7', label: 'Support', icon: Clock },
  ];

  return (
    <section className="py-12 border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="flex items-center gap-3 justify-center">
                <div className="w-11 h-11 bg-primary-50 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.number}</p>
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
// 4. FEATURES — Dark blue bg, flowchart-style connected boxes
// ============================================================
const FeaturesSection = () => {
  const features = [
    { icon: Shield, title: 'Secure Role-Based Access', description: 'Separate views and permissions for employees and admins.', step: '01' },
    { icon: UserCircle, title: 'Employee Profiles', description: 'Centralized records, documents, and job details.', step: '02' },
    { icon: Clock, title: 'Attendance Tracking', description: 'Daily check-in/check-out with live status and calendar view.', step: '03' },
    { icon: CalendarDays, title: 'Leave Management', description: 'Apply, approve, and track leave requests in real time.', step: '04' },
    { icon: DollarSign, title: 'Payroll & Slips', description: 'Transparent salary structure and downloadable payslips.', step: '05' },
    { icon: BarChart3, title: 'Analytics & Reports', description: 'Visual dashboards for attendance, leave, and payroll trends.', step: '06' },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1a2e4a] via-[#2f5597] to-[#1e3a5f] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#73b234] uppercase tracking-wider mb-3">Our Modules</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Everything your HR team needs
            </h2>
            <p className="mt-4 text-lg text-blue-200/80 max-w-2xl mx-auto">
              Powerful modules designed to streamline every aspect of human resource management.
            </p>
          </div>
        </FadeIn>

        {/* Flowchart Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden lg:block absolute top-[50%] left-[33%] w-[34%] h-0.5 bg-gradient-to-r from-white/20 via-white/10 to-white/20" />
          <div className="hidden lg:block absolute top-[25%] left-[16%] w-[68%] h-0.5 bg-white/10" />
          <div className="hidden lg:block absolute top-[75%] left-[16%] w-[68%] h-0.5 bg-white/10" />

          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="group relative">
                {/* Card */}
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/[0.15] hover:border-white/30 hover:scale-[1.02] transition-all duration-300 h-full">
                  {/* Step number */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#73b234] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-white">{f.step}</span>
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#73b234]/20 group-hover:border-[#73b234]/40 transition-all">
                    <f.icon className="w-7 h-7 text-[#73b234]" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-blue-200/70 leading-relaxed">{f.description}</p>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[#73b234]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Connector dot */}
                <div className="hidden lg:block absolute top-1/2 -right-4 w-2 h-2 bg-white/30 rounded-full" />
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Bottom flow arrow */}
        <FadeIn delay={600}>
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 rounded-full">
              <span className="text-sm font-medium text-white/80">All modules work together seamlessly</span>
              <ArrowRight className="w-4 h-4 text-[#73b234]" />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

// ============================================================
// 5. HOW IT WORKS — 4-step timeline
// ============================================================
const HowItWorksSection = () => {
  const steps = [
    { number: '1', title: 'Sign up and create your account' },
    { number: '2', title: 'Get assigned your role (Employee or Admin)' },
    { number: '3', title: 'Track attendance, apply for leave, view payroll' },
    { number: '4', title: 'Admins approve, manage, and monitor the whole team' },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Get started in minutes</h2>
            <p className="mt-4 text-lg text-gray-500">Four simple steps to transform your HR workflow.</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 120}>
              <div className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] right-[-40%] h-0.5 bg-primary-200" />
                )}
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg relative z-10">
                  <span className="text-xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 leading-snug px-2">{step.title}</h3>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================
// 6. FOR EVERYONE — Employee vs Admin comparison
// ============================================================
const ForEveryoneSection = () => {
  return (
    <section id="about" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Built for everyone on your team</h2>
            <p className="mt-4 text-lg text-gray-500">Tailored experiences for every role.</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <FadeIn>
            <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-5">
                <UserCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Employees</h3>
              <p className="text-gray-600 mb-5">View profile, mark attendance, apply leave, check payroll — all in one place.</p>
              <ul className="space-y-2.5">
                {['View & edit personal profile', 'Check-in / check-out daily', 'Apply for leave online', 'Download salary slips'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-5">
                <Shield className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Admins / HR</h3>
              <p className="text-gray-600 mb-5">Manage employees, approve requests, control payroll, view analytics — full control.</p>
              <ul className="space-y-2.5">
                {['Manage all employee records', 'Approve / reject leave requests', 'Generate & control payroll', 'View reports & analytics'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />{item}
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
// 7. TESTIMONIALS
// ============================================================
const TestimonialsSection = () => {
  const testimonials = [
    { quote: "Dayflow transformed how our HR operates. Attendance tracking used to take hours — now it's effortless.", name: 'Priya Sharma', title: 'HR Director', company: 'TechNova Solutions' },
    { quote: "The analytics dashboard gives me instant visibility into team metrics. Data-driven decisions in seconds.", name: 'Marcus Chen', title: 'VP of People', company: 'ScaleUp Inc.' },
    { quote: "Our employees love how simple it is to apply for leave and check payroll. Clean and intuitive.", name: 'Sarah Johnson', title: 'Operations Manager', company: 'GreenLeaf Corp' },
  ];

  return (
    <section id="testimonials" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Loved by HR teams</h2>
            <p className="mt-4 text-lg text-gray-500">See what people are saying about Dayflow.</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold text-sm flex items-center justify-center">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.title}, {t.company}</p>
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
// 8. CTA SECTION
// ============================================================
const CTASection = () => {
  return (
    <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-primary-500 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to simplify your HR?</h2>
          <p className="mt-4 text-lg text-primary-100">Join hundreds of teams already using Dayflow.</p>
          <div className="mt-8">
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-primary-600 bg-white rounded-xl hover:bg-gray-50 shadow-lg transition-all active:scale-[0.98]">
              Sign Up Free <ArrowRight className="w-5 h-5" />
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
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.jpeg" alt="Dayflow" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-xl font-bold text-white">Dayflow</span>
            </div>
            <p className="text-sm leading-relaxed">Every workday, perfectly aligned.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Product</h4>
            <ul className="space-y-2.5">
              <li><a href="#features" className="text-sm hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-sm hover:text-white transition-colors">How it Works</a></li>
              <li><Link to="/signup" className="text-sm hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link to="/signin" className="text-sm hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Company</h4>
            <ul className="space-y-2.5">
              <li><a href="#about" className="text-sm hover:text-white transition-colors">About</a></li>
              <li><a href="#testimonials" className="text-sm hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#footer" className="text-sm hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors"><Globe className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors"><MessageCircle className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors"><Heart className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Dayflow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// ============================================================
// UTILITY: Scroll-triggered Fade-In
// ============================================================
const FadeIn = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) {
      setIsVisible(true);
      return;
    }

    // Fallback: if IntersectionObserver is not supported, show immediately
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
    );

    observer.observe(ref.current);

    // Safety: ensure elements become visible after 1.5s even if observer doesn't fire
    const timeout = setTimeout(() => setIsVisible(true), 1500);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div ref={ref} className="transition-all duration-700 ease-out"
      style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(24px)', transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

export default Landing;
