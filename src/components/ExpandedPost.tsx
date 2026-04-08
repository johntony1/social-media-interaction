/* ─────────────────────────────────────────────────────────
 * EXPANDED POST — ANIMATION STORYBOARD
 *
 *  ENTER  (container layout-morphs first, then content cascades)
 *   80ms  white card:   y(-10→0) opacity(0→1)  spring s:200 d:24
 *  160ms  full text:    y(8→0)   opacity(0→1)  spring s:200 d:24
 *  240ms  photo strip:  y(8→0)   opacity(0→1)  spring s:200 d:24
 *  320ms  action bar:   y(8→0)   opacity(0→1)  spring s:200 d:24
 *
 *  EXIT   (reverse cascade, then container collapses)
 *    0ms  action bar:   opacity→0, y→4   (80ms ease-in)
 *   55ms  photo strip:  opacity→0, y→4   (90ms ease-in)
 *  110ms  full text:    opacity→0, y→-4  (100ms ease-in)
 *  170ms  white card:   opacity→0, y→-6  (120ms ease-in)
 *
 *  Pixel references
 *  Figma node  202316:528882  (outer container)
 *  Figma node  202316:528883  (white card)
 *  Figma node  202316:528900  (action bar)
 * ─────────────────────────────────────────────────────────
 */

import { motion } from 'framer-motion'

// ── Spring / easing ────────────────────────────────────────
export const SPRING_SOFT  = { type: 'spring' as const, stiffness: 200, damping: 24 }
export const SPRING_PRESS = { type: 'spring' as const, stiffness: 500, damping: 28 }
export const EASE_IN      = [0.4, 0, 1, 1] as const

// ── Types ──────────────────────────────────────────────────
export interface Post {
  id: number
  name: string
  verified: boolean
  avatarImg?: string
  avatarBg: string
  avatarBorder: string
  text: string
  fullText: string[]   // array of paragraphs, rendered as <p> with <br> inside
  photos: string[]
  likes: number
  comments: number
}

// ── Icon wrappers — exact Figma inset percentages ──────────

/** heart-3-line: inset 16.25% 12.5% 14.38% 12.5% */
function HeartIcon() {
  return (
    <div style={{ width: 20, height: 20, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '16.25%', right: '12.5%', bottom: '14.38%', left: '12.5%' }}>
        <img src="/assets/icon-heart.svg" alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
      </div>
    </div>
  )
}

/** chat-1-line: inset 16.25% 12.5% 10.63% 12.5% */
function ChatIcon() {
  return (
    <div style={{ width: 20, height: 20, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '16.25%', right: '12.5%', bottom: '10.63%', left: '12.5%' }}>
        <img src="/assets/icon-chat.svg" alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
      </div>
    </div>
  )
}

/** BookmarkSimple: inset 12.5% 21.88% 9.38% 21.88% */
function BookmarkIcon() {
  return (
    <div style={{ width: 20, height: 20, position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '12.5%', right: '21.88%', bottom: '9.38%', left: '21.88%' }}>
        <img src="/assets/icon-bookmark.svg" alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
      </div>
    </div>
  )
}

/** Export: inset 6.25% 15.63% 12.5% 15.63% */
function ExportIcon() {
  return (
    <div style={{ width: 20, height: 20, position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '6.25%', right: '15.63%', bottom: '12.5%', left: '15.63%' }}>
        <img src="/assets/icon-export.svg" alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
      </div>
    </div>
  )
}

/** SpeakerSimpleSlash: inset 9.38% 9.38% 9.38% 6.25% on 18px container */
function MuteIcon() {
  return (
    <div style={{ width: 18, height: 18, position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '9.38%', right: '9.38%', bottom: '9.38%', left: '6.25%' }}>
        <img src="/assets/icon-mute.svg" alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
      </div>
    </div>
  )
}

