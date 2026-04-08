/* ─────────────────────────────────────────────────────────
 * SOCIAL CARD DECK — ANIMATION STORYBOARD
 *
 *  MOUNT  (back→front cascade, all springs)
 *    0ms  back card:  y(+80) scale(0.85) opacity(0) → stack pos
 *   80ms  mid card:   y(+70) scale(0.85) opacity(0) → stack pos
 *  160ms  front card: y(+60) scale(0.85) opacity(0) → stack pos
 *          spring overshoot gives a natural "pop" on arrival
 *
 *  IDLE STACK
 *  idx 0: y:0   scale:1.00  rotate:0     — front, full size
 *  idx 1: y:8   scale:0.96  rotate:-2.4  — mid, slightly behind
 *  idx 2: y:16  scale:0.92  rotate:4.12  — back, deeper
 *  idx 3+: y:20 scale:0.89  rotate:4.12  — hidden (opacity:0)
 *
 *  DRAG  (top card only — local perspective 600px)
 *  rotate  = x / 14    flat yaw
 *  rotateY = x / 20    3D depth tilt into screen
 *  ≥80px x → LIKE badge + green bloom
 *  ≤-80px  → NOPE badge + red bloom
 *  threshold → x.set(0), cycle (hearts burst on right)
 *  release   → snap spring (s:420, d:30)
 *
 *  SCROLL CYCLE FORWARD  (the actual stacking mechanic)
 *    0ms  setCards() — front card now renders first in DOM (behind all others)
 *         Framer springs it: y:0→36, scale:1.0→0.86, opacity→0
 *         It physically travels BEHIND the visible cards → card stacking ✓
 *         Mid card springs to front: y:14→0, scale:0.95→1.0
 *
 *  SCROLL CYCLE BACKWARD
 *    0ms  hidden card springs from back of stack to front
 *
 *  HOVER  (top card, pointer devices)
 *  y → -5, scale → 1.012  (200ms ease-out)
 *
 *  EXPAND  (tap top card — no drag)
 *    0ms   outer container layout-morphs (spring s:240 d:22)
 *          deck exits: opacity→0, scale→0.97 (140ms ease-in)
 *   80ms   white card springs in
 *  160ms   full text springs in
 *  240ms   photo strip springs in
 *  320ms   action bar springs in
 *
 *  COLLAPSE  (× close — reverse cascade)
 *    0ms   action bar exits  →  170ms white card exits
 * ─────────────────────────────────────────────────────────
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from 'framer-motion'
import { gsap } from 'gsap'
import ExpandedPost, { type Post } from './ExpandedPost'
import CommentsView from './CommentsView'

// ── Spring / easing configs ────────────────────────────────

const SPRING_LAYOUT = { type: 'spring' as const, stiffness: 240, damping: 22 }
const STACK_SPRING  = { type: 'spring' as const, stiffness: 320, damping: 26 }
const SNAP_SPRING   = { type: 'spring' as const, stiffness: 420, damping: 30 }

// Mount stagger: ms before each card starts its entry spring
// Index 0 = front card (last to arrive), index 2 = back (first)
const MOUNT_STAGGER_MS = 80    // ms between each card

// Scroll-cycle exit: top card flies off before deck rotates
const CYCLE_EXIT_MS = 220      // exit animation duration (ms)

// ── Data ──────────────────────────────────────────────────

const PHOTOS_A = ['/assets/photo-1.jpg', '/assets/photo-2.jpg', '/assets/photo-3.jpg']
const PHOTOS_B = ['/assets/photo-2.jpg', '/assets/photo-3.jpg', '/assets/photo-1.jpg']
const PHOTOS_C = ['/assets/photo-3.jpg', '/assets/photo-1.jpg', '/assets/photo-2.jpg']

const POSTS: Post[] = [
  {
    id: 1,
    name: 'John tony',
    verified: true,
    avatarImg: '/assets/avatar-john-tony.png',
    avatarBg: '#93674e',
    avatarBorder: '#a6795c',
    text: "Everyone's building in public I'm just trying to remember who I was in 2016 😭",
    fullText: [
      'Everyone is trying to "build in public"\n Meanwhile I\'m just trying to remember who I was in 2016 😭',
      'Life was simple\n No AI tools\n No 10 productivity systems\n Just vibes, bad decisions, and low-quality selfies',
      'Now it\'s:\n "optimize this"\n "automate that"\n "scale everything"',
      'Lowkey… I miss when the goal was just to go viral once and log out',
      '2026 really said:\n bring back the chaos, but make it productive',
    ],
    photos: PHOTOS_A,
    likes: 120,
    comments: 234,
  },
  {
    id: 2,
    name: 'Maya Chen',
    verified: true,
    avatarImg: 'https://i.pravatar.cc/150?img=47',
    avatarBg: '#4a5568',
    avatarBorder: '#718096',
    text: "Hot take: the best UI is the one you never have to think about. If your users notice it, you've already lost 🎨",
    fullText: [
      'Hot take: the best UI is the one you never have to think about 🎨',
      'If your users notice the interface, you\'ve already lost.',
      'Design should feel like breathing — automatic, invisible, effortless.',
      'The hardest part isn\'t making things beautiful.\nIt\'s making them disappear.',
    ],
    photos: PHOTOS_B,
    likes: 847,
    comments: 112,
  },
  {
    id: 3,
    name: 'Alex Rivera',
    verified: false,
    avatarImg: 'https://i.pravatar.cc/150?img=12',
    avatarBg: '#276749',
    avatarBorder: '#48bb78',
    text: "shipped something today that took me 3 years to understand why I needed it. growth is weird like that 🌱",
    fullText: [
      'shipped something today that took me 3 years to understand why I needed it 🌱',
      'You don\'t grow into the person who ships things.\nYou ship things, and that\'s how you grow.',
      'Nobody tells you that "senior" mostly means\nyou\'ve made enough mistakes to know which ones to avoid.',
      'Growth is weird like that.',
    ],
    photos: PHOTOS_C,
    likes: 2100,
    comments: 89,
  },
  {
    id: 4,
    name: 'Sarah Kim',
    verified: true,
    avatarImg: 'https://i.pravatar.cc/150?img=23',
    avatarBg: '#9b2c2c',
    avatarBorder: '#fc8181',
    text: "reminder that 'move fast and break things' was said by someone who had billions in VC to fix what got broken 💅",
    fullText: [
      'reminder: "move fast and break things" was said by someone with billions in VC 💅',
      'Most of us don\'t have a cleanup crew.',
      'Slow is smooth. Smooth is shipped.\nShipped is what actually matters.',
      'Build like someone has to maintain it.\nBecause someone does.\nIt\'s you, 6 months from now.',
    ],
    photos: PHOTOS_A,
    likes: 5432,
    comments: 671,
  },
  {
    id: 5,
    name: 'Dev Patel',
    verified: false,
    avatarImg: 'https://i.pravatar.cc/150?img=33',
    avatarBg: '#553c9a',
    avatarBorder: '#9f7aea',
    text: "my code works on the first try and I'm choosing to see this as a bad sign 🫠",
    fullText: [
      'my code works on the first try and I\'m choosing to see this as a bad sign 🫠',
      'Either I understand what I\'m doing,\nor I don\'t understand what I\'m doing well enough\nto know what could go wrong.',
      'Both are terrifying.',
      'Shipping it anyway. See you in the incident report.',
    ],
    photos: PHOTOS_B,
    likes: 9871,
    comments: 432,
  },
  {
    id: 6,
    name: 'Zara Williams',
    verified: true,
    avatarImg: 'https://i.pravatar.cc/150?img=56',
    avatarBg: '#1a535c',
    avatarBorder: '#4ecdc4',
    text: "Design systems are just trauma responses to working at scale. I will not be taking questions 📦",
    fullText: [
      'Design systems are just trauma responses to working at scale 📦',
      'You built the same button 47 times\nand finally snapped.\nNow there\'s a button component with 12 variants.',
      'You\'re not over-engineering.\nYou\'re healing.',
      'I will not be taking questions.',
    ],
    photos: PHOTOS_C,
    likes: 3201,
    comments: 198,
  },
  {
    id: 7,
    name: 'Marco Rossi',
    verified: false,
    avatarImg: 'https://i.pravatar.cc/150?img=8',
    avatarBg: '#c05621',
    avatarBorder: '#ed8936',
    text: "10 years of experience and I still google how to center a div. this is fine 🔥",
    fullText: [
      '10 years of experience and I still google how to center a div 🔥',
      'The secret is nobody remembers.\nThat\'s not a weakness. That\'s why search engines exist.',
      'Expertise isn\'t memorizing syntax.\nIt\'s knowing what to search for\nand why the answer works.',
      'This is fine. We\'re all fine.',
    ],
    photos: PHOTOS_A,
    likes: 14200,
    comments: 887,
  },
  {
    id: 8,
    name: 'Priya Sharma',
    verified: true,
    avatarImg: 'https://i.pravatar.cc/150?img=44',
    avatarBg: '#702459',
    avatarBorder: '#ed64a6',
    text: "PSA: your side project is not a startup. it's a side project. and that's completely okay 🌸",
    fullText: [
      'PSA: your side project is not a startup 🌸',
      'It doesn\'t need a roadmap.\nA pitch deck. A landing page.\nA waitlist. An "exclusive beta."',
      'It just needs to exist.\nFor you. Because you wanted to build it.',
      'That is enough.\nYou are enough.\nShip the thing.',
    ],
    photos: PHOTOS_B,
    likes: 6780,
    comments: 345,
  },
]

// ── Front card gradient (Figma node 202316:528861) ─────────

const FRONT_GRADIENT =
  'linear-gradient(103.71deg, rgba(255,255,255,0.3) 42.419%, rgba(251,233,227,0.3) 67.6%, rgba(247,212,242,0.3) 99.706%), linear-gradient(90deg, rgb(255,255,255) 0%, rgb(255,255,255) 100%)'

// ── Animate target per stack position ──────────────────────
// Larger y + scale gaps = clearly visible depth so the stack reads as physical cards.
// When a card cycles to position 3+, it renders first in DOM (behind everything),
// so the spring from y:0→36 visually travels BEHIND the other cards — that IS stacking.

function getTarget(stackIndex: number) {
  if (stackIndex === 0) return { y: 0,  scale: 1.00, rotate: 0,     opacity: 1 }
  if (stackIndex === 1) return { y: 14, scale: 0.95, rotate: -2.4,  opacity: 1 }
  if (stackIndex === 2) return { y: 28, scale: 0.90, rotate: 4.12,  opacity: 1 }
  return                       { y: 36, scale: 0.86, rotate: 4.12,  opacity: 0 }
}

// ── GSAP heart burst ───────────────────────────────────────

function burstHearts(container: HTMLElement) {
  const rect = container.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const emojis = ['❤️', '🩷', '💖', '💗', '✨', '💫', '⭐']
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('span')
    el.textContent = emojis[i % emojis.length]
    el.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;font-size:${14 + Math.random() * 12}px;pointer-events:none;user-select:none;z-index:9999;line-height:1;`
    document.body.appendChild(el)
    const angle = (i / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.6
    const dist = 70 + Math.random() * 90
    gsap.fromTo(el,
      { x: 0, y: 0, scale: 0, opacity: 1, rotation: 0 },
      { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
        scale: 0.7 + Math.random() * 0.9, opacity: 0,
        rotation: (Math.random() - 0.5) * 260,
        duration: 0.48 + Math.random() * 0.3, ease: 'power2.out',
        onComplete: () => el.remove() })
  }
}

// ── Verified badge ─────────────────────────────────────────

function VerifiedBadge() {
  return (
    <div className="relative flex-shrink-0" style={{ width: 20, height: 20 }} aria-label="Verified">
      <svg width="20" height="20" viewBox="0 0 20 20" className="absolute inset-0">
        <circle cx="10" cy="10" r="9" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
      </svg>
      <svg width="20" height="20" viewBox="0 0 20 20" className="absolute inset-0">
        <circle cx="10" cy="10" r="7.5" fill="#1D9BF0" />
      </svg>
      <svg width="20" height="20" viewBox="0 0 20 20" className="absolute inset-0">
        <path d="M6.5 10L8.8 12.3L13.5 7.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ── Post Card ──────────────────────────────────────────────

function PostCard({
  post,
  stackIndex,
  isTop,
  xMV,
  mountDelay,
  onCycle,
  onExpand,
}: {
  post: Post
  stackIndex: number
  isTop: boolean
  xMV: MotionValue<number>     // shared from parent — top card uses this for scroll exit
  mountDelay: number            // ms before this card starts its entry spring
  onCycle: (dir: 'left' | 'right') => void
  onExpand: () => void
}) {
  // Top card uses the shared motion value so scroll-exit can animate it externally.
  // Non-top cards get a local x that stays 0 (just for hook consistency).
  const localX = useMotionValue(0)
  const x = isTop ? xMV : localX

  // Derived motion values — all reference the same x so 3D tilt + rotate stay in sync
  const dragRotate   = useTransform(x, [-220, 0, 220], [-18, 0, 18])
  const rotateY      = useTransform(x, [-220, 0, 220], [10, 0, -10])   // 3D tilt
  const likeOpacity  = useTransform(x, [30, 90], [0, 1], { clamp: true })
  const nopeOpacity  = useTransform(x, [-90, -30], [1, 0], { clamp: true })
  const greenOverlay = useTransform(x, [0, 110], ['rgba(34,197,94,0)', 'rgba(34,197,94,0.12)'])
  const redOverlay   = useTransform(x, [-110, 0], ['rgba(239,68,68,0.12)', 'rgba(239,68,68,0)'])

  // Staggered mount: card stays hidden until mountDelay elapses, then springs in
  const [hasBooted, setHasBooted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setHasBooted(true), mountDelay)
    return () => clearTimeout(t)
  }, []) // intentionally [] — only fires on first mount

  // Reset local x when card leaves top slot (shared xMV is handled by parent)
  useEffect(() => { if (!isTop) localX.set(0) }, [isTop, localX])

  const tapped = useRef(true)
  const target = getTarget(stackIndex)

  // Mount "from" position — back cards drop from higher up for cascade feel
  const mountFromY = stackIndex < 3 ? target.y + (2 - stackIndex) * 10 + 60 : 20

  function handleDragEnd(_: PointerEvent, info: PanInfo) {
    const { offset, velocity } = info
    const isH = Math.abs(offset.x) > Math.abs(offset.y) * 0.7
    if (isH && (offset.x > 80 || velocity.x > 500)) {
      x.set(0); onCycle('right')
    } else if (isH && (offset.x < -80 || velocity.x < -500)) {
      x.set(0); onCycle('left')
    } else {
      animate(x, 0, SNAP_SPRING)
    }
  }

  return (
    <motion.div
      className="absolute"
      style={{
        x: isTop ? x : undefined,
        rotate: isTop ? dragRotate : undefined,
        rotateY: isTop ? rotateY : undefined,      // 3D depth tilt on drag
        transformPerspective: 600,                  // local perspective for rotateY
        cursor: isTop ? 'grab' : 'default',
        touchAction: 'none',
        pointerEvents: stackIndex < 3 ? 'auto' : 'none',
        willChange: 'transform',
      }}
      initial={{ y: mountFromY, scale: 0.85, opacity: 0 }}
      animate={hasBooted
        ? { y: target.y, scale: target.scale, rotate: isTop ? 0 : target.rotate, opacity: target.opacity }
        : { y: mountFromY, scale: 0.85, opacity: 0 }
      }
      transition={STACK_SPRING}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      dragMomentum={false}
      whileHover={isTop ? { y: -5, scale: 1.012, transition: { duration: 0.2, ease: 'easeOut' } } : undefined}
      whileDrag={{ cursor: 'grabbing' }}
      onPointerDown={() => { tapped.current = true }}
      onDragStart={() => { tapped.current = false }}
      onDragEnd={isTop ? handleDragEnd : undefined}
      onClick={() => { if (tapped.current && isTop) onExpand() }}
    >
      {/* LIKE / NOPE overlays */}
      {isTop && (
        <>
          <motion.div className="absolute inset-0 rounded-[20px] pointer-events-none" style={{ backgroundColor: greenOverlay, zIndex: 5 }} />
          <motion.div className="absolute inset-0 rounded-[20px] pointer-events-none" style={{ backgroundColor: redOverlay, zIndex: 5 }} />
          <motion.div className="absolute top-[10px] left-[12px] z-20 border-[2.5px] border-emerald-500 rounded-[7px] px-2 py-[2px] -rotate-12" style={{ opacity: likeOpacity }} aria-hidden="true">
            <span className="text-emerald-500 font-bold text-[12px] tracking-[0.1em]">LIKE</span>
          </motion.div>
          <motion.div className="absolute top-[10px] right-[12px] z-20 border-[2.5px] border-red-500 rounded-[7px] px-2 py-[2px] rotate-12" style={{ opacity: nopeOpacity }} aria-hidden="true">
            <span className="text-red-500 font-bold text-[12px] tracking-[0.1em]">NOPE</span>
          </motion.div>
        </>
      )}

      {/* Card */}
      <div
        className="relative flex items-center overflow-hidden rounded-[20px]"
        style={{
          gap: 9,
          paddingLeft: 8, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
          backgroundImage: stackIndex === 0 ? FRONT_GRADIENT : undefined,
          backgroundColor: stackIndex === 0 ? undefined : 'white',
          boxShadow: `
            0px 1px 1px 0.5px rgba(51,51,51,0.04),
            0px 3px 3px -1.5px rgba(51,51,51,0.02),
            0px 6px 6px -3px rgba(51,51,51,0.04),
            0px 12px 12px -6px rgba(51,51,51,0.04),
            0px 24px 24px -12px rgba(51,51,51,0.04),
            0px 48px 48px -24px rgba(51,51,51,0.04),
            0px 0px 0px 1px #f5f5f5
          `,
        }}
      >
        {/* Avatar */}
        <div
          className="relative flex-shrink-0 overflow-hidden rounded-[12px]"
          style={{ width: 67.657, height: 64, backgroundColor: post.avatarBg, border: `1.219px solid ${post.avatarBorder}` }}
        >
          {post.avatarImg ? (
            <div className="absolute rounded-[10px] overflow-hidden" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 62.781, height: 59.124 }}>
              <img src={post.avatarImg} alt={post.name} className="absolute max-w-none" style={{ width: '118.97%', height: '131.25%', left: '-9.48%', top: '-5.16%' }} />
            </div>
          ) : (
            <div className="absolute inset-[3px] rounded-[9px]" style={{ backgroundColor: post.avatarBg, opacity: 0.7 }} />
          )}
          <div className="absolute inset-0 rounded-[12px] pointer-events-none" style={{ boxShadow: 'inset 0.305px 0px 0.61px 0.914px rgba(255,255,255,0.25), inset 0px 0.305px 0.61px 0px rgba(255,255,255,0.4)' }} />
        </div>

        {/* Text */}
        <div className="flex flex-col items-start" style={{ gap: 4 }}>
          <div className="flex items-center" style={{ gap: 3 }}>
            <span className="font-medium text-[#171717] whitespace-nowrap" style={{ fontSize: 14, lineHeight: '20px', letterSpacing: '-0.084px', fontFeatureSettings: "'ss11', 'calt' 0, 'liga' 0" }}>
              {post.name}
            </span>
            {post.verified && <VerifiedBadge />}
          </div>
          <p className="text-[#5c5c5c] font-normal" style={{ fontSize: 12, lineHeight: '16px', width: 259, fontFeatureSettings: "'ss11', 'calt' 0, 'liga' 0" }}>
            {post.text}
          </p>
        </div>

        <div className="absolute inset-0 pointer-events-none rounded-[20px]" style={{ boxShadow: 'inset 0px -1px 1px -0.5px rgba(51,51,51,0.06)' }} />
      </div>
    </motion.div>
  )
}

