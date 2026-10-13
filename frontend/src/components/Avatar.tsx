interface AvatarProps {
  iniciais: string;
  size?: number;
  className?: string;
}

export function Avatar({ iniciais, size = 36, className = "" }: AvatarProps) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent font-extrabold text-accent-ink ${className}`}
    >
      {iniciais}
    </span>
  );
}
