/*
  Contact's two small behaviours. Markup and styles live in Contact.astro.

  The form: there is no server behind it yet, so sending it writes an
  email in the visitor's own mail app — subject and body filled in from
  the form, addressed to the studio — and they press send there. Required
  fields are checked first, and nothing opens until they are filled.

  The copy button: puts the studio's email on the clipboard and says so
  for a moment — or, where the clipboard is refused, selects it.
*/

interface BodyLabels {
  name: string;
  email: string;
  need: string;
  budget: string;
  message: string;
}

/*
  Set up on every page load, not once: the ClientRouter swaps the whole
  document, and the previous page's listeners go with it.
*/
export function initContact() {
  const stop = new AbortController();
  document.addEventListener('astro:before-swap', () => stop.abort(), { once: true, signal: stop.signal });

  sendAsEmail(stop.signal);
  copyEmail(stop.signal);
}

function sendAsEmail(signal: AbortSignal) {
  const form = document.querySelector<HTMLFormElement>('[data-brief]');
  if (!form) return;

  form.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      // Show what's missing, and stop there, until the form is complete.
      form.dataset.tried = '';
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const text = (key: string) => String(data.get(key) ?? '').trim();
      const labels: BodyLabels = JSON.parse(form.dataset.body ?? '{}');
      const name = text('name');

      const body = [
        `${labels.name}: ${name}`,
        `${labels.email}: ${text('email')}`,
        `${labels.need}: ${data.getAll('need').join(', ') || '—'}`,
        `${labels.budget}: ${text('budget') || '—'}`,
        '',
        `${labels.message}:`,
        text('message') || '—',
      ].join('\n');
      const subject = (form.dataset.subject ?? '').replace('{name}', name);

      window.location.href =
        `mailto:${form.dataset.to}` + `?subject=${encodeURIComponent(subject)}` + `&body=${encodeURIComponent(body)}`;
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
