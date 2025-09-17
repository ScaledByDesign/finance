'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrendingUpIcon,
  UserGroupIcon,
  ChatAltIcon,
  CheckIcon,
  ArrowRightIcon,
  PlayIcon,
  LightningBoltIcon,
  CreditCardIcon,
  ChartPieIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  StarIcon,
  MenuIcon,
  XIcon
} from '@heroicons/react/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/solid'

export function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showStickyButton, setShowStickyButton] = useState(false)

  // Show sticky button after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">FinanceAI</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link href="#features" className="text-sm lg:text-base text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="#how-it-works" className="text-sm lg:text-base text-gray-600 hover:text-gray-900">How it Works</Link>
              <Link href="#pricing" className="text-sm lg:text-base text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="#testimonials" className="text-sm lg:text-base text-gray-600 hover:text-gray-900">Testimonials</Link>
            </div>

            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <Link href="/login" className="text-sm lg:text-base text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/login" className="px-3 py-1.5 lg:px-4 lg:py-2 bg-blue-600 text-white text-sm lg:text-base rounded-lg hover:bg-blue-700 transition-colors">
                Start Free Trial
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? (
                <XIcon className="h-6 w-6 text-gray-600" />
              ) : (
                <MenuIcon className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100"
            >
              <div className="px-4 py-4 space-y-3">
                <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-gray-900">Features</Link>
                <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-gray-900">How it Works</Link>
                <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-gray-900">Pricing</Link>
                <Link href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-gray-900">Testimonials</Link>
                <hr className="border-gray-200" />
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-gray-900">Sign In</Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Start Free Trial
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-8 sm:pb-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                AI-Powered Financial Intelligence
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
                Your Personal AI
                <span className="block text-blue-600 mt-1">Financial Advisor</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
                Get instant insights into your spending, automate your budgets, and receive personalized investment advice.
                All powered by advanced AI that learns your financial habits.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4">
                <Link href="/login" className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base sm:text-lg font-medium">
                  Start Free 14-Day Trial
                  <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </Link>
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-base sm:text-lg font-medium"
                >
                  <PlayIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Watch Demo
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">No credit card required • Cancel anytime</p>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 sm:mt-12"
            >
              <div className="relative rounded-xl overflow-hidden shadow-xl sm:shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop"
                  alt="Dashboard Preview"
                  className="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-6 sm:py-8 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">50K+</p>
              <p className="text-xs sm:text-sm text-gray-600">Active Users</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">$2.5B</p>
              <p className="text-xs sm:text-sm text-gray-600">Assets Tracked</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">4.9/5</p>
              <p className="text-xs sm:text-sm text-gray-600">User Rating</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">99.9%</p>
              <p className="text-xs sm:text-sm text-gray-600">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Everything You Need to Master Your Finances
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Our AI analyzes your financial data in real-time to provide actionable insights and recommendations
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: ChartBarIcon,
                title: 'Real-Time Analytics',
                description: 'Track spending patterns and trends with interactive dashboards updated in real-time'
              },
              {
                icon: LightningBoltIcon,
                title: 'AI-Powered Insights',
                description: 'Get personalized recommendations based on your spending habits and financial goals'
              },
              {
                icon: CreditCardIcon,
                title: 'Account Aggregation',
                description: 'Connect all your bank accounts and credit cards in one secure platform'
              },
              {
                icon: ChartPieIcon,
                title: 'Smart Budgeting',
                description: 'Automatically categorize transactions and set intelligent budget limits'
              },
              {
                icon: BellIcon,
                title: 'Proactive Alerts',
                description: 'Receive notifications for unusual spending, bill reminders, and savings opportunities'
              },
              {
                icon: LockClosedIcon,
                title: 'Bank-Level Security',
                description: '256-bit encryption and multi-factor authentication to protect your data'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Set up your AI financial advisor in minutes, not hours
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: '1',
                title: 'Connect Your Accounts',
                description: 'Securely link your bank accounts, credit cards, and investment accounts'
              },
              {
                step: '2',
                title: 'AI Learns Your Habits',
                description: 'Our AI analyzes your transaction history and spending patterns'
              },
              {
                step: '3',
                title: 'Get Personalized Advice',
                description: 'Receive tailored insights and recommendations to improve your finances'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{step.description}</p>
                </div>
                {index < 2 && (
                  <ArrowRightIcon className="hidden sm:block absolute top-1/2 -right-4 transform -translate-y-1/2 h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Choose the plan that fits your financial journey
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$9',
                period: '/month',
                features: [
                  '2 Bank Account Connections',
                  'Basic Spending Analytics',
                  'Monthly Budget Tracking',
                  'Email Support',
                  'Mobile App Access'
                ],
                cta: 'Start Free Trial',
                popular: false
              },
              {
                name: 'Pro',
                price: '$29',
                period: '/month',
                features: [
                  'Unlimited Account Connections',
                  'Advanced AI Analytics',
                  'Investment Tracking',
                  'Priority Support',
                  'Custom Categories',
                  'Tax Optimization Tips',
                  'API Access'
                ],
                cta: 'Start Free Trial',
                popular: true
              },
              {
                name: 'Business',
                price: '$99',
                period: '/month',
                features: [
                  'Everything in Pro',
                  'Multiple User Access',
                  'Business Expense Tracking',
                  'Dedicated Account Manager',
                  'Custom Integrations',
                  'Advanced Reporting',
                  'SLA Guarantee'
                ],
                cta: 'Contact Sales',
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-white p-6 sm:p-8 rounded-xl border ${
                  plan.popular ? 'border-blue-600 shadow-xl' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-sm sm:text-base text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block w-full py-2.5 sm:py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Loved by Thousands of Users
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              See what our users have to say about transforming their financial life
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Small Business Owner',
                content: 'FinanceAI helped me save over $500 per month by identifying unnecessary subscriptions and optimizing my spending.',
                rating: 5,
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
              },
              {
                name: 'Michael Chen',
                role: 'Software Engineer',
                content: 'The AI insights are incredibly accurate. It predicted my cash flow issues weeks in advance and helped me prepare.',
                rating: 5,
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
              },
              {
                name: 'Emily Rodriguez',
                role: 'Freelance Designer',
                content: 'Finally, a financial app that understands irregular income. The budgeting features are perfect for freelancers.',
                rating: 5,
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200"
              >
                <div className="flex mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIconSolid key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{testimonial.content}</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full mr-2 sm:mr-3"
                  />
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {[
              {
                q: 'Is my financial data secure?',
                a: 'Absolutely. We use bank-level 256-bit encryption and are SOC 2 Type II certified. Your data is encrypted both in transit and at rest.'
              },
              {
                q: 'Which banks do you support?',
                a: 'We support over 12,000 financial institutions in the US, including all major banks and credit unions.'
              },
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.'
              },
              {
                q: 'Do you offer a free trial?',
                a: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.'
              },
              {
                q: 'How does the AI provide personalized advice?',
                a: 'Our AI analyzes your transaction history, spending patterns, and financial goals to provide tailored recommendations unique to your situation.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm sm:text-base text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8">
            Join 50,000+ users who are already saving money and building wealth with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors text-base sm:text-lg font-medium"
            >
              Start Your Free Trial
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-base sm:text-lg font-medium border border-blue-500"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-blue-200 mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                <span className="text-lg sm:text-xl font-bold text-white">FinanceAI</span>
              </div>
              <p className="text-xs sm:text-sm">
                Your AI-powered financial advisor for smarter money management.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white">API Docs</Link></li>
                <li><Link href="#" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white">Security</Link></li>
                <li><Link href="#" className="hover:text-white">GDPR</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>&copy; 2024 FinanceAI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl overflow-hidden max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video bg-gray-900">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Bottom CTA - Mobile Only */}
      <AnimatePresence>
        {showStickyButton && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-2xl z-40"
          >
            <div className="p-4">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold text-base shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform active:scale-95"
              >
                <SparklesIcon className="h-5 w-5" />
                Start Free Trial Now
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <p className="text-center text-xs text-gray-500 mt-2">No credit card required</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Floating Button - Desktop */}
      <AnimatePresence>
        {showStickyButton && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="hidden md:block fixed bottom-8 right-8 z-40"
          >
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold text-base shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
            >
              <SparklesIcon className="h-5 w-5" />
              Start Free Trial
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}