import React, { useEffect, useState } from 'react';
import { MessageCircle, X, ExternalLink } from 'lucide-react';

/**
 * Floating "Dayflow Assistant" chat button (bottom-right corner).
 * Opens the Dify-hosted assistant in a panel. The iframe is only loaded
 * after the first click, so it never slows down the page.
 *
 * The URL is the public Dify web-app link (safe to ship to the browser).
 * Override it with VITE_ASSISTANT_URL if the agent ever changes.
 */
const ASSISTANT_URL =
  import.meta.env.VITE_ASSISTANT_URL || 'https://udify.app/agent/wXZty0HQgPrbR4cf';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false); // iframe mounted at least once
  const [ready, setReady] = useState(false); // iframe finished loading

  const toggle = () => {
    setOpen((o) => !o);
    setLoaded(true);
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
      {/* Chat panel */}
      {loaded && (
        <div
          id="dayflow-assistant-panel"
          role="dialog"
          aria-label="Dayflow Assistant"
          aria-hidden={!open}
          className={`fixed z-[60] bg-white border border-gray-200 shadow-2xl overflow-hidden flex flex-col
            inset-x-3 bottom-24 top-20 rounded-2xl
            sm:inset-auto sm:right-6 sm:bottom-24 sm:w-[380px] sm:h-[min(600px,calc(100vh-8rem))]
            origin-bottom-right transition-all duration-200 ease-out
            ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#73b234] text-white">
            <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0 leading-tight">
              <p className="font-semibold text-sm">Dayflow Assistant</p>
              <p className="text-xs text-white/85">Ask about leave, attendance and payroll</p>
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
                <span className="w-8 h-8 border-[3px] border-green-100 border-t-[#73b234] rounded-full animate-spin" />
                Loading assistant…
              </div>
            )}
            <iframe
              src={ASSISTANT_URL}
              title="Dayflow Assistant chat"
              className="w-full h-full border-0"
              allow="clipboard-write; microphone"
              onLoad={() => setReady(true)}
            />
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="dayflow-assistant-panel"
        aria-label={open ? 'Close Dayflow Assistant' : 'Chat with Dayflow Assistant'}
        title={open ? 'Close chat' : 'Ask Dayflow Assistant'}
        className="fixed z-[61] right-4 bottom-4 sm:right-6 sm:bottom-6 w-14 h-14 rounded-full
          bg-[#73b234] hover:bg-[#5a9a1f] text-white shadow-lg hover:shadow-xl
          flex items-center justify-center transition-all duration-200 active:scale-95
          focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && !loaded && (
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-[#73b234] animate-pulse" />
          </span>
        )}
      </button>
    </>
  );
};

export default ChatWidget;
