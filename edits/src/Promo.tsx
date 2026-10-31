/*
  The promo: the logo, the site on a device, then how to reach us, over
  the music. Each scene overlaps the one before by a few frames, where
  they hand over. One timeline for every version (src/timeline.ts).
*/

import { Html5Audio, Series, staticFile } from 'remotion';
import type { Locale } from './brand';
import { LogoScene } from './scenes/LogoScene';
import { DeviceScene } from './scenes/DeviceScene';
import { ContactScene } from './scenes/ContactScene';
import { frames, type Device } from './timeline';

export const Promo = ({ locale, device }: { locale: Locale; device: Device }) => (
  <>
    <Series>
      <Series.Sequence durationInFrames={frames.logo}>
        <LogoScene locale={locale} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={frames.site} offset={-frames.logoToSite}>
        <DeviceScene locale={locale} device={device} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={frames.contact} offset={-frames.siteToContact}>
        <ContactScene locale={locale} />
      </Series.Sequence>
    </Series>
    <Html5Audio src={staticFile('sfx/music.wav')} volume={0.55} />
  </>
);
