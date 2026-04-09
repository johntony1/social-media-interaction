/* ─────────────────────────────────────────────────────────
 * COMMENTS VIEW + HEART REACTION — ANIMATION STORYBOARD
 *
 *  HEART REACTION (on bubble click):
 *    0ms   anchor heart:  opacity 0→1, scale 0.95→1  (200ms ease-out)
 *    0ms   heart A (100%): y 0→64px, x→+3px  (480ms ease-in)
 *   90ms   heart B  (75%): y 0→64px, x→−4px  (460ms ease-in)
 *  175ms   heart C  (55%): y 0→64px, x→+2px  (510ms ease-in)
 *  Hearts absorbed via overflow:hidden clip at zone bottom (= bubble top edge)
 *  Ripple: scale 0.8→1.4, opacity 0.2→0, 400ms ease-out, fires on absorption
 *
 * COMMENTS VIEW — ANIMATION STORYBOARD
 *
 *  ENTER  (layout-morph continues from ExpandedPost)
 *   80ms  white card:    y(-10→0)    opacity(0→1)  spring s:200 d:24
 *  160ms  thread line:   pathLength(0→1)            0.7s ease draw
 *  240ms  Dami comment:  y(8→0)      opacity(0→1)  spring s:200 d:24
 *  320ms  input bar:     y(8→0)      opacity(0→1)  spring s:200 d:24
 *
 *  NEW COMMENT  (user types + Enter)
 *         comment item: scale(0.94→1) y(12→0) opacity(0→1)  spring s:320 d:26
 *
 *  EXIT   (reverse cascade)
 *    0ms  input bar:   opacity→0, y→4   (80ms ease-in)
 *   55ms  comment:     opacity→0, y→4   (90ms ease-in)
 *  110ms  thread line: opacity→0        (80ms ease-in)
 *  170ms  white card:  opacity→0, y→-6  (120ms ease-in)
 *
 *  Figma node  202316:528919  (outer container)
 *  Figma node  202316:528920  (white card)
 *  Figma node  202316:528946  (comment input bar)
 * ───────────────────────────────────────────────────────── */

import { motion, AnimatePresence, useTransform } from 'framer-motion'
import { useState, useCallback, useRef } from 'react'
import { useScrollTilt } from '../hooks/useScrollTilt'
import type { Post } from './ExpandedPost'
import {
  JOHN_TONY_PARAGRAPHS,
  SPRING_SOFT,
  EASE_IN,
} from './ExpandedPost'

// ── Shared shadow (custom-shadows/medium) ──────────────────
const CARD_SHADOW = [
  '0px 1px 1px 0.5px rgba(51,51,51,0.04)',
  '0px 3px 3px -1.5px rgba(51,51,51,0.02)',
  '0px 6px 6px -3px rgba(51,51,51,0.04)',
  '0px 12px 12px -6px rgba(51,51,51,0.04)',
  '0px 24px 24px -12px rgba(51,51,51,0.04)',
  '0px 48px 48px -24px rgba(51,51,51,0.04)',
  '0px 0px 0px 1px #f5f5f5',
].join(', ')

const COMMENT_SPRING = { type: 'spring' as const, stiffness: 320, damping: 26 }

// ── Comment type ────────────────────────────────────────────
interface Comment {
  id: string
  name: string
  text: string
  avatarSrc?: string
  avatarBg: string
}

