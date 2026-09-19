# Kaksha: The App I Built for My Mother

> My mother has spent the last year building the timetable for an entire government school by hand. I finally sat down, made her explain how it actually works, and shipped an Android tablet app for her in one night. This is that story.

- URL: https://pulkit.blog/kaksha/
- Published: August 9, 2026
- Tags: React Native, Expo, Claude Code, Android, TypeScript, Zod, Building in Public, Product

My mother has been a teacher at a government school for close to twenty years. About a year ago, one extra job landed on her desk: building the timetable for the entire school.

It is hard to picture how much work that is, and I think the reason is that all of us met the timetable from the wrong side. We were kids. We sat in the lectures. What we saw was one row: our class, our six periods, the same every week, printed and stuck on a wall. It looked like a fact about the world, not like something a person made.

Turn it around and it stops being a row and starts being a grid. Twelve classes in the school. Around five sections in each of those classes. Nine periods a day, six days a week. Dozens of teachers, and the same teacher has to appear over and over across that grid on the same day, in the right rooms, in the right order, without ever being in two of those places at once. Some subjects split into three streams inside a single slot. Some teachers only take certain classes. Period zero is remedial.

Then reality shows up. One teacher takes leave, and every slot they were holding that day has to be reassigned to someone who is free, who can actually teach that subject, and who is not already at their limit. One absence, and a piece of the grid has to be rebuilt on the spot. On paper, in pencil, before the first bell.

That is the problem. Not the pretty final table, but everything that has to stay true underneath it.

She would disappear into it for days. Sheets everywhere, everything cross-checked by hand, and the same sentence every time I brought it up:

> "Ho jaega ho jaega."

I kept telling her this is a software problem. Genuinely a textbook one. And she kept brushing it off, which I understand now: when a job arrives already defined as "the thing you do on paper", you inherit the method along with the work. Nobody hands you the option of doing it differently. It is just the job.

## The night I actually sat down with her

At some point I stopped suggesting and just sat next to her.

I told her we are building this, and I need you to explain it to me properly. Not the summary. The actual thing. What you do first, what breaks, what you check twice, what you have to redo when one teacher goes on leave.

And this is what came out of that conversation:

