export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 2 9 9l7 7 7-7-7-7ZM2 16l7 7 7-7-7-7-7 7Zm14 14 7-7-7-7-7 7 7 7Zm14-14-7-7-7 7 7 7 7-7Z"
        fill="currentColor"
      />
    </svg>
  );
}
