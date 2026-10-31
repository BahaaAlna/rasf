/*
  Scene three: the ink ground opens out of the middle like a growing dot,
  and the way to reach us builds up line by line: the invitation, the
  email typing itself out (a key sound for each letter), Instagram and
  the site, a button, and the logotype at the foot.

  Upright, it is one column. Wide (the Mac version), the invitation sits
  on the start side and the details on the end side.
*/

import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { color, contact, copy, font, type Locale } from '../brand';
import { Logo } from '../Logo';
import { sec } from '../timeline';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const TYPE_FROM = sec(0.85);
const TYPE_EACH = 2;

export const ContactScene = ({ locale }: { locale: Locale }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const wide = width > height;
  const words = copy[locale];
  const rtl = locale === 'ar';
  const display = rtl ? font.display.ar : font.display.en;

  const open = interpolate(frame, [0, sec(0.45)], [0, 120], { ...clamp, easing: Easing.inOut(Easing.quad) });

  const rise = (start: number) => {
    const v = spring({ frame: frame - start, fps, config: { damping: 200 }, durationInFrames: sec(0.7) });
    return { opacity: v, transform: `translateY(${(1 - v) * 46}px)`, filter: `blur(${(1 - v) * 8}px)` };
  };

  const heading = words.heading.replace(/\.$/, '');
  const typed = Math.max(0, Math.min(contact.email.length, Math.floor((frame - TYPE_FROM) / TYPE_EACH) + 1));
  const caret = frame < TYPE_FROM + contact.email.length * TYPE_EACH + sec(0.8) && Math.floor(frame / sec(0.27)) % 2 === 0;

  const BUTTON = sec(1.75);
  const button = spring({ frame: frame - BUTTON, fps, config: { damping: 13, stiffness: 150 } });
  const LOGO = sec(2.1);

  const headline = (
    <p
      style={{
        margin: 0,
        fontFamily: display,
        fontWeight: rtl ? 600 : 500,
        fontSize: rtl ? (wide ? 190 : 210) : wide ? 136 : 150,
        lineHeight: rtl ? 1.05 : 0.95,
        letterSpacing: rtl ? 0 : '-0.04em',
        ...rise(sec(0.25)),
      }}
    >
      {heading}
      <span style={{ color: color.accent }}>.</span>
    </p>
  );

  const cta = (
    <div style={{ marginTop: wide ? 70 : 120, display: 'flex' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 20,
          padding: rtl ? '18px 56px 30px' : '30px 56px',
          fontFamily: display,
          fontSize: rtl ? 72 : 48,
          color: color.paper,
          background: color.accent,
          borderRadius: 999,
          transform: `scale(${button})`,
          transformOrigin: rtl ? 'right center' : 'left center',
        }}
      >
        {words.cta}
        <span style={{ fontFamily: font.display.en, fontSize: 48, transform: rtl ? 'scaleX(-1)' : undefined }}>→</span>
      </span>
    </div>
  );

  const details = (
    <div>
      <p
        style={{
          margin: '0 0 18px',
          fontFamily: rtl ? display : font.mono,
          fontSize: rtl ? 56 : 30,
          letterSpacing: rtl ? 0 : '0.12em',
          textTransform: 'uppercase',
          color: color.inkMuted,
          ...rise(sec(0.6)),
        }}
      >
        {words.emailLabel}
      </p>
      <p dir="ltr" style={{ margin: 0, fontFamily: font.display.en, fontSize: wide ? 76 : 84, letterSpacing: '-0.02em', textAlign: rtl ? 'right' : 'left', ...rise(sec(0.7)) }}>
        {contact.email.slice(0, typed)}
        <span style={{ opacity: caret ? 1 : 0, color: color.accent }}>|</span>
      </p>
      <div
        dir="ltr"
        style={{
          display: 'flex',
          justifyContent: rtl ? 'flex-end' : 'flex-start',
          gap: 48,
          marginTop: 48,
          whiteSpace: 'nowrap',
          fontFamily: font.mono,
          fontSize: 34,
          letterSpacing: '0.06em',
          color: color.paper,
          ...rise(sec(1.45)),
        }}
      >
        <span>
          <span style={{ color: color.inkMuted }}>IG</span> {contact.instagram}
        </span>
        <span>
          <span style={{ color: color.inkMuted }}>WEB</span> {contact.site}
        </span>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: color.ink, clipPath: `circle(${open}% at 50% 50%)` }}>
      <AbsoluteFill
        dir={rtl ? 'rtl' : 'ltr'}
        style={
          wide
            ? { padding: '0 150px 80px', display: 'grid', gridTemplateColumns: '1.15fr 1fr', alignItems: 'center', gap: 100, color: color.paper }
            : { padding: '0 96px', justifyContent: 'center', color: color.paper }
        }
      >
        {wide ? (
          <>
            <div>
              {headline}
              {cta}
            </div>
            {details}
          </>
        ) : (
          <>
            {headline}
            <div style={{ marginTop: 110 }}>{details}</div>
            {cta}
          </>
        )}
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: wide ? 10 : 40, ...rise(LOGO) }}>
        <Logo locale={locale} width={wide ? 340 : 420} light />
      </AbsoluteFill>

      {/* Sound */}
      <Html5Audio src={staticFile('sfx/impact.wav')} volume={0.75} />
      {[...contact.email].map((_, i) => (
        <Sequence key={i} from={TYPE_FROM + i * TYPE_EACH} durationInFrames={sec(0.1)}>
          <Html5Audio src={staticFile(`sfx/key-${i % 6}.wav`)} volume={0.28} />
        </Sequence>
      ))}
      <Sequence from={BUTTON} durationInFrames={sec(0.5)}>
        <Html5Audio src={staticFile('sfx/pop.wav')} volume={0.5} />
      </Sequence>
      <Sequence from={LOGO} durationInFrames={sec(2.2)}>
        <Html5Audio src={staticFile('sfx/shimmer.wav')} volume={0.25} />
      </Sequence>
    </AbsoluteFill>
  );
};
