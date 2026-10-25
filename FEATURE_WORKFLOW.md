# MoneyMind — Feature Completion & GitHub Upload Workflow

Companion to `moneymind-react-spec.md`. Rule: **when a feature is finished, it is uploaded (pushed) to the `main` branch on GitHub.** One feature = one commit (or a small, tidy set of commits). Do not batch unrelated features.

## 1. Feature list (IDs from the PRD)

| ID | Feature | Commit scope |
|----|---------|--------------|
| F1 | Onboarding (3 slides, skip/next, first-launch gate) | `onboarding` |
| F2 | Home dashboard | `home` |
| F3 | Transactions list (groups, swipe actions, empty state) | `transactions` |
| F4 | Receipt scan | `scan` |
| F5 | Analytics | `analytics` |
| F6 | AI Chat | `chat` |
| F7 | Settings / Profile | `settings` |
| F8 | Transaction detail drawer | `drawer` |
| F9 | Export report sheet | `export` |
| F10 | Dark theme | `theme` |
| F11 | Accessibility layer | `a11y` |

Suggested build order: F10 (tokens/theme) → shell + nav → F8 → F3 → F2 → F4 → F5 → F6 → F7 → F9 → F1 → F11 polish.

## 2. "Definition of done" checklist (per feature)

A feature is finished only when all boxes are ticked:

- [ ] Matches the PRD functional requirements and acceptance criteria for that feature (e.g. `FR-HM-*` for Home).
- [ ] Uses the Style Guide tokens (no hard-coded colors, radii, shadows).
- [ ] Works in light and dark theme.
- [ ] Keyboard operable, visible focus ring, labels/roles per the spec, announcements via `useAnnounce`.
- [ ] Respects `prefers-reduced-motion`.
- [ ] No prototype-only items carried over (demo toggles, device frame, hard-coded timers) unless intentionally kept.
- [ ] Type-check, lint and tests pass locally.
- [ ] Open assumptions from the PRD (§10) touching this feature are either resolved or noted in the commit body.

## 3. Upload steps (run after the checklist is complete)

```bash
git checkout main
git pull --rebase origin main
git add -A
git commit -m "feat(<scope>): <short summary>" -m "Implements F<id>. Refs: FR-<area>-*"
git push origin main
```

Or use the helper script in this folder:

```bash
./ship-feature.sh F2 home "home dashboard with balance hero, budget and recent list"
```

The script refuses to push if there is nothing to commit, if you are not on `main`, or if lint/type-check/tests fail. It never force-pushes.

## 4. Commit message convention

```
feat(<scope>): <imperative summary, ≤ 72 chars>

Implements F<id> (<feature name>).
Covers: FR-XX-1, FR-XX-2
Notes: <assumptions or deviations from the spec>
```

Examples:

- `feat(home): add balance hero, budget card and recent transactions`
- `feat(theme): add light/dark tokens and persisted theme toggle`
- `fix(transactions): keep swipe row closed after delete`

Use `fix`, `refactor`, `docs`, `chore` for non-feature work.

## 5. Notes

- Pushing directly to `main` skips code review. If the repository has branch protection, push a branch `feat/<scope>` and open a pull request instead; the checklist is the same.
- Never commit secrets (API keys, Telegram bot tokens). Keep them in `.env` and make sure `.env` is in `.gitignore`.
- Remote name is assumed to be `origin`; change it in the script if different.
