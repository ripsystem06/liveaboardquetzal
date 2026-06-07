# Proposal: perspective-transitions

## Intent

Apply Olivier Larose's sticky perspective section transitions to the home page landing flow (Hero → DestinationSection), creating a cinematic scroll experience with scale and rotate transforms. This is a visual enhancement to increase engagement and perceived quality.

## Scope

### In Scope
- Install `framer-motion` and `@studio-freight/lenis`
- Hero section: sticky wrapper with scale (1→0.8) + rotate (0→-5deg) transform
- DestinationSection: sticky transition entry with matching scroll-driven behavior
- Lenis smooth scroll integration on the home page
- Mobile disable (< 768px): standard scroll, no sticky transforms
- Remove `bg-fixed` class from DestinationSection (conflicts with sticky transforms)

### Out of Scope
- Other home page sections (MarineLife, DestinationsGrid, UpcomingTrips, Testimonials, ScrollGallery, ContactForm)
- Booking page or account page
- ContactForm sticky elements

## Capabilities

### New Capabilities
- `perspective-transition`: Scroll-driven sticky section transitions with scale/rotate transforms on the Hero and DestinationSection

### Modified Capabilities
- None (pure visual enhancement, no spec-level behavior change)

## Approach

1. **Install dependencies**: `framer-motion`, `@studio-freight/lenis`
2. **Wrap Hero section**: Use `useScroll` + `useTransform` on a motion div with sticky positioning
3. **Wrap DestinationSection**: Match scroll timing for seamless transition
4. **Container height**: Extend page height to provide scroll room for transforms
5. **Lenis integration**: Initialize in layout; skip on mobile
6. **Mobile fallback**: Detect `window.innerWidth < 768` → standard scroll, no transforms

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/page.tsx` | Modified | Hero + DestinationSection sticky wrappers, Lenis init |
| `components/home/Hero.tsx` | Modified | Add motion wrapper with scroll transforms |
| `components/home/DestinationSection.tsx` | Modified | Remove `bg-fixed`, add motion wrapper |
| `package.json` | Modified | Add `framer-motion`, `lenis` |
| `tailwind.config.ts` | Modified | If needed for custom scroll behavior |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `bg-fixed` removal breaks existing bg behavior | Medium | Verify DestinationSection bg renders correctly without class; test on all breakpoints |
| Scroll conflicts with existing animations | Low | Target only Hero→DestinationSection; other sections unchanged |
| Mobile performance with Lenis | Low | Disable Lenis + transforms below 768px |

## Rollback Plan

1. Remove `framer-motion` and `lenis` from `package.json`
2. Revert Hero.tsx and DestinationSection.tsx to previous versions
3. Restore `bg-fixed` class on DestinationSection
4. Remove Lenis initialization from page.tsx

## Dependencies

- `framer-motion` (^11.x)
- `@studio-freight/lenis` (^1.x)

## Success Criteria

- [ ] Hero section scales from 1→0.8 and rotates 0→-5deg during scroll through transition zone
- [ ] DestinationSection enters with matching transform timing
- [ ] Smooth scroll works on desktop via Lenis
- [ ] Mobile (< 768px) shows standard scroll with no visual glitches
- [ ] `bg-fixed` conflict resolved — DestinationSection bg renders correctly
- [ ] No regressions in other home page sections