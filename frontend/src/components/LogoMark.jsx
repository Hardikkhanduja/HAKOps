/**
 * LogoMark — CareSetu logo mark (house + cross + leaves).
 * white=true  → white version for dark backgrounds (navbar, headers)
 * white=false → full-colour version for light backgrounds
 */
export default function LogoMark({ size = 36, white = true }) {
  const houseFill   = white ? "rgba(255,255,255,0.95)" : "#0F6B5C";
  const roofStroke  = white ? "white"                  : "#0F6B5C";
  const crossFill   = white ? "#1DB88E"                : "#1DB88E";
  const leafLeft    = white ? "rgba(255,255,255,0.75)" : "#0F6B5C";
  const leafRight   = white ? "rgba(255,255,255,0.55)" : "#4CD98A";

  return (
    <svg width={size} height={size} viewBox="0 0 300 260" fill="none"
      aria-label="CareSetu logo mark" role="img">
      {/* Left leaf */}
      <path d="M80 195 C40 185,20 155,30 115 C50 130,75 155,80 195Z" fill={leafLeft} />
      {/* Right leaf */}
      <path d="M218 195 C258 185,278 155,268 115 C248 130,223 155,218 195Z" fill={leafRight} />
      {/* House body */}
      <rect x="82" y="90" width="136" height="105" rx="8" fill={houseFill} />
      {/* Roof */}
      <line x1="58"  y1="103" x2="150" y2="42"  stroke={roofStroke} strokeWidth="16" strokeLinecap="round"/>
      <line x1="150" y1="42"  x2="242" y2="103" stroke={roofStroke} strokeWidth="16" strokeLinecap="round"/>
      {/* Medical cross */}
      <rect x="135" y="105" width="30" height="70" rx="6" fill={crossFill} />
      <rect x="115" y="125" width="70" height="30" rx="6" fill={crossFill} />
    </svg>
  );
}