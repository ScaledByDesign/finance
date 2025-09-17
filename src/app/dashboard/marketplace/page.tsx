'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  SearchIcon,
  OfficeBuildingIcon,
  CreditCardIcon,
  ScaleIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  PhoneIcon,
  MailIcon,
  LocationMarkerIcon,
  StarIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  FilterIcon,
  ArrowLeftIcon,
  RefreshIcon,
  PlusIcon,
  DotsVerticalIcon
} from '@heroicons/react/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/solid'

// Define vendor categories
const categories = [
  { id: 'all', name: 'All Services', icon: BriefcaseIcon },
  { id: 'secured-loans', name: 'Secured Loans', icon: CurrencyDollarIcon },
  { id: 'banking', name: 'Banking Services', icon: OfficeBuildingIcon },
  { id: 'merchant', name: 'Merchant Services', icon: CreditCardIcon },
  { id: 'legal', name: 'Legal Services', icon: ScaleIcon },
  { id: 'insurance', name: 'Insurance', icon: ShieldCheckIcon },
  { id: 'accounting', name: 'Accounting & Tax', icon: BriefcaseIcon },
]

// Sample vendor data
const vendors = [
  {
    id: 1,
    name: 'SecureCapital Lending',
    category: 'secured-loans',
    description: 'Specialized in asset-backed loans for businesses. Quick approval process with competitive rates.',
    services: ['Equipment Financing', 'Real Estate Loans', 'Inventory Financing', 'Asset-Based Lines of Credit'],
    rating: 4.8,
    reviews: 245,
    badge: 'Verified Partner',
    contact: {
      phone: '1-800-555-0123',
      email: 'business@securecapital.com',
      website: 'www.securecapital.com'
    },
    minLoan: '$50,000',
    maxLoan: '$10M',
    features: ['Same Day Approval', '24/7 Support', 'Flexible Terms']
  },
  {
    id: 2,
    name: 'First National Business Bank',
    category: 'banking',
    description: 'Full-service business banking with dedicated relationship managers and competitive rates.',
    services: ['Business Checking', 'Savings Accounts', 'Wire Transfers', 'Cash Management'],
    rating: 4.6,
    reviews: 512,
    badge: 'Premium Partner',
    contact: {
      phone: '1-800-555-0234',
      email: 'business@fnbb.com',
      website: 'www.fnbb.com'
    },
    features: ['No Monthly Fees', 'Mobile Banking', 'API Integration']
  },
  {
    id: 3,
    name: 'SwiftPay Merchant Solutions',
    category: 'merchant',
    description: 'Modern payment processing with the lowest rates in the industry. PCI compliant.',
    services: ['Credit Card Processing', 'POS Systems', 'E-commerce Solutions', 'Mobile Payments'],
    rating: 4.9,
    reviews: 892,
    badge: 'Top Rated',
    contact: {
      phone: '1-800-555-0345',
      email: 'support@swiftpay.com',
      website: 'www.swiftpay.com'
    },
    processingRate: '1.9% + $0.10',
    features: ['Next Day Funding', 'No Setup Fees', 'Free Equipment']
  },
  {
    id: 4,
    name: 'PrePaid Legal Services',
    category: 'legal',
    description: 'Affordable legal protection for your business. Access to attorneys nationwide.',
    services: ['Contract Review', 'Legal Consultation', 'Document Preparation', 'Litigation Support'],
    rating: 4.5,
    reviews: 156,
    badge: 'Certified Provider',
    contact: {
      phone: '1-800-555-0456',
      email: 'business@prepaidlegal.com',
      website: 'www.prepaidlegal.com'
    },
    monthlyPlan: '$99/month',
    features: ['24/7 Legal Hotline', 'Unlimited Consultations', 'Document Templates']
  },
  {
    id: 5,
    name: 'Shield Business Insurance',
    category: 'insurance',
    description: 'Comprehensive business insurance solutions. Protect your assets and operations.',
    services: ['General Liability', 'Property Insurance', 'Workers Comp', 'Professional Liability'],
    rating: 4.7,
    reviews: 423,
    badge: 'Trusted Insurer',
    contact: {
      phone: '1-800-555-0567',
      email: 'quotes@shieldinsurance.com',
      website: 'www.shieldinsurance.com'
    },
    features: ['Custom Policies', 'Claims Support', 'Risk Assessment']
  },
  {
    id: 6,
    name: 'ProTax Accounting',
    category: 'accounting',
    description: 'Expert accounting and tax services for businesses of all sizes.',
    services: ['Bookkeeping', 'Tax Preparation', 'Financial Planning', 'Audit Support'],
    rating: 4.9,
    reviews: 334,
    badge: 'CPA Certified',
    contact: {
      phone: '1-800-555-0678',
      email: 'info@protaxaccounting.com',
      website: 'www.protaxaccounting.com'
    },
    features: ['Cloud Accounting', 'Tax Planning', 'Monthly Reports']
  },
  {
    id: 7,
    name: 'Bridge Capital Partners',
    category: 'secured-loans',
    description: 'Bridge loans and short-term financing solutions for growing businesses.',
    services: ['Bridge Loans', 'Hard Money Loans', 'Construction Loans', 'Fix & Flip Financing'],
    rating: 4.4,
    reviews: 189,
    badge: 'Fast Funding',
    contact: {
      phone: '1-800-555-0789',
      email: 'loans@bridgecapital.com',
      website: 'www.bridgecapital.com'
    },
    minLoan: '$100,000',
    maxLoan: '$50M',
    features: ['48-Hour Funding', 'No Prepayment Penalty', 'Interest Only Options']
  },
  {
    id: 8,
    name: 'Global Merchant Bank',
    category: 'merchant',
    description: 'International payment processing and multi-currency support for global businesses.',
    services: ['International Processing', 'Currency Exchange', 'Fraud Protection', 'Chargeback Management'],
    rating: 4.6,
    reviews: 567,
    badge: 'Global Partner',
    contact: {
      phone: '1-800-555-0890',
      email: 'global@merchantbank.com',
      website: 'www.globalmerchantbank.com'
    },
    processingRate: '2.2% + $0.15',
    features: ['180+ Currencies', 'Fraud Detection AI', 'Multi-Language Support']
  }
]

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // Filter vendors based on category and search
  const filteredVendors = vendors.filter(vendor => {
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <main className="min-h-screen transition-colors duration-300 bg-white">
      {/* Header Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Marketplace</h1>
              <p className="text-xs text-gray-500">{filteredVendors.length} vendors available</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-all ${
                isLoading ? 'animate-spin' : ''
              }`}
            >
              <RefreshIcon className="h-5 w-5 text-gray-700" />
            </button>

            <button
              onClick={() => {/* Add vendor action */}}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-gray-700" />
            </button>

            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <DotsVerticalIcon className="h-5 w-5 text-gray-700" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm text-gray-700">
                      <FilterIcon className="h-4 w-4" />
                      Filter & Sort
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm text-gray-700">
                      <StarIcon className="h-4 w-4" />
                      Saved Vendors
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm text-gray-700">
                      <BriefcaseIcon className="h-4 w-4" />
                      My Applications
                    </button>
                    <div className="border-t border-gray-100">
                      <button className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm text-gray-700">
                        <PhoneIcon className="h-4 w-4" />
                        Contact Support
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6">
        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">Find trusted vendors for all your business needs</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors, services, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <category.icon className="h-4 w-4" />
              {category.name}
            </motion.button>
          ))}
        </div>

        {/* Vendor Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeleton
          [...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="p-6 border-b border-gray-100">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : (
          filteredVendors.map((vendor, index) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-gray-50 rounded-xl hover:shadow-lg transition-all border border-gray-200 overflow-hidden cursor-pointer"
            >
              {/* Vendor Header */}
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1">{vendor.name}</h3>
                    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      {vendor.badge}
                    </span>
                  </div>
                  <div className="text-right ml-2">
                    <div className="flex items-center gap-1">
                      <StarIconSolid className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-400" />
                      <span className="text-sm sm:text-base font-semibold">{vendor.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">({vendor.reviews})</span>
                  </div>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{vendor.description}</p>
              </div>

              {/* Services */}
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Services</h4>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {vendor.services.slice(0, 3).map((service, idx) => (
                    <span key={idx} className="px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {service}
                    </span>
                  ))}
                  {vendor.services.length > 3 && (
                    <span className="px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-500 rounded text-xs">
                      +{vendor.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Key Features */}
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="space-y-1 sm:space-y-2">
                  {vendor.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircleIcon className="h-3 sm:h-4 w-3 sm:w-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing Info */}
                {vendor.minLoan && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-600">Loan Range: </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">{vendor.minLoan} - {vendor.maxLoan}</span>
                  </div>
                )}
                {vendor.processingRate && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-600">Processing Rate: </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">{vendor.processingRate}</span>
                  </div>
                )}
                {vendor.monthlyPlan && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-600">Starting at: </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">{vendor.monthlyPlan}</span>
                  </div>
                )}
              </div>

              {/* Contact Actions */}
              <div className="p-4 sm:p-6 bg-white">
                <div className="flex gap-2 sm:gap-3">
                  <motion.a
                    whileTap={{ scale: 0.95 }}
                    href={`tel:${vendor.contact.phone}`}
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-md transition-all"
                  >
                    <PhoneIcon className="h-3 sm:h-4 w-3 sm:w-4" />
                    <span className="text-xs sm:text-sm font-medium">Call</span>
                  </motion.a>
                  <motion.a
                    whileTap={{ scale: 0.95 }}
                    href={`https://${vendor.contact.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    <ExternalLinkIcon className="h-3 sm:h-4 w-3 sm:w-4" />
                    <span className="text-xs sm:text-sm font-medium">Visit</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))
        )}

          {/* Empty State */}
          {filteredVendors.length === 0 && !isLoading && (
            <div className="col-span-full">
              <div className="text-center py-8 sm:py-12">
                <BriefcaseIcon className="h-10 sm:h-12 w-10 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No vendors found</h3>
                <p className="text-sm sm:text-base text-gray-600 px-4">Try adjusting your search or filters to find what you&apos;re looking for.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}