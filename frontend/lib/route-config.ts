import skilledWorkerSlots from "@/config/routes/skilled-worker.slots.json";
import ilrSlots from "@/config/routes/ilr.slots.json";
import type { Route, RouteSlotConfig } from "@/lib/types";

export const SKILLED_WORKER_SLOT_CONFIG = skilledWorkerSlots as RouteSlotConfig;
export const ILR_SLOT_CONFIG = ilrSlots as RouteSlotConfig;

export function routeSlotConfig(route: Route): RouteSlotConfig {
  return route === "ilr" ? ILR_SLOT_CONFIG : SKILLED_WORKER_SLOT_CONFIG;
}
