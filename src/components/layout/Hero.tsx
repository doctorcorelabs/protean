import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dna, Brain, Zap, Microscope, ArrowRight } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Dna className="w-16 h-16 text-primary-500" />
            </motion.div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            AI-Powered
            <span className="block gradient-text">
              Molecular Research
            </span>
            Laboratory Platform
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Accelerate protein research with advanced 3D visualization, AlphaFold predictions, 
            and specialized AI analysis. From computational validation to molecular insights.
          </p>

          <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto mb-12">
            {[
              { icon: Brain, title: "AI Analysis", desc: "Advanced computational insights", color: "text-purple-500" },
              { icon: Zap, title: "AlphaFold", desc: "Protein structure prediction", color: "text-yellow-500" },
              { icon: Microscope, title: "3D Visualization", desc: "Interactive molecular viewer", color: "text-blue-500" },
              // ...existing code...
            ].map((item, index) => (
              <GlassCard key={item.title} delay={0.2 + index * 0.1} className="text-center">
                <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-3`} />
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </GlassCard>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/viewer" className="btn-primary flex items-center space-x-2">
              <span>Start Research</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { number: "10K+", label: "Proteins Analyzed" },
              { number: "99.9%", label: "Accuracy Rate" },
              { number: "24/7", label: "AI Processing" }
            ].map((stat, index) => (
              <GlassCard key={stat.label} delay={1.2 + index * 0.1} className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </GlassCard>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