// ── Verified badge (same as ExpandedPost) ─────────────────
function VerifiedBadge() {
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: 20, height: 20,
      boxShadow: '0px 2px 4px 0px rgba(27,28,29,0.04)' }}>
      <div style={{ position: 'absolute', inset: '7.54%' }}>
        <img src="/assets/badge-stroke.svg" alt="" style={{ position: 'absolute', display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} />
      </div>
      <div style={{ position: 'absolute', inset: '13.79%' }}>
        <img src="/assets/badge-bg.svg" alt="" style={{ position: 'absolute', display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} />
      </div>
      <div style={{ position: 'absolute', top: '37.37%', right: '33.21%', bottom: '37.25%', left: '35.29%' }}>
        <img src="/assets/badge-check.svg" alt="" style={{ position: 'absolute', display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}

// ── Thread connector — exact Figma path, animated via pathLength ──
// Path from thread-line.svg: vertical line with a left-hook curl at the bottom.
// pathLength 0→1 draws it from top to bottom like a pen.
function ThreadLine() {
  return (
    <motion.svg
      aria-hidden="true"
      preserveAspectRatio="none"
      viewBox="0 0 12.6758 433"
      style={{
        position: 'absolute',
        left: 0,
        top: 30,
        width: 12,
        height: 433,
        display: 'block',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.01, delay: 0.16 } }}
      exit={{ opacity: 0, transition: { duration: 0.08, ease: EASE_IN, delay: 0.11 } }}
    >
      <motion.path
        d="M12.1758 0V405.909C12.1758 407.593 11.8245 409.259 11.1444 410.801L9.14361 415.334C8.42178 416.97 6.80245 418.025 5.01458 418.025H4.88023C2.76914 418.025 0.962352 416.511 0.594025 414.432L0.561683 414.249C0.321443 412.894 0.79251 411.509 1.80984 410.581C3.17386 409.337 5.21036 409.183 6.74597 410.208L7.8523 410.946C8.94312 411.674 9.75043 412.755 10.1388 414.008L10.832 416.243C11.1983 417.425 11.3846 418.654 11.3846 419.891V433"
        stroke="#EBEBEB"
        strokeWidth={1}
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{
          pathLength: 1,
          transition: {
            pathLength: { duration: 1.5, ease: [0.25, 0.1, 0.2, 1], delay: 0.16 },
          },
        }}
      />
    </motion.svg>
  )
}

// ── Heart reaction config ──────────────────────────────────
const HEART_PARTICLES = [
  { startRight: 4,  dx:  3, duration: 480, delay:   0, opacity: 1.00, size: 12 },
  { startRight: 9,  dx: -4, duration: 460, delay:  90, opacity: 0.75, size: 10 },
  { startRight: 2,  dx:  2, duration: 510, delay: 175, opacity: 0.55, size:  9 },
] as const
const ZONE_H = 50 // px — travel zone above bubble

function HeartSvg({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#ef4444"
      style={{ display: 'block', opacity }}>
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
    </svg>
  )
}

// ── Single comment item ─────────────────────────────────────
function CommentItem({
  comment,
  entryDelay = 0,
}: {
  comment: Comment
  entryDelay?: number
}) {
  const [liked,  setLiked]  = useState(false)
  const [round,  setRound]  = useState(0)        // increments each click → re-keys hearts
  const [ripples, setRipples] = useState<number[]>([])
  const rippleCounter = useRef(0)

  const handleLike = useCallback(() => {
    setLiked(true)
    setRound(r => r + 1)

    // Fire a ripple when each heart is absorbed (delay + travel duration)
    HEART_PARTICLES.forEach(h => {
      setTimeout(() => {
        const id = ++rippleCounter.current
        setRipples(prev => [...prev, id])
        setTimeout(() => setRipples(prev => prev.filter(r => r !== id)), 500)
      }, h.delay + h.duration)
    })
  }, [])

  return (
    <motion.div
      layout
      style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexShrink: 0, width: '100%' }}
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { ...COMMENT_SPRING, delay: entryDelay } }}
      exit={{ opacity: 0, y: 4, transition: { duration: 0.09, ease: EASE_IN } }}
    >
      {/* Avatar */}
      <div style={{
        background: comment.avatarBg, border: '2px solid white', borderRadius: 999,
        flexShrink: 0, width: 24, height: 24, position: 'relative', overflow: 'hidden',
      }}>
        {comment.avatarSrc && (
          <img src={comment.avatarSrc} alt={comment.name} style={{
            position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover',
            pointerEvents: 'none', borderRadius: 999, width: '100%', height: '100%',
          }} />
        )}
      </div>

      {/* Content: name + bubble */}
      <div style={{
        display: 'flex', flex: '1 0 0', flexDirection: 'column', gap: 4,
        alignItems: 'flex-start', minWidth: 0, position: 'relative',
      }}>
        {/* Name */}
        <p style={{
          fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13,
          lineHeight: '20px', color: '#171717', letterSpacing: '-0.078px',
          whiteSpace: 'nowrap', margin: 0, flexShrink: 0,
          fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
        }}>
          {comment.name}
        </p>

        {/* ── Chat bubble ── */}
        <div
          onClick={handleLike}
          style={{
            position: 'relative',
            background: '#f5f4f2',
            borderRadius: 10,
            padding: '7px 10px',
            cursor: 'pointer',
            userSelect: 'none',
            maxWidth: '100%',
          }}
        >
          {/* Heart travel zone — clipped container above bubble.
              overflow:hidden absorbs hearts as they cross the bottom edge. */}
          <div style={{
            position: 'absolute', bottom: '100%', right: 8,
            width: 26, height: ZONE_H,
            overflow: 'hidden', pointerEvents: 'none', zIndex: 10,
          }}>
            {round > 0 && HEART_PARTICLES.map((h, i) => (
              <motion.div
                key={`${round}-${i}`}
                style={{ position: 'absolute', top: 0, right: h.startRight }}
                initial={{ y: 0, x: 0 }}
                animate={{ y: ZONE_H + 16, x: h.dx }}
                transition={{
                  y: { delay: h.delay / 1000, duration: h.duration / 1000, ease: [0.4, 0, 1, 1] },
                  x: { delay: h.delay / 1000, duration: h.duration / 1000, ease: 'easeInOut' },
                }}
              >
                <HeartSvg size={h.size} opacity={h.opacity} />
              </motion.div>
            ))}
          </div>

          {/* Ripples — soft pink circles that expand and fade on absorption */}
          <AnimatePresence>
            {ripples.map(id => (
              <motion.div
                key={id}
                style={{
                  position: 'absolute', top: -5, right: 4,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.22)',
                  pointerEvents: 'none', zIndex: 2, transformOrigin: 'center',
                }}
                initial={{ scale: 0.8, opacity: 0.2 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{}}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            ))}
          </AnimatePresence>

          {/* Anchor heart badge — appears on first like, stays */}
          <AnimatePresence>
            {liked && (
              <motion.div
                style={{
                  position: 'absolute', top: -9, right: -7, zIndex: 3,
                  pointerEvents: 'none', background: 'white', borderRadius: '50%',
                  width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 1.5px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.08)',
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <HeartSvg size={10} opacity={1} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comment text */}
          <p style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12,
            lineHeight: '16px', color: '#5c5c5c', margin: 0,
            fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
          }}>
            {comment.text}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Comment input bar (node 202316:528946) ─────────────────
