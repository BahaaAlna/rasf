# Rasf — dashboard

The admin dashboard: where the studio edits the site's content without
touching code. React + Vite, with Firebase for sign-in (Auth) and the
content itself (Firestore).

It manages the **whole site**: every section of the home page (site details,
navigation, hero, What is Rasf?, work, services, about, contact), the blog
page's words, and the **blog posts**. Each has an Arabic and an English
version. The sections are described in `src/content/sections.ts`; one form
draws itself from those descriptions.

The website (`../web`) reads all of it while it builds (`web/src/lib/firestore.ts`),
laid over its own text in `web/src/data`, so anything never saved here keeps
the site's wording, and a build never fails if Firestore can't be reached.
Because the site is built ahead of time, **saved changes go live the next time
the site is built**.

## Setting up Firebase (once)

1. **Create a project** at [console.firebase.google.com](https://console.firebase.google.com).
2. **Add a web app** to it (Project settings → General → Your apps). Copy
   `.env.example` to `.env.local` and fill in the values it shows you.
3. **Turn on sign-in:** Authentication → Sign-in method → Email/Password.
   Then add yourself under Authentication → Users. Nobody can sign up
   from the dashboard; every account is added here.
4. **Create the database:** Firestore Database → Create database.
5. **Make yourself an admin:** in Firestore, create a collection `admins`
   with one document whose ID is your user's UID (from Authentication →
   Users, or shown by the dashboard when you sign in). It needs no fields.
6. **Publish the security rules** in `firestore.rules`:

   ```sh
   npx firebase login
   npx firebase use --add      # pick your project; replaces the demo one in .firebaserc
   npm run deploy:rules
   ```

## Working on it

```sh
npm install
npm run dev                 # http://localhost:5173, against your Firebase project
```

To try it without a real project, run the local emulators in one terminal
and the dashboard in another. The Firestore emulator needs Java installed.

```sh
npm run emulators           # Auth on :9099, Firestore on :8080, UI on :4000
npm run dev:emulators
```

## Putting it online

`npm run deploy` builds the dashboard and publishes it on Firebase Hosting,
at `https://<project-id>.web.app`.
