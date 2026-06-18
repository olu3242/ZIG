export default function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="zigGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: "#10b981", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#f59e0b", stopOpacity: 1 }} />
        </linearGradient>

        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g filter="url(#logoGlow)">
        <path 
          d="M40 40H160L80 120H160" 
          stroke="url(#zigGradient)" 
          strokeWidth="16" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none" 
        />
        <path 
          d="M40 80H120L40 160H160" 
          stroke="url(#zigGradient)" 
          strokeWidth="16" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none" 
        />
      </g>
    </svg>
  );
}
