import React, { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

/**
 * Floating "Dayflow Assistant" launcher (bottom-right corner).
 * Opens the Dify-hosted assistant in a panel. The iframe is only loaded
 * after the first click, so it never slows down the page.
 *
 * VITE_ASSISTANT_URL can override the link (public Dify web-app / embed URL).
 */
const ASSISTANT_URL =
  import.meta.env.VITE_ASSISTANT_URL || 'https://udify.app/agent/wXZty0HQgPrbR4cf';

const GREEN = '#73b234';
const RED = '#e5484d';

/** Small animated robot face: blinking eyes + glowing red antenna light. */
const BotFace = ({ size = 40, className = '' }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
    {/* antenna */}
    <line x1="24" y1="5" x2="24" y2="12" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="5" r="3.4" fill={RED} className="df-antenna" />
    {/* ears */}
    <rect x="4" y="22" width="5" height="10" rx="2.5" fill={RED} />
    <rect x="39" y="22" width="5" height="10" rx="2.5" fill={RED} />
    {/* head */}
    <rect x="8" y="12" width="32" height="28" rx="11" fill="#fff" stroke="#1f2937" strokeWidth="2" />
    {/* visor */}
    <rect x="13" y="19" width="22" height="13" rx="6.5" fill="#1f2937" />
    {/* eyes */}
    <g className="df-eyes">
      <circle cx="19.5" cy="25.5" r="2.6" fill={GREEN} />
      <circle cx="28.5" cy="25.5" r="2.6" fill={GREEN} />
    </g>
    {/* smile */}
    <path d="M20 35.5c2.4 1.6 5.6 1.6 8 0" stroke={GREEN} strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false); // iframe mounted at least once
  const [ready, setReady] = useState(false); // iframe finished loading
  const [hint, setHint] = useState(false); // "Need help?" bubble

  // Show the greeting bubble a moment after the page loads, until the user opens chat
  useEffect(() => {
    if (loaded) return undefined;
    const t = setTimeout(() => setHint(true), 2000);
    return () => clearTimeout(t);
  }, [loaded]);

  const toggle = () => {
    setOpen((o) => !o);
    setLoaded(true);
    setHint(false);
  };

  // Close with Escape
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <style>{`
        @keyframes df-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
        @keyframes df-blink { 0%,92%,100% { transform: scaleY(1) } 95% { transform: scaleY(.1) } }
        @keyframes df-glow { 0%,100% { opacity: 1 } 50% { opacity: .35 } }
        @keyframes df-wave { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-12deg) } 75% { transform: rotate(10deg) } }
        @keyframes df-pop { from { opacity: 0; transform: translateY(6px) scale(.96) } to { opacity: 1; transform: none } }
        .df-launcher { animation: df-float 3.2s ease-in-out infinite; }
        .df-launcher:hover, .df-launcher:focus-visible { animation-play-state: paused; }
        .df-launcher:hover .df-bot { animation: df-wave .7s ease-in-out; }
        .df-eyes { transform-box: fill-box; transform-origin: center; animation: df-blink 4s infinite; }
        .df-antenna { animation: df-glow 1.6s ease-in-out infinite; }
        .df-hint { animation: df-pop .35s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .df-launcher, .df-eyes, .df-antenna, .df-hint, .df-launcher:hover .df-bot { animation: none; }
        }
      `}</style>

      {/* Chat panel */}
      {loaded && (
        <div
          id="dayflow-assistant-panel"
          role="dialog"
          aria-label="Dayflow Assistant"
          aria-hidden={!open}
          className={`fixed z-[60] bg-white border border-gray-200 shadow-2xl overflow-hidden flex flex-col
            inset-2 rounded-2xl
            sm:inset-auto sm:right-6 sm:bottom-32 sm:w-[420px] sm:h-[min(640px,calc(100vh-10rem))]
            origin-bottom-right transition-all duration-200 ease-out
            ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ background: `linear-gradient(120deg, ${GREEN}, #5a9a1f)` }}>
            <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <BotFace size={30} />
            </span>
            <div className="flex-1 min-w-0 leading-tight">
              <p className="font-semibold text-sm">Dayflow Assistant</p>
              <p className="text-xs text-white/90 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Online · leave, attendance &amp; payroll
              </p>
            </div>
            <a
              href={ASSISTANT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/15 transition-colors"
              title="Open in a new tab"
              aria-label="Open assistant in a new tab"
              tabIndex={open ? 0 : -1}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-white/15 transition-colors"
              aria-label="Close assistant"
              tabIndex={open ? 0 : -1}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Assistant */}
          <div className="relative flex-1 bg-gray-50">
            {!ready && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-gray-500">
                <BotFace size={48} />
                Loading assistant…
              </div>
            )}
            <iframe
              src={ASSISTANT_URL}
              title="Dayflow Assistant chat"
              className="w-full h-full border-0"
              allow="microphone; clipboard-write"
              onLoad={() => setReady(true)}
            />
          </div>
        </div>
      )}

      {/* Greeting bubble */}
      {hint && !open && (
        <div className="df-hint fixed z-[61] right-4 bottom-[6.5rem] sm:right-8 sm:bottom-[7.75rem] max-w-[220px]">
          <div className="relative bg-white border border-gray-200 shadow-lg rounded-2xl rounded-br-md pl-4 pr-8 py-3 text-sm text-gray-700">
            <button
              type="button"
              onClick={toggle}
              className="text-left leading-snug"
            >
              <span className="font-semibold text-gray-900">Hi! 👋 Need help?</span>
              <br />
              Ask me about leave, attendance or payroll.
            </button>
            <button
              type="button"
              onClick={() => setHint(false)}
              className="absolute top-1.5 right-1.5 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Launcher */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="dayflow-assistant-panel"
        aria-label={open ? 'Close Dayflow Assistant' : 'Chat with Dayflow Assistant'}
        className={`${open ? 'hidden sm:flex' : 'df-launcher flex'} fixed z-[61] right-4 bottom-8 sm:right-6 sm:bottom-10
          items-center gap-2.5 rounded-full bg-white border-2 shadow-xl hover:shadow-2xl
          transition-shadow duration-200 active:scale-95
          focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200
          ${open ? 'p-1.5' : 'pl-1.5 pr-5 py-1.5'}`}
        style={{ borderColor: GREEN }}
      >
        <span
          className="df-bot w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: open ? GREEN : `radial-gradient(circle at 30% 30%, #e8f5d9, #d4ecb8)` }}
        >
          {open ? <X className="w-6 h-6 text-white" /> : <BotFace size={40} />}
        </span>
        {!open && (
          <span className="flex flex-col items-start leading-none">
            <span className="text-[17px] font-extrabold tracking-tight">
              <span style={{ color: GREEN }}>Day</span><span style={{ color: RED }}>flow</span>
            </span>
            <span className="text-[11px] font-medium text-gray-500 mt-1">AI Assistant</span>
          </span>
        )}
        {!open && (
          <span className="absolute -top-0.5 left-10 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: RED }} aria-hidden="true" />
        )}
      </button>
    </>
  );
};

export default ChatWidget;
