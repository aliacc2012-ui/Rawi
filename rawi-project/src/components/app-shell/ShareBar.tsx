"use client";

import { useState } from "react";

export function ShareBar({ url, clientName }: { url: string; clientName?: string }) {
  const [copied, setCopied] = useState(false);

  const message = `Hi ${clientName || "there"} \u{1F44B}\n\nYour gallery is ready.\n\nView & download your media here:\n${url}\n\nEnjoy!`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">Public gallery link</p>
      <code className="block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs break-all mb-3">{url}</code>
      <div className="flex gap-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center bg-[#25D366] text-white font-bold rounded-full px-4 py-2.5 text-sm"
        >
          WhatsApp
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm font-bold"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
