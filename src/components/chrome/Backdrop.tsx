/**
 * Living atmosphere backdrop — crossfades between condition themes driven
 * by the SDUI payload (dusk / monsoon / heat / marine / cloud).
 */
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { ATMOSPHERE } from "../../lib/theme";

export function Backdrop() {
  const theme = useAppStore((s) => s.theme);
  const atmo = ATMOSPHERE[theme];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <AnimatePresence mode="sync">
        <motion.div
          key={theme}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          style={{
            background: `linear-gradient(178deg, ${atmo.sky[0]} 0%, ${atmo.sky[1]} 46%, ${atmo.sky[2]} 100%)`,
          }}
        >
          <div
            className="orb-a absolute -right-24 -top-24 h-[340px] w-[340px] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${atmo.orbA}, transparent 70%)` }}
          />
          <div
            className="orb-b absolute -bottom-32 -left-28 h-[380px] w-[380px] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${atmo.orbB}, transparent 70%)` }}
          />
        </motion.div>
      </AnimatePresence>
      {/* film grain */}
      <div className="noise absolute inset-0" />
      {/* legibility vignette */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 to-transparent" />
    </div>
  );
}
