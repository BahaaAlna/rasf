import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getProjects, nameOf, saveProjects, type Project } from '../../lib/projects';

/*
  Every project, in the order the site shows it, numbered. Each opens on
  its own page to edit; Up and Down move it in the list, saved at once.
  The words around the projects (the Work section's intro and labels)
  are edited in Site › Work page.
*/

const CATEGORY = { software: 'Software', design: 'Designs' } as const;

/** example.com, from https://www.example.com/path. */
const host = (link: string) => {
  try {
    return new URL(link).host.replace(/^www\./, '');
  } catch {
    return link;
  }
};

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState('');
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    let live = true;
    getProjects()
      .then((stored) => live && setProjects(stored.projects))
      .catch(() => live && setError('Couldn’t load the projects. Check the connection.'));
    return () => {
      live = false;
    };
  }, []);

  async function move(from: number, to: number) {
    if (!projects) return;
    const next = [...projects];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setProjects(next);
    setMoving(true);
    setError('');
    try {
      await saveProjects(next);
    } catch {
      setError('Couldn’t save the new order. Check the connection, and that this account is an admin.');
      setProjects(projects);
    }
    setMoving(false);
  }

  return (
    <>
      <header className="screen__head">
        <div>
          <h1 className="screen__title">
            Projects<span className="dot">.</span>
          </h1>
          <p className="screen__lead">
            The work on the site, in the order it’s shown. Open one to edit it. The words around them are in{' '}
            <Link to="/content/work">Work page</Link>.
          </p>
        </div>
        <Link className="button" to="/projects/new">
          New project
        </Link>
      </header>

      {error && <p className="form__error">{error}</p>}
      {!projects && !error && <p className="empty">Loading…</p>}
      {projects && projects.length === 0 && <p className="empty">No projects yet. Add the first one.</p>}

      {projects && projects.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th className="mono table__num">No.</th>
              <th className="mono">Project</th>
              <th className="mono">Listed under</th>
              <th className="mono">Live</th>
              <th className="mono">Order</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr key={p.slug || i}>
                <td className="mono table__num">{String(i + 1).padStart(2, '0')}</td>
                <td>
                  <Link className="table__title" to={`/projects/${p.slug}`} dir="auto">
                    {nameOf(p)}
                  </Link>
                  <span className="table__sub mono">
                    {p.en.name && p.en.name !== nameOf(p) ? `${p.en.name} · ` : ''}/work/{p.slug}
                  </span>
                </td>
                <td className="mono">{CATEGORY[p.category]}</td>
                <td className="mono">
                  {p.link ? (
                    <a href={p.link} target="_blank" rel="noreferrer" className="table__link">
                      {host(p.link)}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <span className="item__tools">
                    <button
                      type="button"
                      className="chip"
                      disabled={moving || i === 0}
                      onClick={() => move(i, i - 1)}
                      aria-label={`Move ${nameOf(p)} up`}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="chip"
                      disabled={moving || i === projects.length - 1}
                      onClick={() => move(i, i + 1)}
                      aria-label={`Move ${nameOf(p)} down`}
                    >
                      Down
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