// ── Main export ────────────────────────────────────────────

export default function SocialCardDeck() {
  const [cards, setCards] = useState<Post[]>(POSTS)
  const [expanded, setExpanded] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const deckRef = useRef<HTMLDivElement>(null)
  const lastSwipeAt = useRef(0)
  const isCycling = useRef(false)

  // Shared x for the top card — lets cycleWithExit animate it externally
  const topX = useMotionValue(0)

  // Called from drag — card already exited visually, just rotate the array
  const cycle = useCallback((dir: 'left' | 'right') => {
    if (expanded) return
    if (dir === 'right' && deckRef.current) burstHearts(deckRef.current)
    setCards(prev => { const [first, ...rest] = prev; return [...rest, first] })
  }, [expanded])

  // Called from scroll — animate top card flying off first, then rotate array
  const cycleWithExit = useCallback((dir: 'left' | 'right') => {
    if (expanded || isCycling.current) return
    isCycling.current = true
    animate(topX, dir === 'right' ? 380 : -380, {
      duration: CYCLE_EXIT_MS / 1000,
      ease: [0.2, 0, 0.4, 1],
      onComplete: () => {
        topX.set(0)
        isCycling.current = false
        if (dir === 'right' && deckRef.current) burstHearts(deckRef.current)
        setCards(prev => { const [first, ...rest] = prev; return [...rest, first] })
      },
    })
  }, [expanded, topX])

  const goBack = useCallback(() => {
    if (expanded || isCycling.current) return
    setCards(prev => { const last = prev[prev.length - 1]; return [last, ...prev.slice(0, -1)] })
  }, [expanded])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (expanded) return
    const now = Date.now()
    if (now - lastSwipeAt.current < 480) return
    if (Math.abs(e.deltaY) < 30) return
    lastSwipeAt.current = now
    // Scroll: call cycle() directly — front card re-renders behind the stack
    // and Framer springs it from y:0 down to y:36, visually going behind the other cards.
    if (e.deltaY > 0) cycle('left')
    else goBack()
  }, [cycle, goBack, expanded])

  return (
    <motion.div
      layout
      style={{
        position: 'relative',  // anchors popLayout absolute children to this container
        width: 380,
        borderRadius: expanded ? 20 : 0,
        overflow: 'visible',
        background: expanded ? '#f7f7f7' : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        gap: expanded ? 12 : 0,
        paddingBottom: expanded ? 12 : 0,
      }}
      transition={SPRING_LAYOUT}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {!expanded ? (
          /* ── DECK VIEW ──────────────────────────── */
          <motion.div
            key="deck"
            style={{ position: 'relative' }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
          >
            <div
              ref={deckRef}
              className="relative"
              style={{ width: 380, height: 158, overflow: 'visible' }}
              onWheel={handleWheel}
            >
              {/* Render back→front so DOM order handles stacking without z-index */}
              {[...cards].reverse().map(post => {
                const stackIndex = cards.indexOf(post)
                // Stagger: back card (idx 2) mounts first, front card (idx 0) last
                const mountDelay = stackIndex < 3 ? (2 - stackIndex) * MOUNT_STAGGER_MS : 0
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    stackIndex={stackIndex}
                    isTop={stackIndex === 0}
                    xMV={topX}
                    mountDelay={mountDelay}
                    onCycle={cycle}
                    onExpand={() => { setCommentsOpen(false); setExpanded(true) }}
                  />
                )
              })}
            </div>
          </motion.div>
        ) : !commentsOpen ? (
          /* ── EXPANDED POST VIEW ─────────────────── */
          <motion.div
            key="expanded"
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
          >
            <ExpandedPost
              post={cards[0]}
              onClose={() => setExpanded(false)}
              onOpenComments={() => setCommentsOpen(true)}
            />
          </motion.div>
        ) : (
          /* ── COMMENTS VIEW ──────────────────────── */
          <motion.div
            key="comments"
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
          >
            <CommentsView
              post={cards[0]}
              onClose={() => { setCommentsOpen(false); setExpanded(false) }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
