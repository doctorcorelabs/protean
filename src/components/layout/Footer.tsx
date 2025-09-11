import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dna, Mail, Linkedin } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/daivan-febri-juan-setiya/' }
  ]

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Dna className="w-8 h-8 text-blue-400" />
                </motion.div>
                <span className="text-2xl font-bold">
                  Protean AI
                </span>
              </Link>
              <p className="text-gray-300 mb-6 max-w-md text-center">
                Accelerating protein research with advanced AI technology, 
                3D visualization, and computational analysis tools.
              </p>
              <div className="flex space-x-4 justify-center">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </motion.div>
          </div>

        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <GlassCard className="p-6 bg-white/5 border-white/10">
            <div className="flex justify-center">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-gray-300 text-sm">
                    daivanlabs@gmail.com
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm mb-4 md:mb-0">
              © {currentYear} Protean AI. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-300">
              <span>Made by DaivanLabs</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
