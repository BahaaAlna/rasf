import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { site } from '../../../web/src/data/site';
import defaultShare from '../../../web/public/og-default.png';
import logoAr from '../../../web/src/assets/logo-ar.png';
import logoEn from '../../../web/src/assets/logo-en.png';
import type { Lang } from '../lib/posts';
import type { Project } from '../lib/projects';

/*
  How a project's link looks when it's shared: as a WhatsApp message and
  as a post on X, in the language being edited, from what's typed now.

  The picture is the site's own share card (web/src/lib/og.ts,
  projectCard) drawn again here in HTML at the same 1200 × 630 layout:
  the logo, the name and kind at the start, the project's picture whole
  at the end. The site draws the real one as it builds; a project whose
  picture isn't a photograph under /work/ shares the site's own picture,
  as it does here.
*/

/** The project pictures in the website's public folder, by their address on the site. */
const PICTURES = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>('../../../web/public/work/**/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' }),
  ).map(([file, url]) => [file.replace(/^.*\/web\/public/, ''), url]),
);

/** The same test as the site's (hasPhoto in web/src/lib/og.ts): a photograph gets a card of its own. */
const hasPhoto = (image: string) => /^\/work\/[^/]+\.(jpe?g|png|webp)$/i.test(image);

/** A picture by its address on the site: from the website's folder, or the live site if it isn't there. */
const pictureUrl = (image: string) => PICTURES[image] ?? `${site.url}${image}`;

const domain = site.url.replace(/^https?:\/\//, '');

interface Props {
  project: Project;
  lang: Lang;
}

export default function SharePreview({ project, lang }: Props) {
  const words = project[lang];
  const rtl = lang === 'ar';
  const path = `${lang === 'en' ? '/en' : ''}/work/${project.slug || '…'}`;
  const title = `${words.name || '…'} — ${site.name[lang]}`;
  const photo = hasPhoto(project.image.trim());

  if (!words.name.trim()) {
    return <p className="empty">Not shown in {lang === 'ar' ? 'Arabic' : 'English'} until it has a name in it.</p>;
  }

  const card = photo ? (
    <ShareCard name={words.name} kind={words.kind} image={pictureUrl(project.image.trim())} lang={lang} />
  ) : (
    <img className="share__default" src={defaultShare} alt="" />
  );

  return (
    <div className="share">
      <figure className="share__app">
        <figcaption className="share__label mono">WhatsApp</figcaption>
        <div className="wa">
          <div className="wa__bubble">
            <div className="wa__preview">
              <div className="wa__picture">{card}</div>
              <div className="wa__text" dir={rtl ? 'rtl' : 'ltr'}>
                <strong className="wa__title">{title}</strong>
                {words.summary && <span className="wa__desc">{words.summary}</span>}
                <span className="wa__domain">{domain}</span>
              </div>
            </div>
            <span className="wa__link">
              {site.url}
              {path}
            </span>
            <span className="wa__time">12:30 ✓✓</span>
          </div>
        </div>
      </figure>

      <figure className="share__app">
        <figcaption className="share__label mono">X</figcaption>
        <div className="x">
          <div className="x__card">
            {card}
            <span className="x__title" dir={rtl ? 'rtl' : 'ltr'}>
              {title}
            </span>
          </div>
          <span className="x__from">From {domain}</span>
        </div>
      </figure>
    </div>
  );
}

/**
 * The site's share card for a project, at its own 1200 × 630 layout, scaled
 * to its width: every size below is in the card's pixels (--px).
 */
function ShareCard({ name, kind, image, lang }: { name: string; kind: string; image: string; lang: Lang }) {
  const rtl = lang === 'ar';
  const cardRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  // As the site does: the name as large as fits in about three lines.
  const [size, setSize] = useState(58);

  useLayoutEffect(() => {
    setSize(58);
  }, [name, lang]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const el = nameRef.current;
    if (!card || !el || !card.clientWidth) return;
    const height = (el.offsetHeight * 1200) / card.clientWidth;
    const next = [50, 44, 38].find((s) => s < size);
    if (height > 170 && next) setSize(next);
  }, [size, name, lang]);

  return (
    <div ref={cardRef} className={`card${rtl ? ' card--rtl' : ''}`} dir={rtl ? 'rtl' : 'ltr'}>
      <img className="card__logo" src={rtl ? logoAr : logoEn} alt="" />
      <div className="card__words">
        <span ref={nameRef} className="card__name" style={{ '--size': size } as CSSProperties}>
          {name}
        </span>
        {kind && <span className="card__kind">{kind}</span>}
      </div>
      <span className="card__dot" />
      <img className="card__shot" src={image} alt="" />
    </div>
  );
}
