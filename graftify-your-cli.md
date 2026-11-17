# Graftify Your CLI

> How I gave AI agents my Rust CLI through Graftcode without writing an MCP server by hand, and what it took to make it work out of the box.

- URL: https://pulkit.blog/graftify-your-cli/
- Published: November 17, 2026
- Tags: MCP, CLI, Graftcode, Agents

I have been building [Quinjet](https://github.com/pulkitxm/quinjet), a Git and GitHub client for the terminal, written in Rust. Over time it grew a full command line underneath the interface: status, diffs, branches, pull requests, review threads, check logs and stacks. Almost every command can answer in JSON, and every one of them is documented.

You would think that makes it easy for an AI agent to use. It did not. My agents kept reaching for `git` and `gh` instead, because that is what they already know. When I pointed them at Quinjet, they had to read help pages, guess flags and parse output, and they often gave up halfway and went back to what was familiar. The tools were all there. The agents just could not see them.

The obvious answer was an MCP server, so agents would see Quinjet's commands as tools they can call. I kept putting it off. Writing one by hand meant a second definition of every command, a protocol to implement, a server to keep running, and a tool list that would slowly drift away from the CLI. For a side project, it was a headache I did not want.

Then I came across [Graftcode](https://graftcode.com). The idea is simple: you give it plain methods, and its gateway serves them as MCP tools. Reading about it, it struck me that Quinjet's commands already were those methods. Each one has a name, arguments and help text, so Quinjet could generate the methods from its own command tree, with each method just running its command and returning the JSON. I would not maintain a server at all. I would describe my CLI once, the way it already was, and let Graftcode do the protocol work.

That part came together quickly. The harder lessons came after, and they are the ones I think are worth sharing.

The first is that a server nobody has to run is the whole product. An MCP server you start in a separate terminal is one most people will never start. So Quinjet owns the entire lifecycle. The agent launches Quinjet, Quinjet downloads and verifies the gateway the first time it is needed, keeps one copy running in the background for every agent on the machine, and stops it when nobody needs it anymore. One command connects Claude Code, Codex, Cursor and the rest, and after that the user never thinks about it again.

The second is that your CLI already knows how to be safe. Exposing reads felt fine, but letting an agent commit, merge or delete made me nervous, until I noticed that Quinjet's risky commands already asked for confirmation. For an agent, that becomes a preview: the first call says what would happen, and only a second call with an explicit yes does it. Those tools are marked as destructive, so the agent checks with you first, and one flag makes the whole thing read-only.

The third is that "works on my machine" is not the bar. On clean Linux machines, the gateway failed with a message saying Node.js was missing, even when Node was installed. The real cause was a small system library its bundled runtime needed. On a fresh machine, two agents also downloaded the gateway at the same moment and tripped over each other. None of this ever showed up on my laptop. The fix was to make every failure explain itself, naming the missing piece and the exact command that installs it.

Today agents get 94 Quinjet tools, from status and commits to review threads and check logs, on macOS and Linux with nothing installed first. Asking an agent why a check failed is now one call, instead of a chain of `gh` commands and a few thousand lines of log.

If you maintain a CLI, you are probably closer to this than you think. If your commands can print JSON, the tools already exist. Graftcode can serve them, and your job is to make it all disappear for the user. The whole change is in [one pull request](https://github.com/pulkitxm/quinjet/pull/161) if you want to see how the pieces fit together.

## Related writing

- [An MCP Server That Writes Itself](https://pulkit.blog/mcp-server-that-writes-itself.md): April 22, 2026
- [Git Worktrees](https://pulkit.blog/git-worktrees.md): May 29, 2026
