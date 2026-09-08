# vrrdnt.dev

A static personal terminal with a vertical GitHub repository index and a Conway's
Game of Life field. Hosted on GitHub Pages, with no runtime framework or external
JavaScript dependencies.

## Local development

Requires Node.js 22 or newer.

```sh
npm run dev    # http://127.0.0.1:4173; reload after editing
npm run sync   # Refresh public GitHub metadata and commit summaries
npm test       # Conway behavior, project filtering, and pagination
npm run build  # Produce dist/, including the existing Vintage Story tools
```

The checked-in repository snapshot allows development and builds without GitHub
access. An optional GITHUB_TOKEN increases the sync script's API allowance. It is
read only by the Node script, never written to the snapshot or sent to browsers.

## Repository discovery

Edit data/project-settings.json:

- activeDays: default 90; active means non-archived and pushed within this window.
- excluded: names to omit from every view (empty by default).
- overrides: optional description, category, and featured values by repository.
- featured: true keeps an older, non-archived project in the active view.

Public forks are included and labeled. A push timestamp is repository activity,
not proof of the owner's authorship. Newly discovered repositories default to the
Other category. Search, filters, and counts are computed in the browser. The
archive includes older repositories and repositories archived on GitHub.

The deploy workflow refreshes on main pushes, manual dispatch, and a six-hour
schedule. It restores the last cached public snapshot before syncing and retains
it if GitHub is unavailable. If the workflow cache is absent, the checked-in copy
is available. The UI displays the snapshot timestamp and labels it cached after
24 hours. GitHub can delay scheduled runs and disables scheduled workflows in
public repositories after 60 days without repository activity; re-enable the
workflow when needed.

Commit summaries come from the default branches of the six most recently pushed
non-archived repositories. A default branch can contain an older commit than its
repository push date. Source and Releases links work without commit metadata.

## Interactions

life-core.js implements Conway B3/S23 with dead cells outside the finite boundary.
Two upper-left Gosper glider guns send gliders along parallel outward lanes.
There is no periodic random reseeding; clear removes the sources as well.
Visitors can add patterns through interaction:

- Scrolling emits gliders and lightweight spaceships at the entering entry's
  visible marker. Programmatic scrolling on initial deep-link load does not seed.
- Moving the pointer into a repository emits a glider at the pointer.
- Activating a repository emits at the click/tap, or its marker for keyboard use.
- Commands and filters emit at their controls. Explicit seed commands can place
  gliders, lightweight spaceships, pulsars, or R-pentominoes.

The field advances at most 16 generations per second and draws only on changes.
Live cells render as small crosses, squares, and dots. Ordered dithering makes
older activity progressively sparser, and dead-cell traces fade over 96
generations. Rendering age does not alter the simulation. Registration crosses,
calibration ticks, and a dithered header strip use the existing terminal palette.
Evolution stops when the tab is hidden or both cells and traces are empty. Reduced-motion
users start paused; pause preferences are stored locally. Manual seeds also work
while paused. Cells render behind text, with dark reading surfaces and opaque
terminal controls to protect legibility.

## Commands

```text
help
ls
ls --all
ls --archive
ls tools/vintage-story
find <text>
open <repository>
cd projects|tools|archive|about
cat about.txt
cat conway.txt
seed glider|spaceship|pulsar|pentomino|gun
pause
resume
clear
```

These are client-side site commands. Up/down recalls command history. Escape
dismisses command output. / or Ctrl/Cmd+K focuses the command input with find.
Native details panels support touch and keyboard access; project URLs use
#repo-NAME fragments.

## Deployment

.github/workflows/deploy.yaml uploads only dist/. Source scripts, tests, local
tool settings, and credentials are not published. Existing vs-tools/ pages and
assets are copied unchanged. Pull requests run tests and a static build without
publishing.
