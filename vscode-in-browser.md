# VSCode in Your Browser

> Guide on setting up a VSCode Server in your browser using Docker

- URL: https://pulkit.blog/vscode-in-browser/
- Published: July 4, 2024
- Tags: VSCode, Code Server, Docker, Web IDE, DevOps, Developer Tools

VSCode has always been our favourite code editor, but I recently got the task of getting a web version of it in a React application. Well, after googling a few things, I found this way.

## Setting up using docker

```plaintext
docker run -d \
  --name=code-server \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8443:8443 \
  -v /path/to/appdata/config:/config \
  --restart unless-stopped \
  lscr.io/linuxserver/code-server:latest
```

![Docker run command for code-server](https://pulkit.blog/assets/content/blogs/vscode-server-in-browser/4c52e535-8a6b-4cbd-bb92-0824071d152c.webp)

for more reference: [github.com/linuxserver/docker-code-server](https://github.com/linuxserver/docker-code-server)

## Setting up using npm

```plaintext
pnpm add -g code-server
```

```plaintext
code-server
```

![Terminal showing code-server starting](https://pulkit.blog/assets/content/blogs/vscode-server-in-browser/6082f3fe-bb08-495d-a275-fb3d7a327828.webp)

To get the password

![Terminal showing config file path for password](https://pulkit.blog/assets/content/blogs/vscode-server-in-browser/124e039a-8bf8-4bfc-851e-d458a185e0b3.webp)

![VSCode running in browser](https://pulkit.blog/assets/content/blogs/vscode-server-in-browser/9ee65c06-6667-43b1-a56b-43feb7b80d37.webp)

## Related writing

- [Coolify: Self-Host Postgres, Redis & Next.js](https://pulkit.blog/deploying-on-coolify.md): July 26, 2025
- [Partial Clones, Shallow Clones, and Sparse Checkout](https://pulkit.blog/git-partial-clones.md): August 3, 2026
- [Git Worktrees](https://pulkit.blog/git-worktrees.md): May 29, 2026
