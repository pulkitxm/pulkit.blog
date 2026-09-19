# How I Use Cursor to Build at 1000x Speed

> A deep dive into how I use Cursor AI to ship production features faster than ever, the workflows that actually work, and why my company sponsors the Ultra plan for every engineer

- URL: https://pulkit.blog/how-i-use-cursor/
- Published: February 26, 2026
- Tags: Cursor, AI, Developer Tools, Productivity, Workflow, Web Development

I'm about to graduate in July. I started coding seriously in my freshman year, so I haven't been at this for that long. And yet, before even graduating, I'm able to write and ship at a speed that feels insane. That's only possible because of how I've learned to use Cursor, and I owe a huge thanks to [Shashank Agarwal](https://www.linkedin.com/in/shashankagarwal2), our CEO, who put in so much time teaching us. He runs the dev syncs every two weeks, personally onboarded each of us on Cursor, and made sure everyone on the team understood the importance of AI and agentic coding. He's the one who taught us.

![](https://pulkit.blog/assets/content/blogs/how-i-use-cursor/cursor-top-11-perc.webp)

![](https://pulkit.blog/assets/content/blogs/how-i-use-cursor/cursor-2025.webp)

![](https://pulkit.blog/assets/content/blogs/how-i-use-cursor/cursor-2025-models.webp)

I've gone through the usual arc: VS Code with a million extensions, Vim motions that made me feel like a hacker, terminal workflows that were more ritual than productivity. But nothing, and I mean nothing, has changed the way I build software the way Cursor has.

This isn't a "Cursor is cool" post. This is a breakdown of how I actually use it every day at work and on my personal projects, the specific workflows that give me leverage, and the mental models that make the difference between using Cursor as a fancy autocomplete and using it as a genuine force multiplier.

## The Context: Why My Company Sponsors the Ultra Plan

I work at [Noveum AI](https://noveum.ai), a 7-engineer startup where customers regularly assume we're a 50-person team. Recently, our CEO [Shashank's post](https://www.linkedin.com/posts/shashankagarwal2_were-a-7-engineer-startup-customers-regularly-activity-7427177147267633153-PeFv) about how we operate went viral on LinkedIn. The core idea: every developer gets a company credit card with $50-200/month to spend on any AI tool they want. No approval needed.

![Cursor individual plans pricing - Hobby (Free), Pro ($20/mo), Pro+ ($60/mo), Ultra ($200/mo)](https://pulkit.blog/assets/content/blogs/how-i-use-cursor/pricing.webp)

I'm fortunate enough to have the $200 Ultra plan sponsored. And it's not charity, it's an investment. The output I produce with Cursor is genuinely incomparable to what I was doing before. Features that used to take me days now take hours. Entire modules that would've been a week-long sprint get shipped in an afternoon.

Every two weeks, we do a "Dev Sync" where the team shares what's working: new Cursor tricks, prompts that save time, patterns that didn't work. The knowledge compounds fast when 7 people are all experimenting and sharing. This post is essentially my version of that sync, but for everyone.

## Before Cursor: The Old World

Let me paint the picture of what building looked like before:

1. Read docs for 30 minutes to understand an API
2. Write boilerplate by hand
3. Google the error, find a StackOverflow answer from 2019
4. Adapt it, break something else
5. Repeat

It worked. We all did it. But looking back, so much of that time was spent on **translation**, not **thinking**. I already knew what I wanted to build. The bottleneck was turning that intent into code, dealing with syntax I half-remembered, APIs I'd used once before, and patterns I knew existed but couldn't recall the exact shape of.

Cursor eliminates the translation layer. I think, and the code appears. Not perfectly every time, but close enough that I'm editing instead of writing from scratch. And no, it's not like I was a bad engineer before, I'm a god-level engineer, obviously :) I could ship without Cursor. The bottleneck was never my ability, it was the speed of getting code onto the screen.

## My Actual Workflow

Here's how I use Cursor on a typical day. Not the theoretical "you could do this" stuff, but what I actually do.

### 1. Start With Context, Not Code

The biggest mistake people make with Cursor is jumping straight into asking it to write code. I always start by giving it context.

When I open a new task, I'll usually:

- Open the relevant files that touch what I'm building
- Reference them with `@` in the chat
- Describe the feature I'm building in plain English, including edge cases and constraints. I use [Wisprflow](http://wisprflow.ai) and blab every single thought in my head, no filter, no structure, just stream of consciousness untill Cursor has enough context

Speaking is faster than typing. I can get my thoughts out way faster by talking than by breaking the keyboard. I don't have a 100 wpm typing speed, so judge me all you want. Voice input is my cheat code.

Something like:

> I'm adding a rate limiter to our API routes. We use Hono on Next.js with Redis for state. The rate limit should be per-user based on thier API key, with a sliding window of 60 seconds and a max of 100 requests. It needs to return proper 429 responses with retry-after headers.

This is way more effective than saying "add rate limiting". The specificity of the prompt directly correlates with the quality of the output.

### 2. Plan Mode First

![](https://pulkit.blog/assets/content/blogs/how-i-use-cursor/plan-mode.webp)

Use `Cmd + .` to switch modes in Cursor. I always start with [Plan mode](https://cursor.com/blog/plan-mode). It's similar to Ask, but instead of jumping straight into code(like it is in Agent mode), Plan mode edits a single markdown file and spits out a step-by-step flow of how it'll build. You get a clear execution plan before any code gets written. Review it, tweak the order if something doesn't make sense, and keep iterating on the plan it makes till you're satisfied with it. Only then switch to Agent mode to execute. It's like having a blueprint before breaking ground. Saves me from backtracking when the agent goes down a path I didn't want.

### 3. Agent Mode for Greenfield, Tab for Everything Else

I use two modes almost exclusively:

**Agent mode** when I'm building something new. A new component, a new API route, a new utility. Agent mode is incredible for greenfield work because it can create files, install dependencies, and wire things together across your codebase. I'll describe what I want, point it at the right directories, and let it work.

**Tab completion** for everything else. When I'm editing existing code, fixing bugs, or making small changes, Cursor's tab completion is shockingly good. It reads the context of what you're doing and suggests the next logical chunk. Not just the next line, but often entire blocks that are exactly what you need.

I almost never use the inline edit `Cmd + K` anymore. Agent mode or tab, that's it.

### 4. Rules Are Everything

This is probably the single most impactful thing I've done with Cursor. I have a `.cursor/rules` directory in every project with specific rules for the codebase.

My rules cover things like:

- The coding style (functional components, no classes, no enums)
- Which libraries to prefer (Shadcn over custom components, Tailwind for styling)
- How to structure files
- Naming conventions
- Performance patterns to follow
- Community rules from [skills.sh](https://skills.sh), install pre-built skills with `npx skills add owner/repo` to add React best practices, web design guidelines, and more

When Cursor knows the rules of your codebase, it stops generating generic code and starts generating code that actually fits. The difference is night and day.

### 5. Model Selection

Not all models are equal, and not every task needs the most expensive one. Be aware of both the cost and the type of task you're doing.

**Opus 4.6** is a great model for planning and reasoning. But if you use it for Agent mode - long-running tasks where it's creating files, running commands, iterating across your codebase - it will burn through your credits fast. Save the heavy models for the thinking work, not the grunt work.

**For design tasks**, try Gemini 3 or GPT 5.2. At this point in time, these models tend to produce better design outputs - layouts, UI suggestions, visual structure. Match the model to the job.

**Cost awareness matters.** If you default to expensive models like Opus or ChatGPT's top-tier options for everything, you'll blow through your credits before the month ends. Use cheaper models for simple edits, tab completion, and routine tasks. Reserve the premium models for complex architecture decisions, tricky debugging, and tasks where the extra capability actually pays off.

A common pattern I use: Plan mode with Opus 4.6 to think through the approach and get a solid blueprint, then switch to cheaper models like Auto or others when Agent mode executes. Let the expensive model do the thinking, let the cheaper one do the typing.

### 6. Patterns That Actually Work!!

This one's probably the best and most actionable one, stick to it!!

I use source control, for the longest time ever I've been that guys who used to enjoy writing git commands, but with the adoption to these AI tools like cursor, claude code etc. I have started leaning towards using source control. It just gives me better and faster visualization of the changes I'm making with agents.

So let's say I am doing a task with cursor/or whatever agent and I keep iterating with it on and on. So how do I keep track of the changes I'm making? I use source control. Even while writing this blog I am using source control.

![Using source control to track agent changes](https://pulkit.blog/assets/content/blogs/how-i-use-cursor/using-source-control.webp)

I keep staging/commiting changes regularly, so that I can always go back to a previous version if I need to. This also helps me to understand the changes agent is making and why it made them. This also helps in faster rollbacks, I know cursor have a better way to do this.

![Cursor rollback UI for reverting agent changes](https://pulkit.blog/assets/content/blogs/how-i-use-cursor/rollback.webp)

I usually run around >4-5 agents and keeping track of the changes I'm making with all of them :) \
&#x20;Good luck doing that without source control!!

You can also try using different mcp servers, recently they caused me a hell lot of issues in cursor so I refrain from using them!! But If they work out for you, go for it!!

![Cursor mail or notification UI](https://pulkit.blog/assets/content/blogs/how-i-use-cursor/mail.webp)

### 7. Don't Accept Blindly

This is critical. I read every line Cursor generates before accepting it. Not because I don't trust it, but because:

- It catches the 10% of the time when the output is subtly wrong
- I learn patterns I didn't know about
- I maintain a mental model of my codebase

The developers who get burned by AI tools are the ones who accept everything without reading. You're the architect, Cursor is the builder. The architect still needs to review the blueprints.

## What 1000x Actually Means

When I say 1000x, people think I'm exaggerating. Let me be specific about what I mean.

**It's not that I write code 1000x faster.** It's that the entire feedback loop is compressed.

Before Cursor:

- Think about what to build → 10 min
- Look up the API/pattern → 20 min
- Write the code → 40 min
- Debug issues → 30 min
- Write tests → 20 min
- **Total: \~2 hours**

With Cursor:

- Think about what to build → 10 min (this doesn't change)
- Describe it to Cursor with context → 2 min
- Review and refine the output → 10 min
- Tests are already written → 0 min
- **Total: \~22 minutes**

For a single feature, that's roughly a 5x speedup. But the real multiplier comes from compounding: I can now attempt things I wouldn't have before. A feature that would've taken 3 days? I'll try it in an afternoon. If it doesn't work, I've lost 3 hours instead of 3 days.

The willingness to experiment, to build and throw away, to try ambitious approaches, that's where the 1000x feeling comes from. It's not just speed, it's expanded scope.

## The Human Part That Still Matters

Despite everything I've said, here's what Cursor can't do:

- **Understand your users.** It doesn't know why a feature matters or who it's for.
- **Make product decisions.** It can't decide what to build, only how.
- **Debug production issues.** It can help analyze logs, but it can't reason about distributed system failures the way an experianced engineer can.
- **Review its own work critically.** You need to be the quality gate.

The best way I can describe it: Cursor handles the "what" and "how" of coding. You still own the "why" and "whether".

## Getting Started If You're New

If you're reading this and haven't tried Cursor yet, here's my recomendation:

1. **Start with tab completion.** Just use it as a VS Code replacement and let tab do its thing. You'll be impressed in the first hour.
2. **Try Agent mode on a side project.** Build something small end-to-end. A CLI tool, a simple API, a component library.
3. **Set up rules for your main project.** Even 10 lines of rules will noticeably improve output quality.
4. **Share what works with your team.** The compounding effect of a whole team learning together is massive.

Can't afford it or your company won't sponsor it? Get the $20 Pro plan anyway. It's one of the best investments you can make in yourself, you won't regret it.

## Wrapping Up

A year ago, I was skeptical about AI coding tools. Today, I can't imagine going back. Cursor hasn't made me a worse programmer, it's made me a more ambitious one. I take on bigger projects, ship faster, and spend more time on the parts of engineering that actually require human judgment.

Sure, if I coded without AI now, it'd take me longer. I might not remember concepts as well as I did in pre-AI times. But code is no longer the leverage, ideas are. So go out and build stuff.

If your company isn't sponsoring AI tools for developers yet, show them the math. A $200/month tool that makes each engineer even 3x more productive is the highest-ROI investment in the entire tech budget.

And if you're already using Cursor but feel like you're not getting the full value, revisit your rules, be more specific with your prompts, and stop accepting code you haven't read.

If you want personalized Cursor tips or suggestions for your workflow, reach out. I'm happy to help. You can find all my socials and [contact form](https://pulkit.page/contact/).

Happy building!

## Related writing

- [Git Worktrees](https://pulkit.blog/git-worktrees.md): May 29, 2026
- [Partial Clones, Shallow Clones, and Sparse Checkout](https://pulkit.blog/git-partial-clones.md): August 3, 2026
- [Build a Contact Form with Resend in Next.js](https://pulkit.blog/contact-form-with-resend.md): December 13, 2024
