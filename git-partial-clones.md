# Partial Clones, Shallow Clones, and Sparse Checkout

> A deep dive into git's three cloning knobs: how partial clone, shallow clone, and sparse checkout actually work under the hood, and the exact recipe that turns a multi-gigabyte clone into a few seconds of download when you only need to touch one file.

- URL: https://pulkit.blog/git-partial-clones/
- Published: August 3, 2026
- Tags: Git, Partial Clone, Shallow Clone, Sparse Checkout, Monorepo, Performance, Developer Tools, Workflow

The other day I had to change exactly one file in a repo that had grown enormous: years of history and hundreds of committed videos and images, the kind of repo where `git clone` sits at `Receiving objects: 4%` long enough for you to make tea, drink it, and start questioning your choices.

And the change I needed? A few lines in a single markdown file.

So I did what I do with tedious work now: I handed it to [Claude Code](https://code.claude.com) while my own `git clone` kept crawling in another terminal. A few seconds later it was done. File edited, committed, pushed. My clone was still downloading.

That gap nagged at me. Same repo, same network, same machine, and the agent had shipped the fix before my clone finished counting objects. So I asked it what exactly it had done, and the answer was four git flags composed in exactly the right order, with a total download of a couple of megabytes instead of multiple gigabytes. Nothing about it was a hack: every piece is a first-class git feature, most people have just never had a reason to compose them. I went down the rabbit hole to understand every flag, and it was too good not to share with y'all.

So this is that rabbit hole, written up properly. We're going deep: what git actually downloads when you clone, the three independent knobs that control it (**shallow clone**, **partial clone**, **sparse checkout**), why the order you apply them matters, and how a repository that's missing 99% of its own data can still commit and push like nothing's wrong.

## TL;DR

The whole trick is these four commands:

```bash
git clone --filter=blob:none --depth 1 --no-checkout --branch main <url> repo
cd repo
git sparse-checkout set --no-cone /README.md
git checkout main
```

- **`--filter=blob:none`** (partial clone) downloads commits and trees but **zero file contents**. Missing blobs get fetched from the server later, on demand, the moment something needs them.
- **`--depth 1`** (shallow clone) downloads only the **tip commit**, no history.
- **`--no-checkout`** stops git from materializing the working tree, which is what stops it from immediately re-downloading everything you just filtered out.
- **`git sparse-checkout set`** shrinks the working tree to only the paths you list, so the final `git checkout` fetches exactly the blobs for those paths. One file listed, one blob downloaded.
- Commit and push work normally: push only sends the **new** objects you created, and the server never asks you for anything it already has.
- Each knob cuts a different axis: shallow cuts **history**, partial cuts **content**, sparse cuts the **working tree**. They compose because they're independent.

## First, what a clone actually downloads

To see why each flag works, you need the object model in your head. It's small, and it's the best mental model in all of git.

A repository is a content-addressed database of four object types, but three matter here:

1. **Blobs**: file contents. Just the bytes, no filename, no path.
2. **Trees**: directory listings. A tree maps names to blobs (files) and other trees (subdirectories).
3. **Commits**: a pointer to one root tree, plus parent commit(s), author, and message.

```text
   commit ──► root tree ──► blob        README.md
                 │
                 ├────────► tree        src/
                 │            ├───────► blob   index.ts
                 │            └───────► blob   utils.ts
                 │
                 └────────► tree        assets/
                              ├───────► blob   demo.mp4   (30 MB)
                              └───────► blob   hero.png   (2 MB)
```

Every commit in history points at a full snapshot like this. A normal `git clone` downloads **all of it**: every commit ever made, every version of every tree, and every version of every blob. Then it checks out the tip into your working directory.

Here's the part that matters: **the weight is almost entirely in the blobs.** Commits and trees are tiny text-like records that compress brilliantly. Blobs are your actual files, and in any repo with media, build fixtures, or just a lot of code and years of churn, historical blob versions are where the gigabytes live. You are downloading every version of every video that was ever committed, including the ones deleted years ago.

So the game is: how much of this can we *not* download? Git gives you three independent knobs, and each one cuts along a different axis.

## Knob 1: shallow clone, cutting history

The oldest and best-known knob:

```bash
git clone --depth 1 <url>
```

`--depth 1` says: give me the **tip commit only**, none of its ancestors. Git records the cut point in `.git/shallow`, and the bottom commit becomes a "grafted" commit that pretends to have no parents. (`--depth` also implies `--single-branch`, so you're only getting one branch's tip unless you say otherwise.)

You still get the *full snapshot* at the tip: all trees and all blobs for the current state of the project. What you lose is the past: no old versions, no `git log` beyond the tip, no blame history.

You can change your mind later:

```bash
git fetch --deepen=50      # pull in 50 more commits of history
git fetch --unshallow      # give up, download everything
```

Shallow clones are why CI checkouts are fast, and for a one-shot "build this and throw it away" they're perfect. But for a repo whose weight is media at the tip, `--depth 1` barely helps: the current snapshot is still huge. That's the axis it can't touch, which brings us to the interesting knob.

## Knob 2: partial clone, cutting content

This is the modern one, and the one that changes everything:

```bash
git clone --filter=blob:none <url>
```

The `--filter` tells the server: send me the commits and the trees, but **no blobs at all**. The full shape of history arrives; none of the file contents do.

Which immediately raises the question: how can a repository even function with no file contents? The answer is the clever part. A partial clone registers its origin as a **promisor remote**: git records that this remote has *promised* it can supply any missing object later. From then on, any time a git command actually needs a blob that isn't there, git pauses, fetches exactly that object from the server, and carries on. Lazily, on demand, invisible when it works well.

You can watch it happen. In a fresh blobless clone:

```bash
git log --oneline -20        # instant, commits are local
git ls-tree HEAD             # instant, trees are local
git show HEAD:package.json   # pauses briefly... fetches ONE blob, prints it
```

That last command is the whole feature in miniature: the repository is a skeleton, and flesh gets attached one bone at a time, only where you actually touch it.

There are other filters worth knowing:

```bash
--filter=blob:none        # no blobs (the one you want 95% of the time)
--filter=blob:limit=1m    # blobs over 1 MB stay behind, small ones come along
--filter=tree:0           # not even trees, just commits (extreme, see gotchas)
```

Two caveats before you fall in love. First, the server has to support filtering (`uploadpack.allowFilter`); GitHub, GitLab, and the other big hosts all do, but a random bare server might not, in which case git quietly warns and sends everything. Second, that on-demand fetching has sharp edges we'll get to in the gotchas, because a repo that needs the network to read old files is a different animal.

## Knob 3: sparse checkout, cutting the working tree

The first two knobs control what's in your `.git` object database. The third controls something else entirely: **which files git materializes into your working directory.**

```bash
git sparse-checkout set apps/web shared/ui
```

After this, your working directory contains only those directories (plus files at the repo root). Everything else is still *in the repository*, committed and safe, just not written to disk. `git status` is clean; git knows the missing files are intentionally absent, not deleted.

By default `sparse-checkout set` works in **cone mode**: you give it directories, and it includes everything under them. Cone mode is fast because git can match paths with simple prefix checks. But cone mode *only* does directories. If you want to pin the working tree down to individual files, you need patterns:

```bash
git sparse-checkout set --no-cone /README.md
```

`--no-cone` mode takes `.gitignore`-style patterns, so `/README.md` means "exactly this one file at the root". It's slower at scale and the docs nudge you toward cone mode, but for surgical work on a handful of files it's exactly the right tool.

The rest of the surface is small:

```bash
git sparse-checkout list           # show current patterns
git sparse-checkout add docs/      # widen the checkout
git sparse-checkout disable        # materialize everything again
```

On its own, sparse checkout saves disk and makes tools faster (your editor, file watcher, and grep stop seeing a million files). But notice what it does **in combination with a partial clone**: if checkout is what triggers blob fetches, and sparse checkout shrinks what gets checked out... you control exactly which blobs ever get downloaded. That's the combination lock, and it's why the recipe works.

## The recipe, line by line

Here it is again, the whole thing:

```bash
git clone --filter=blob:none --depth 1 --no-checkout --branch main <url> repo
cd repo
git sparse-checkout set --no-cone /README.md
git checkout main
```

**Line 1** creates the skeleton. `--filter=blob:none` keeps every blob on the server. `--depth 1` keeps every historical commit and tree on the server too, so even the metadata download is tiny. `--branch main` picks the branch. And `--no-checkout` is the quiet hero: it tells git to stop after writing `.git` and **not** populate the working directory.

Why does that matter so much? Because of *when* blobs get fetched. Checkout is the step that writes files to disk, and writing files needs their contents. If you let the clone check out normally, git would immediately demand every blob in the tip snapshot, and your "partial" clone would re-download the entire current state of the repo file by file. The classic partial-clone footgun: you filtered the blobs out, then instantly invited them all back in.

**Line 3** sets the trap before springing it: with the working tree still empty, we pin the sparse patterns down to one file.

**Line 4** springs it. `git checkout main` materializes the working tree, which by now means: exactly the paths matching the sparse patterns. Git walks the tip tree, finds one matching path, notices its blob is missing, fetches that single object from the promisor remote, and writes the file. (When multiple blobs are missing, git batches them into one request rather than making a round trip per file.)

Total transfer: one commit object, the trees for one snapshot, and one blob. On the repo that started this post, the multi-gigabyte clone became a download small enough that the sparse-checkout step was the part I noticed.

Need more of the repo later? Widen it, and git fetches just the difference:

```bash
git sparse-checkout add scripts/     # fetches only the blobs under scripts/
```

## The part that feels illegal: committing from a skeleton

So you have a repository that's missing nearly all of its history's content. Surely git objects to you *writing* to it?

It doesn't, and understanding why is the best part of the whole exercise.

When you edit the file and run `git commit`, git creates exactly three kinds of new things, all locally:

1. A new **blob** for the edited file's contents.
2. New **trees**: one for each directory on the path from the file up to the root (their listings changed, because one entry now points at the new blob).
3. A new **commit** pointing at the new root tree, with the old tip as parent.

None of that requires reading the objects you don't have. Committing is pure addition to a content-addressed store.

Then push:

```bash
git push origin main
```

Push is a negotiation, and it's beautifully minimal. Your git and the server compare refs: "you're at `f5a0be6`, I have `4c9f1b9` which descends from it." Then your side computes which objects the server could possibly be missing: just the new blob, the few new trees, and the commit. That handful of objects goes over the wire, a few kilobytes, and the server updates the ref. The thousands of blobs you never downloaded are never mentioned by either side. The server doesn't care what your local copy is missing; it only cares that the objects *you're sending* connect to history *it already has*.

Shallow doesn't break this either: your new commit's parent is the remote's own tip, so the connection check trivially passes. Clone in seconds, edit, commit, push, and the remote ends up byte-identical to what a full clone would have produced.

## The gotchas that will bite you

Every one of these is a lesson I'd rather you learn here than in production.

### History-walking commands phone home

This is the big one for partial clones. Commands that only read *metadata* stay fast forever: `git log --oneline`, `git ls-tree`, branch and merge operations. But commands that read historical *contents* need historical blobs, and those live on the server:

```bash
git log -p            # fetches blobs for EVERY commit it displays, one batch at a time
git blame src/app.ts  # fetches every historical version of that file
git bisect            # fetches each checkout as you go
```

On a blobless clone these work, but they crawl, and they need the network. A partial clone is a repo with a dependency on its server baked in. On a plane, `git show HEAD~40:src/app.ts` doesn't say "slow", it says no. If your daily work is archaeology (blame, bisect, spelunking), take the full clone; that's what it's for.

### The checkout stampede

Covered above but worth repeating, because it's *the* classic mistake: doing `git clone --filter=blob:none` **without** `--no-checkout` + sparse checkout means the clone ends by fetching the entire tip snapshot anyway. Blobless clones only skip what you never touch, and a full checkout touches everything. Decide what you'll touch *before* the first checkout.

### Shallow history is weird at the edges

A shallow clone's bottom commit lies about having no parents, and anything that walks ancestry can hit the wall: `git merge-base` can't find a fork point that's below the cut, `git describe` can't reach a tag, and CI diff jobs ("what changed vs main?") fail in confusing ways when the merge base is missing. This is exactly why CI systems that compute diffs use full-depth fetches, and why `--deepen` exists as the escape hatch. Shallow is great when the job is "the code as of now"; it's wrong when the job involves *comparing* points in history.

Also know that shallow and partial solve overlapping problems, and if you're using `--filter=blob:none` anyway, you often don't need `--depth 1` at all: commits and trees are cheap, and keeping full (blobless) history makes the repo behave much more normally. I add `--depth 1` when I truly want one snapshot and nothing else; I skip it when the clone will live for a while.

### `tree:0` is a trap for anything long-lived

A treeless clone (`--filter=tree:0`) downloads commits only, and it feels amazing for about a minute. Then any operation that needs to know what's *in* a commit starts fetching trees on demand, and trees are needed constantly, for far more operations than blobs. Treeless clones are for one-shot jobs (clone, build, discard). Never hand one to a human for daily work.

### Sparse checkout hides files, and tools get confused

The files excluded by sparse checkout genuinely aren't on disk. Global search finds nothing in them; a codemod won't touch them; a build that imports from an excluded directory just fails. Git itself is never confused (`git sparse-checkout list` always tells the truth), but your *tools* trust the filesystem. When something behaves impossibly, check whether you're standing in a sparse checkout; my earlier confused self can confirm that "the file is tracked but doesn't exist" is a very disorienting first symptom.

### One command to rule them all: `scalar`

If this whole post sounds like configuration you'd rather not remember, git ships a tool that bundles the recommended setup:

```bash
scalar clone <url>
```

`scalar` (included with git since 2.38) does a blobless partial clone, enables cone-mode sparse checkout starting from the root directory only, and turns on background maintenance. It's the "monorepo defaults" button, and for daily work on a huge repo it's honestly the right starting point; the manual flags are for when you want surgical control (or you want to understand what scalar is doing for you, which, after this post, you do).

## The comparison, in one table

| Clone command                  | History (commits) | Trees     | File contents (blobs)    | Best for                         |
| ------------------------------ | ----------------- | --------- | ------------------------ | -------------------------------- |
| `git clone`                    | All               | All       | All                      | Daily work, archaeology, offline |
| `git clone --depth 1`          | Tip only          | Tip only  | Tip only (full snapshot) | One-shot CI builds               |
| `git clone --filter=blob:none` | All               | All       | On demand                | Big repos, monorepo daily work   |
| `git clone --filter=tree:0`    | All               | On demand | On demand                | One-shot jobs only               |
| The full recipe (all three)    | Tip only          | Tip only  | Only sparse paths        | Surgical edits in huge repos     |

And the axes, because this is the picture to keep:

```text
                 history (commits)
                       ▲
                       │   ← --depth cuts here
                       │
   working tree ◄──────┼──────► content (blobs)
   (files on disk)     │        ← --filter cuts here
   ← sparse-checkout   │
     cuts here         ▼
```

Three axes, three independent knobs. Any combination is valid, and each one only pays for what it uses.

## When I actually reach for each

- **Quick surgical edit in a huge repo** (the use case that started this post): the full recipe. Seconds of download, full push capability.
- **Daily work in a big monorepo**: `--filter=blob:none` plus cone-mode sparse checkout of the directories I own, or just `scalar clone`. Full history for `git log`, contents on demand, working tree sized to my slice.
- **CI, build-and-discard**: `--depth 1`, adding `--filter=blob:none` when the tree is media-heavy. If the job diffs against a base branch, deepen or skip shallow entirely.
- **Archaeology** (blame, bisect, "when did this break"): a boring full clone. The right tool for reading history is having the history.

One more connection worth making: if you read my [git worktrees](https://pulkit.blog/git-worktrees.md) post, you'll recognize the philosophy. Worktrees stop you from paying twice for the same `.git`; partial and sparse stop you from paying for parts of the repo you'll never touch. Both come from the same realization: `git clone`'s defaults assume you want *everything*, and on modern repo sizes, you usually don't. They compose, too: a blobless clone with several sparse worktrees is a genuinely great setup for parallel work on a monorepo.

## Wrapping up

The thing I love about this corner of git is that nothing here is a workaround. The object model was always three cleanly separated layers (history, content, working tree), and these three features are just the honest admission that you should be able to pay for each layer separately. Once you've seen the model, the flags stop being incantations and become obvious: of course you can skip blobs, they're leaves; of course push still works, it only ever sends what's new; of course checkout order matters, checkout is what spends the money.

Next time a giant repo stands between you and a one-file fix, don't watch the progress bar. Skeleton-clone it, check out the one file, do the surgery, push, and be done before the full clone would have hit double digits.

If you want to go deeper: the [official partial clone docs](https://git-scm.com/docs/partial-clone), the [`git sparse-checkout` reference](https://git-scm.com/docs/git-sparse-checkout), and GitHub's excellent [partial vs shallow clone write-up](https://github.blog/open-source/git/get-up-to-speed-with-partial-clone-and-shallow-clone/) are all worth your time. And if you set this up and hit something weird, reach out, you can find all my socials and a [contact form](https://pulkit.page/contact/).

Happy (skeleton) shipping!

## Related writing

- [Git Worktrees](https://pulkit.blog/git-worktrees.md): May 29, 2026
- [How I Use Cursor to Build at 1000x Speed](https://pulkit.blog/how-i-use-cursor.md): February 26, 2026
- [The Cookie Sync Pattern](https://pulkit.blog/cookie-sync-pattern.md): May 4, 2026
