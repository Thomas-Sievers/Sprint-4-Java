export function BrandLoader({ size = 200 }: { size?: number }) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className="relative overflow-hidden rounded-full border border-hairline/10 bg-sidebar"
      style={{ width: size, height: size }}
    >
      <div aria-hidden="true" className="brand-loader-orbit animate-orbit-cw">
        <span
          className="brand-loader-blob"
          style={{
            top: -50,
            left: -40,
            width: 90,
            height: 90,
            background: "#22d3e5",
            filter: "blur(36px)",
          }}
        />
      </div>
      <div aria-hidden="true" className="brand-loader-orbit animate-orbit-ccw">
        <span
          className="brand-loader-blob"
          style={{
            top: -44,
            left: 28,
            width: 84,
            height: 84,
            background: "#1e3a8a",
            filter: "blur(34px)",
          }}
        />
      </div>

      <span className="relative z-10 flex h-full w-full items-center justify-center leading-[0]">
        <span className="text-4xl font-extrabold leading-none text-ink">N.</span>
      </span>
    </div>
  );
}
