import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Brain, 
  Zap, 
  Microscope, 
  Database, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Target,
  Search
} from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'

const Features: React.FC = () => {
  const features = [
    {
      icon: Microscope,
      title: "3D Molecular Visualization",
      description: "Interactive protein structure viewer with real-time manipulation and analysis tools.",
      link: "/viewer",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Zap,
      title: "AlphaFold Integration",
      description: "Advanced protein structure prediction using state-of-the-art AI models.",
      link: "/predict",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: Brain,
      title: "AI Analysis Tools",
      description: "Comprehensive computational analysis with machine learning insights.",
      link: "/analysis",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
  // ...existing code...
    {
      icon: Search,
      title: "PDB Search",
      description: "Search and explore protein structures from the Protein Data Bank.",
      link: "/search",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Secure cloud storage and organization of research data.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with full compliance standards.",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    }
  ]

  const capabilities = [
    "Real-time 3D protein visualization",
    "AlphaFold structure prediction",
    "AI-powered binding site analysis",
    "Automated lab protocol generation",
    "PDB structure search and exploration",
    "Collaborative research tools",
    "Advanced data analytics"
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Research
            <span className="block gradient-text">Capabilities</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools for modern molecular research, from visualization to analysis
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <GlassCard className="h-full p-6 hover:scale-105 transition-transform duration-300">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  {feature.link && (
                    <Link
                      to={feature.link}
                      className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium transition-colors"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </GlassCard>
              </motion.div>
            )
          })}
        </div>

        {/* Capabilities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Everything You Need for
              <span className="block gradient-text">Molecular Research</span>
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Our platform combines cutting-edge AI technology with intuitive design 
              to accelerate your research workflow and deliver actionable insights.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {capabilities.map((capability, index) => (
                <motion.div
                  key={capability}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{capability}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <GlassCard className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                Research Accuracy
              </h4>
              <div className="text-4xl font-bold gradient-text mb-2">99.9%</div>
              <p className="text-gray-600 mb-6">
                Industry-leading accuracy in protein structure prediction and analysis
              </p>
              <div className="flex justify-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Proteins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
