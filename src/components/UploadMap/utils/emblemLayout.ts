import { forceCollide, forceSimulation } from "d3-force";
import type { TLMapEmblem } from "../../../definitions/TerraLogger";

// Adapted from the following pinned AFMG source:
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/356f1c8088aba49bd41d837be4732d765a574728/src/renderers/draw-emblems.ts
const sizing = {
  state: { extent: 40, min: 10, max: 100, expected: 15, divisor: 100, deficit: 200 },
  province: { extent: 100, min: 5, max: 70, expected: 115, divisor: 1000, deficit: 1000 },
  burg: { extent: 185, min: 2, max: 50, expected: 450, divisor: 1000, deficit: 1000 },
};
const types = ["burg", "province", "state"] as const;

export function layoutMapEmblems(
  emblems: readonly TLMapEmblem[],
  width: number,
  height: number,
  sizeModifiers: Partial<Record<TLMapEmblem["type"], number>> = {},
) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("Cannot restore emblems with invalid map dimensions.");
  }
  const mapped = emblems.filter((emblem) => emblem.size !== 0);
  const ids = new Set<string>();
  for (const emblem of mapped) {
    if (ids.has(emblem.id)) throw new Error(`Duplicate map emblem ${emblem.id}.`);
    ids.add(emblem.id);
    if (!Number.isFinite(emblem.x) || !Number.isFinite(emblem.y) ||
      !Number.isFinite(emblem.size) || emblem.size < 0 ||
      (emblem.fx !== undefined && !Number.isFinite(emblem.fx)) ||
      (emblem.fy !== undefined && !Number.isFinite(emblem.fy))) {
      throw new Error(`Invalid placement for map emblem ${emblem.id}.`);
    }
  }

  const sizes: Record<TLMapEmblem["type"], number> = {
    burg: 0, province: 0, state: 0,
  };
  for (const type of types) {
    const config = sizing[type];
    const count = mapped.filter((emblem) => emblem.type === type).length;
    const start = Math.min(Math.max((height + width) / config.extent, config.min), config.max);
    const countModifier = 1 + count / config.divisor - (config.expected - count) / config.deficit;
    const modifier = sizeModifiers[type] || 1;
    if (!Number.isFinite(modifier) || modifier < 0) {
      throw new Error(`Invalid ${type} emblem size modifier.`);
    }
    sizes[type] = Math.round((start / countModifier) * modifier);
  }

  // AFMG inserts burgs, then provinces, then states into the collision pass.
  // Clone nodes so simulation never mutates the imported source records.
  const nodes = types.flatMap((type) =>
    mapped.filter((emblem) => emblem.type === type).map((emblem) => ({
      ...emblem,
      shift: (sizes[type] * emblem.size) / 2,
    })),
  );
  const simulation = forceSimulation(nodes)
    .alphaMin(0.6)
    .alphaDecay(0.2)
    .velocityDecay(0.6)
    .force("collision", forceCollide<(typeof nodes)[number]>().radius(({ shift }) => shift))
    .stop();
  const ticks = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
  simulation.tick(ticks);
  return { nodes, sizes };
}
