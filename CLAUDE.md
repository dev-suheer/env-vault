# Claude Safety Guidelines

## CRITICAL EXECUTION RESTRICTIONS
- NEVER execute, suggest, or plan any destructive commands such as `rm`, `rmdir`, `git clean`, or any file deletion scripts.
- NEVER run any operations referencing the home directory path (`~/`) or the root folder (`/`). You are strictly scoped to the active workspace project directory.
- You do not possess autonomous permissions for shell executions. Every single terminal operation or code rewrite must explicitly ask the user for confirmation.
- If you notice repetitive tasks, cleanups, or refactoring that involve deleting folders, HALT immediately, explain your plan to the user, and wait for confirmation. Do not try to automate it in a single pass.


Don't do browser check

# EnvVault codebase

EnvVault is a browser-only app for sharing `.env` files. There is no server. Accounts, workspaces, projects, env files, and notifications live in `localStorage`. The signed-in email lives in `sessionStorage`.

`env-vault.html` at the repo root is the original single-file demo and the visual source of truth. The Next.js app must keep that look: Manrope, JetBrains Mono, brand green, canvas/ink/line colors, dotted background, and dark mode via the `dark` class on `<html>`. Do not restyle the product onto the default shadcn/Geist theme. `src/components/ui/button.tsx` is leftover shadcn and is not used by the screens.

## Stack

- Next.js App Router (`src/app`), React, TypeScript, Tailwind CSS 4
- Path alias `@/*` → `src/*`
- `src/app` only owns routes and layouts. Feature code lives in `src/modules/<name>`
- Shared data, permissions, and class strings live in `src/lib`
- Shared visual pieces live in `src/components/brand`

## Product flow

1. A project manager creates a **workspace**.
2. The project manager creates a **project** inside that workspace.
3. Env files are created **inside that project**.
4. Devs also have **personal envs** on My envs. Those are private and are not inside a workspace or project.

People in a workspace can open its projects and add envs. Only the workspace project manager (and admin) can create or delete projects, invite or remove devs, and delete the workspace.

Older data that had envs attached directly to a workspace is grouped into a project named General on load. Do not drop those envs.

## Roles

| Role | Home | Can do |
|---|---|---|
| Dev | `/envs` | Personal envs, join workspaces by invite, create envs inside projects they can access |
| Project manager | `/workspaces` | Create workspaces and projects, invite devs, edit envs they own or that sit in a workspace they own |
| Admin | `/dashboard` | Dashboard with counts, an activity chart, member access, and the busiest workspaces. Also the workspace list and the Users page. No notification bell. Cannot create workspaces. There is one admin, the seed account. Signup and user edit cannot create another admin |

Demo accounts, password `demo1234`: `admin@gmail.com`, `pm@gmail.com`, `dev1@gmail.com`, `dev2@gmail.com`.

Permission checks are in `src/lib/permissions.ts`: `inWs`, `manages`, `canCreateIn`, `canView`, `canEdit`. A personal env is visible and editable only by its owner. A project env is visible to anyone in that workspace. It is editable by its owner, that workspace's project manager, an admin, or a member whose invite access is Edit (`workspace.editors`). View members can still show, copy, and download values, and can edit env files they created. The project manager picks View or Edit when inviting, and can change it later on the Members tab. Older members with no stored access load as View.

## Routes

| Route | Screen |
|---|---|
| `/` | Sign in / sign up when logged out. Redirects by role when logged in. Sign in links to forgot password |
| `/forgot` | Request a password reset code for an email on this browser |
| `/forgot/verify` | Enter the 6-digit code. The demo shows the code on the screen because there is no email server |
| `/forgot/reset` | Choose a new password after the code is verified |
| `/envs` | Dev personal env list |
| `/envs/[envId]` | Env editor |
| `/workspaces` | Workspace list |
| `/workspaces/[workspaceId]` | Projects and Members tabs. Audit tab for the workspace project manager and admin |
| `/workspaces/[workspaceId]/projects/[projectId]` | Envs in that project |
| `/dashboard` | Admin dashboard. Counts, activity chart, member access, busiest workspaces, latest changes |
| `/users` | Admin user list. The admin account is hidden. Tabs are All, Project Managers, and Users. Clicking a row opens that user's detail page. The edit icon still opens name, role, and status. Role choices are Project Manager or Dev. An admin cannot change their own role or deactivate themselves. Inactive accounts cannot sign in |
| `/users/[email]` | Admin user detail. Profile, sign-up date, last login, last login device, linked workspaces, up to 3 env files, a login line chart (week, month, or year), and that user's audit log. The email in the path is encoded. The admin account is not opened from here |
| `/users/[email]/envs` | Every env file that user created, opened from View all when there are more than 3 |
| `/profile` | Account page, linked from the header menu. Details tab saves name, phone, and photo. Password tab checks the current password, then the new one and a confirmation. Email and role are read-only |

Navigation between levels is the breadcrumb in `src/components/brand/crumbs.tsx` (Workspaces / workspace / project / env). Do not bring back the plain `← Back` text link.

## Storage and state

- Database key: `envvault_db2` (`src/lib/db.ts`). `audits` records workspace changes (who, action, subject, detail, time). Variable values are not written into the log. Older databases get an empty `audits` list on load
- Session key: `envvault_session` (`src/modules/auth/lib/session.ts`). Password reset codes live in `envvault_reset` for 10 minutes (`src/modules/auth/lib/reset.ts`)
- Theme key: `envvault_theme` (`src/modules/theme/lib/theme.ts`)
- Client state is `src/lib/store.tsx` (`Providers`, `useVault`). It hydrates with `useSyncExternalStore` and syncs across tabs on the `storage` event
- Types are in `src/lib/types.ts`: `User`, `Workspace`, `Project`, `EnvFile`, `Notification`. A user also stores `created`, `lastLogin`, `lastDevice`, and `logins` (sign-in times from the last 400 days). Older accounts load those as empty until the next sign-up or sign-in. Login writes the time and a short browser label such as Chrome on macOS
- An env's `ws` is the workspace id, or `null` for a personal env. `project` is the project id, or `null` for a personal env
- Passwords are plaintext. This is a demo, not real auth
- Ids come from `uid()` in `src/lib/format.ts`

## UI rules already settled

- Theme tokens, dotted background, `.surface`, `.btn-p`, and `.tab-scroll` are in `src/app/globals.css`. Tab rows use `.tab-scroll` so they can slide sideways without a vertical scrollbar
- Buttons, links, and labels use a pointer cursor from global CSS
- Dropdowns are in-app menus (`SelectMenu`, `InviteDevField`), not native `<select>`, `<datalist>`, or the browser address list
- Delete env, delete project, and delete workspace use `ConfirmDialog`, not `window.confirm`
- Download must save a file named `.env`. Chrome and Edge use the save picker so the leading dot is kept
- Env cards and workspace cards keep the original single footer row (count, time, owner, view-only on one line). Do not split that footer into stacked rows
- Variable values stay masked until Show or Reveal all. Reveal state is local to the editor and clears when you leave the page
- Import accepts pasted `.env` text or a file. Existing keys are updated. Export quotes values that contain space, `#`, `"`, or `'`
- The header account menu links to Profile and Sign out. Admins do not see the notification bell