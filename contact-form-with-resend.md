# Build a Contact Form with Resend in Next.js

> Build a Resend contact form in Next.js using Server Actions and React email templates, then verify a custom domain to reach the inbox.

- URL: https://pulkit.blog/contact-form-with-resend/
- Published: December 13, 2024
- Tags: Resend, Contact Form, Next.js, Email, Server Actions, Resend API, Web Development

Sending emails is a common feature in web applications, whether for user signups, notifications, or transactional purposes. In this guide, we’ll explore how to integrate Resend, a developer-friendly email API, into a Next.js application for seamless email delivery.

## **What is Resend?**

> Resend is **a software development company that specializes in providing developer-focused email solutions**. The company offers an email API for developers, enabling them to build, test, and send transactional emails at scale.

I'm quite particular about my portfolio, and while browsing through some developer portfolios online, I noticed that most of them had a contact section with a form in addition to contact links. This led me to research some good email solutions. Initially, I tried [emailjs](https://www.emailjs.com), but its free tier was pretty basic. That's how I eventually discovered Resend.

[![Contact form on portfolio website](https://pulkit.blog/assets/content/blogs/emails-with-resend/fb91fd24-5e0d-463d-90c9-223671d3db5c.webp)](https://pulkitxm.com/contact)

So let me show you how you can easily integrate an awesome contact form into your Next.js project!

## Setting Up the Environment

### Create a New Next.js App

Let's first set up a new Next.js project. You can follow along if you already have one too!

```bash
pnpx create-next-app resend-demo
```

```bash
pulkit@pulkit-tuf:~/Desktop/resend-demo pnpx create-next-app resend-demo
✔ Would you like to use TypeScript? … No / Yes
✔ Would you like to use ESLint? … No / Yes
✔ Would you like to use Tailwind CSS? … No / Yes
✔ Would you like your code inside a `src/` directory? … No / Yes
✔ Would you like to use App Router? (recommended) … No / Yes
✔ Would you like to use Turbopack for `next dev`? … No / Yes
✔ Would you like to customize the import alias (`@/*` by default)? … No / Yes
Creating a new Next.js app in ~/Desktop/resend-demo.
```

Once the setup is complete, navigate to the project directory:

```bash
cd resend-demo
pnpm dev
```

Open <http://localhost:3000> in your browser. You should see the default Next.js welcome page.

### Install Required Dependencies

Next, install the Resend SDK to integrate email functionality:

```bash
pnpm add resend
```

This package will allow us to interact with Resend's API effortlessly.

### Set Up Environment Variables

To securely use the Resend API, you'll need an API key. Follow these steps:

1. Visit [**resend.com**](https://resend.com) and create an account if you haven't already.
2. **Generate an API Key**:

   - Navigate to the API keys section in your dashboard or go directly to [resend.com/api-keys](https://resend.com/api-keys).
   - Click on `Create API key` to generate a new key.
     ![Resend API keys page with create button](https://pulkit.blog/assets/content/blogs/emails-with-resend/957f2ab3-d003-4467-900a-03c6abbd3d7b.webp)
     - Copy the generated API key for later use.
       ![Generated API key displayed on Resend dashboard](https://pulkit.blog/assets/content/blogs/emails-with-resend/faf1f878-5818-441e-a6b1-1b8c9527e1bf.webp)
     - Add the key to a `.env` file in your project root
       ```bash
       RESEND_API_KEY=your-resend-api-key
       ```

## Implementing Email Sending in Next.js

Now, let's focus on implementing email sending functionality in our Next.js application. This process involves integrating the Resend SDK, which we installed earlier, to seamlessly interact with Resend's API. By doing so, we can send emails directly from our application, enhancing its communication capabilities.

### Building a Basic Contact Form

Before diving into sending emails, let’s create a basic contact form as our frontend interface. This form will allow users to enter their name, email, and message. Once submitted, we’ll handle the backend functionality to send emails via Resend.

> The below snippet defines a `ContactForm` component, managing form inputs for name, email, and message with state hooks. It includes a submit handler that simulates sending a message with a loading animation, using [shadcn](https://ui.shadcn.com) components and icons for a polished user interface. The form provides feedback on submission status with conditional rendering and animations.

Before copying and pasting, please install the dependencies.

```bash
pnpx shadcn add input textarea button label
#lucid-icons are installed along these
```

```tsx
// src/components/ContactForm.tsx
"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send, User } from "lucide-react";

export default function ContactForm() {
  const [formInputs, setFormInputs] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formInputs.name || !formInputs.email || !formInputs.message) return;

      setIsSubmitting(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsSubmitted(true);
      } catch (error) {
        console.error("Failed to send email:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formInputs],
  );

  return (
    <form
      onSubmit={handleSendMessage}
      className="mx-auto max-w-4xl space-y-4 px-4 sm:px-6 lg:px-8 min-w-[600px]"
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">
          Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            value={formInputs.name}
            onChange={(e) =>
              setFormInputs((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-400"
            placeholder="John Doe"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="email"
            value={formInputs.email}
            onChange={(e) =>
              setFormInputs((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-400"
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-gray-300">
          Message
        </Label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Textarea
            value={formInputs.message}
            onChange={(e) =>
              setFormInputs((prev) => ({
                ...prev,
                message: e.target.value,
              }))
            }
            className="min-h-[120px] border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-400"
            placeholder="Your message here..."
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-white text-black hover:bg-white/90"
        disabled={isSubmitting || isSubmitted}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            Sending...
            <span className="animate-spin">⏳</span>
          </span>
        ) : isSubmitted ? (
          <span className="flex items-center gap-2">
            Thanks
            <span className="animate-pulse">✨</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Send Message
            <Send className="h-4 w-4" />
          </span>
        )}
      </Button>
    </form>
  );
}
```

### Sending Emails with Resend

For handling form submissions and sending emails in Next.js, I personally prefer **Server Actions**, as they allow for cleaner and most important **type safety**. However, if you prefer, we can also create an API endpoint for the same functionality.

Now, let's dive into the code implementation:

```tsx
"use server";

import EmailTemplate from "@/components/EmailTemplate";
import { Resend } from "resend";

const { RESEND_API_KEY } = process.env;

export async function sendEmail(data: {
  from_name: string;
  message: string;
  sender_email: string;
}) {
  if (!RESEND_API_KEY) {
    return { error: "Failed to send email", status: 500 };
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const resp = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["delivered@resend.dev"],
      subject: "🎉New submission to your contact form!",
      react: EmailTemplate(data),
    });

    if (resp.error) {
      console.log(resp.error);
      return { error: "Failed to send email", status: 500 };
    }

    return { message: "Email sent successfully" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return { error: "Failed to send email", status: 500 };
  }
}
```

You must have noticed the email template in the code above. Yes, **Resend** allows us to use **React components** as the email content, making it super convenient to create dynamic and personalized email layouts.

```tsx
// src/components/EmailTemplate.tsx
import Link from "next/link";

export default function EmailTemplate({
  from_name,
  message,
  sender_email,
}: {
  message: string;
  from_name: string;
  sender_email: string;
}) {
  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">
        New message from {from_name}
      </h1>
      <p className="mb-2 text-gray-600">{message}</p>
      <p className="text-gray-500">
        Sender email:{" "}
        <Link
          href={`mailto:${sender_email}`}
          className="text-blue-500 hover:underline"
        >
          {sender_email}
        </Link>
      </p>
    </div>
  );
}
```

Now you can update the

```tsx
import { sendEmail } from "@/actions/email";

const handleSendMessage = useCallback(
  async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInputs.name || !formInputs.email || !formInputs.message) return;

    setIsSubmitting(true);

    try {
      await sendEmail({
        from_name: formInputs.name,
        message: formInputs.message,
        sender_email: formInputs.email,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to send email:", error);
    } finally {
      setIsSubmitting(false);
    }
  },
  [formInputs],
);
```

Now we can test the contact form and find all the emails in the resend dashboard.

![Resend dashboard showing sent emails](https://pulkit.blog/assets/content/blogs/emails-with-resend/c42f0db8-a864-4d0a-8c43-018b179f3742.webp)

## Adding a Verified Domain

In the previous section, we've demonstrated how to send emails using **Resend** in a Next.js application. However, to ensure your emails land in the recipient's inbox and avoid being marked as spam, it’s crucial to add and verify a **custom domain**. Here's why:

### Why Add a Custom Domain?

When you send an email without a verified domain, it’s likely to be flagged by email providers due to the absence of proper email authentication. By default, emails sent through Resend come from generic email addresses (e.g., [`onboarding@resend.dev`](mailto:onboarding@resend.dev)). While this can work for testing purposes, production emails require more trustworthiness.

### Adding a custom domain

I had added a custom domain from my portfolio domain: [**pulkitxm.com**](https://pulkitxm.com). Here’s a step-by-step guide on how I did it:

1. **Add Domain**: First, I logged into my Resend dashboard and added my portfolio domain **pulkitxm.com**. This is the domain from which I wanted to send emails.
2. **DNS Settings**: After adding the domain, Resend prompted me to configure the **DNS settings**. It provided specific records, such as **SPF**, **DKIM**, and **DMARC**, which I needed to add to the DNS settings for my domain.
3. **Update DNS Records**: I accessed my domain registrar (where I purchased **pulkitxm.com**) and updated the DNS settings by adding the records provided by Resend. This process usually takes some time to propagate.
4. **Domain Verification**: Once the DNS settings were updated, Resend verified the domain and completed the setup. It might take a few minutes to a couple of hours for the verification process to complete.
5. **Email Setup**: After successfully adding and verifying my domain, I was able to start sending emails from a custom email address: **<mails-from-portfolio@pulkitxm.com>**.

## Wrapping Up

And there you have it! You've enhanced your Next.js app with a contact form and Resend email integration. Now, users can easily contact you, and you'll be ready to reply. Whether it's for a portfolio, business site, or just for fun, this setup will impress. Try it out and enjoy the incoming emails. Happy coding!

## Related writing

- [Open Graph Images in Next.js](https://pulkit.blog/og-images-in-nextjs.md): November 15, 2024
- [SEO for Next.js Portfolio](https://pulkit.blog/seo-for-nextjs-portfolio.md): December 21, 2025
- [Smooth Scrolling in Next.js](https://pulkit.blog/smooth-scroll.md): March 3, 2026
