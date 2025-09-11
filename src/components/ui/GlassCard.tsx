import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  delay?: number
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hover = true,
  glow = false,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={clsx(
        'backdrop-blur-md bg-glass-white border border-glass-border rounded-2xl p-6',
        'shadow-xl shadow-blue-500/10',
        hover && 'hover:bg-glass-white-strong',
        glow && 'animate-glow',
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
