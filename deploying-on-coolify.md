# Coolify: Self-Host Postgres, Redis & Next.js

> Coolify self-hosting guide to deploy Postgres, Redis, and a Next.js app on one server, an open-source Vercel alternative you fully control.

- URL: https://pulkit.blog/deploying-on-coolify/
- Published: July 26, 2025
- Tags: Coolify, Redis, PostgreSQL, Next.js, Self-Hosting, Deployment, Docker, DevOps

## Intro

While exploring some cool tech I came across [Coolify](http://coolify.io). It’s basically a self-hosted version of Vercel, an open-source deployment tool that gives you full control. No limits, no paid plans, just full power.

Earlier, my setup was like this:

- My portfolio was deployed on [Vercel](http://vercel.com)
- Postgres was on [NeonDB](http://neon.tech)
- Redis was on [Upstash](http://upstash.com)

## My previous setup

So I had deployed my portfolio on vercel, postgres db on neondb and redis on upstash. Btw I recently closed source my portfolio. Switching to Coolify helped me with these things →

- Faster builds
- Running as many apps as I want, with all the features
- Insanely fast database queries
- And honestly, a lot more peace of mind
- Automatic Deployments(Just like vercel)

In this blog, I’ll walk you through how I did all setup by spinning up a VM on Azure (had credits there, so why not), install Coolify, and deploy:

- my Next.js portfolio(will of course work the same with any nextjs, react, express, etc. project because we’ll dockerize it)
- a Postgres database
- a Redis instance

All on a single server with 50GB storage(can be less as well, I added this much because first I have credits so it’s not a pain for me and Second it will not crash the server out of storage issues) and 8GB RAM.

This is my current config(for reference)

![Azure VM configuration showing 50GB storage and 8GB RAM](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/9434ba4b-bc77-4b13-baf3-f60892cb2c76.webp)

## Setting up a VM

I have chose Azure but you can choose any of the cloud provider like AWS, GCP, Vultr etc. All you need to do is get a compute server with given specs(50 gigs hdrive and 8 gigs memory).

1. Go to Create page and click on create under Ubuntu Server.

[![Azure portal create Ubuntu Server page](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/57c0ed18-7fe3-4e7a-b3ff-5dac9d8b251a.webp)](https://portal.azure.com/#create/hub)

2. Fill in the details, and select at least 8 gigs 4 vcpus in “Size”

![Azure VM size selection showing 8GB 4 vCPUs option](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/1d67e1ef-f3db-4d6d-bf5e-715153039872.webp)

3. You can choose whatever size that suits under the Disks section, After creation we can add custom size(maybe choose custom size like 50 gigs from there)

![Azure VM disk configuration page](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/d0c59bbe-b6ff-4f3a-9be2-c2769508d982.webp)

4. That’s it, then review and create. And wait for the deployment complete.

   ![Azure deployment complete notification](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/62fddf51-739b-4866-a2de-14b4dad78d68.webp)

## Setting up Coolify

Coolify has a very simple setup, all you need to do is run a setup script that will install all required tools and whole networking required behind the scenes.

### Installation using script

Just got to this page → <https://coolify.io/docs/get-started/installation#self-hosted-installation>

Or you can directly run this command:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

You need to ssh into your server and run this command

![Terminal showing Coolify installation script running](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/78df5c83-af18-48c2-9505-dfebb08389ed.webp)

It will take around 4-5 minutes and install all required tools like Docker, Coolify, a database to manage coolify’s state and all the setup to make available a Dashboard just like vercel. And after the complete setup the final screen looks like something this

```bash
   ____                            _         _       _   _                 _
  / ___|___  _ __   __ _ _ __ __ _| |_ _   _| | __ _| |_(_) ___  _ __  ___| |
 | |   / _ \| '_ \ / _` | '__/ _` | __| | | | |/ _` | __| |/ _ \| '_ \/ __| |
 | |__| (_) | | | | (_| | | | (_| | |_| |_| | | (_| | |_| | (_) | | | \__ \_|
  \____\___/|_| |_|\__, |_|  \__,_|\__|\__,_|_|\__,_|\__|_|\___/|_| |_|___(_)
                   |___/


Your instance is ready to use!

You can access Coolify through your Public IPV4: http://[your-server-ip]:8000

If your Public IP is not accessible, you can use the following Private IPs:

http://10.0.0.1:8000
http://10.0.1.1:8000
http://fdb9:e3dd:639b::1:8000

WARNING: It is highly recommended to backup your Environment variables file (/data/coolify/source/.env) to a safe location, outside of this server (e.g. into a Password Manager).
```

So as it says your public dashboard will be available at → `http://[your-server-ip]:8000` .

### Configuring Ports

But wait you might not be able to access the dashboard as yet.

You need to configure some networking related ports for this dashboard to work properly \[[Firewall Settings](https://coolify.io/docs/knowledge-base/server/firewall#coolify-self-hosted)]. You need to open up these ports.

| **8000** | HTTP access to the Coolify dashboard                                    |
| -------- | ----------------------------------------------------------------------- |
| 6001     | Real-time communications                                                |
| 6002     | Terminal access (Required for Coolify version 4.0.0-beta.336 and above) |
| 22       | SSH access (or your custom SSH port)                                    |
| 80       | SSL certificate generation via reverse proxy (Traefik or Caddy)         |
| 443      | HTTPS traffic                                                           |

Since we are deploying Redis and Postgres, if you need to expose them to the internet. You need to add port `5432` and `6379` as well. After these my Azure Networking section looked like this.

![Azure networking configuration showing open ports for Coolify](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/3095fd2e-c030-4cb3-9d47-eddf13735c6b.webp)

That’s it now you would be able to see a login page on that url, make an account and Login. After this follow all the onboarding steps and select localhost as the server. And you will be able to see this type of page.

![Coolify dashboard showing project overview](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/3dfa3ba5-9def-4254-b0d5-5e898bc38cf2.webp)

Now it’s like a vercel dashboard with superpowers. On this page you would be able to see a lot of options like Postgres, MongoDB, Redis, and what not. A lot of open source projects like Excalidraw, AppWrite are also available.

## Deploying NextJs app

But for this walkthrough we will start with a nextjs App. So select public repository(you can also select private repository and make a GitHub app for authentication) and enter a url. In the next step, please select Dockerfile under Build Packs and make sure the repository have a Dockerfile.

The Dockerfile I used for my nextjs App → [gist.github.com/Pulkitxm/742a20fb....](https://gist.github.com/Pulkitxm/742a20fb68a4d6031c19a91949b12873)

![Coolify repository selection with Dockerfile buildpack option](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/9c970786-0745-49c1-8028-6b32912534d9.webp)

And click continue. Then on this screen you configure further things like Environment variable, and other things. But for now click on Deploy.

![Coolify deployment configuration page with deploy button](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/957441f5-3da3-4609-8955-67517ceda1cb.webp)

After the complete Deployment you would be able to visit your website on the configured domain(if not, there will be an autogenerated domain). For configuring custom domain, you just need to add an `A` record pointing to the domain of the server and you should be good. For adding multiple domains, you can add comma separated values.

![Coolify domain configuration showing custom domain setup](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/99bcc776-539b-4e3c-8676-262019add16b.webp)

## Deploying Postgres & Redis

As I already mentioned in the Ports section you need to configure `5432` port for Postgres and `6379` for Redis. These two have a very simple and clean setup. Just go to a new Resource page from you Project. For postgres you can choose what configuration you need, but I am going with the default one.

![Coolify PostgreSQL database configuration page](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/4401c7fe-c1df-48fe-bea3-84efa5fb9057.webp)

And that’s it after this, click on start and you will see the deployment logs.

```bash
...
 Volume "postgres-data-agookgc8ckkwkwww8ccsk8ok"  Creating
 Volume "postgres-data-agookgc8ckkwkwww8ccsk8ok"  Created
 Container agookgc8ckkwkwww8ccsk8ok  Creating
 agookgc8ckkwkwww8ccsk8ok Your kernel does not support memory swappiness capabilities or the cgroup is not mounted. Memory swappiness discarded.
 Container agookgc8ckkwkwww8ccsk8ok  Created
 Container agookgc8ckkwkwww8ccsk8ok  Starting
 Container agookgc8ckkwkwww8ccsk8ok  Started
Database started.
```

For configuring if the database should be exposed to the internet or not you can edit in on the final dashboard. If you make it external then you will see Internal and external links separately. But if it is internal(as in not exposed to internet) then it can be used in environment variables for our nextjs project and it will work out of the box.

![Coolify database dashboard showing internal and external connection URLs](https://pulkit.blog/assets/content/blogs/deploying-postgres-redis-and-a-nextjs-app-on-coolify/74bc75e6-73ff-4485-8c21-1e1058fa736f.webp)

For redis also you can consider the same procedure and make it internal/external based on requirements.

Tip: If you are planning to use it for yourself then you can restrict the 8000 port of your app to your IP in the networking section of your cloud provider. This will allow you to work seamlessly without the threat of security.

## Conclusion

Switching to Coolify has been a game-changer for my deployment workflow. It's fast, flexible, and gives me the control I need without the hassle. Whether you're deploying a Next.js app or managing databases like Postgres and Redis, Coolify makes it a breeze. Give it a try and see how it can transform your projects. Happy deploying!

## Related writing

- [Node.js on EC2 with PM2 and NGINX](https://pulkit.blog/nodejs-on-ec2.md): August 5, 2024
- [VSCode in Your Browser](https://pulkit.blog/vscode-in-browser.md): July 4, 2024
- [Build a Contact Form with Resend in Next.js](https://pulkit.blog/contact-form-with-resend.md): December 13, 2024
