# SEO for Next.js Portfolio

> Discover the exact SEO strategies that helped my Next.js website rank at the top of Google search results using SSG, dynamic metadata, and Open Graph optimization

- URL: https://pulkit.blog/seo-for-nextjs-portfolio/
- Published: December 21, 2025
- Tags: SEO, Next.js, MDX, Open Graph, Meta Tags, Web Development

## Introduction

Recently, I randomly searched for "Deploying portfolio on Coolify" and was pleasantly surprised to see my website appear at the top of Google search results. This wasn't luck - it was the result of implementing a systematic SEO strategy for my Next.js website.

I even tweeted about it:

> Randomly searched for 'Deploying portfolio on Coolify' and my blog appeared on top on google
>
> http://pulkitxm.com/blogs/deploying...
>
> let's discuss how I did this?🧵
>
> [View the post on X](undefined)

I don't use any third-party platforms for my content (I used to write on Hashnode earlier, but not anymore). Now I have everything integrated into my Next.js portfolio, giving me complete control over SEO optimization. But with that control comes responsibility, you need to implement all the right techniques to rank well on search engines.

In this post, I'll walk you through the exact strategies I used to achieve perfect Lighthouse SEO scores and rank high on Google, using Next.js deployed on Vercel.

![Lighthouse performance report showing perfect 100 SEO score](https://pulkit.blog/assets/content/blogs/how-this-website-ranks-on-google/lighthouse-score.webp)
([I think nextjs won't let me have 4-100's🥲](https://x.com/_pulkitxm/status/1991758828464111734))

## The Foundation: Static Site Generation (SSG) with MDX

### Why SSG Matters for SEO

Static Site Generation is one of the most powerful features of Next.js for SEO. Instead of generating pages on each request, SSG pre-renders pages at build time, resulting in:

- Lightning-fast page load speeds (\~100-200ms)
- Better Core Web Vitals scores
- Improved crawlability for search engines
- Excellent performance on Vercel's CDN

### Setting Up MDX for Content Management

I use MDX (Markdown + JSX) for writing content. MDX gives you the flexibility of Markdown with the power of React components. Here's my content structure:

```text
/content/blogs/
  ├── content-1.mdx
  ├── content-2.mdx
  └── content-3.mdx
```

Each `.mdx` file contains frontmatter metadata and the actual content:

```markdown
---
title: "Your Content Title"
description: "SEO-optimized description"
date: "2025-12-11"
tags: ["Next.js", "SEO"]
readTime: 10
slug: "your-content-slug"
---

Your content here...
```

### Essential MDX Libraries

To parse and render MDX content effectively, I use these libraries:

1. **next-mdx-remote** (RSC-ready)

   - Enables React Server Components support
   - Provides better performance with server-side rendering
   - Allows custom component mapping

2. **gray-matter**

   - Parses frontmatter metadata from MDX files
   - Extracts title, description, tags, and other metadata
   - Essential for generating dynamic metadata

3. **remark-gfm**

   - Adds GitHub Flavored Markdown features
   - Supports tables, task lists, strikethrough
   - Enhances content formatting options

4. **rehype-highlight**

   - Provides syntax highlighting for code blocks
   - Makes technical content more readable
   - Essential for developer-focused blogs

5. **rehype-slug + autolink-headings**
   - Automatically generates heading IDs
   - Creates anchor links for headings
   - Improves internal navigation and SEO

### Implementing SSG for Dynamic Pages

Here's how I generate static pages for all my content:

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content/blogs');

export async function generateStaticParams() {
  const files = fs.readdirSync(CONTENT_DIR);

  return files
    .filter(file => file.endsWith('.mdx'))
    .map(file => ({
      slug: file.replace('.mdx', ''),
    }));
}

export default async function Page({ params }: { params: { slug: string } }) {
  const filePath = path.join(CONTENT_DIR, `${params.slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return (
    <article>
      <h1>{data.title}</h1>
      {/* Render MDX content */}
    </article>
  );
}
```

This approach ensures that all pages are pre-rendered at build time, giving you the performance benefits that search engines love. When deployed on Vercel, these static pages are served instantly from their global CDN.

## Dynamic Metadata Generation

### The Power of generateMetadata()

Next.js provides the `generateMetadata()` function for dynamic pages, which is crucial for SEO. For each page, I dynamically generate:

- Page title
- Meta description
- Open Graph tags
- Twitter Card tags
- Canonical URLs

Here's the implementation:

```typescript
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const filePath = path.join(
    process.cwd(),
    "content/blogs",
    `${params.slug}.mdx`,
  );
  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data } = matter(fileContent);

  const title = `${data.title} | Pulkit`;
  const description = data.description;
  const coverImage = `https://pulkitxm.com/images/${data.coverImage}.png`;
  const url = `https://pulkitxm.com/blogs/${params.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: data.date,
      authors: [data.author],
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage],
      creator: "@_pulkitxm",
    },
    alternates: {
      canonical: url,
    },
  };
}
```

### Custom Cover Images for Each Page

Each page has its own cover image, which is crucial for:

- Social media sharing
- Visual appeal in search results
- Better click-through rates
- Professional appearance

I store cover images in my public folder and reference them in the frontmatter. When someone shares my content on social media, they see a custom, branded image instead of a generic placeholder.

## Dynamic Sitemap Generation

### Why Sitemaps Matter

A [sitemap](https://www.pulkit.page/sitemap.xml) helps search engines discover and crawl your content more efficiently. I use this specifically for Google Search index improvement via [Google Search Console](https://search.google.com/search-console). Your sitemap helps:

- Find new pages quickly
- Understand your site structure
- Prioritize crawling important pages
- Track indexing status

### Implementing Dynamic Sitemap in Next.js

Next.js 13+ has built-in support for dynamic sitemaps. Using the files from `/content/blogs/`, I dynamically map them to generate sitemap entries:

```typescript
import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogsDir = path.join(process.cwd(), "content/blogs");
  const files = fs.readdirSync(blogsDir);

  const blogs = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const filePath = path.join(blogsDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContent);

      return {
        url: `https://pulkitxm.com/blogs/${data.slug}`,
        lastModified: new Date(data.date),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      };
    });

  return [
    {
      url: "https://pulkitxm.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://pulkitxm.com/blogs",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...blogs,
  ];
}
```

### Submitting to Google Search Console

After generating your sitemap:

1. Visit [Google Search Console](https://search.google.com/search-console)
2. Add your property (your website)
3. Go to Sitemaps section
4. Submit your sitemap URL: `https://yoursite.com/sitemap.xml`
5. Monitor indexing status

This significantly improves how quickly Google discovers and indexes your new content. I've added my sitemap to Google Console for better indexing.

## Rich Social Media Cards

### The Complete Metadata Package

Every page on my site gets the full SEO treatment:

**Canonical URL**

- Prevents duplicate content issues
- Establishes the authoritative version of the page
- Essential for SEO health

**Open Graph Tags** (Facebook, LinkedIn)

- Controls how links appear on social platforms
- Includes title, description, image, type
- Drives social media traffic

**Twitter Cards** (summary\_large\_image)

- Optimized for Twitter/X platform
- Uses larger image format for better visibility
- Includes creator attribution

**Author Attribution**

- Establishes content ownership
- Builds author authority
- Helps with E-A-T (Expertise, Authoritativeness, Trustworthiness)

**Read Time Estimation**

- Improves user experience
- Sets expectations for readers
- Can increase engagement

### Example Implementation

Here's what a complete metadata setup looks like:

```typescript
export const metadata: Metadata = {
  title: "Blog Title | Pulkit",
  description: "SEO-optimized description under 160 characters",

  openGraph: {
    title: "Blog Title",
    description: "Engaging description for social sharing",
    url: "https://pulkitxm.com/blogs/blog-slug",
    type: "article",
    publishedTime: "2025-12-11",
    authors: ["Pulkit"],
    images: [
      {
        url: "https://pulkitxm.com/images/cover.png",
        width: 1200,
        height: 630,
        alt: "Blog Title",
      },
    ],
    siteName: "Pulkit - Developer",
  },

  twitter: {
    card: "summary_large_image",
    title: "Blog Title",
    description: "Engaging description for Twitter",
    creator: "@_pulkitxm",
    images: ["https://pulkitxm.com/images/cover.png"],
  },

  alternates: {
    canonical: "https://pulkitxm.com/blogs/blog-slug",
  },

  authors: [{ name: "Pulkit" }],
};
```

### Why Social Cards Matter

When your content has rich social media cards:

- Shares look professional and trustworthy
- Click-through rates increase significantly
- Social media drives substantial traffic
- Brand recognition improves
- Content spreads more organically

Social shares look professional and drive traffic!

## Additional SEO Best Practices

### Security & Cache Headers

Implement proper security and caching headers in your `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

### Semantic HTML

Use proper HTML5 semantic elements:

- `<article>` for blog posts
- `<header>` for page headers
- `<nav>` for navigation
- `<main>` for main content
- `<aside>` for sidebars
- `<footer>` for footers

Search engines use semantic HTML to better understand your content structure.

### RSS Feed Generation

Create an [RSS feed](https://support.microsoft.com/en-us/office/what-are-rss-feeds-e8aaebc3-a0a7-40cd-9e10-88f9c1e74b97) for your content:

```typescript
import RSS from "rss";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export async function GET() {
  const feed = new RSS({
    title: "Pulkit",
    description: "Technical content about web development",
    feed_url: "https://pulkitxm.com/rss.xml",
    site_url: "https://pulkitxm.com",
    language: "en",
  });

  const contentDir = path.join(process.cwd(), "content/blogs");
  const files = fs.readdirSync(contentDir);

  files.forEach((file) => {
    const filePath = path.join(contentDir, file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);

    feed.item({
      title: data.title,
      description: data.description,
      url: `https://pulkitxm.com/blogs/${data.slug}`,
      date: data.date,
      author: data.author,
    });
  });

  return new Response(feed.xml(), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
```

### Internal Linking via Tags

Implement a tagging system that creates internal links between related posts:

```typescript
export function RelatedPosts({ currentSlug, tags }: { currentSlug: string; tags: string[] }) {
  const relatedPosts = getAllPosts()
    .filter(post =>
      post.slug !== currentSlug &&
      post.tags.some(tag => tags.includes(tag))
    )
    .slice(0, 3);

  return (
    <aside>
      <h3>Related Posts</h3>
      <ul>
        {relatedPosts.map(post => (
          <li key={post.slug}>
            <Link href={`/blogs/${post.slug}`}>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

Internal linking:

- Helps search engines discover content
- Distributes page authority
- Improves user engagement
- Reduces bounce rates

### Mobile-First Responsive Design

Ensure your website is mobile-friendly:

- Use Tailwind CSS responsive utilities
- Test on multiple device sizes
- Optimize images for mobile
- Use proper viewport meta tags
- Ensure touch targets are large enough

Google uses mobile-first indexing, meaning it primarily uses the mobile version of your content for indexing and ranking.

## The Complete SEO Checklist

To hit 💯 on Lighthouse SEO, implement these strategies:

1. **Static Site Generation (SSG)**

   - Use `next-mdx-remote` for MDX parsing (RSC-ready)
   - Pre-render all pages at build time
   - Achieve fast page load speeds (\~100-200ms)

2. **Dynamic Metadata per Page**

   - Implement `generateMetadata()` for each page
   - Include Open Graph and Twitter Card tags
   - Set canonical URLs
   - Use custom cover images

3. **Security & Cache Headers**

   - Add security headers in `next.config.js`
   - Implement proper caching strategies
   - Optimize images and assets

4. **Semantic HTML**

   - Use proper HTML5 elements
   - Structure content logically
   - Improve accessibility

5. **Sitemap + RSS Feed**

   - Generate dynamic sitemap from content files
   - Submit to Google Search Console
   - Provide RSS feed for readers

6. **Internal Linking via Tags**

   - Implement tag-based related content
   - Create navigation between pages
   - Build topic clusters

7. **Rich OG/Twitter Cards**

   - Custom cover images per page
   - Complete Open Graph implementation
   - Twitter Card optimization (summary\_large\_image)
   - Author attribution

8. **Mobile-First Responsive Design**
   - Use Tailwind CSS for responsive layouts
   - Touch-friendly interfaces
   - Fast mobile load times

## Results and Benefits

By implementing these strategies, I achieved:

- **100/100 Lighthouse SEO score**
- **Top rankings on Google** for relevant searches
- **High-quality social media shares** with professional previews
- **Fast page load times** (\~100-200ms with SSG on Vercel)
- **Complete control** over content and SEO
- **No dependency** on third-party content platforms

## Conclusion

Having your content directly on your Next.js portfolio (instead of platforms like Hashnode or Medium) gives you unprecedented control over SEO optimization. While it requires more setup, the benefits are substantial:

- Full control over technical SEO
- Better performance and Core Web Vitals
- Custom branding and design
- No platform limitations
- Direct ownership of your content

**No 3rd party platforms needed. Full control over SEO!**

By following this comprehensive guide, you can achieve similar results and rank well on Google. The key is to implement these techniques systematically and maintain high-quality content.

Remember: SEO is not a one-time setup. Continue to:

- Monitor your rankings in Google Search Console
- Update old content
- Create fresh, valuable content
- Stay updated with SEO best practices
- Analyze your performance data

With patience and consistency, your Next.js website can compete with - and even outperform - content on major platforms. Happy building and ranking! 🚀

## Related writing

- [Open Graph Images in Next.js](https://pulkit.blog/og-images-in-nextjs.md): November 15, 2024
- [Build a Contact Form with Resend in Next.js](https://pulkit.blog/contact-form-with-resend.md): December 13, 2024
- [Smooth Scrolling in Next.js](https://pulkit.blog/smooth-scroll.md): March 3, 2026