/** Top Status [1.1] verified badge — exact Figma insets */
function VerifiedBadge() {
  return (
    <div style={{
      position: 'relative',
      boxShadow: '0px 2px 4px 0px rgba(27,28,29,0.04)',
      flexShrink: 0,
      width: 20,
      height: 20,
    }}>
      {/* Stroke ring: inset 7.54% */}
      <div style={{ position: 'absolute', top: '7.54%', right: '7.54%', bottom: '7.54%', left: '7.54%' }}>
        <img src="/assets/badge-stroke.svg" alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
      </div>
      {/* BG fill: inset 13.79% */}
      <div style={{ position: 'absolute', top: '13.79%', right: '13.79%', bottom: '13.79%', left: '13.79%' }}>
        <img src="/assets/badge-bg.svg" alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
      </div>
      {/* Check mark: inset 37.37% 33.21% 37.25% 35.29% */}
      <div style={{ position: 'absolute', top: '37.37%', right: '33.21%', bottom: '37.25%', left: '35.29%' }}>
        <img src="/assets/badge-check.svg" alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
      </div>
    </div>
  )
}

// ── Text typography helpers ────────────────────────────────
// Figma: flex-col, leading-[0] wrapper, leading-[16px] on <p>, mb-0 all except last

const TEXT_WRAPPER: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  lineHeight: 0,
  fontStyle: 'normal',
  fontSize: 12,
  color: '#5c5c5c',
  fontWeight: 400,
  fontFamily: "'Inter', sans-serif",
  minWidth: '100%',
  width: 'min-content',
  whiteSpace: 'pre-wrap',
  position: 'relative',
  flexShrink: 0,
  fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
}

const PARA: React.CSSProperties = {
  lineHeight: '16px',
  margin: 0,
  marginBottom: 0,
}

const PARA_LAST: React.CSSProperties = {
  lineHeight: '16px',
  margin: 0,
}

// ── ExpandedPost ───────────────────────────────────────────
import type React from 'react'

// The paragraphs with embedded line breaks exactly matching Figma node 202316:528891
export const JOHN_TONY_PARAGRAPHS = [
  ['Everyone is trying to "build in public"', ' Meanwhile I\'m just trying to remember who I was in 2016 😭'],
  ['Life was simple', ' No AI tools', ' No 10 productivity systems', ' Just vibes, bad decisions, and low-quality selfies'],
  ['Now it\'s:', ' "optimize this"', ' "automate that"', ' "scale everything"'],
  ['Lowkey… I miss when the goal was just to go viral once and log out'],
  ['2026 really said:', ' bring back the chaos, but make it productive'],
]

