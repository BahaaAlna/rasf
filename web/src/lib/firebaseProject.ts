/*
  The Firebase project the site talks to: where the build reads the
  dashboard's content, and where the contact form sends messages.

  Neither value is a secret. Both ship to every visitor, as Firebase
  intends for web apps; the security rules (dashboard/firestore.rules)
  decide what anyone may read or write.
*/

export const PROJECT_ID = 'rasf-437ae';
export const API_KEY = 'AIzaSyCqxUSCJbO5AQ4YwKT9akg05GuMePpu5_o';

/** Firestore's REST address for this project's database. */
export const FIRESTORE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
