import React, { useState } from 'react';
import { Chandelier3DArchetype } from '../types/lighting';

interface ProductVisualStudioProps {
  imageSource: string;
  productName: string;
  archetype: Chandelier3DArchetype;
  category?: string;
  className?: string;
  zoomScale?: number;
}

type StudioViewAngle = 'front' | 'warm' | 'detail' | 'room';

function parseStudioToken(source: string, fallbackArchetype: Chandelier3DArchetype): {
  isStudio: boolean;
  archetype: Chandelier3DArchetype;
  angle: StudioViewAngle;
} {
  if (!source || source.startsWith('studio:')) {
    const parts = (source || '').split(':');
    const arch = (parts[1] as Chandelier3DArchetype) || fallbackArchetype;
    const angle = (parts[2] as StudioViewAngle) || 'front';
    return { isStudio: true, archetype: arch, angle };
  }
  return { isStudio: false, archetype: fallbackArchetype, angle: 'front' };
}

export const ProductVisualStudio: React.FC<ProductVisualStudioProps> = ({
  imageSource,
  productName,
  archetype,
  className = '',
  zoomScale = 1,
}) => {
  const [imgError, setImgError] = useState(false);
  const parsed = parseStudioToken(imageSource, archetype);

  if (!parsed.isStudio && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-[#171513] ${className}`}>
        <img
          src={imageSource}
          alt={productName}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImgError(true)}
          style={{ transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined }}
          className="h-full w-full object-cover transition-transform duration-300"
        />
      </div>
    );
  }

  const { archetype: activeArch, angle } = parsed;

  // Color palette per angle to make each gallery thumbnail visibly distinct
  const bgPalettes: Record<StudioViewAngle, { top: string; mid: string; bot: string; glow: string; rim: string }> = {
    front: {
      top: '#171412',
      mid: '#241E1A',
      bot: '#12100E',
      glow: '#F7C86A',
      rim: '#E5B85C',
    },
    warm: {
      top: '#1A120B',
      mid: '#2E1E10',
      bot: '#140D08',
      glow: '#FFAE42',
      rim: '#F4A836',
    },
    detail: {
      top: '#1E1C1A',
      mid: '#2C2824',
      bot: '#161412',
      glow: '#FCE29C',
      rim: '#D8B467',
    },
    room: {
      top: '#25211D',
      mid: '#332C25',
      bot: '#1B1815',
      glow: '#F5C469',
      rim: '#C69C47',
    },
  };

  const pal = bgPalettes[angle] || bgPalettes.front;
  const viewTransform =
    angle === 'detail'
      ? `scale(${1.35 * zoomScale}) translate(0px, -12px)`
      : angle === 'room'
        ? `scale(${0.86 * zoomScale}) translate(0px, -18px)`
        : `scale(${zoomScale})`;

  const uid = `${activeArch}-${angle}-${productName.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div
      className={`relative select-none overflow-hidden bg-[#171412] ${className}`}
      role="img"
      aria-label={`${productName} - ${angle} studio view`}
    >
      <svg
        viewBox="0 0 600 450"
        className="h-full w-full object-cover transition-transform duration-300"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={pal.top} />
            <stop offset="55%" stopColor={pal.mid} />
            <stop offset="100%" stopColor={pal.bot} />
          </linearGradient>

          <radialGradient id={`glow-${uid}`} cx="50%" cy="44%" r="48%">
            <stop offset="0%" stopColor={pal.glow} stopOpacity={angle === 'warm' ? '0.52' : '0.36'} />
            <stop offset="45%" stopColor={pal.rim} stopOpacity="0.14" />
            <stop offset="100%" stopColor={pal.bot} stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`brass-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F9E498" />
            <stop offset="35%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#9A7420" />
            <stop offset="100%" stopColor="#F3D678" />
          </linearGradient>

          <linearGradient id={`crystal-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#FFF3D1" stopOpacity="0.82" />
            <stop offset="75%" stopColor="#E6C275" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Studio backdrop */}
        <rect width="600" height="450" fill={`url(#bg-${uid})`} />

        {/* Architectural wall panelling in room perspective */}
        {angle === 'room' && (
          <g opacity="0.22" stroke="#C69C47" strokeWidth="1" fill="none">
            <rect x="45" y="30" width="140" height="330" />
            <rect x="210" y="30" width="180" height="330" />
            <rect x="415" y="30" width="140" height="330" />
            <line x1="0" y1="385" x2="600" y2="385" strokeWidth="1.5" />
          </g>
        )}

        {/* Ceiling warm light cone & radial glow */}
        <polygon points="220,0 380,0 560,450 40,450" fill={`url(#glow-${uid})`} opacity="0.55" />
        <circle cx="300" cy="200" r="210" fill={`url(#glow-${uid})`} />

        {/* Main 3D-styled Chandelier Vector Artwork */}
        <g style={{ transform: viewTransform, transformOrigin: '300px 190px' }}>
          {/* Ceiling Canopy & Suspension */}
          {activeArch !== 'wall-sconce' && (
            <g>
              <ellipse cx="300" cy="18" rx="46" ry="9" fill={`url(#brass-${uid})`} />
              <rect x="266" y="10" width="68" height="10" rx="3" fill={`url(#brass-${uid})`} />
              <line x1="300" y1="22" x2="300" y2="95" stroke={`url(#brass-${uid})`} strokeWidth="4" />
            </g>
          )}

          {/* ARCHETYPE 1: IMPERIAL CRYSTAL CHANDELIER */}
          {activeArch === 'imperial-crystal' && (
            <g>
              {/* Suspension chains */}
              <line x1="275" y1="22" x2="200" y2="128" stroke={`url(#brass-${uid})`} strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="325" y1="22" x2="400" y2="128" stroke={`url(#brass-${uid})`} strokeWidth="1.5" strokeDasharray="4 2" />

              {/* Upper Crown Ring */}
              <ellipse cx="300" cy="132" rx="126" ry="22" fill="none" stroke={`url(#brass-${uid})`} strokeWidth="10" />
              <ellipse cx="300" cy="132" rx="126" ry="22" fill="none" stroke="#FFF6D6" strokeWidth="2" opacity="0.7" />

              {/* Tier 1 Crystal Prisms */}
              {Array.from({ length: 19 }).map((_, idx) => {
                const t = idx / 18;
                const angleRad = Math.PI * (0.06 + t * 0.88);
                const x = 300 + Math.cos(angleRad) * 122;
                const y = 134 + Math.sin(angleRad) * 20;
                const h = 48 + Math.sin(t * Math.PI) * 18;
                return (
                  <g key={`t1-${idx}`}>
                    <rect
                      x={x - 4.5}
                      y={y}
                      width="9"
                      height={h}
                      rx="2"
                      fill={`url(#crystal-${uid})`}
                      stroke="#FFF6D6"
                      strokeWidth="0.6"
                    />
                    <polygon
                      points={`${x},${y + h + 12} ${x - 5},${y + h + 4} ${x},${y + h - 2} ${x + 5},${y + h + 4}`}
                      fill="#FFFDF5"
                    />
                  </g>
                );
              })}

              {/* Middle Tier Brass Ring */}
              <ellipse cx="300" cy="196" rx="92" ry="16" fill="none" stroke={`url(#brass-${uid})`} strokeWidth="8" />

              {/* Tier 2 Crystal Prisms */}
              {Array.from({ length: 15 }).map((_, idx) => {
                const t = idx / 14;
                const angleRad = Math.PI * (0.08 + t * 0.84);
                const x = 300 + Math.cos(angleRad) * 89;
                const y = 198 + Math.sin(angleRad) * 14;
                const h = 44 + Math.sin(t * Math.PI) * 14;
                return (
                  <g key={`t2-${idx}`}>
                    <rect
                      x={x - 4}
                      y={y}
                      width="8"
                      height={h}
                      rx="2"
                      fill={`url(#crystal-${uid})`}
                      stroke="#FFF6D6"
                      strokeWidth="0.5"
                    />
                    <circle cx={x} cy={y + h + 7} r="4.2" fill="#FFFDF7" />
                  </g>
                );
              })}

              {/* Lower Tier Ring */}
              <ellipse cx="300" cy="252" rx="54" ry="10" fill="none" stroke={`url(#brass-${uid})`} strokeWidth="6" />

              {/* Lower Final Drops */}
              {Array.from({ length: 9 }).map((_, idx) => {
                const t = idx / 8;
                const angleRad = Math.PI * (0.1 + t * 0.8);
                const x = 300 + Math.cos(angleRad) * 51;
                const y = 254 + Math.sin(angleRad) * 9;
                const h = 34 + Math.sin(t * Math.PI) * 14;
                return (
                  <rect
                    key={`t3-${idx}`}
                    x={x - 3.5}
                    y={y}
                    width="7"
                    height={h}
                    rx="2"
                    fill={`url(#crystal-${uid})`}
                  />
                );
              })}

              {/* Center Faceted Crystal Finial Sphere */}
              <circle cx="300" cy="312" r="16" fill={`url(#crystal-${uid})`} stroke={`url(#brass-${uid})`} strokeWidth="2" />
              <circle cx="295" cy="307" r="5" fill="#FFFFFF" opacity="0.9" />

              {/* Warm Candle Glow Points */}
              {[215, 255, 300, 345, 385].map((cx, i) => (
                <g key={`candle-${i}`}>
                  <circle cx={cx} cy="118" r="16" fill={pal.glow} opacity="0.35" />
                  <ellipse cx={cx} cy="116" rx="4.5" ry="9" fill="#FFFDF2" />
                </g>
              ))}
            </g>
          )}

          {/* ARCHETYPE 2: GOLDEN ORBITAL RINGS */}
          {activeArch === 'golden-rings' && (
            <g>
              {/* Suspension Wires */}
              <line x1="272" y1="22" x2="170" y2="165" stroke="#D4AF37" strokeWidth="1.2" opacity="0.8" />
              <line x1="328" y1="22" x2="430" y2="145" stroke="#D4AF37" strokeWidth="1.2" opacity="0.8" />
              <line x1="285" y1="22" x2="215" y2="235" stroke="#D4AF37" strokeWidth="1.2" opacity="0.8" />
              <line x1="315" y1="22" x2="385" y2="250" stroke="#D4AF37" strokeWidth="1.2" opacity="0.8" />

              {/* Outer Golden Ring */}
              <g transform="rotate(-7 300 165)">
                <ellipse cx="300" cy="165" rx="148" ry="38" fill="none" stroke={`url(#brass-${uid})`} strokeWidth="12" />
                <ellipse cx="300" cy="169" rx="142" ry="34" fill="none" stroke="#FFF9E6" strokeWidth="5" />
              </g>

              {/* Middle Interlocking Ring */}
              <g transform="rotate(9 300 225)">
                <ellipse cx="300" cy="225" rx="112" ry="30" fill="none" stroke={`url(#brass-${uid})`} strokeWidth="10" />
                <ellipse cx="300" cy="228" rx="107" ry="27" fill="none" stroke="#FFF9E6" strokeWidth="4.5" />
              </g>

              {/* Inner Floating Ring */}
              <g transform="rotate(-4 300 278)">
                <ellipse cx="300" cy="278" rx="72" ry="20" fill="none" stroke={`url(#brass-${uid})`} strokeWidth="8" />
                <ellipse cx="300" cy="281" rx="68" ry="17" fill="none" stroke="#FFF9E6" strokeWidth="4" />
              </g>
            </g>
          )}

          {/* ARCHETYPE 3: MUGHAL BRASS LANTERN */}
          {activeArch === 'mughal-lantern' && (
            <g>
              {/* Ornamental Dome */}
              <path
                d="M240,125 C240,75 285,68 300,52 C315,68 360,75 360,125 Z"
                fill={`url(#brass-${uid})`}
              />
              {/* Finial Spire */}
              <circle cx="300" cy="46" r="7" fill={`url(#brass-${uid})`} />
              {/* Lantern Body Frame */}
              <polygon
                points="232,125 368,125 352,275 248,275"
                fill="rgba(255, 204, 112, 0.18)"
                stroke={`url(#brass-${uid})`}
                strokeWidth="7"
              />
              {/* Geometric Jaali Lattice Lines */}
              <line x1="272" y1="125" x2="278" y2="275" stroke={`url(#brass-${uid})`} strokeWidth="3.5" />
              <line x1="328" y1="125" x2="322" y2="275" stroke={`url(#brass-${uid})`} strokeWidth="3.5" />
              <polygon
                points="300,145 335,200 300,255 265,200"
                fill="none"
                stroke={`url(#brass-${uid})`}
                strokeWidth="2.5"
              />
              {/* Glowing Inner Filament */}
              <circle cx="300" cy="198" r="36" fill={pal.glow} opacity="0.65" />
              <ellipse cx="300" cy="198" rx="14" ry="24" fill="#FFFDF5" />
              {/* Lower Taper & Tassel */}
              <polygon points="248,275 352,275 300,322" fill={`url(#brass-${uid})`} />
              <circle cx="300" cy="332" r="8" fill={`url(#brass-${uid})`} />
            </g>
          )}

          {/* ARCHETYPE 4: CASCADE BEDROOM / DINING GLOBE CLUSTER */}
          {activeArch === 'cascade-cluster' && (
            <g>
              <ellipse cx="300" cy="38" rx="95" ry="14" fill={`url(#brass-${uid})`} />
              {[
                { x: 225, y: 155, r: 28 },
                { x: 265, y: 215, r: 32 },
                { x: 300, y: 140, r: 26 },
                { x: 305, y: 270, r: 35 },
                { x: 342, y: 195, r: 30 },
                { x: 378, y: 245, r: 27 },
              ].map((globe, idx) => (
                <g key={`globe-${idx}`}>
                  <line x1={globe.x} y1="42" x2={globe.x} y2={globe.y - globe.r} stroke="#D4AF37" strokeWidth="2" />
                  <rect
                    x={globe.x - 6}
                    y={globe.y - globe.r - 10}
                    width="12"
                    height="12"
                    rx="2"
                    fill={`url(#brass-${uid})`}
                  />
                  <circle cx={globe.x} cy={globe.y} r={globe.r + 10} fill={pal.glow} opacity="0.24" />
                  <circle
                    cx={globe.x}
                    cy={globe.y}
                    r={globe.r}
                    fill={`url(#crystal-${uid})`}
                    stroke={`url(#brass-${uid})`}
                    strokeWidth="2"
                  />
                  <circle cx={globe.x - globe.r * 0.28} cy={globe.y - globe.r * 0.28} r={globe.r * 0.25} fill="#FFFFFF" opacity="0.85" />
                </g>
              ))}
            </g>
          )}

          {/* ARCHETYPE 5: DECORATIVE BRASS & FLUTED CRYSTAL WALL SCONCE */}
          {activeArch === 'wall-sconce' && (
            <g>
              {/* Upward & Downward Wall Wash Cones */}
              <polygon points="300,140 190,10 410,10" fill={pal.glow} opacity="0.28" />
              <polygon points="300,260 190,430 410,430" fill={pal.glow} opacity="0.28" />

              {/* Brass Wall Backplate */}
              <rect x="276" y="88" width="48" height="234" rx="8" fill={`url(#brass-${uid})`} />

              {/* Fluted Crystal Rods */}
              {[-32, -20, -8, 4, 16, 28].map((offset, idx) => (
                <rect
                  key={`rod-${idx}`}
                  x={296 + offset}
                  y="112"
                  width="9"
                  height="186"
                  rx="4"
                  fill={`url(#crystal-${uid})`}
                  stroke="#FFF6D6"
                  strokeWidth="0.7"
                />
              ))}

              {/* Brass Top & Center Bands */}
              <rect x="256" y="128" width="88" height="12" rx="3" fill={`url(#brass-${uid})`} />
              <rect x="252" y="198" width="96" height="14" rx="4" fill={`url(#brass-${uid})`} />
              <rect x="256" y="268" width="88" height="12" rx="3" fill={`url(#brass-${uid})`} />
            </g>
          )}
        </g>

        {/* Subtle bokeh light particles */}
        <circle cx="130" cy="120" r="3" fill="#FFF3D1" opacity="0.45" />
        <circle cx="465" cy="155" r="4" fill="#FFF3D1" opacity="0.35" />
        <circle cx="175" cy="295" r="2.5" fill="#FFF3D1" opacity="0.4" />
        <circle cx="430" cy="280" r="3.5" fill="#FFF3D1" opacity="0.45" />
      </svg>
    </div>
  );
};