![A handwritten list on school notepaper next to an Android tablet running the Kaksha app. The list reads: 1 Teachers Add/Del, 2 Sub Add/Del, 3 Full Tr. Time Table, 4 Clash of T.T., 5 Sub-Tr (Data feed), 6 Notes, with a boxed mapping of class numbers to section letters underneath.](https://pulkit.blog/assets/content/public/blogs/kaksha/paper-and-tablet.webp)

*The actual spec. Six numbered lines on school notepaper, and a boxed list of how many sections each class runs.*

Six lines. Add and delete teachers. Add and delete subjects. The full per-teacher timetable. Clashes. Subject-to-teacher data feed. Notes. Then a box in the middle mapping each class to how many sections it has: 6 has E, 7 has F, 8 has G, 9 has E, 10 has C, 11 has D, 12 has D.

That piece of paper is a better product spec than most PRDs I have read. She had been carrying the whole data model in her head the entire time, she just never had a reason to write it down. My only job was to not lose anything in translation.

The most important thing I learned that night: **the hard part is not generating a timetable. The hard part is catching what is wrong with the one you already have.** She does not want a magic button that spits out a schedule from scratch. She wants to build it the way she always has, and be told immediately when she has double-booked someone.

That completely changed what I was going to build.

## Why it could not be a website

My first instinct was, of course, a website. I have been building websites my whole life. That is the tool I reach for without thinking.

Then I asked one more question: where would you actually use this?

In Indian government schools, every teacher gets an Android tablet. Not a laptop. Not a desktop in a staff room. A tablet, in their bag, that they already carry every day. The staff room does not reliably have wifi. Nobody is going to open a browser, type a URL, and log in to fix one period.

So a website was the wrong answer even though it was my answer. It had to be an Android app on a tablet, offline-first, where the whole timetable is a grid you look at and touch.

I went with React Native and Expo because I am comfortable there and I wanted this shipped, not researched. And I told Claude one thing over and over while building it: keep it simple. She is not a power user, she does not want settings, she wants the grid and she wants to be told when something is broken.

## What got built

The app is called **Kaksha**. The repo is [public on GitHub](https://github.com/pulkitxm/kaksha).

It is a small monorepo. A `core` package holds all the shared logic: the Zod schemas, the clash detection, the derivations, the share rendering. `server` is the web side with Postgres on Neon and Drizzle. `mobile` is the Expo app that actually runs on her tablet. Every read is parsed through a schema at the boundary, so a bad row fails loudly instead of quietly rendering as `undefined` in the middle of a timetable, which is exactly the failure mode you cannot afford here.

The navigation is, almost line for line, her piece of paper.

One note before the screenshots: **every teacher name, class and slot you are about to see is made up.** The real staff list and the real timetable belong to the school, so the screenshots run on a sample dataset. The layout is real, the data is not.

### The grid

![The Kaksha timetable screen on an Android tablet. Sections A and B are shown as rows, periods 0 to 6 as columns, and each cell holds coloured subject chips with teacher names underneath.](https://pulkit.blog/assets/content/public/blogs/kaksha/timetable-grid.webp)

*Class VI. Sections down the side, periods across the top, day numbers on each block.*

This is the screen she lives in. Sections down the left, periods across the top, and inside each cell the subject chip, the teacher, and the days that block runs on. Period 0 is the remedial NIPUN slot. Notice the block with `Skt`, `Pnb` and `Urdu` stacked together with three teacher names: that is one elective slot splitting into three streams at once, which is exactly the kind of thing that made the paper version painful.

### Clashes

![The Kaksha clashes screen listing four teacher overlaps. Each card names a teacher, says 'Booked in two places at once', and lists the conflicting sections, subjects and the period and days involved.](https://pulkit.blog/assets/content/public/blogs/kaksha/clash-detection.webp)

*Four teacher overlaps, each one telling you exactly who, which period, and which days.*

This is the screen that justifies the whole app.

Take the first card. That teacher is booked in two places in period 4, on Tuesday, Wednesday, Thursday, Friday and Saturday. On paper, that mistake survives until a teacher physically walks into the wrong room and finds someone else already teaching. Here it surfaces the second it exists, with both offending blocks listed underneath so you can tap straight into either one.

Nothing about it is clever. It is a pure function over the entries. But this is the thing she used to burn hours checking by hand, and now it is a tab.

### Teachers

![The Kaksha teachers screen showing a sample staff list. Each row has a teacher's name, their department and slot count, a green load bar, subject chips, and their weekly lecture count on the right.](https://pulkit.blog/assets/content/public/blogs/kaksha/teacher-load.webp)

*Every teacher with their weekly load as a bar. Overloading someone becomes visible instead of theoretical.*

The whole staff list, each with their weekly lecture count and a load bar. Fairness in a timetable is mostly about load distribution, and load distribution is basically impossible to eyeball across a stack of paper sheets. Here it is a list you can scan in five seconds.

This is also the screen for the bad mornings. Someone calls in sick, and the question becomes: who else teaches this subject, who is free in that period, and who is not already carrying the most lectures in the school. On paper that is three separate cross-checks under time pressure. Here you filter, you reassign, and the clashes tab immediately tells you whether the fix broke something else.

### Share

Then the part she actually cared about most, which I did not see coming.

![The Kaksha share screen. A dropdown selects a teacher, a light and dark style toggle sits below it, a rendered weekly timetable card is previewed, and there are 'Preview image' and 'Share as image' buttons at the bottom.](https://pulkit.blog/assets/content/public/blogs/kaksha/share-screen.webp)

*Pick a teacher, pick light or dark, and it renders their week as a card.*

Every teacher needs their own personal timetable. Not the whole school grid, just their week. And the way that gets distributed in real life is WhatsApp.

So the share tab renders one teacher's week as a proper image and hands it straight to the Android share sheet. `react-native-view-shot` to rasterise the card, `expo-sharing` to fire the intent. One tap, pick the chat, done.

![An exported timetable card for a single teacher, showing 27 lectures per week across classes VI, VII, VIII and X, laid out as periods by weekday with colour-coded subject blocks.](https://pulkit.blog/assets/content/public/blogs/kaksha/teacher-export.webp)

*What actually lands in the WhatsApp group. One teacher's whole week, one image.*

This is the feature that made her go from politely humouring me to actually asking for changes. Distribution was never a step in my head, because I was thinking about the data. For her, distributing a personalised timetable to every teacher on the staff list was half the job.

Good reminder that you do not find that out from a whiteboard. You find it out sitting next to the person.

## On building it in one night

I want to be honest about this part, because it is the part people usually inflate.

The building was fast. I understood the domain by 11pm and I had the thing running on a tablet before I slept. I prompted the whole thing through [Claude Code](https://code.claude.com), which is how most of my work happens now, and it did what it always does: turned a clear spec into working code faster than I could have typed it.

But the reason it worked in one night is not the tool. It is that I spent the evening before it getting the spec right, from the one person who actually knew it. Every hour of that conversation removed about three hours of building the wrong thing. Handed a vague prompt, I would have built a beautiful timetable generator that solved a problem she does not have.

The tool collapsed the implementation. The conversation is what made the implementation correct.

## Why this one felt different

If you look through [my GitHub](https://github.com/pulkitxm), there is a clear pattern. [`edith`](https://github.com/pulkitxm/edith) is a macOS menu bar app for watching my coding agent usage. [`ac`](https://github.com/pulkitxm/ac) is a project runner for Apple Container because I got tired of the ceremony. [`x-chat-exporter`](https://github.com/pulkitxm/x-chat-exporter) exports an X conversation to an offline page. [`warden`](https://github.com/pulkitxm/warden) checks packages and agent diffs before they run. [`claude-directory`](https://github.com/pulkitxm/claude-directory) came out of wanting a reference library of AI-built interfaces.

Every single one of those is me building for me. Sharpening my own workflow, shaving my own yak. I am good at that, and I like doing it, and none of it ever felt like it counted for very much.

Kaksha is the first thing I have built where the user is someone I love, doing a job that was genuinely hard, in a place where software had simply never shown up. It runs on a government-issue tablet in a school. It saves a real person real hours in a week that she was never going to get paid for anyway.

I have shipped a lot of things. This is the one I am actually proud of.

## Go sit with your parents

If your parents do something tedious and repetitive for work, go sit with them and make them explain it properly. Not the summary, the actual thing. Our parents' generation still runs a huge amount of this country on paper and habit, mostly because nobody ever sat with them long enough to show them there was another way.

And it has never been cheaper to fix. A month of evenings a few years ago is one night now. Build the thing, then teach them to use it. My mother went from "ho jaega ho jaega" to asking me for features, and that shift is the whole point.

It is a weekend of work, and it will mean more than anything else on your GitHub.

## Related writing

- [Branded Types in TypeScript](https://pulkit.blog/branded-types-in-typescript.md): December 26, 2025
- [My First Talk: Claude Directory](https://pulkit.blog/my-first-talk.md): June 13, 2026
- [BullMQ Cron Jobs with Redis in Node.js](https://pulkit.blog/cron-jobs-with-bullmq.md): March 29, 2026
