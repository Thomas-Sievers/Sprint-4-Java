import { useAuth } from "../context/AuthContext";

export type FluidBackgroundIntensity = "hero" | "subtle";

type OpacityPorFundo = { dark: number; light: number };

interface BlobConfig {
  animation: string;
  delay: string;
  size: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  color: string;
  blur: number;
  opacity: Record<FluidBackgroundIntensity, OpacityPorFundo>;
}

// Opacidade e mais alta no claro que no escuro pra compensar: a mesma cor a baixa opacidade
// "lava" muito mais em cima de um fundo claro do que em cima de um fundo quase-preto.
const BLOBS: BlobConfig[] = [
  {
    animation: "animate-blob-a",
    delay: "-2s",
    size: 620,
    top: "-12%",
    left: "-10%",
    color: "#22d3e5",
    blur: 130,
    opacity: { hero: { dark: 0.18, light: 0.3 }, subtle: { dark: 0.1, light: 0.17 } },
  },
  {
    animation: "animate-blob-d",
    delay: "-9s",
    size: 420,
    top: "-8%",
    right: "-6%",
    color: "#7c6ff0",
    blur: 110,
    opacity: { hero: { dark: 0.22, light: 0.36 }, subtle: { dark: 0.12, light: 0.2 } },
  },
  {
    animation: "animate-blob-c",
    delay: "-15s",
    size: 480,
    bottom: "-14%",
    right: "-8%",
    color: "#22d3e5",
    blur: 120,
    opacity: { hero: { dark: 0.16, light: 0.27 }, subtle: { dark: 0.09, light: 0.15 } },
  },
  {
    animation: "animate-blob-b",
    delay: "-5s",
    size: 700,
    bottom: "-18%",
    left: "-14%",
    color: "#7c6ff0",
    blur: 140,
    opacity: { hero: { dark: 0.2, light: 0.33 }, subtle: { dark: 0.11, light: 0.18 } },
  },
];

export function FluidBackground({ intensity }: { intensity: FluidBackgroundIntensity }) {
  const { tema } = useAuth();
  const fundo = tema === "claro" ? "light" : "dark";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {BLOBS.map((blob, index) => (
        <span
          key={index}
          className={`fluid-blob ${blob.animation}`}
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            bottom: blob.bottom,
            left: blob.left,
            right: blob.right,
            backgroundImage: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            opacity: blob.opacity[intensity][fundo],
            filter: `blur(${blob.blur}px)`,
            animationDelay: blob.delay,
          }}
        />
      ))}
    </div>
  );
}
