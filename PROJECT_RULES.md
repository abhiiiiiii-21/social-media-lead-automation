PROJECT UI RULES (MANDATORY)

Follow these rules strictly throughout the project.

## Component Library

- ONLY use shadcn/ui components.
- NEVER create custom versions of components that already exist in shadcn/ui.
- If a required component is missing, install it using the shadcn CLI before using it.
- Reuse existing components whenever possible.
- Use Lucide React for icons ONLY.
- Never use Material UI, Chakra UI, Mantine, Ant Design, DaisyUI, Bootstrap, or any other UI library.

----------------------------------------------------

## Design Language

The design should resemble:

- Linear
- Vercel Dashboard
- Stripe Dashboard
- Raycast

Minimal.
Premium.
Professional.
Modern.

----------------------------------------------------

----------------------------------------------------

## Typography

Use ONLY the Geist font throughout the entire application.

Install using next/font/google.

Example:

import { Geist } from "next/font/google"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

Do NOT use:

- Poppins
- Montserrat
- Roboto
- Ubuntu
- Open Sans
- Nunito
- Inter (unless explicitly requested)

The entire application must use Geist as the primary font.

Never mix multiple font families.

----------------------------------------------------

## Typography Scale

Use a consistent typography system across the application.

Dashboard Title
- text-3xl
- font-bold
- tracking-tight

Page Title
- text-2xl
- font-semibold

Section Heading
- text-xl
- font-semibold

Card Title
- text-lg
- font-semibold

Table Header
- text-sm
- font-semibold

Body Text
- text-sm
- font-normal

Secondary Text
- text-xs
- text-muted-foreground

Button Text
- text-sm
- font-medium

Sidebar Items
- text-sm
- font-medium

Labels
- text-sm
- font-medium

----------------------------------------------------

## Font Weights

Use only these font weights:

400 → Normal

500 → Medium

600 → Semibold

700 → Bold

Avoid unnecessary font weights.

----------------------------------------------------

## Letter Spacing

Use tracking-tight only for:

- Dashboard Titles
- Large Statistics
- Hero Numbers

Do not apply tracking adjustments to normal body text.

----------------------------------------------------

## Numbers

Statistics should be visually prominent.

Examples:

- Total Leads
- Campaigns
- Response Rate
- Meetings
- Revenue

Use:

font-bold

tracking-tight

tabular numbers when appropriate.

----------------------------------------------------

## Typography Consistency

Every page in the application must use the exact same typography system.

Never introduce new font sizes unless absolutely necessary.

Always reuse the predefined typography scale.

Maintain consistent line heights, spacing, and font weights throughout the application.

----------------------------------------------------

## Theme

The application should ALWAYS use:

Black
White
Grey

Use only neutral colors.

Allowed Tailwind colors:

- zinc
- neutral
- slate (only when necessary)

Avoid colorful UI.

No blue buttons unless absolutely necessary.

No random accent colors.

No gradients unless specifically requested.

----------------------------------------------------

## Cards

Use shadcn Card.

Rounded-xl

Soft borders

Subtle shadows

Generous spacing

----------------------------------------------------

## Buttons

Always use shadcn Button.

Variants:

default

secondary

outline

ghost

destructive (only when needed)

Never create custom button styles.

----------------------------------------------------

## Inputs

Always use shadcn Input.

Use consistent spacing.

Use labels.

Use proper validation placeholders.

----------------------------------------------------

## Dialogs

Always use shadcn Dialog.

Never build custom modals.

----------------------------------------------------

## Dropdowns

Always use shadcn DropdownMenu.

----------------------------------------------------

## Tables

Always use TanStack Table.

Table UI should be built using shadcn Table components.

----------------------------------------------------

## Forms

Always use:

React Hook Form

Zod

shadcn Form

----------------------------------------------------

## Notifications

Always use Sonner.

Never use alert().

----------------------------------------------------

## Animations

Use Framer Motion only where it improves UX.

Animations should be subtle.

Fast.

Smooth.

Professional.

No flashy animations.

----------------------------------------------------

## Icons

Lucide React ONLY.

Use a consistent icon size.

----------------------------------------------------

## Layout

Large whitespace.

Consistent padding.

Consistent spacing.

Desktop-first.

Responsive.

----------------------------------------------------

## Code Quality

Use reusable components.

Never duplicate code.

Keep components small.

Prefer composition over repetition.

Always use TypeScript.

----------------------------------------------------

Before creating any custom UI component, check if shadcn/ui already provides it.

If it exists in shadcn/ui, use that component instead.

----------------------------------------------------

## Design System Lock

These design rules are permanent for the entire project.

Do not change the design language unless explicitly instructed.

Do not introduce new colors.

Do not introduce new fonts.

Do not introduce new component libraries.

Do not redesign existing components.

Always extend the existing design system instead of replacing it.

Before generating code, first check whether a similar component already exists in the project. If it does, reuse or extend it instead of creating a new one.

Maintain a consistent visual language across all pages, components, and future features.