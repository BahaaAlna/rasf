/*
  A MacBook Pro 14" in space black, drawn in CSS: the lid with its notch,
  the macOS menu bar, a Safari window filling the screen, and the base.
  Sizes are in points, times `k`.

  The page goes in `children`, in a 1512 × 930 area under Safari's
  toolbar: the size scripts/record.mjs films at. `open` (0–1) swings the
  lid up from closed.
*/

import type { ReactNode } from 'react';
import { color, contact, font } from '../brand';

export const MAC = { width: 1512, menu: 30, toolbar: 52, page: 930, bezel: 18, chin: 26 };
const screenHeight = MAC.menu + MAC.toolbar + MAC.page;
const lidWidth = MAC.width + 2 * MAC.bezel;
const lidHeight = screenHeight + MAC.bezel + MAC.chin;
const baseWidth = lidWidth * 1.13;
const baseHeight = 22;

export const macOuter = (k: number) => ({ width: baseWidth * k, height: (lidHeight + baseHeight) * k });

const MenuBar = ({ k }: { k: number }) => (
  <div
    style={{
      height: MAC.menu * k,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 ${20 * k}px`,
      fontFamily: font.display.en,
      fontSize: 13.5 * k,
      color: color.ink,
      background: '#e9e6df',
    }}
  >
    <span style={{ display: 'flex', gap: 20 * k }}>
      <b style={{ fontWeight: 700 }}>Safari</b>
      {['File', 'Edit', 'View', 'History', 'Bookmarks', 'Window', 'Help'].map((m) => (
        <span key={m}>{m}</span>
      ))}
    </span>
    <span style={{ display: 'flex', gap: 18 * k }}>
      <span>Fri 31 Oct</span>
      <span>9:41</span>
    </span>
  </div>
);

const Toolbar = ({ k }: { k: number }) => (
  <div
    style={{
      position: 'relative',
      height: MAC.toolbar * k,
      display: 'flex',
      alignItems: 'center',
      padding: `0 ${18 * k}px`,
      background: '#f3f1ec',
      borderBottom: `${1 * k}px solid ${color.rule}`,
    }}
  >
    <span style={{ display: 'flex', gap: 8 * k }}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <span key={c} style={{ width: 12 * k, height: 12 * k, borderRadius: '50%', background: c }} />
      ))}
    </span>
    <svg width={60 * k} height={16 * k} viewBox="0 0 60 16" fill="none" stroke={color.inkMuted} strokeWidth={1.6} style={{ marginLeft: 26 * k }}>
      <path d="M8 3 3 8l5 5M30 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div
      style={{
        position: 'absolute',
        left: '50%',
        width: 520 * k,
        height: 32 * k,
        marginLeft: -260 * k,
        borderRadius: 9 * k,
        background: '#e6e3dc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7 * k,
        fontFamily: font.display.en,
        fontSize: 14 * k,
        color: color.ink,
      }}
    >
      <svg width={9 * k} height={11 * k} viewBox="0 0 10 12">
        <rect x={0.5} y={5} width={9} height={6.5} rx={1.5} fill={color.inkMuted} />
        <path d="M2.5 5V3.5a2.5 2.5 0 0 1 5 0V5" fill="none" stroke={color.inkMuted} strokeWidth={1.3} />
      </svg>
      {contact.site}
    </div>
  </div>
);

export const MacBook = ({ k, open = 1, children }: { k: number; open?: number; children: ReactNode }) => {
  const angle = (1 - open) * -82;
  return (
    <div style={{ position: 'relative', ...macOuter(k), perspective: 2600 * k }}>
      {/* The lid, hinged at its foot. */}
      <div
        style={{
          position: 'absolute',
          left: (baseWidth - lidWidth) * 0.5 * k,
          top: 0,
          width: lidWidth * k,
          height: lidHeight * k,
          padding: `${MAC.bezel * k}px ${MAC.bezel * k}px ${MAC.chin * k}px`,
          borderRadius: `${26 * k}px ${26 * k}px ${8 * k}px ${8 * k}px`,
          background: '#0c0c0e',
          boxShadow: `inset 0 0 0 ${2 * k}px #3a3a3e`,
          transformOrigin: '50% 100%',
          transform: `rotateX(${angle}deg)`,
        }}
      >
        <div style={{ position: 'relative', width: MAC.width * k, height: screenHeight * k, overflow: 'hidden', borderRadius: 8 * k, background: color.paper }}>
          <MenuBar k={k} />
          <Toolbar k={k} />
          <div style={{ position: 'relative', width: MAC.width * k, height: MAC.page * k, overflow: 'hidden' }}>{children}</div>
          {/* The notch */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              width: 200 * k,
              height: 32 * k,
              marginLeft: -100 * k,
              borderRadius: `0 0 ${10 * k}px ${10 * k}px`,
              background: '#0c0c0e',
            }}
          />
          {/* Glass, and the screen dimmed while the lid is still low. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(160deg, #ffffff14, #ffffff00 40%), rgba(12,12,14,${(1 - open) * 0.85})`,
            }}
          />
        </div>
      </div>
      {/* The base, with the thumb notch in its front edge. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: lidHeight * k,
          width: baseWidth * k,
          height: baseHeight * k,
          borderRadius: `${4 * k}px ${4 * k}px ${22 * k}px ${22 * k}px`,
          background: 'linear-gradient(180deg, #4a4a4f 0%, #2b2b2f 35%, #1b1b1e 100%)',
          boxShadow: `0 ${40 * k}px ${60 * k}px -${20 * k}px #18181c66`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: 220 * k,
            height: 9 * k,
            marginLeft: -110 * k,
            borderRadius: `0 0 ${10 * k}px ${10 * k}px`,
            background: '#141416',
          }}
        />
      </div>
    </div>
  );
};
