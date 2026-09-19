# My First Talk: Claude Directory

> The story of the craziest 24 hours I've had: launching Claude Directory, watching it cross 75k views and 160+ stars overnight, and then walking up to demo it on stage for the very first time in my life.

- URL: https://pulkit.blog/my-first-talk/
- Published: June 13, 2026
- Tags: AI, Claude, Fable 5, Claude Code, Building in Public, Public Speaking, Noveum

Today was, without exaggeration, one of the craziest days I've had.

I launched a project, watched it do numbers I've never seen on anything I've made, and then, completely on impulse, got up in front of a room full of people and demoed it for the first time in my life. I work as a software engineer at [Noveum.ai](https://noveum.ai) and I've shipped plenty of things, but I had never once stood up and talked about my own work to a crowd. Today I did.

## Claude Directory

Last night I put a project live on my GitHub called [Claude Directory](https://github.com/pulkitxm/claude-directory): a directory of landing pages, hero sections, and interactive prototypes, more than 55 of them, every single one built end to end with [Fable 5](https://x.com/claudeai/status/2064394146916229443).

The loop was simple. I took prompts from public references, mostly [motionsites.ai](https://motionsites.ai/) and [this gist from cnemri](https://gist.github.com/cnemri/c917e11b3a6936823b509dcff53392aa), and handed them to Fable 5 to build the demos. Then I had Fable 5 write the recording script, captured a clean video of each one, and pulled it all into the [Claude Directory page](https://www.pulkit.page/claude-directory) on my portfolio. The page itself, the recording scripts, even the [launch video](https://youtu.be/mc3AYQplnM8): all Fable 5, start to finish. Each entry ships with the exact prompt I used, the open code in a single download click, and a demo video, so you can see what you're getting and just grab it.

I didn't do a big launch. I messaged people I know and told them to repost it only if they actually liked it. A lot of them did, and it snowballed: **75k+ views on X**, **160+ stars**, and **100 to 200 new follows** in twenty-four hours.

> I spent thousands of dollars building this repo… so you don't have to
>
> 50+ landing pages, hero sections & interactive prototypes: every single one generated with "Claude Fable 5", with the exact prompt preserved in its folder.
>
> Steal it. Ship it. Contribute. 👇
>
> [View the post on X](https://x.com/_pulkitxm/status/2065401748202860896)

Then came the bittersweet twist: this morning the [US government blocked Fable 5 everywhere except the US](https://x.com/AnthropicAI/status/2065597531644743999), so a chunk of the people who got excited couldn't even try the tool I'd built the whole thing with. The work is open though, and [at least we have the memories](https://x.com/_pulkitxm/status/2065646268672852448).

## My first talk

All of this was happening online while I was sitting at an event: **Localhost Build, at Microsoft**. At some point it hit me that if the project was getting this much attention on the internet right now, I should just show it to the people in the room. I asked a couple of friends, they said go for it, so I threw together a quick, slightly broken slide and presented.

[Watch on YouTube: Demoing Claude Directory at Localhost Build, Microsoft](https://www.youtube.com/watch?v=fYsE_CJn_rY)

I walked through what it was, how I built it, and the part I cared about most: the intuition behind building this way. It isn't magic, it's a way of working. At [Noveum.ai](https://noveum.ai) we lean on AI heavily, for planning, for structured workflows, and a huge amount of my day runs through [Claude Code](https://code.claude.com). To give you a sense of it, here's my usage over the last few weeks:

![My Claude Code activity calendar from May 26 to June 13: 5.76 billion tokens across 19 active days out of 19, with opus-4-8 as the top model and almost all usage coming from Code.](https://pulkit.blog/assets/content/public/blogs/my-first-talk/claude-code-usage.webp)

*~5.76B tokens in about three weeks. opus-4-8 doing most of the heavy lifting, and almost all of it from coding work, automations, etc...*

Roughly 5.76 billion tokens in three weeks, nineteen active days out of nineteen. That is the honest answer to how I shipped 55+ demos, recorded them, and built a directory page in a couple of days.

And then the part I will remember longest: people liked it. They asked questions, I answered, and there was this back-and-forth I genuinely did not expect. A few of them said they were proud of me. I was nervous out of my mind, it was my first time speaking and my first time demoing anything live, but I got through it, and I think I would do it again.

And the kindness was not only in the room. The replies on X kept coming, and a few of them really stuck with me:

> good work, most of those were gatekeeped or paid/locked behind. i really wanted these, good work making them free for use
>
> [Divikkk (@divikkk1)](https://x.com/divikkk1/status/2065730484718690645)

> you did some god's work. thank you sir
>
> [TaraT (@tarat_211)](https://x.com/tarat_211/status/2065631990674805026)

> thanks for your service sir
>
> [Yigit Okar (@yigitokar)](https://x.com/yigitokar/status/2065481860575043849)

> This is looking so good. Would love to use it for my website. But I am a grandpa when it comes to design 😢
>
> [Kushal Patil (@LatentKush)](https://x.com/LatentKush/status/2065493769265226170)

> This looks amazing, can't wait to check it out. I build websites for real clients and I'll have to test this and let you know how well it works!
>
> [Randy Franzmeier (@FranzmeierRandy)](https://x.com/FranzmeierRandy/status/2065627117606367415)

> these look pretty, thanks.
>
> [Adnan Abbasi (@LibertyAndAI)](https://x.com/LibertyAndAI/status/2065633854791266720)

> Thanks for your service, man!
>
> [aashuu ✦ (@warrioraashuu)](https://x.com/warrioraashuu/status/2065487533484454372)

> ooooo looking good!
>
> [Good Enough (@GoodEnoughAi)](https://x.com/GoodEnoughAi/status/2065473545832894623)

> Very cool 😎
>
> [Jason Kay (@jasonemkay)](https://x.com/jasonemkay/status/2065531792233308609)

> Thanks buddy
>
> [Umair Ali (@buildwithumair)](https://x.com/buildwithumair/status/2065658702682865927)

> This was much needed, found it useful
>
> [Akshit Singh Bhandari (@akshitbhandarix)](https://x.com/akshitbhandarix/status/2065777558172598738)

> cool asf
>
> [Simo Musyi (@Simo_Musyimi)](https://x.com/Simo_Musyimi/status/2065695698759110984)

> 🔥
>
> [Sina Mobasser (@mobass)](https://x.com/mobass/status/2065559415500267623)

> Super thanks Pulkit
>
> [Arsalan Shaikh أرسلان (@AbuKhadeejah)](https://x.com/AbuKhadeejah/status/2065432128939266293)

> Hey pullkit i love your website and its been really helpful on my projects! Thank you so much for making this free, you are an awesome developer and person!
>
> [LucasOl1337 (@Krocodile01)](https://x.com/Krocodile01/status/2065773716450030047)

> the prompt-preserved-in-the-folder move is the underrated part. anyone can ship a landing page from fable 5. shipping 50 with the exact prompts saved is a textbook for the next ten people who want to learn what good prompts look like in 2026
>
> [mitch morales | xp/acc (@0x1m2m3)](https://x.com/0x1m2m3/status/2065586529289052209)

> you won't get the credit you deserve for this act of generosity. from me to you - THANK YOU SO MUCH!!!
>
> [Adam Wright (@AdamLeapN)](https://x.com/AdamLeapN/status/2065534083266990521)

> this is super useful, thanks!
>
> [Savar Gupta (@savar_gupta)](https://x.com/savar_gupta/status/2065672028481536507)

> Thanks will check it out this weekend
>
> [IMRAN - Zebracross (@billyvision)](https://x.com/billyvision/status/2065470642237899176)

> 🤜🏼🤛🏼
>
> [Bruce (@BruceLLP)](https://x.com/BruceLLP/status/2065539411153199464)

> Absolute legend. Thanks man
>
> [Kai Khalid 🇰🇪 (@imkaikhalid)](https://x.com/imkaikhalid/status/2065731869828624616)

The best part was not the views or the stars. It was the people I got to meet. What a day.

## A few moments from the day

![The opening slide of my talk, 'Pulkit, Software Engineer @ Noveum.ai', on the big screen as the session begins.](https://pulkit.blog/assets/content/public/blogs/my-first-talk/01.webp)

![My X post about Claude Directory up on the screen while I present to the room.](https://pulkit.blog/assets/content/public/blogs/my-first-talk/02.webp)

![One of the Claude Directory demo landing pages shown live during the talk.](https://pulkit.blog/assets/content/public/blogs/my-first-talk/03.webp)

![A QR code on screen linking to the Claude Directory GitHub repo, with 'Give it a star'.](https://pulkit.blog/assets/content/public/blogs/my-first-talk/04.webp)

![A QR code linking to pulkitxm.com/claude-directory, captioned 'Check it out with live demos here'.](https://pulkit.blog/assets/content/public/blogs/my-first-talk/05.webp)

![The meeting chat panel projected on screen as people joined the hybrid session.](https://pulkit.blog/assets/content/public/blogs/my-first-talk/06.webp)

![Pizza and Thums Up on the table after the talk.](https://pulkit.blog/assets/content/public/blogs/my-first-talk/07.webp)

![The DLF Downtown office complex in Gurugram where the event was held.](https://pulkit.blog/assets/content/public/blogs/my-first-talk/08.webp)

![A walkway between the glass office towers at DLF Downtown, Gurugram.](https://pulkit.blog/assets/content/public/blogs/my-first-talk/09.webp)

## Related writing

- [Git Worktrees](https://pulkit.blog/git-worktrees.md): May 29, 2026
- [Kaksha: The App I Built for My Mother](https://pulkit.blog/kaksha.md): August 9, 2026
- [How I Use Cursor to Build at 1000x Speed](https://pulkit.blog/how-i-use-cursor.md): February 26, 2026
