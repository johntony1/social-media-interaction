/* ─────────────────────────────────────────────────────────
 * useScrollTilt — TILT + ELEVATION STORYBOARD
 *
 *  On scroll:  velocity (px/ms) × SCALE → rotateZ angle (°)
 *              elevation raw 0 → 1  (photos lift up + shadow)
 *  Clamped:    ±MAX_ANGLE
 *  Tilt spring:      stiffness 120, damping 12, mass 0.5
 *                    → underdamped → micro-overshoot on direction change
 *  Elevation spring: stiffness 140, damping 18, mass 0.6
 *                    → smooth lift / settle
 *  Reset:      STOP_DELAY ms after last scroll event → both spring to 0
 *
 *  Usage:
 *    const [ref, tilt, elev] = useScrollTilt()
 *    <div ref={ref} style={{ overflowX: 'auto' }}>
 *      <motion.div style={{ rotate: tilt, y: useTransform(elev,[0,1],[0,-6]), ... }}>
 *    </div>
 * ─────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'

const VELOCITY_SCALE = 8    // px/ms  →  degrees
const MAX_ANGLE      = 6    // °  hard clamp
const STOP_DELAY     = 80   // ms after last scroll event before reset

const TILT_SPRING = { stiffness: 120, damping: 12, mass: 0.5 }
const ELEV_SPRING = { stiffness: 140, damping: 18, mass: 0.6 }

export function useScrollTilt(): [React.RefObject<HTMLDivElement>, MotionValue<number>, MotionValue<number>] {
  const ref     = useRef<HTMLDivElement>(null)
  const rawTilt = useMotionValue(0)
  const rawElev = useMotionValue(0)
  const tilt    = useSpring(rawTilt, TILT_SPRING)
  const elev    = useSpring(rawElev, ELEV_SPRING)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const scrollEl = el
    let lastLeft  = scrollEl.scrollLeft
    let lastTime  = performance.now()
    let stopTimer: ReturnType<typeof setTimeout>

    function onScroll() {
      const now = performance.now()
      const dt  = now - lastTime
      const dx  = scrollEl.scrollLeft - lastLeft

      if (dt > 0) {
        const velocity = dx / dt
        const angle    = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, velocity * VELOCITY_SCALE))
        rawTilt.set(angle)
        rawElev.set(1)
      }

      lastLeft = scrollEl.scrollLeft
      lastTime = now

      clearTimeout(stopTimer)
      stopTimer = setTimeout(() => {
        rawTilt.set(0)
        rawElev.set(0)
      }, STOP_DELAY)
    }

    scrollEl.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scrollEl.removeEventListener('scroll', onScroll)
      clearTimeout(stopTimer)
    }
  }, [rawTilt, rawElev])

  return [ref, tilt, elev]
}
