/**
 * Example: replacing a regular <Link> with <TransitionLink>
 *
 * Before:
 *   import Link from 'next/link';
 *   <Link href="/services">Services</Link>
 *
 * After:
 *   import { TransitionLink } from '@/components/transitions';
 *   <TransitionLink href="/services">Services</TransitionLink>
 *
 * TransitionLink accepts all standard <a> attributes — className, style,
 * aria-label, etc. — so existing styled Link wrappers need minimal changes.
 *
 * You do NOT need to wrap every link. Apply TransitionLink selectively to:
 *   - Main nav items
 *   - Section-level CTAs ("Book Appointment", "View Services")
 *   - Prominent cards that navigate to a detail page
 *
 * Inline links in body copy, footer utility links, and breadcrumbs
 * can stay as plain <a> or <Link> — the transition is a premium gesture,
 * not a universal rule.
 */

import { TransitionLink } from '@/components/transitions';

export function ExampleNav() {
  return (
    <nav>
      <TransitionLink href="/" className="nav-link">
        Home
      </TransitionLink>
      <TransitionLink href="/services" className="nav-link">
        Services
      </TransitionLink>
      <TransitionLink href="/gallery" className="nav-link">
        Gallery
      </TransitionLink>
      <TransitionLink href="/book" className="btn-gold">
        Book Appointment
      </TransitionLink>
    </nav>
  );
}
