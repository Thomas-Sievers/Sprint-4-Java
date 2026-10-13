import { Outlet } from "react-router-dom";
import { FluidBackground } from "./FluidBackground";

export function AuthLayout() {
  return (
    <div className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-4">
      <FluidBackground intensity="hero" />
      <Outlet />
    </div>
  );
}
