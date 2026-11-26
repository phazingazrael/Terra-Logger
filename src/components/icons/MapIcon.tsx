import { Box, Chip } from "@mui/material";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  MapInf,
  TLBiome,
  TLCustomIcon,
  TLGood,
} from "../../definitions/TerraLogger";
import {
  mapIconImage,
  readMapIconContext,
  reliefIconReference,
  reliefTypes,
  type MapIconContext,
} from "./iconLibrary";

const emptyContext: MapIconContext = { customIcons: [], reliefSet: "simple" };
const IconContext = createContext<MapIconContext>(emptyContext);

export function MapIconProvider({
  map,
  children,
}: {
  map: MapInf | null;
  children: ReactNode;
}) {
  const value = useMemo(() => readMapIconContext(map), [map]);
  return <IconContext value={value}>{children}</IconContext>;
}

export function MapIcon({
  icon,
  label = icon,
  size = 22,
  customIcons,
}: {
  icon: string;
  label?: string;
  size?: number;
  customIcons?: readonly TLCustomIcon[];
}) {
  const context = useContext(IconContext);
  const icons = customIcons ?? context.customIcons;
  const [loaded, setLoaded] = useState<{
    icon: string;
    icons: readonly TLCustomIcon[];
    src?: string;
    error?: string;
  }>();
  useEffect(() => {
    let cancelled = false;
    if (icon)
      void mapIconImage(icon, icons).then(
        (src) => {
          if (!cancelled) setLoaded({ icon, icons, src });
        },
        (error: unknown) => {
          if (!cancelled)
            setLoaded({
              icon,
              icons,
              error:
                error instanceof Error ? error.message : "Icon unavailable.",
            });
        },
      );
    return () => {
      cancelled = true;
    };
  }, [icon, icons]);
  if (!icon) return null;
  const current =
    loaded?.icon === icon && loaded.icons === icons ? loaded : undefined;
  const style = {
    width: size,
    height: size,
    flexShrink: 0,
    verticalAlign: "middle",
  };
  return current?.src ? (
    <img
      key={current.src}
      src={current.src}
      alt=""
      title={label}
      style={{ ...style, objectFit: "contain" }}
      onError={() =>
        setLoaded({ icon, icons, error: "Icon image could not be loaded." })
      }
    />
  ) : (
    <span
      role="img"
      aria-label={
        current?.error ? `${label}: icon unavailable` : `${label}: loading icon`
      }
      title={current?.error ?? label}
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.55,
      }}
    >
      ◇
    </span>
  );
}

// AFMG paints the good's colour behind its artwork, rather than recolouring the SVG.
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/354eeaa7a6aa6e0e57abb8e2f5af5e62cef8aab4/src/renderers/draw-goods.ts
export function GoodLabel({
  good,
  children,
  chip = false,
}: {
  good?: TLGood;
  children?: ReactNode;
  chip?: boolean;
}) {
  const content = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35em",
        verticalAlign: "middle",
        maxWidth: "100%",
        minWidth: 0,
      }}
    >
      {good?.icon ? (
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: "50%",
            bgcolor: good.color || "action.selected",
            border: 1,
            borderColor: "divider",
          }}
        >
          <MapIcon icon={good.icon} label={good.name} size={22} />
        </Box>
      ) : null}
      <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>
        {children ?? good?.name}
      </span>
      {good && (good.depositYield !== undefined || (good.deposits?.[1] ?? 0) > 0) ? (
        <span
          title="Deposit output multiplier; already included in imported production quantities."
          style={{
            fontSize: "0.75em",
            opacity: 0.75,
            whiteSpace: "nowrap",
          }}
        >
          Deposit yield ×{good.depositYield ?? 1}
        </span>
      ) : null}
    </span>
  );
  return chip ? (
    <Chip
      label={content}
      variant="outlined"
      sx={{
        height: "auto",
        maxWidth: "100%",
        py: 0.35,
        "& .MuiChip-label": {
          display: "block",
          px: 0.75,
          whiteSpace: "normal",
          overflowWrap: "anywhere",
        },
      }}
    />
  ) : (
    content
  );
}

export function BiomeIcons({ biome }: { biome?: TLBiome }) {
  const { reliefSet } = useContext(IconContext);
  if (!biome) return null;
  const pool = new Map<string, { weight: number; size?: number }>();
  if (Array.isArray(biome.icons)) {
    for (const icon of biome.icons)
      pool.set(icon, { weight: (pool.get(icon)?.weight ?? 0) + 1 });
  } else {
    for (const [icon, entry] of Object.entries(biome.icons))
      pool.set(icon, entry);
  }
  if (!pool.size) return null;
  return (
    <span
      title={`${biome.name} relief icon pool`}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.35em 0.75em",
        marginTop: "0.3em",
      }}
    >
      {[...pool].map(([icon, entry]) => {
        const ref = (reliefTypes as readonly string[]).includes(icon)
          ? reliefIconReference({ type: icon }, reliefSet)
          : icon;
        const name = icon.replace(/([a-z])([A-Z])/g, "$1 $2");
        return (
          <span
            key={icon}
            title={`${name}: weight ${entry.weight}${entry.size === undefined ? "" : `, size ×${entry.size}`}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2em",
              fontSize: "0.8em",
            }}
          >
            <MapIcon icon={ref} label={name} size={24} />
            {name} ×{entry.weight}
          </span>
        );
      })}
    </span>
  );
}
