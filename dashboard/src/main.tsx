import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { isConfigured } from './lib/config';
import ConnectFirebase from './layout/ConnectFirebase';
import './styles.css';

const root = createRoot(document.getElementById('root')!);

/*
  Firebase throws as it loads if there's no project to talk to, which
  would leave a blank page. So without one, show how to connect it; with
  one, load the app (and Firebase with it) only then.
*/
if (!isConfigured) {
  root.render(
    <StrictMode>
      <ConnectFirebase />
    </StrictMode>,
  );
} else {
  import('./Root').then(({ default: Root }) =>
    root.render(
      <StrictMode>
        <Root />
      </StrictMode>,
    ),
  );
}
