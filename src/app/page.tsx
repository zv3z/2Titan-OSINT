import { redirect } from 'next/navigation';

// Middleware handles locale redirect, but this is a hard fallback.
export default function RootPage() {
  redirect('/en');
}
