/* ─────────────────────────────────────────────────────────
 * COMMENTS VIEW — ANIMATION STORYBOARD
 *
 *  ENTER  (layout-morph continues from ExpandedPost)
 *   80ms  white card:    y(-10→0)    opacity(0→1)  spring s:200 d:24
 *  160ms  thread line:   scaleY(0→1) opacity(0→1)  spring s:180 d:24
 *          origin: top — line "draws" down from the avatar
 *  240ms  Dami comment:  y(8→0)      opacity(0→1)  spring s:200 d:24
 *  320ms  input bar:     y(8→0)      opacity(0→1)  spring s:200 d:24
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
 * ─────────────────────────────────────────────────────────
 */

import { motion } from 'framer-motion'
import type { Post } from './ExpandedPost'
import {
  JOHN_TONY_PARAGRAPHS,
  SPRING_SOFT,
  SPRING_PRESS,
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

// ── Thread connector line (node 202316:528938) ────────────
// Draws from below the original avatar down to Dami's avatar.
// scaleY animates 0→1 from origin:top, giving the "drawing" effect.
function ThreadLine() {
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        top: 30,
        width: 12,
        height: 433,
        pointerEvents: 'none',
        transformOrigin: 'top center',
      }}
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1, transition: { ...SPRING_SOFT, stiffness: 180, delay: 0.16 } }}
      exit={{ opacity: 0, transition: { duration: 0.08, ease: EASE_IN, delay: 0.11 } }}
    >
      <div style={{ position: 'absolute', inset: '0 -4.17% 0 -1.47%' }}>
        <img
          src="/assets/thread-line.svg"
          alt=""
          style={{ display: 'block', width: '100%', height: '100%', maxWidth: 'none' }}
        />
      </div>
    </motion.div>
  )
}

// ── Comment input bar (node 202316:528946) ────────────────
function CommentInput({ avatarSrc }: { avatarSrc?: string }) {
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
            style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover',
              pointerEvents: 'none', borderRadius: 999, width: '100%', height: '100%' }}
          />
        )}
      </div>

      {/* Text input pill (node I202316:528948;266:5238) */}
      <div style={{
        background: 'white',
        border: '1px solid #ebebeb',
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingLeft: 12,
        paddingRight: 10,
        paddingTop: 10,
        paddingBottom: 10,
        height: 32,
        width: 300,
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: '0px 1px 2px 0px rgba(10,13,20,0.03)',
        flexShrink: 0,
        position: 'relative',
      }}>
        <p style={{
          flex: '1 0 0',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: 13,
          lineHeight: '20px',
          color: '#a3a3a3',
          letterSpacing: '-0.078px',
          margin: 0,
          fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          Type comment
        </p>

        {/* Emoji icon (node I202316:528948;266:5242) — 20px */}
        <div style={{ overflow: 'hidden', flexShrink: 0, width: 20, height: 20, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '12.5%' }}>
            <img src="/assets/icon-emoji.svg" alt="" style={{
              position: 'absolute', display: 'block', maxWidth: 'none', width: '100%', height: '100%'
            }} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main export ────────────────────────────────────────────

export default function CommentsView({ post, onClose }: { post: Post; onClose: () => void }) {
  const isJohnTony = post.id === 1
  const paragraphs = isJohnTony ? JOHN_TONY_PARAGRAPHS : post.fullText.map(t => [t])

  return (
    <>
      {/* ── White card (node 202316:528920) ──────────── */}
      <motion.div
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', position: 'relative', flexShrink: 0, width: '100%' }}>

          {/* Thread connector line (node 202316:528938) */}
          <ThreadLine />

          {/* Avatar (node 202316:528922) */}
          <div style={{
            background: '#ebebeb', border: '2px solid white', borderRadius: 999,
            flexShrink: 0, width: 24, height: 24, position: 'relative', overflow: 'hidden',
          }}>
            {post.avatarImg && (
              <img src={post.avatarImg} alt={post.name}
                style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover',
                  pointerEvents: 'none', borderRadius: 999, width: '100%', height: '100%' }} />
            )}
          </div>

          {/* Content column (node 202316:528923) */}
          <div style={{
            display: 'flex', flex: '1 0 0', flexDirection: 'column', gap: 8,
            alignItems: 'flex-start', minHeight: 1, minWidth: 1, overflow: 'hidden',
            position: 'relative',
          }}>

            {/* Name + badge (node 202316:528924/925) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', flexShrink: 0, width: '100%' }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 0, flexShrink: 0 }}>
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
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              position: 'relative', flexShrink: 0,
              overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none',
              marginLeft: -40, marginRight: -16, paddingLeft: 40, paddingRight: 16,
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0, width: 520 }}>
                {post.photos.map((src, i) => (
                  <div key={i} style={{
                    height: 180, position: 'relative', borderRadius: 12.915,
                    flexShrink: 0, width: 161.435, overflow: 'hidden',
                  }}>
                    <img src={src} alt="" style={{
                      position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover',
                      pointerEvents: 'none', borderRadius: 12.915, width: '100%', height: '100%',
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Dami's comment (node 202316:528939) ─────── */}
        <motion.div
          style={{
            display: 'flex', gap: 8, alignItems: 'flex-start',
            flexShrink: 0, width: 316,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: 0.24 } }}
          exit={{ opacity: 0, y: 4, transition: { duration: 0.09, ease: EASE_IN, delay: 0.055 } }}
        >
          {/* Dami's avatar (node 202316:528940) — yellow #ffecc0 */}
          <div style={{
            background: '#ffecc0', border: '2px solid white', borderRadius: 999,
            flexShrink: 0, width: 24, height: 24, position: 'relative', overflow: 'hidden',
          }}>
            <img src="/assets/avatar-dami.png" alt="Dami"
              style={{ position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover',
                pointerEvents: 'none', borderRadius: 999, width: '100%', height: '100%' }} />
          </div>

          {/* Comment content (node 202316:528941) */}
          <div style={{
            display: 'flex', flex: '1 0 0', flexDirection: 'column',
            alignItems: 'flex-start', minHeight: 1, minWidth: 1, overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', flexShrink: 0, width: '100%' }}>
              {/* Commenter name (node 202316:528944) */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 0, flexShrink: 0 }}>
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13,
                  lineHeight: '20px', color: '#171717', letterSpacing: '-0.078px',
                  whiteSpace: 'nowrap', margin: 0,
                  fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
                }}>
                  Dami
                </p>
              </div>

              {/* Comment text (node 202316:528945) */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 0, flexShrink: 0, width: '100%' }}>
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12,
                  lineHeight: '16px', color: '#5c5c5c', margin: 0,
                  fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
                }}>
                  2016 me had no systems, no strategy… just vibes and somehow less stress 😭
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Inner bottom shadow vignette */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          borderRadius: 'inherit',
          boxShadow: 'inset 0px -1px 1px -0.5px rgba(51,51,51,0.06)',
        }} />
      </motion.div>

      {/* ── Comment input bar (node 202316:528946) ─── */}
      <CommentInput avatarSrc={post.avatarImg} />
    </>
  )
}