function CommentInput({
  avatarSrc,
  value,
  onChange,
  onSubmit,
}: {
  avatarSrc?: string
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
}) {
  return (
    <motion.div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 12,
        position: 'relative',
        flexShrink: 0,
        width: '100%',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: 0.32 } }}
      exit={{ opacity: 0, y: 4, transition: { duration: 0.08, ease: EASE_IN, delay: 0 } }}
    >
      {/* Avatar (node 202316:528947) — 28px */}
      <div style={{
        background: '#ebebeb',
        border: '2px solid white',
        borderRadius: 999,
        flexShrink: 0,
        width: 28,
        height: 28,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {avatarSrc && (
          <img
            src={avatarSrc}
            alt=""
            style={{
              position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover',
              pointerEvents: 'none', borderRadius: 999, width: '100%', height: '100%',
            }}
          />
        )}
      </div>

      {/* Text input pill */}
      <div style={{
        background: 'white',
        border: '1px solid #ebebeb',
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingLeft: 12,
        paddingRight: 10,
        height: 32,
        flex: '1 0 0',
        minWidth: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: '0px 1px 2px 0px rgba(10,13,20,0.03)',
        position: 'relative',
      }}>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && value.trim()) {
              e.preventDefault()
              onSubmit()
            }
          }}
          placeholder="Type comment"
          style={{
            flex: '1 0 0',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 13,
            lineHeight: '20px',
            color: '#171717',
            letterSpacing: '-0.078px',
            fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
            minWidth: 0,
          }}
        />

        {/* Send button — appears when there's text */}
        <AnimatePresence>
          {value.trim() ? (
            <motion.button
              key="send"
              onClick={onSubmit}
              aria-label="Send comment"
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
              whileTap={{ scale: 0.85 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.5 8L2.5 8M13.5 8L9.5 4M13.5 8L9.5 12"
                  stroke="#171717"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          ) : (
            <motion.div
              key="emoji"
              style={{ overflow: 'hidden', flexShrink: 0, width: 20, height: 20, position: 'relative' }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
            >
              <div style={{ position: 'absolute', inset: '12.5%' }}>
                <img src="/assets/icon-emoji.svg" alt="" style={{
                  position: 'absolute', display: 'block', maxWidth: 'none', width: '100%', height: '100%',
                }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Main export ─────────────────────────────────────────────

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'dami-initial',
    name: 'Dami',
    text: '2016 me had no systems, no strategy… just vibes and somehow less stress 😭',
    avatarSrc: '/assets/avatar-dami.png',
    avatarBg: '#ffecc0',
  },
]

export default function CommentsView({ post, onClose }: { post: Post; onClose: () => void }) {
  const isJohnTony = post.id === 1
  const paragraphs = isJohnTony ? JOHN_TONY_PARAGRAPHS : post.fullText.map(t => [t])

  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS)
  const [inputValue, setInputValue] = useState('')
  const idCounter = useRef(0)
  const [photoScrollRef, photoTilt, photoElev] = useScrollTilt()
  const photoY = useTransform(photoElev, [0, 1], [0, -6])

  const handleSubmit = useCallback(() => {
    const text = inputValue.trim()
    if (!text) return
    idCounter.current += 1
    setComments(prev => [
      ...prev,
      {
        id: `comment-${idCounter.current}`,
        name: post.name,
        text,
        avatarSrc: post.avatarImg,
        avatarBg: '#ebebeb',
      },
    ])
    setInputValue('')
  }, [inputValue, post.name, post.avatarImg])

  return (
    <>
      {/* ── White card (node 202316:528920) ──────────── */}
      <motion.div
        layout
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          overflow: 'hidden',
          padding: 16,
          gap: 16,
          borderRadius: 20,
          flexShrink: 0,
          width: '100%',
          position: 'relative',
          boxShadow: CARD_SHADOW,
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: 0.08 } }}
        exit={{ opacity: 0, y: -6, transition: { duration: 0.12, ease: EASE_IN, delay: 0.17 } }}
      >
        {/* White bg fill */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, background: 'white',
          pointerEvents: 'none', borderRadius: 20,
        }} />

        {/* Close × */}
        <motion.button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 10, right: 10, zIndex: 10,
            width: 20, height: 20, display: 'flex', alignItems: 'center',
            justifyContent: 'center', borderRadius: 4, border: 'none',
            background: 'transparent', cursor: 'pointer', outline: 'none',
          }}
          whileTap={{ scale: 0.85 }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.button>

        {/* ── Original post section (node 202316:528921) ── */}
        <div style={{
          display: 'flex', gap: 8, alignItems: 'flex-start',
          position: 'relative', flexShrink: 0, width: '100%',
        }}>
          {/* Thread connector — draws down behind the comment below */}
          <ThreadLine />

          {/* Avatar (node 202316:528922) */}
          <div style={{
            background: '#ebebeb', border: '2px solid white', borderRadius: 999,
            flexShrink: 0, width: 24, height: 24, position: 'relative', overflow: 'hidden',
          }}>
            {post.avatarImg && (
              <img src={post.avatarImg} alt={post.name}
                style={{
                  position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover',
                  pointerEvents: 'none', borderRadius: 999, width: '100%', height: '100%',
                }} />
            )}
          </div>

          {/* Content column (node 202316:528923) */}
          <div style={{
            display: 'flex', flex: '1 0 0', flexDirection: 'column', gap: 8,
            alignItems: 'flex-start', minHeight: 1, minWidth: 1, overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Name + badge (node 202316:528924/925) */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 4,
              alignItems: 'flex-start', flexShrink: 0, width: '100%',
            }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  lineHeight: 0, flexShrink: 0,
                }}>
                  <p style={{
                    fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 14,
                    lineHeight: '20px', color: '#171717', letterSpacing: '-0.084px',
                    whiteSpace: 'nowrap', margin: 0,
                    fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
                  }}>
                    {post.name}
                  </p>
                </div>
                {post.verified && <VerifiedBadge />}
              </div>

              {/* Post text (node 202316:528928) */}
              <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                lineHeight: 0, flexShrink: 0, width: '100%',
                fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
              }}>
                {paragraphs.map((lines, pi) => (
                  <p key={pi} style={{
                    fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12,
                    lineHeight: '16px', color: '#5c5c5c', margin: 0,
                  }}>
                    {lines.map((line, li) => (
                      <span key={li}>
                        {li > 0 && <><br aria-hidden="true" />{' '}</>}
                        {line}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>

            {/* Photos (node 202316:528930) */}
            <div
              ref={photoScrollRef}
              style={{
                alignSelf: 'stretch',
                overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none',
                marginLeft: -40, marginRight: -16,
                paddingLeft: 40, paddingRight: 100,
                paddingTop: 10, marginTop: -10,
                scrollSnapType: 'x proximity',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0, width: 520 }}>
                {post.photos.map((src, i) => (
                  <motion.div
                    key={i}
                    style={{
                      height: 180, width: 161.435, flexShrink: 0,
                      borderRadius: 12.915, overflow: 'hidden', position: 'relative',
                      rotate: photoTilt,
                      y: photoY,
                      willChange: 'transform',
                      scrollSnapAlign: 'center',
                    }}
                  >
                    <img src={src} alt="" style={{
                      position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover',
                      pointerEvents: 'none', width: '100%', height: '100%',
                    }} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Comments list (dynamic, animated) ─────────── */}
        <AnimatePresence mode="popLayout">
          {comments.map((comment, i) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              entryDelay={comment.id === 'dami-initial' ? 0.24 : 0}
            />
          ))}
        </AnimatePresence>

        {/* Inner bottom shadow vignette */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          borderRadius: 'inherit',
          boxShadow: 'inset 0px -1px 1px -0.5px rgba(51,51,51,0.06)',
        }} />
      </motion.div>

      {/* ── Comment input bar (node 202316:528946) ─── */}
      <CommentInput
        avatarSrc={post.avatarImg}
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
      />
    </>
  )
}
