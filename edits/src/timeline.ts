/*
  The promo's timing, shared by every version (and by scripts/sounds.mjs,
  which times the music to it): seconds in timeline.json, frames here.

  The device scene lasts as long as its recording, plus a lead-in while
  the device arrives and a short tail under the hand-over.
*/

import tl from './timeline.json';
import iphoneAr from '../public/rec/iphone-ar.json';
import iphoneEn from '../public/rec/iphone-en.json';
import macAr from '../public/rec/mac-ar.json';
import macEn from '../public/rec/mac-en.json';
import type { Locale } from './brand';

export type Device = 'phone' | 'iphone' | 'mac';

export const FPS = tl.fps;
export const sec = (s: number) => Math.round(s * FPS);

export interface Recording {
  fps: number;
  frames: number;
  width: number;
  height: number;
  stops: { id: 'hero' | 'work' | 'services' | 'about' | 'contact'; frame: number }[];
  swipes: { start: number; end: number }[];
  clicks: number[];
}

const recordings: Record<string, Recording> = {
  'iphone-ar': iphoneAr as Recording,
  'iphone-en': iphoneEn as Recording,
  'mac-ar': macAr as Recording,
  'mac-en': macEn as Recording,
};

/** The plain phone shows the iPhone's recording. */
export const recordingFor = (device: Device, locale: Locale) => {
  const name = `${device === 'mac' ? 'mac' : 'iphone'}-${locale}`;
  return { name, ...recordings[name] };
};

export const frames = {
  logo: sec(tl.logo),
  logoToSite: sec(tl.logoToSite),
  siteLead: sec(tl.siteLead),
  site: sec(tl.siteLead) + recordings['iphone-en'].frames + sec(tl.siteTail),
  siteToContact: sec(tl.siteToContact),
  contact: sec(tl.contact),
};

export const total = frames.logo + frames.site + frames.contact - frames.logoToSite - frames.siteToContact;
