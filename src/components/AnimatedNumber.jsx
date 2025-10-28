import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

export default function AnimatedNumber({ value, duration = 0.8, prefix = '', suffix = '' }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    const controls = animate(count, value || 0, { duration, ease: 'easeOut' })
    return controls.stop
  }, [value])

  return <motion.span>{prefix}<motion.span>{rounded}</motion.span>{suffix}</motion.span>
}
