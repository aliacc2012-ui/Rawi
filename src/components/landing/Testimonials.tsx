"use client";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "I sent my first gallery through RAWI the same day I signed up. My client called me just to say how beautiful it looked. No client has ever called me about a Google Drive link.",
    name: "Layla Al Mansouri",
    role: "Wedding Photographer · Dubai",
    avatar: "L",
    color: "#c9a96e",
  },
  {
    quote: "The automotive shoots I do are all about presentation — the cars deserve a gallery that matches. RAWI is the only platform that actually gets that. My clients think I built it myself.",
    name: "Khalid Al Rashidi",
    role: "Commercial & Automotive · Abu Dhabi",
    avatar: "K",
    color: "#e8a020",
  },
  {
    quote: "Switching from WeTransfer to RAWI took 10 minutes. I've never had a client fail to download their photos. The WhatsApp sharing alone saved me so many follow-up messages.",
    name: "Sara Nasser",
    role: "Portrait & Editorial · Riyadh",
    avatar: "S",
    color: "#8b7cf6",
  },
];

export function Testimonials() {
  return (
    <section className="bg-[#06060F] py-[72px] md:py-[110px]">
      <div className="w-[min(1180px,calc(100%-32px))] md:w-[min(1180px,calc(100%-40px))] mx-auto">
        <div className="mb-12 md:mb-16">
          <div className="editorial-eyebrow mb-4">CREATORS LOVE IT</div>
          <h2 className="display-section max-w-[480px]">
            Don&apos;t take our<br />
            <span style={{ color: "#C9962A" }}>word for it.</span>
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col gap-5 rounded-2xl border border-white/[.06] bg-white/[.03] p-6 md:p-7"
            >
              {/* Quote mark */}
              <span
                className="absolute top-5 right-6 text-5xl font-black leading-none opacity-10 select-none"
                style={{ color: t.color }}
              >
                &ldquo;
              </span>

              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 14 14" fill={t.color} xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625.59-3.44L2 4.635l3.455-.505L7 1z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-white/70 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/[.06]">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-black flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white">{t.name}</div>
                  <div className="text-[11px] text-white/35">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
