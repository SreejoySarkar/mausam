/**
 * SDUIRenderer
 *   └─ receives SDUI JSON
 *   └─ iterates component nodes in backend-defined order
 *   └─ resolves each type via the Component Registry
 *   └─ validates props, isolates failures, animates entrance
 *
 * Unknown or malformed nodes are skipped silently — the app never crashes
 * because of malformed SDUI data.
 */
import { memo } from "react";
import { motion } from "framer-motion";
import type { SDUIPayload } from "../types/sdui";
import { ComponentBoundary, resolveComponent } from "./registry";

function SDUIRendererInner({ payload }: { payload: SDUIPayload }) {
  if (!payload || !Array.isArray(payload.components)) return null;

  return (
    <div className="flex flex-col gap-4">
      {payload.components.map((node, index) => {
        if (!node || typeof node.type !== "string") return null;
        const entry = resolveComponent(node.type);
        if (!entry) return null;
        if (entry.validate && !entry.validate(node.props)) {
          if (import.meta.env.DEV) console.warn(`[SDUI] Invalid props for "${node.type}" — skipped.`);
          return null;
        }
        const Node = entry.render;
        return (
          <motion.section
            key={`${payload.generatedAt}:${node.id ?? node.type}`}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: Math.min(index * 0.055, 0.4), duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            aria-label={node.type}
          >
            <ComponentBoundary nodeId={node.id ?? node.type}>
              <Node {...(node.props ?? {})} />
            </ComponentBoundary>
          </motion.section>
        );
      })}
    </div>
  );
}

export const SDUIRenderer = memo(SDUIRendererInner);
