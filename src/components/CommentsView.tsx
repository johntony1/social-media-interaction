/* ─────────────────────────────────────────────────────────
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

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, useRef } from 'react'
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
            pathLength: { duration: 0.85, ease: [0.25, 0.1, 0.2, 1], delay: 0.16 },
          },
        }}
      />
    </motion.svg>
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
  return (
    <motion.div
      layout
      style={{
        display: 'flex', gap: 8, alignItems: 'flex-start',
        flexShrink: 0, width: '100%',
      }}
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{
        opacity: 1, y: 0, scale: 1,
        transition: { ...COMMENT_SPRING, delay: entryDelay },
      }}
      exit={{ opacity: 0, y: 4, transition: { duration: 0.09, ease: EASE_IN } }}
    >
      {/* Avatar */}
      <div style={{
        background: comment.avatarBg,
        border: '2px solid white',
        borderRadius: 999,
        flexShrink: 0,
        width: 24,
        height: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {comment.avatarSrc && (
          <img
            src={comment.avatarSrc}
            alt={comment.name}
            style={{
              position: 'absolute', inset: 0, maxWidth: 'none', objectFit: 'cover',
              pointerEvents: 'none', borderRadius: 999, width: '100%', height: '100%',
            }}
          />
        )}
      </div>

      {/* Comment content */}
      <div style={{
        display: 'flex', flex: '1 0 0', flexDirection: 'column',
        alignItems: 'flex-start', minHeight: 1, minWidth: 1, overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 4,
          alignItems: 'flex-start', flexShrink: 0, width: '100%',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 0, flexShrink: 0 }}>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13,
              lineHeight: '20px', color: '#171717', letterSpacing: '-0.078px',
              whiteSpace: 'nowrap', margin: 0,
              fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
            }}>
              {comment.name}
            </p>
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            lineHeight: 0, flexShrink: 0, width: '100%',
          }}>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12,
              lineHeight: '16px', color: '#5c5c5c', margin: 0,
              fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
            }}>
              {comment.text}
            </p>
          </div>
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
