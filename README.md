# Digital Hallmark Dashboard

Next.js admin portal starter with Tailwind CSS and a responsive dashboard layout.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000

## Included pages

- `/` — login page (Firebase email/password authentication)
- `/dashboard` — admin dashboard overview (protected)
- `/users` — user management page (protected, displays digiluxUsers collection with pagination)
- `/products` — products listing page (protected, displays digilusData collection)

## Firebase setup

Create a `.env.local` file at the project root and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Then restart the dev server.

## Features

- Next.js App Router
- Tailwind CSS styling
- Responsive sidebar
- Analytics cards, order table, recent activity feed
