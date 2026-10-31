/*
  Scene one: the letters write themselves in, in reading order, and the
  dot drops onto the end of the word with a bounce; the tagline settles
  underneath. Then everything leans in, softens and fades, handing over
  to the device.
*/

import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { color, copy, font, type Locale } from '../brand';
import { Logo } from '../Logo';
import { frames, sec } from '../timeline';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const DOT_FALL = sec(0.85);
const bounce = { damping: 10, stiffness: 120, mass: 0.8 };

/** The first frame the falling dot touches down, for the sound. */
function landing(fps: number) {
  for (let f = 0; f < fps * 2; f++) if (spring({ frame: f, fps, config: bounce }) >= 1) return f;
  return Math.round(fps * 0.3);
}

export const LogoScene = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const words = copy[locale];
  const end = frames.logo;

  const reveal = interpolate(frame, [sec(0.15), sec(1.0)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  const fall = spring({ frame: frame - DOT_FALL, fps, config: bounce });
  const dotLift = interpolate(fall, [0, 1], [460, 0]);
  const dot = interpolate(frame, [DOT_FALL, DOT_FALL + sec(0.08)], [0, 1], clamp);
  // A squash as it lands.
  const land = DOT_FALL + landing(fps);
  const squash = interpolate(frame, [land - 2, land, land + sec(0.15)], [1, 0.82, 1], clamp);

  const tagline = interpolate(frame, [sec(1.35), sec(1.85)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  // The hand-over: lean in, soften, fade.
  const out = interpolate(frame, [end - sec(0.6), end], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const scale = interpolate(frame, [0, end], [1, 1.05]) + out * 0.3;

  return (
    <AbsoluteFill style={{ background: color.paper, alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          transform: `scale(${scale})`,
          opacity: 1 - out,
          filter: `blur(${out * 14}px)`,
          display: 'grid',
          justifyItems: 'center',
        }}
      >
        <div style={{ transform: `scaleY(${squash})`, transformOrigin: '50% 60%' }}>
          <Logo locale={locale} width={Math.min(980, width * 0.9)} reveal={reveal} dot={dot} dotLift={dotLift} />
        </div>
        <p
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
          style={{
            margin: '-150px 0 0',
            fontFamily: locale === 'ar' ? font.display.ar : font.mono,
            fontSize: locale === 'ar' ? 64 : 34,
            letterSpacing: locale === 'ar' ? 0 : `${0.12 + (1 - tagline) * 0.2}em`,
            textTransform: 'uppercase',
            color: color.inkMuted,
            opacity: tagline,
            transform: `translateY(${(1 - tagline) * 24}px)`,
            filter: `blur(${(1 - tagline) * 8}px)`,
          }}
        >
          {words.tagline}
        </p>
      </div>

      <Sequence from={sec(0.1)} durationInFrames={sec(0.8)}>
        <Html5Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} />
      </Sequence>
      <Sequence from={land - 1} durationInFrames={sec(0.5)}>
        <Html5Audio src={staticFile('sfx/pop.wav')} volume={0.8} />
      </Sequence>
      <Sequence from={sec(1.35)} durationInFrames={sec(2.2)}>
        <Html5Audio src={staticFile('sfx/shimmer.wav')} volume={0.3} />
      </Sequence>
    </AbsoluteFill>
  );
};
