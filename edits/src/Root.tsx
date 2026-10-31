import { Composition } from 'remotion';
import { Promo } from './Promo';
import { FPS, total } from './timeline';

// Upright, for Reels, Stories and TikTok; wide for YouTube, LinkedIn and the site.
const upright = { width: 1080, height: 1920, fps: FPS, durationInFrames: total };
const wide = { width: 1920, height: 1080, fps: FPS, durationInFrames: total };

export const Root = () => (
  <>
    <Composition id="PhoneAr" component={Promo} {...upright} defaultProps={{ locale: 'ar' as const, device: 'phone' as const }} />
    <Composition id="PhoneEn" component={Promo} {...upright} defaultProps={{ locale: 'en' as const, device: 'phone' as const }} />
    <Composition id="IphoneAr" component={Promo} {...upright} defaultProps={{ locale: 'ar' as const, device: 'iphone' as const }} />
    <Composition id="IphoneEn" component={Promo} {...upright} defaultProps={{ locale: 'en' as const, device: 'iphone' as const }} />
    <Composition id="MacAr" component={Promo} {...wide} defaultProps={{ locale: 'ar' as const, device: 'mac' as const }} />
    <Composition id="MacEn" component={Promo} {...wide} defaultProps={{ locale: 'en' as const, device: 'mac' as const }} />
    <Composition id="MacReelAr" component={Promo} {...upright} defaultProps={{ locale: 'ar' as const, device: 'mac' as const }} />
    <Composition id="MacReelEn" component={Promo} {...upright} defaultProps={{ locale: 'en' as const, device: 'mac' as const }} />
  </>
);
