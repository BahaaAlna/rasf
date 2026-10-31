/*
  The plain phone from the first draft: a black slab with rounded corners,
  nothing else, so the page is all there is to look at. It shows the
  iPhone's recording (393 × 724), sizes in points times `k`.
*/

import type { ReactNode } from 'react';
import { color } from '../brand';

export const PHONE = { width: 393, height: 724, bezel: 11, radius: 38 };

export const phoneOuter = (k: number) => ({
  width: (PHONE.width + 2 * PHONE.bezel) * k,
  height: (PHONE.height + 2 * PHONE.bezel) * k,
});

export const Phone = ({ k, children }: { k: number; children: ReactNode }) => (
  <div
    style={{
      padding: PHONE.bezel * k,
      background: color.ink,
      borderRadius: (PHONE.radius + PHONE.bezel) * k,
      boxShadow: `0 ${30 * k}px ${60 * k}px -${20 * k}px #18181c55`,
    }}
  >
    <div
      style={{
        position: 'relative',
        width: PHONE.width * k,
        height: PHONE.height * k,
        overflow: 'hidden',
        borderRadius: PHONE.radius * k,
        background: color.paper,
      }}
    >
      {children}
    </div>
  </div>
);
