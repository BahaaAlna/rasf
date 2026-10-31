/*
  Scene two: a device arrives with the site open on it, and plays the
  recording from scripts/record.mjs: the page scrolling from section to
  section, as a visitor sees it. Above it, the address and the name of
  the section in view.

  The phones rise into frame; the Mac's lid swings open. While the
  device arrives the recording holds on its first frame. On the phones
  a fingertip shows each swipe; on the Mac the site's own cursor is in
  the recording. The camera drifts in slowly, and a little more on
  Contact. A swell at the end climbs into the next scene.
*/

import {
  AbsoluteFill,
  Easing,
  Freeze,
  Html5Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { color, contact, copy, font, type Locale } from '../brand';
import { IPhone, iphoneOuter, IPHONE } from '../devices/IPhone';
import { MacBook, macOuter } from '../devices/MacBook';
import { Phone, phoneOuter } from '../devices/Phone';
import { frames, recordingFor, sec, type Device } from '../timeline';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/*
  Video pixels per point, where the device's top sits, and where the
  label above it sits. The Mac in an upright frame is drawn so its screen
  spans the frame's width and the base runs off both sides; the name of
  the section sits above it and the address below (`pill`).
*/
const fit: Record<string, { k: number; top: number; label: number; focus: number; pill?: number }> = {
  phone: { k: 1.86, top: 330, label: 92, focus: 0.06 },
  iphone: { k: 1.7, top: 318, label: 92, focus: 0.06 },
  mac: { k: 0.75, top: 192, label: 62, focus: 0.07 },
  macUpright: { k: 0.7, top: 640, label: 440, focus: 0.05, pill: 1500 },
};

const Fingertip = ({ swipes, lead, k, frame }: { swipes: { start: number; end: number }[]; lead: number; k: number; frame: number }) => (
  <>
    {swipes.map((s) => {
      const t = frame - (lead + s.start - sec(0.1));
      const span = sec(0.45);
      if (t < 0 || t > span) return null;
      const p = t / span;
      const drag = Easing.out(Easing.cubic)(Math.min(1, p / 0.75));
      const alpha = interpolate(p, [0, 0.12, 0.7, 1], [0, 1, 1, 0]);
      const press = interpolate(p, [0, 0.12], [1.3, 1], clamp);
      return (
        <div
          key={s.start}
          style={{
            position: 'absolute',
            left: IPHONE.width * 0.58 * k - 30 * k,
            top: (560 - 300 * drag) * k,
            width: 60 * k,
            height: 60 * k,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #18181c38 0%, #18181c22 60%, #18181c00 72%)',
            boxShadow: `0 0 0 ${1.5 * k}px #ffffffaa`,
            opacity: alpha,
            transform: `scale(${press})`,
          }}
        />
      );
    })}
  </>
);

export const DeviceScene = ({ locale, device }: { locale: Locale; device: Device }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const wide = width > height;
  const rec = recordingFor(device, locale);
  const words = copy[locale];
  const lead = frames.siteLead;
  const { k, top, label: labelTop, focus: closer, pill } = fit[device === 'mac' && !wide ? 'macUpright' : device];
  const outer = device === 'mac' ? macOuter(k) : device === 'iphone' ? iphoneOuter(k) : phoneOuter(k);

  // Arriving: smooth, no bounce.
  const arrive = spring({ frame, fps, config: { damping: 200 }, durationInFrames: sec(1.0) });
  const open = interpolate(frame, [sec(0.15), sec(1.05)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const fadeIn = interpolate(frame, [0, frames.logoToSite], [0, 1], clamp);

  // The camera: a slow push in, and a little more once the page reaches Contact.
  const contactAt = lead + (rec.stops.find((s) => s.id === 'contact')?.frame ?? rec.frames);
  const push = interpolate(frame, [0, frames.site], [1, 1.035]);
  const focus = interpolate(frame, [contactAt - sec(0.3), contactAt + sec(1.2)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const camera = push * (1 + focus * closer);

  // The section in view, switching as the page gets there.
  const current = [...rec.stops].reverse().find((s) => frame >= lead + s.frame - sec(0.45)) ?? rec.stops[0];
  const since = frame - (lead + current.frame - sec(0.45));
  const label = current === rec.stops[0] ? arrive : interpolate(since, [0, sec(0.3)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  const screen = {
    width: rec.width * k,
    height: rec.height * k,
  };
  const video = <OffthreadVideo src={staticFile(`rec/${rec.name}.mp4`)} muted style={{ display: 'block', ...screen }} />;
  const page = (
    <>
      {frame < lead ? <Freeze frame={0}>{video}</Freeze> : <Sequence from={lead}>{video}</Sequence>}
      {device !== 'mac' && <Fingertip swipes={rec.swipes} lead={lead} k={k} frame={frame} />}
    </>
  );

  const rise = device === 'mac' ? (1 - arrive) * 140 : (1 - arrive) * 1500;
  const tilt = device === 'mac' ? 0 : (1 - arrive) * 9;
  const display = locale === 'ar' ? font.display.ar : font.display.en;

  const address = (
    <span
      style={{
        padding: '10px 26px',
        fontFamily: font.mono,
        fontSize: 28,
        letterSpacing: '0.08em',
        color: color.ink,
        border: `2px solid ${color.rule}`,
        borderRadius: 999,
      }}
    >
      <span style={{ color: color.accent }}>●</span> {contact.site}
    </span>
  );

  return (
    <AbsoluteFill style={{ background: color.paper, opacity: fadeIn }}>
      <div
        style={{
          position: 'absolute',
          top: labelTop,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: wide ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: wide ? 28 : 18,
          opacity: arrive,
        }}
      >
        {pill === undefined && address}
        <span
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
          style={{
            minWidth: wide ? 360 : undefined,
            textAlign: wide ? (locale === 'ar' ? 'right' : 'left') : 'center',
            fontFamily: display,
            fontWeight: locale === 'ar' ? 600 : 500,
            fontSize: locale === 'ar' ? (wide ? 84 : 96) : wide ? 64 : 76,
            lineHeight: 1,
            letterSpacing: locale === 'ar' ? 0 : '-0.03em',
            color: color.ink,
            opacity: label,
            transform: `translateY(${(1 - label) * 22}px)`,
            filter: `blur(${(1 - label) * 6}px)`,
          }}
        >
          {words.sections[current.id]}
          <span style={{ color: color.accent }}>.</span>
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          top,
          left: (width - outer.width) / 2,
          // Grow downward, away from the label above; the wide-screen Mac
          // in an upright frame grows evenly, as it has room both ways.
          transformOrigin: pill === undefined ? '50% 15%' : '50% 50%',
          transform: `translateY(${rise}px) rotate(${tilt}deg) scale(${camera})`,
        }}
      >
        {device === 'mac' ? (
          <MacBook k={k} open={open}>
            {page}
          </MacBook>
        ) : device === 'iphone' ? (
          <IPhone k={k}>{page}</IPhone>
        ) : (
          <Phone k={k}>{page}</Phone>
        )}
      </div>

      {pill !== undefined && (
        <div style={{ position: 'absolute', top: pill, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: arrive }}>
          {address}
        </div>
      )}

      {/* Sound */}
      <Html5Audio src={staticFile('sfx/whoosh-long.wav')} volume={0.55} />
      {device === 'mac' && (
        <Sequence from={sec(0.95)} durationInFrames={sec(0.5)}>
          <Html5Audio src={staticFile('sfx/click.wav')} volume={0.35} />
        </Sequence>
      )}
      {rec.swipes.map((s) => (
        <Sequence key={s.start} from={lead + s.start - sec(0.05)} durationInFrames={sec(0.5)}>
          <Html5Audio src={staticFile(device === 'mac' ? 'sfx/whoosh.wav' : 'sfx/swipe.wav')} volume={device === 'mac' ? 0.16 : 0.5} />
        </Sequence>
      ))}
      {rec.clicks.map((c) => (
        <Sequence key={c} from={lead + c} durationInFrames={sec(0.3)}>
          <Html5Audio src={staticFile('sfx/click.wav')} volume={0.7} />
        </Sequence>
      ))}
      <Sequence from={frames.site - frames.siteToContact - sec(1.4)} durationInFrames={sec(1.5)}>
        <Html5Audio src={staticFile('sfx/riser.wav')} volume={0.45} />
      </Sequence>
    </AbsoluteFill>
  );
};
