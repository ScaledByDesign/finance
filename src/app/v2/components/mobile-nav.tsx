'use client'

import { motion } from 'framer-motion'
import { HomeIcon, CreditCardIcon, ChartBarIcon, UserIcon, PlusCircleIcon } from '@heroicons/react/outline'
import { useState } from 'react'

const navItems = [
  { icon: HomeIcon, label: 'Home', id: 'home' },
  { icon: CreditCardIcon, label: 'Cards', id: 'cards' },
  { icon: PlusCircleIcon, label: 'Add', id: 'add', isSpecial: true },
  { icon: ChartBarIcon, label: 'Analytics', id: 'analytics' },
  { icon: UserIcon, label: 'Profile', id: 'profile' },
]

export function MobileNav() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden">
      <div className="glass-effect border-t border-gray-200 dark:border-gray-800 mobile-safe-area">
        <nav className="flex justify-around items-center py-2">
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center p-2 ${
                item.isSpecial ? 'mb-4' : ''
              }`}
            >
              {item.isSpecial ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute -top-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-3 shadow-lg"
                >
                  <item.icon className="w-6 h-6 text-white" />
                </motion.div>
              ) : (
                <>
                  <item.icon
                    className={`w-6 h-6 transition-colors duration-200 ${
                      activeTab === item.id
                        ? 'text-blue-500'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  />
                  <span
                    className={`text-xs mt-1 transition-colors duration-200 ${
                      activeTab === item.id
                        ? 'text-blue-500'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full"
                    />
                  )}
                </>
              )}
            </motion.button>
          ))}
        </nav>
      </div>
    </div>
  )
}