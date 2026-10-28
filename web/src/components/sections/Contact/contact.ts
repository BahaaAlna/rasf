/*
  Contact's two small behaviours. Markup and styles live in Contact.astro.

  The form: sending it saves the message straight into Firestore, where
  it arrives in the dashboard's Messages. Required fields are checked
  first. A hidden field catches bots, and the security rules accept only
  a message of the right shape and size. If it can't be sent, the page
  says so and points to the email address instead.

  The copy button: puts the studio's email on the clipboard and says so
  for a moment — or, where the clipboard is refused, selects it.

  The wheel: starts just under the location line. CSS alone can't place
  the section's own edge-to-edge layer level with a line inside the
  column, so its top is measured here and handed over as --wheel-top.
*/

import { API_KEY, FIRESTORE, PROJECT_ID } from '../../../lib/firebaseProject';

/*
  Set up on every page load, not once: the ClientRouter swaps the whole
  document, and the previous page's listeners go with it.
*/
export function initContact() {
  const stop = new AbortController();
  document.addEventListener('astro:before-swap', () => stop.abort(), { once: true, signal: stop.signal });

  sendMessage(stop.signal);
  copyEmail(stop.signal);
  placeWheel(stop.signal);
}

function placeWheel(signal: AbortSignal) {
  const section = document.querySelector<HTMLElement>('#contact');
  const line = section?.querySelector<HTMLElement>('[data-wheel-start]');
  if (!section || !line) return;

  // offsetTop is laid-out position, so the reveal's rise doesn't skew it.
  // It counts from the nearest offsetParent, which may sit inside the
  // section, so add them up until the section itself.
  const place = () => {
    let top = line.offsetHeight;
    for (let el: HTMLElement | null = line; el && el !== section; el = el.offsetParent as HTMLElement | null) {
      top += el.offsetTop;
    }
    section.style.setProperty('--wheel-top', `${top}px`);
  };
  const watch = new ResizeObserver(place);
  watch.observe(section);
  signal.addEventListener('abort', () => watch.disconnect());
}

/** A random document id, the way Firestore makes its own. */
const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);

const str = (value: string) => ({ stringValue: value });

function sendMessage(signal: AbortSignal) {
  const form = document.querySelector<HTMLFormElement>('[data-brief]');
  const status = form?.querySelector<HTMLElement>('[data-status]');
  if (!form || !status) return;

  const say = (state: 'sending' | 'sent' | 'failed' | null) => {
    if (state) form.dataset.state = state;
    else delete form.dataset.state;
    status.textContent = state ? (form.dataset[state] ?? '') : '';
  };

  form.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();
      if (form.dataset.state === 'sending') return;
      // Show what's missing, and stop there, until the form is complete.
      form.dataset.tried = '';
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const text = (key: string) => String(data.get(key) ?? '').trim();

      // Only bots fill the hidden field: thank them, and send nothing.
      if (text('website')) {
        form.reset();
        say('sent');
        return;
      }

      say('sending');
      const fields = {
        name: str(text('name')),
        email: str(text('email')),
        needs: { arrayValue: { values: data.getAll('need').map((need) => str(String(need))) } },
        message: str(text('message')),
        locale: str(form.dataset.locale ?? 'ar'),
        read: { booleanValue: false },
      };

      try {
        // A commit rather than a plain create, so Firestore stamps the time
        // itself; the rules check that stamp, and the shape of the rest.
        const response = await fetch(`${FIRESTORE}:commit?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            writes: [
              {
                update: { name: `projects/${PROJECT_ID}/databases/(default)/documents/messages/${newId()}`, fields },
                updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
                currentDocument: { exists: false },
              },
            ],
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error(String(response.status));
        form.reset();
        delete form.dataset.tried;
        say('sent');
      } catch {
        say('failed');
      }
    },
    { signal },
  );

  // Typing again clears an old "sent" or "failed".
  form.addEventListener(
    'input',
    () => {
      if (form.dataset.state === 'sent' || form.dataset.state === 'failed') say(null);
    },
    { signal },
  );
}

function copyEmail(signal: AbortSignal) {
  const button = document.querySelector<HTMLButtonElement>('[data-copy]');
  if (!button) return;
  const label = button.textContent ?? '';
  let timer = 0;

  button.addEventListener(
    'click',
    async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
      } catch {
        // No clipboard (an insecure page, or refused): select the address
        // beside the button instead, so one keystroke copies it.
        const address = button.parentElement?.querySelector('a');
        if (address) window.getSelection()?.selectAllChildren(address);
        return;
      }
      button.textContent = button.dataset.copiedText ?? label;
      button.dataset.done = '';
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.textContent = label;
        delete button.dataset.done;
      }, 1800);
    },
    { signal },
  );
}
