import type { ReactNode } from 'react';
import Wordmark from './Wordmark';

/** A full-screen message: loading, setup steps, or why the door is shut. */
export default function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main className="notice">
      <Wordmark />
      <h1 className="notice__title">
        {title.replace(/[.…]$/, '')}
        <span className="dot">{title.endsWith('…') ? '…' : '.'}</span>
      </h1>
      {children && <div className="notice__body">{children}</div>}
    </main>
  );
}
