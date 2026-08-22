import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Users, BarChart3 } from 'lucide-react';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';

/**
 * Landing Page - First impression of Dayflow.
 * Features hero section, feature highlights, and CTA buttons.
 */
const Landing = () => {
  const features = [
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Effortless clock-in/out with real-time tracking and reports.',
    },
    {
      icon: Users,
      title: 'Leave Management',
      description: 'Streamlined leave requests with approval workflows.',
    },
    {
      icon: BarChart3,
      title: 'Payroll & Analytics',
      description: 'Automated payroll processing with insightful analytics.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="sm" />
            <div className="flex items-center gap-3">
              <Link to="/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo large */}
          <div className="flex justify-center mb-8">
            <Logo size="xl" showText={false} />
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            <span className="text-primary-500">Dayflow</span>
          </h1>

          {/* Tagline */}
          <p className="mt-4 text-xl sm:text-2xl text-gray-500 font-light">
            Every workday, perfectly aligned.
          </p>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A modern Human Resource Management System designed to simplify attendance,
            leave, payroll, and team management — all in one beautiful platform.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" icon={ArrowRight} className="min-w-[200px]">
                Sign Up
              </Button>
            </Link>
            <Link to="/signin">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to manage your team
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              Powerful tools designed for modern HR workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-200"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Ready to streamline your HR?
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Join Dayflow today and experience the future of workforce management.
          </p>
          <div className="mt-8">
            <Link to="/signup">
              <Button size="lg" icon={ArrowRight}>
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Dayflow HRMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
