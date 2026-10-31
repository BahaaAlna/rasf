/*
  An iPhone 15 Pro in natural titanium, drawn in CSS: the frame and its
  buttons, the Dynamic Island, the status bar, and Safari's bar at the
  bottom with the address in it. Sizes are in points, times `k`.

  The page goes in `children`, in a 393 × 724 area between the status bar
  and Safari's bar: the size scripts/record.mjs films at.
*/

import type { ReactNode } from 'react';
import { color, contact, font } from '../brand';

export const IPHONE = { width: 393, height: 852, status: 54, bar: 74, radius: 55, bezel: 5, rim: 4 };
const page = IPHONE.height - IPHONE.status - IPHONE.bar;

export const iphoneOuter = (k: number) => ({
  width: (IPHONE.width + 2 * (IPHONE.bezel + IPHONE.rim)) * k,
  height: (IPHONE.height + 2 * (IPHONE.bezel + IPHONE.rim)) * k,
});

const Status = ({ k }: { k: number }) => (
  <div
    style={{
      height: IPHONE.status * k,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${6 * k}px ${32 * k}px 0 ${44 * k}px`,
      fontFamily: font.display.en,
      fontWeight: 600,
      fontSize: 17 * k,
      color: color.ink,
      background: color.paper,
    }}
  >
    <span>9:41</span>
    <svg width={78 * k} height={13 * k} viewBox="0 0 78 13" fill={color.ink}>
      {/* Signal */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i * 5} y={9 - i * 3} width={3.2} height={4 + i * 3} rx={0.8} />
      ))}
      {/* Wi-Fi */}
      <path d="M31 4.2a10 10 0 0 1 14 0l-1.4 1.4a8 8 0 0 0-11.2 0Z M33.4 6.7a6.6 6.6 0 0 1 9.2 0l-1.4 1.4a4.6 4.6 0 0 0-6.4 0Z M35.8 9.2a3.2 3.2 0 0 1 4.4 0L38 11.4Z" />
      {/* Battery */}
      <rect x={52} y={0.5} width={23} height={12} rx={3.5} fill="none" stroke={color.ink} strokeOpacity={0.4} />
      <rect x={54} y={2.5} width={17} height={8} rx={2} />
      <rect x={76} y={4.5} width={1.5} height={4} rx={0.75} fillOpacity={0.4} />
    </svg>
  </div>
);

const SafariBar = ({ k }: { k: number }) => (
  <div
    style={{
      position: 'relative',
      height: IPHONE.bar * k,
      background: '#f7f5f0',
      borderTop: `${0.5 * k}px solid ${color.rule}`,
      paddingTop: 8 * k,
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        width: 361 * k,
        height: 44 * k,
        borderRadius: 14 * k,
        background: '#ffffff',
        boxShadow: `0 ${1 * k}px ${6 * k}px #18181c14`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${14 * k}px`,
        fontFamily: font.display.en,
        fontSize: 16 * k,
        color: color.ink,
      }}
    >
      <span style={{ fontSize: 15 * k, fontWeight: 600 }}>
        <span style={{ fontSize: 11 * k }}>A</span>A
      </span>
      <span>
        <svg width={10 * k} height={12 * k} viewBox="0 0 10 12" style={{ marginInlineEnd: 5 * k, verticalAlign: '-0.05em' }}>
          <rect x={0.5} y={5} width={9} height={6.5} rx={1.5} fill={color.inkMuted} />
          <path d="M2.5 5V3.5a2.5 2.5 0 0 1 5 0V5" fill="none" stroke={color.inkMuted} strokeWidth={1.3} />
        </svg>
        {contact.site}
      </span>
      <svg width={16 * k} height={16 * k} viewBox="0 0 16 16" fill="none" stroke={color.ink} strokeWidth={1.6}>
        <path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v3h-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    {/* Home indicator */}
    <div
      style={{
        position: 'absolute',
        bottom: 8 * k,
        left: '50%',
        width: 134 * k,
        height: 5 * k,
        marginLeft: -67 * k,
        borderRadius: 3 * k,
        background: color.ink,
      }}
    />
  </div>
);

const buttons = [
  // side, top, height
  ['left', 180, 32],
  ['left', 240, 62],
  ['left', 316, 62],
  ['right', 262, 98],
] as const;

export const IPhone = ({ k, children }: { k: number; children: ReactNode }) => {
  const { bezel, rim, radius } = IPHONE;
  return (
    <div style={{ position: 'relative', ...iphoneOuter(k) }}>
      {buttons.map(([side, top, height]) => (
        <div
          key={`${side}${top}`}
          style={{
            position: 'absolute',
            [side]: -2.6 * k,
            top: top * k,
            width: 3.4 * k,
            height: height * k,
            borderRadius: 2 * k,
            background: 'linear-gradient(90deg, #8f8b84, #d6d2ca, #8f8b84)',
          }}
        />
      ))}
      {/* Titanium rim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: (radius + bezel + rim) * k,
          background: 'linear-gradient(135deg, #e3dfd7, #9a968f 22%, #ece8e0 48%, #85817b 72%, #d2cec6)',
          boxShadow: `0 ${50 * k}px ${80 * k}px -${30 * k}px #18181c66, inset 0 0 0 ${0.6 * k}px #ffffff88`,
        }}
      />
      {/* Black glass bezel, then the screen. */}
      <div
        style={{
          position: 'absolute',
          inset: rim * k,
          padding: bezel * k,
          borderRadius: (radius + bezel) * k,
          background: '#0b0b0c',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: IPHONE.width * k,
            height: IPHONE.height * k,
            borderRadius: radius * k,
            overflow: 'hidden',
            background: color.paper,
          }}
        >
          <Status k={k} />
          <div style={{ position: 'relative', width: IPHONE.width * k, height: page * k, overflow: 'hidden' }}>{children}</div>
          <SafariBar k={k} />
          {/* Dynamic Island */}
          <div
            style={{
              position: 'absolute',
              top: 11 * k,
              left: '50%',
              width: 126 * k,
              height: 37 * k,
              marginLeft: -63 * k,
              borderRadius: 19 * k,
              background: '#000',
            }}
          />
          {/* A faint sheen across the glass. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(115deg, #ffffff1c 0%, #ffffff00 35%, #ffffff00 70%, #ffffff10 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};
