# Git Worktrees

> A deep dive into git worktrees: how they actually work under the hood, the full command surface, and the workflow I use to run multiple AI agents like Claude Code in parallel without them stepping on each other.

- URL: https://pulkit.blog/git-worktrees/
- Published: May 29, 2026
- Tags: Git, Git Worktrees, AI, Agents, Claude Code, Workflow, Developer Tools, Productivity

I work at [Noveum.ai](https://noveum.ai), a small, fast-moving startup. On a normal day I'll be deep in a new feature, an agent grinding through a refactor in the background, and then it happens: something breaks in prod. Or a customer hits a bug we need fixed in the next hour. Or a tiny config change has to ship *right now*.

So I have to drop everything and context switch. And for the longest time, the way I handled that switch was bad. Really bad.

I'd either:

1. **Stash my work**, switch branches, fix the thing, switch back, `git stash pop`, and pray nothing got mangled, or
2. **Sit and wait** for my long-running agent task to finish before I touched anything, or
3. **Clone the whole repo into a second folder**, then hand-copy over all the `.env` and config files that aren't tracked by git, just to have a clean place to do the hotfix.

All three are bad in their own way. Stashing throws away your dev server, your build cache, and your train of thought. Waiting is just... waiting. And cloning the repo twice means a second multi-gigabyte download, a second `node_modules`, a second set of remotes to fetch, manually copying every untracked `.env` and config file across, and two copies of history that drift apart.

Then I properly learned **git worktrees**, and the whole problem dissolved. Now I keep my feature work exactly where it is, agent and all, and spin up a separate, clean checkout for the hotfix in seconds, sharing the same `.git`. No stashing. No waiting. No second clone.

I genuinely think this is one of the biggest unlocks for anyone working with AI agents today, and almost nobody I talk to uses it. So this is the post I wish I'd read. We're going to go deep: what a worktree actually *is* on disk, the full command surface, the gotchas, and the exact workflow I use to run multiple [Claude Code](https://code.claude.com) sessions in parallel.

## TL;DR

- A **git worktree** lets you check out multiple branches into multiple directories at the same time, all backed by **one** shared `.git`. One clone, many working directories.
- It's not a second clone. The object database, refs, and config are shared. You `git fetch` once and every worktree sees it. The only extra cost is the checked-out files.
- The core command is `git worktree add ../some-dir -b some-branch`. Then `cd` into it and it behaves like a normal repo.
- This is the perfect substrate for AI agents: each agent gets its **own** working directory and branch, so they never clobber each other's files. One agent can refactor for 20 minutes in worktree A while you ship a hotfix in worktree B.
- **Claude Code has this built in**: `claude --worktree <name>` spins up an isolated worktree per session, and subagents can run with `isolation: worktree` so parallel agents stay sandboxed.
- The two things that bite everyone: a fresh worktree has **no `node_modules` and no `.env`** (they aren't in git), and **you can't check out the same branch in two worktrees**. We'll handle both.

## First, the mental model

Before any commands, you need the right picture in your head, because once you have it, every quirk of worktrees makes sense.

A normal Git repository has two parts that we usually think of as one thing:

1. **The repository** itself, the `.git` directory: the object database (every commit, tree, and blob), your refs (branches, tags, remotes), and config.
2. **The working tree**: the actual checked-out files you edit, plus a `HEAD` (what's checked out) and an `index` (the staging area).

When you `git clone`, you get exactly one of each, glued together. The mental leap with worktrees is realizing **a single repository can have many working trees attached to it at once.**

```text
        ┌──────────────────────────────────────────┐
        │   ONE repository (.git)                  │
        │   objects, refs, config (shared)         │
        └──────────────────────────────────────────┘
            ▲                ▲                 ▲
            │                │                 │
   ┌────────┴───────┐ ┌──────┴────────┐ ┌──────┴─────────┐
   │  main checkout │ │  worktree A   │ │  worktree B    │
   │  branch: main  │ │ branch: feat  │ │ branch: hotfix │
   │  own HEAD+index│ │ own HEAD+index│ │ own HEAD+index │
   │  own files     │ │ own files     │ │ own files      │
   └────────────────┘ └───────────────┘ └────────────────┘
```

The directory you created with `git clone` is the **main working tree**. Every directory you add later with `git worktree add` is a **linked working tree**. They all share the same underlying repository, but each has its own checked-out files, its own `HEAD`, and its own index.

The single most important consequence: **fetch once, use everywhere.** A `git fetch` in any worktree updates the shared object store and remote-tracking refs, and every other worktree immediately sees those new commits. You are not re-downloading anything. That's the fundamental difference from cloning the repo a second time.

## What's actually happening on disk

This is the part most tutorials skip, and it's the part that makes you *trust* worktrees instead of treating them as magic. Let's say your main repo is at `~/code/myapp` and you run:

```bash
git worktree add ../myapp-worktrees/feat-auth -b feat-auth
```

Let's read that command left to right, because every piece matters:

- **`git worktree add`** is the subcommand that creates a new linked working tree.
- **`../myapp-worktrees/feat-auth`** is *where* to create it, the path to the new directory. The `../` means "go up one level out of my current repo, into a sibling folder," so if your repo is `~/code/myapp`, this makes `~/code/myapp-worktrees/feat-auth`. The directory must not already exist, Git creates it for you. (The path can be anywhere you like; this sibling layout is just the convention I'll recommend later.)
- **`-b feat-auth`** means "create a new branch called `feat-auth` and check it out here." It's the exact same `-b` you know from `git checkout -b` / `git switch -c`, just aimed at the new directory instead of the one you're standing in.

Put together, that one line creates a new folder, makes a fresh `feat-auth` branch, and checks it out *into that folder*, all without touching your main checkout or the branch you currently have open. You now have two branches checked out at once, in two directories, backed by one repo. (If you wanted to check out a branch that *already exists* instead of making one, you'd just drop the `-b`, more on the variations later.)

Go look inside the new directory and you'll find something surprising. In a normal repo, `.git` is a **directory**. In a linked worktree, `.git` is a **plain text file**. Its entire contents are a single line:

```text
gitdir: /Users/you/code/myapp/.git/worktrees/feat-auth
```

That's it. It's a pointer. When Git runs inside the linked worktree, it follows that pointer to a small per-worktree admin directory that lives *inside the main repo's* `.git`. So the real `.git` data never gets duplicated, the linked worktree just points back to it.

Inside that admin directory git keeps this worktree's own `HEAD`, its own index, and small pointer files back to the shared repo. The takeaway: **the repository itself, all your commits and branches, lives once and is shared**; each worktree just adds its own checked-out files on top. Your git config is shared too, so your remotes and aliases work everywhere without re-setting anything.

> One habit worth keeping: don't hand-edit the files *inside* `.git`. Read them to understand what's going on, but change them with git commands, not a text editor.

## The command surface

There are really only a handful of subcommands. Here's the whole thing.

### `git worktree add`: create one

This is the command you'll use 95% of the time.

```bash
# Create a NEW branch and check it out in a new directory (most common)
git worktree add ../myapp-worktrees/feat-auth -b feat-auth

# Check out an EXISTING branch into a new directory
git worktree add ../myapp-worktrees/hotfix hotfix

# Branch from a specific start point
git worktree add ../myapp-worktrees/feat-auth -b feat-auth origin/main
```

### `git worktree list`: see what you've got

```bash
git worktree list
# /Users/you/code/myapp                  abcd123 [main]
# /Users/you/code/myapp-worktrees/feat   ef45678 [feat-auth]
# /Users/you/code/inspect                9988776 (detached HEAD)

git worktree list --porcelain   # stable, machine-readable; parse this, not the human format
```

### `git worktree remove`: clean one up

```bash
git worktree remove ../myapp-worktrees/feat-auth        # refuses if there are uncommitted changes
git worktree remove --force ../myapp-worktrees/feat-auth # remove anyway
```

Always prefer this over `rm -rf`-ing the directory. If you delete the folder manually, Git doesn't know it's gone, and the admin directory hangs around as a ghost (which can later trigger confusing "already checked out" errors). If you *do* delete a worktree folder by hand, run `git worktree prune` to clear the stale entry.

### `git worktree prune`: sweep the ghosts

```bash
git worktree prune -n              # dry run: show what would be pruned
git worktree prune -v              # verbose: report each removal
git worktree prune --expire 3.days.ago
```

## The gotchas that will bite you

I hit most of these the hard way, so let me save you the trouble.

### You cannot check out the same branch in two worktrees

This is the cardinal rule and it confuses everyone the first time:

```bash
$ git worktree add ../second main
fatal: 'main' is already checked out at '/Users/you/code/myapp'
```

Why? Each worktree has its own `HEAD` and `index`, but a branch ref is **shared**. If two worktrees were both "on" `main`, a commit in one would move the shared ref out from under the other, and the second worktree would silently think a bunch of files were modified or deleted. Git refuses to let you create that footgun.

There's a `--force` to override it, but don't, unless you genuinely want a throwaway read-only checkout and understand exactly what you're doing. The right move is: one branch, one worktree. If you want to look at `main`'s code while you're on `main`, just use the main checkout you already have.

### A fresh worktree has no `node_modules` and no `.env`

This is the big one for any real project, and it trips up agents constantly. A worktree is a **fresh checkout of tracked files only.** Anything in your `.gitignore`, `node_modules/`, `.venv/`, `.next/`, build caches, and crucially your `.env` files, does **not** exist in a new worktree. Your agent will cheerfully run `bun run dev` and immediately fail with "module not found."

We'll solve this properly in the next section. Just know it's expected, not a bug.

### Stash is global, not per-worktree

`git stash` is stored on a shared ref, so a stash you make in worktree A is visible (and poppable) from worktree B. This surprises people. Honestly, though, the beauty of worktrees is that you rarely *need* to stash anymore. Instead of stashing to switch context, you just walk to a different directory.

### Manually deleting a worktree directory leaves a ghost

Covered above, but worth repeating because it's the most common mess: use `git worktree remove`, not `rm -rf`. If you forget, `git worktree prune` cleans up.

## How worktrees compare to the alternatives

This table is the whole argument in one place:

| Approach                | Object DB  | Disk cost                           | Fetch     | Parallel work? |
| ----------------------- | ---------- | ----------------------------------- | --------- | -------------- |
| **`git worktree add`**  | **Shared** | Just the extra checked-out files    | **Once**  | **Yes**        |
| `git clone` a 2nd copy  | Duplicated | Full second copy of history + files | Per clone | Yes            |
| `git stash` + switch    | Shared     | Zero extra                          | n/a       | No (one dir)   |
| Just switching branches | Shared     | Zero extra                          | n/a       | No (one dir)   |

Worktrees give you clone-level isolation of your *working files* with single-clone disk and fetch costs. A second clone only wins when you need *fully* independent state (different config, a sandbox you can corrupt safely). Stash and branch-switching keep you stuck in a single directory, which is exactly the bottleneck we're trying to escape.

## The convention I settled on

After trying a few layouts, here's what I recommend, and what I now use everywhere.

**Keep worktrees in a sibling folder named after the repo:** `../<repo>-worktrees/<branch>`.

```text
~/code/myapp/                 # main checkout (your normal clone)
~/code/myapp-worktrees/
  ├── feat-auth/              # branch: feat-auth
  ├── hotfix-billing/         # branch: hotfix-billing
  └── pr-1234/                # a PR you're reviewing
```

The alternative is putting worktrees *inside* the repo (like `./.worktrees/feat-auth`), and Claude Code's default actually does a version of this under `.claude/worktrees/`. The problem with in-repo worktrees when *you're* driving manually is **recursion**: file watchers, `ripgrep`, your test runner, your bundler, and the agent itself can all descend into the worktree folder and suddenly see N copies of your codebase. Keeping worktrees as siblings, physically outside the repo, sidesteps that entire class of problem. So: siblings when you manage them by hand; in-repo is fine when the agent owns the lifecycle and handles the ignores for you.

### A one-command helper

Creating a worktree *and* getting it ready to run is a few steps every time, so I wrapped it. This simple version creates the worktree, copies the common gitignored config a fresh checkout is missing (`.env` and friends), and installs dependencies; the fuller version further down copies whatever else you list. Drop it in your `~/.zshrc` or `~/.bashrc`:

```bash
# wt <branch> [base]: create a worktree, copy common config, install deps
wt() {
  local branch="$1"
  local base="${2:-origin/HEAD}"
  [ -z "$branch" ] && { echo "usage: wt <branch> [base]"; return 1; }

  local root; root="$(git rev-parse --show-toplevel)" || return 1
  local repo; repo="$(basename "$root")"
  local wtdir="$(dirname "$root")/${repo}-worktrees/${branch//\//-}"

  git -C "$root" fetch --quiet origin
  git -C "$root" worktree add "$wtdir" -b "$branch" "$base" || return 1

  # copy the common gitignored config a fresh checkout is missing
  for f in .env .env.local .npmrc; do
    [ -f "$root/$f" ] && cp "$root/$f" "$wtdir/$f"
  done

  # install deps
  cd "$wtdir" || return 1
  bun install

  echo "✅ worktree ready: $wtdir"
}

# wtrm: tear down the current worktree + its branch, run from inside it
wtrm() {
  local wt; wt="$(git rev-parse --show-toplevel)"
  local branch; branch="$(git symbolic-ref --short HEAD)"
  local main; main="$(git worktree list --porcelain | awk 'NR==1{print $2}')"
  cd "$main" || return 1
  git worktree remove "$wt" && git branch -D "$branch" && git worktree prune
}
```

<details>

<summary>The full version I actually use in my workflow</summary>

This is the real one. It does a fair bit more than the simple version above: it reads a `.worktreeinclude` (or falls back to a default list) and copies nested config like `config/secrets.json` across with a portable tar-pipe, it attaches to a branch that already exists instead of erroring, and it detects Bun.

```bash
wt() {
  emulate -L bash 2>/dev/null || true
  local branch="$1"
  local base="${2:-origin/HEAD}"
  [ -z "$branch" ] && { echo "usage: wt <branch> [base]"; return 1; }

  local root; root="$(git rev-parse --show-toplevel)" || return 1
  local repo; repo="$(basename "$root")"
  local wtdir="$(dirname "$root")/${repo}-worktrees/${branch//\//-}"

  git -C "$root" fetch --quiet origin

  if git -C "$root" show-ref --verify --quiet "refs/heads/$branch"; then
    echo "branch '$branch' already exists, attaching a worktree to it"
    git -C "$root" worktree add "$wtdir" "$branch" || return 1
  else
    git -C "$root" worktree add "$wtdir" -b "$branch" "$base" || return 1
  fi

  wtdir="$(cd "$wtdir" && pwd)"

  local -a include
  if [ -f "$root/.worktreeinclude" ]; then
    while IFS= read -r line; do
      case "$line" in ''|'#'*) continue ;; esac
      include+=("$line")
    done < "$root/.worktreeinclude"
  else
    include=(.env .env.local .env.development .env.production .env.test
             .npmrc .tool-versions .nvmrc
             config/secrets.json certs/localhost.pem certs/localhost-key.pem)
  fi

  ( cd "$root"
    for pat in "${include[@]}"; do
      for f in $pat; do [ -e "$f" ] && printf '%s\0' "$f"; done
    done
  ) | tar -C "$root" --null -T - -cf - | tar -C "$wtdir" -xf -

  cd "$wtdir" || return 1
  if   [ -f pnpm-lock.yaml ];               then pnpm install
  elif [ -f bun.lockb ] || [ -f bun.lock ]; then bun install
  elif [ -f yarn.lock ];                    then yarn install
  elif [ -f package-lock.json ];            then npm ci
  fi

  echo "✅ worktree ready: $wtdir (branch: $branch, config seeded from $repo)"
}

wtrm() {
  local wt; wt="$(git rev-parse --show-toplevel)"
  local branch; branch="$(git symbolic-ref --short HEAD)"
  local main; main="$(git worktree list --porcelain | awk 'NR==1{print $2}')"
  cd "$main" || return 1
  git worktree remove "$wt" && git branch -D "$branch" && git worktree prune
}
```

</details>

Now `wt feat-auth` gives me a working worktree in seconds: branched, config seeded, dependencies installed, ready for an agent. `wtrm` from inside one tears it down cleanly.

It copies a **curated** (hand-picked) list on purpose, not every gitignored file. The full version above reads that list from a `.worktreeinclude` if you have one (same idea as Claude Code's, more on that below), otherwise a sensible default. Blanket-copying everything would drag in junk you never meant to duplicate, a multi-gigabyte local SQLite database, a stray `.pem`, build caches.

## Solving the dependency, secrets, and port problems

These three are what separate "I tried worktrees once and it was annoying" from "I live in worktrees now."

**Dependencies.** A fresh worktree has no `node_modules`. The always-correct option is just to reinstall (`bun install`), which the helper above does. If your `node_modules` is huge and reinstalling per worktree hurts, this is where **bun** shines: it keeps every package version once in a global cache (`~/.bun/install/cache`) and links it into each project, so a second worktree's install is nearly instant and costs almost no extra disk. You get that behavior by default, with no special config.

One thing *not* to do: symlink a single `node_modules` across worktrees. The whole point is that different branches can have different dependencies, and a shared `node_modules` is then wrong for at least one of them. Native modules and postinstall scripts assume a real per-project tree. Let bun share file *content* safely through its global cache instead.

**Secrets and config.** Your `.env` and friends aren't in git, so a fresh worktree won't have them, the `wt` helper copies them in for you (and Claude Code does the same via `.worktreeinclude`, covered below). Don't copy everything blindly though, local databases and build caches should *not* be carried over, which brings us to the next point.

**Ports and databases.** If two worktrees both run `bun run dev`, they'll fight over port 3000. Give each one its own port via its (gitignored, therefore per-worktree) `.env.local`:

```bash
# in each worktree
echo "PORT=3001" >> .env.local        # 3002, 3003, ... per worktree
```

The bigger hazard is shared external state. If two worktrees point at the **same** database and an agent runs a destructive `migrate` or `db push` in one, it can wreck the other's runtime. Give each agent's worktree its own database, or at least its own schema.

The rule of thumb: **git shares your history and objects, not your runtime.** Ports, databases, caches, secrets, and uncommitted work are all per-worktree by design. Plan for that and the friction disappears.

## The part you came for: running AI agents in parallel

Here's where worktrees stop being a nice git trick and become a genuinely different way to work.

The core insight is simple: **an AI agent editing your code needs its own working directory.** If you run two agents in the same checkout, they'll overwrite each other's files, fight over the dev server, and generally create chaos. Give each agent its own worktree and the problem vanishes, each one has an isolated copy of the files and its own branch, and they're completely invisible to each other until you commit.

That maps perfectly onto my Noveum day. The feature I'm building lives in one worktree with its own agent. When prod breaks, I open a second worktree off `main`, point an agent at the hotfix, and ship it, all while the first agent keeps grinding, untouched. No stash, no wait, no second clone.

### The pattern: one long task, one foreground

This is my bread and butter: I kick off a slow, autonomous task in worktree A, a big refactor, a flaky-test fix, a dependency bump, and let the agent churn. Then I switch to worktree B and do focused work, pairing with a second agent or hand-editing the hotfix. Because the worktrees are isolated checkouts, the background agent can rewrite half the codebase and never touch what I'm doing. I check back on A when it's done; it has its own branch ready to become a PR. (If you've read [how I use Cursor](https://pulkit.blog/how-i-use-cursor.md), you know I run a few of these at once, worktrees are what keep it sane.)

Practically, run each worktree in its own terminal tab or `tmux` window, each with its own agent. One tip that saves a lot of confusion: **name the worktree directory exactly the same as its branch** (`feat-auth/` on branch `feat-auth`), and put the branch in your shell prompt, so you always know which world you're typing in.

### Claude Code has worktrees built in

Here's the part that genuinely surprised me, and it's why I wanted to write this with current, accurate detail rather than describing worktrees as a purely manual thing: **Claude Code treats worktrees as a first-class feature.** Anthropic has a [dedicated docs page on running parallel sessions with worktrees](https://code.claude.com/docs/en/worktrees). The manual `git worktree` ceremony I described above is great to understand, but for the agent workflow specifically, a lot of it is handled for you.

The pieces that matter:

**The `--worktree` flag.** Start an isolated session in one command:

```bash
claude --worktree feat-auth      # creates an isolated worktree + branch, starts Claude in it
claude -w bugfix-123             # second isolated session, its own branch
claude --worktree "#1234"        # check out a PR (fetches pull/1234/head) into its own worktree
claude --worktree                # no name -> auto-generates one like "bright-running-fox"
```

By default it creates the worktree under `.claude/worktrees/<name>/` on a new branch, and branches from `origin/HEAD` so you start clean and matching the remote. You can change that to branch from your local `HEAD` (carrying unpushed work) with the `worktree.baseRef` setting. Add `.claude/worktrees/` to your `.gitignore` so the worktree contents don't show up as untracked noise in your main checkout.

Run that in two terminals with two different names and you've got two fully isolated Claude Code sessions, one building a feature, one fixing a bug, neither able to touch the other's files. That's the entire workflow, packaged.

**`EnterWorktree` / `ExitWorktree`.** You don't even need the flag. Mid-session you can just tell Claude to "work in a worktree" and it will create one and switch into it, then return when you're done.

**Subagent isolation.** When Claude fans out to subagents, you can have each one run in its own temporary worktree by setting `isolation: worktree` in the subagent's config (or just asking it to "use worktrees for your agents"). Each subagent gets an isolated copy of the repo and the worktree is cleaned up automatically if it didn't make changes. This is how you safely run several subagents editing files *in parallel*, they're not fighting over one working directory.

**`.worktreeinclude`.** Remember the "fresh worktree has no `.env`" problem? This is Claude Code's built-in answer, and it's the same idea as the `wt` helper above. Drop a `.worktreeinclude` file at your project root (it uses `.gitignore` syntax), and Claude copies the matching files into every worktree it creates, for `--worktree`, for subagents running with `isolation: worktree`, and for the desktop app's parallel sessions. The one rule to internalize: it only copies files that match a pattern *and* are gitignored, tracked files are already in the checkout, so they're never duplicated. Keep the patterns narrow (env, secrets, certs); don't write broad globs that would sweep in `node_modules`.

```text
# .worktreeinclude  (project root, .gitignore syntax)

# Local secrets and env (gitignored, so they get copied)
.env
.env.local
.env.*.local

# Service credentials and local TLS certs
config/secrets.json
.npmrc
certs/localhost.pem
certs/localhost-key.pem
```

If you need full control over how worktrees get created and cleaned up, or you're on a non-git VCS like SVN or Mercurial, there are `WorktreeCreate` and `WorktreeRemove` hooks. One sharp edge worth knowing: a `WorktreeCreate` hook *replaces* git's default logic entirely, so `.worktreeinclude` is **not** processed when that hook is set, you copy local config inside the hook script yourself (which is also the natural place to run `install` and `migrate`).

**The desktop app does it automatically.** In the Claude Code desktop app, every session gets its own worktree with no setup, just open a new session and you're isolated.

A couple of honest caveats so you don't get surprised:

- **You still have to install dependencies in each worktree.** Creating the worktree doesn't run your `bun install`, the docs are explicit about this. The `.worktreeinclude` handles config files, not `node_modules`.
- **Running several sessions multiplies your token usage.** Three agents working at once is roughly three times the spend. Worth it for the parallelism, but go in with eyes open.
- The sandbox is worktree-aware, when a session runs in a linked worktree, the sandbox still lets `git commit` update the shared `.git`, so commits work normally from inside a worktree.

If you take one thing from this section: **one agent, one worktree, one branch.** Everything else is logistics.

## Review and merge flow

Worktrees map one-to-one onto a PR-per-feature flow, which is exactly how you want to work with agents anyway. One worktree, one branch, one PR.

```bash
# inside the worktree
git add -A && git commit -m "feat: add auth flow"
git push -u origin feat-auth
gh pr create --fill
```

When the PR merges, tear it all down. Note that you can't remove a worktree from *inside* it, and you can't delete a branch that's still checked out somewhere, so order matters:

```bash
cd ~/code/myapp                                       # back to the main checkout
git worktree remove ../myapp-worktrees/feat-auth      # add --force if there's leftover junk
git branch -d feat-auth                               # -d refuses if unmerged; -D forces
git worktree prune                                    # drop stale admin entries
```

If you use Claude Code, it cleans most of this up for you: an unnamed session that made no changes removes its own worktree and branch on exit.

## When NOT to use worktrees

I'm not going to pretend they're free. Some honest cases where they're the wrong tool:

- **Big trees or heavy build artifacts.** Each worktree is a full checkout on disk (only `.git` is shared) and a fresh one has no `node_modules`. If your tree is multi-gigabyte or your installs are slow and native-heavy, the per-worktree duplication can outweigh the benefit, bun's global cache helps, but not always.
- **When branch-switching is genuinely cheap.** If your branches share the same dependencies and switching is a one-second `git switch`, the worktree overhead may exceed the benefit. Worktrees pay off specifically when you want things running **in parallel**, or when switching is expensive because of dirty state or long rebuilds. The AI-agent case is squarely the former.

## The top gotchas, in one list

Bookmark this:

1. **Fresh worktree has no `node_modules` / `.env` / build cache.** Always bootstrap (install + copy config). Use `.worktreeinclude` with Claude Code.
2. **You can't check out the same branch in two worktrees.** One branch, one worktree.
3. **Port collisions.** Two dev servers on :3000. Assign a deterministic per-worktree port via `.env.local`.
4. **Shared database = cross-worktree corruption.** An agent's migration in one worktree breaks another's runtime. Isolate the DB or schema per worktree.
5. **It's per-worktree state, not shared.** Git shares objects and history, not your runtime, secrets, ports, or uncommitted work.

## Wrapping up

The shift is real, and it fits how we build now: several streams of work at once, a feature here, a refactor there, a hotfix that just landed. Worktrees are what let you run all of it in parallel without it turning into mush, and Claude Code building them in as a first-class feature tells you this is where the workflow is heading.

If you take nothing else away: next time prod breaks while you're mid-feature, don't stash and don't clone. Run `git worktree add ../myapp-worktrees/hotfix -b hotfix`, fix the thing, ship it, and walk right back to where you were. Once you feel that, you won't go back.

If you want to go deeper, the [Claude Code worktrees docs](https://code.claude.com/docs/en/worktrees) and the [official `git worktree` reference](https://git-scm.com/docs/git-worktree) are both excellent. And if you set this up and have questions about wiring it into your own workflow, reach out, you can find all my socials and a [contact form](https://pulkit.page/contact/).

Happy shipping!

## Related writing

- [How I Use Cursor to Build at 1000x Speed](https://pulkit.blog/how-i-use-cursor.md): February 26, 2026
- [Partial Clones, Shallow Clones, and Sparse Checkout](https://pulkit.blog/git-partial-clones.md): August 3, 2026
- [An MCP Server That Writes Itself](https://pulkit.blog/mcp-server-that-writes-itself.md): April 22, 2026