export default function ExpandedPost({ post, onClose, onOpenComments }: {
  post: Post
  onClose: () => void
  onOpenComments: () => void
}) {
  // Use exact Figma paragraphs for the first post (John tony), fall back to post.fullText for others
  const isJohnTony = post.id === 1
  const paragraphs = isJohnTony ? JOHN_TONY_PARAGRAPHS : post.fullText.map(t => [t])

  return (
    <>
      {/* ── White card  (node 202316:528883) ──────────── */}
      <motion.div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          overflow: 'hidden',
          padding: 16,
          borderRadius: 20,
          flexShrink: 0,
          width: '100%',
          position: 'relative',
          /* custom-shadows/medium — exact from Figma node 202316:528883 */
          boxShadow: [
            '0px 1px 1px 0.5px rgba(51,51,51,0.04)',
            '0px 3px 3px -1.5px rgba(51,51,51,0.02)',
            '0px 6px 6px -3px rgba(51,51,51,0.04)',
            '0px 12px 12px -6px rgba(51,51,51,0.04)',
            '0px 24px 24px -12px rgba(51,51,51,0.04)',
            '0px 48px 48px -24px rgba(51,51,51,0.04)',
            '0px 0px 0px 1px #f5f5f5',
          ].join(', '),
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: 0.08 } }}
        exit={{ opacity: 0, y: -6, transition: { duration: 0.12, ease: EASE_IN, delay: 0.17 } }}
      >
        {/* White bg fill (aria-hidden, from Figma) */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, background: 'white',
          pointerEvents: 'none', borderRadius: 20,
        }} />

        {/* Close × — floats absolute top-right, not in Figma but needed for UX */}
        <motion.button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 10, right: 10, zIndex: 10,
            width: 20, height: 20, display: 'flex', alignItems: 'center',
            justifyContent: 'center', borderRadius: 4, border: 'none',
            background: 'transparent', cursor: 'pointer', outline: 'none',
          }}
          whileHover={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
          whileTap={{ scale: 0.88 }}
          transition={SPRING_PRESS}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 1L9 9M9 1L1 9" stroke="#a3a3a3" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </motion.button>

        {/* Row: avatar + content (node 202316:528884) */}
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
          position: 'relative',
          flexShrink: 0,
          width: '100%',
        }}>

          {/* Avatar [1.1] — 24px circle (node 202316:528885) */}
          <div style={{
            background: '#ebebeb',
            border: '2px solid white',
            position: 'relative',
            borderRadius: 999,
            flexShrink: 0,
            width: 24,
            height: 24,
            overflow: 'hidden',
          }}>
            {/* Use dedicated small avatar (avatar-sm.png) for John tony; fall back to card avatar */}
            <img
              src={post.id === 1 ? '/assets/avatar-sm.png' : (post.avatarImg ?? '')}
              alt=""
              style={{
                position: 'absolute', inset: 0, maxWidth: 'none',
                objectFit: 'cover', pointerEvents: 'none',
                borderRadius: 999, width: '100%', height: '100%',
              }}
            />
          </div>

          {/* Content column (node 202316:528886) */}
          <div style={{
            flex: '1 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: 'flex-start',
            minHeight: 1,
            minWidth: 1,
            overflow: 'hidden',
            position: 'relative',
          }}>

            {/* Header: name + text (node 202316:528887) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              alignItems: 'flex-start',
              position: 'relative',
              flexShrink: 0,
              width: '100%',
            }}>
              {/* Name row (node 202316:528888) */}
              <div style={{
                display: 'flex',
                gap: 3,
                alignItems: 'center',
                position: 'relative',
                flexShrink: 0,
              }}>
                {/* Name text — flex-col leading-[0] wrapper with <p leading-[20px]> inside */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  lineHeight: 0,
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: 14,
                  color: '#171717',
                  letterSpacing: '-0.084px',
                  whiteSpace: 'nowrap',
                  fontFamily: "'Inter', sans-serif",
                  position: 'relative',
                  flexShrink: 0,
                  fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
                }}>
                  <p style={{ lineHeight: '20px', margin: 0 }}>{post.name}</p>
                </div>
                {post.verified && <VerifiedBadge />}
              </div>

              {/* Full tweet text (node 202316:528891) — animated */}
              <motion.div
                style={TEXT_WRAPPER}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: 0.16 } }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.1, ease: EASE_IN, delay: 0.11 } }}
              >
                {paragraphs.map((lines, pIdx) => (
                  <p
                    key={pIdx}
                    style={pIdx < paragraphs.length - 1 ? PARA : PARA_LAST}
                  >
                    {lines.map((line, lIdx) => (
                      lIdx === 0 ? line : <span key={lIdx}><br />{line}</span>
                    ))}
                  </p>
                ))}
              </motion.div>
            </div>

            {/* Photo strip container (node 202316:528892) — w-[520px], animated */}
            <motion.div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative',
                flexShrink: 0,
                // overflow scroll to expose all 3 photos (extends beyond content column)
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollbarWidth: 'none',
                // bleed to card edge: negate left padding+avatar+gap and right padding
                marginLeft: -40,   // -(16 card padding + 24 avatar + 8 gap) relative to content col
                marginRight: -16,
                paddingLeft: 40,
                paddingRight: 16,
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: 0.24 } }}
              exit={{ opacity: 0, y: 4, transition: { duration: 0.09, ease: EASE_IN, delay: 0.055 } }}
            >
              <style>{`
                .photo-strip-scroll::-webkit-scrollbar { display: none; }
              `}</style>

              {/* Photo row (node 202316:528893) — fixed 520px width, scrollable */}
              <div
                className="photo-strip-scroll"
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  position: 'relative',
                  flexShrink: 0,
                  width: 520,
                }}
              >
                {/* Photo 1 (node 202316:528894) */}
                <div style={{
                  height: 180,
                  position: 'relative',
                  borderRadius: 12.915,
                  flexShrink: 0,
                  width: 161.435,
                  overflow: 'hidden',
                }}>
                  <img
                    src={post.photos[0]}
                    alt=""
                    style={{
                      position: 'absolute', inset: 0, maxWidth: 'none',
                      objectFit: 'cover', pointerEvents: 'none',
                      borderRadius: 12.915, width: '100%', height: '100%',
                    }}
                  />
                </div>

                {/* Photo 2 (node 202316:528895) */}
                <div style={{
                  height: 180,
                  position: 'relative',
                  borderRadius: 12.915,
                  flexShrink: 0,
                  width: 161.435,
                  overflow: 'hidden',
                }}>
                  <img
                    src={post.photos[1]}
                    alt=""
                    style={{
                      position: 'absolute', inset: 0, maxWidth: 'none',
                      objectFit: 'cover', pointerEvents: 'none',
                      borderRadius: 12.915, width: '100%', height: '100%',
                    }}
                  />
                </div>

                {/* Photo 3 (node 202316:528896) */}
                <div style={{
                  height: 180,
                  position: 'relative',
                  borderRadius: 12.915,
                  flexShrink: 0,
                  width: 161.435,
                  overflow: 'hidden',
                }}>
                  <img
                    src={post.photos[2]}
                    alt=""
                    style={{
                      position: 'absolute', inset: 0, maxWidth: 'none',
                      objectFit: 'cover', pointerEvents: 'none',
                      borderRadius: 12.915, width: '100%', height: '100%',
                    }}
                  />
                </div>

                {/* Mute nav button (node 202316:528897)
                    Figma: left-[calc(50%+290.85px)] -translate-x-1/2 bottom-[30px]
                    On 520px container: left = 260 + 290.85 = 550.85px, center at 550.85+18 = 568.85px
                    This places it beyond the 3rd photo area — visible when scrolled */}
                <div style={{
                  position: 'absolute',
                  bottom: 30,
                  left: 'calc(50% + 290.85px)',
                  transform: 'translateX(-50%)',
                  backdropFilter: 'blur(40px)',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  gap: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 10px',
                  borderRadius: 100,
                  width: 36,
                  height: 36,
                }}>
                  <MuteIcon />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Inner bottom shadow vignette */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          borderRadius: 'inherit',
          boxShadow: 'inset 0px -1px 1px -0.5px rgba(51,51,51,0.06)',
        }} />
      </motion.div>

      {/* ── Action bar  (node 202316:528900) ─────────── */}
      <motion.div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
        {/* Left: heart + chat (node 202316:528901) */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>

          {/* Heart group */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
            <HeartIcon />
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: 13,
              lineHeight: '20px',
              color: '#5c5c5c',
              letterSpacing: '-0.078px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              position: 'relative',
              margin: 0,
              fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
              fontVariantNumeric: 'tabular-nums',
            }}>
              {post.likes}
            </p>
          </div>

          {/* Chat group — tap to open comments */}
          <motion.button
            onClick={onOpenComments}
            style={{
              display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, outline: 'none',
            }}
            whileTap={{ scale: 0.9 }}
            transition={SPRING_PRESS}
          >
            <ChatIcon />
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: 13,
                lineHeight: '20px',
                color: '#5c5c5c',
                letterSpacing: '-0.078px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                position: 'relative',
                margin: 0,
                fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
                fontVariantNumeric: 'tabular-nums',
              }}>
                {post.comments}
              </p>
            </div>
          </motion.button>
        </div>

        {/* Right: bookmark + export (node 202316:528911) */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
          <motion.button
            aria-label="Bookmark"
            style={{
              display: 'flex', alignItems: 'center', flexShrink: 0,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, outline: 'none',
            }}
            whileTap={{ scale: 0.88 }}
            transition={SPRING_PRESS}
          >
            <BookmarkIcon />
          </motion.button>
          <motion.button
            aria-label="Share"
            style={{
              display: 'flex', alignItems: 'center', flexShrink: 0,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, outline: 'none',
            }}
            whileTap={{ scale: 0.88 }}
            transition={SPRING_PRESS}
          >
            <ExportIcon />
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}
