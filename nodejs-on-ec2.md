# Node.js on EC2 with PM2 and NGINX

> Learn to deploy Node.js applications on EC2 using PM2 and NGINX for robust and scalable production environments. Step-by-step guide included

- URL: https://pulkit.blog/nodejs-on-ec2/
- Published: August 5, 2024
- Tags: AWS, EC2, Node.js, PM2, NGINX, Deployment, DevOps

Deploying Node.js applications can be a daunting task, especially when aiming for a robust and scalable production environment. However, with the right tools and a clear process, it becomes much more manageable. In this guide, I will walk you through the easy deployment of Node.js applications on Amazon EC2 using PM2 and NGINX. By the end of this article, you'll have a solid understanding of how to set up your server, manage your application processes, and configure a reverse proxy to handle incoming traffic efficiently. Let's dive in!

## Initializing the Node project

**For this walkthrough, I will be deploying a simple Express hello-world application on EC2. Let's start by initialize a simple express app**

```bash
pnpm init
```

![Terminal showing npm init command output](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/90d8aa96-dad8-4b4e-abaf-14e859a8b118.webp)

### Add express as a dependency

```bash
pnpm add express
```

### Adding a simple / endpoint that returns a hello world object

```javascript
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("app is listening on port " + PORT);
});
```

### Start your express application

```bash
node index.js
```

and you see a / endpoint like this

![Browser showing Hello World JSON response from Express app](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/e4c258cd-a01a-4dc5-8339-c79f74ac4a04.webp)

## Deploying the app on AWS EC2

### Let's bootstrap an EC2 instance

You can directly head over to [AWS EC2 create instance page](https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#LaunchInstances)

![AWS EC2 launch instance page](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/ea5f89a4-48a0-4fa0-8e17-ad1b8977ae74.webp)

You can name the ec2 instance according to you, I am naming it `demo-nodejs`.

![EC2 instance name configuration](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/62d86fd2-805f-4b60-be5b-0d1c81b5fecb.webp)

Select any image that suits you best, or you can learn more about these [here](https://aws.amazon.com/ec2/features/#product-features#ec2-features#operating-systems-and-software). I have selected the basic Ubuntu image, as it is widely used and has good support.

![EC2 Ubuntu image selection](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/4fb4dc83-b7e0-43c1-bec9-70c540e271e8.webp)

Since I am using this instance for this walkthrough, I have selected a free-tier Instance type, you can choose the instance types according to your need, know more about this [here](https://repost.aws/knowledge-center/ec2-instance-choose-type-for-workload)

![EC2 instance type selection showing free tier option](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/f97c6597-38ba-4044-86e9-253a725ac5c4.webp)

And finally launch the instance, I am going to access this instance from AWS connect, If you want to ssh into the instance you can create a key-pair and do that

![EC2 instance connect button](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/1b308264-6a14-4ca7-a363-63c5969f226c.webp)

**Click on connect to access your instance and start setting up your environment.**

![AWS EC2 connect interface](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/caa0cfbf-2bab-468c-8cb2-c5f784a7fc9f.webp)

Now you have access to you ec2 instance from your brower

![Terminal connected to EC2 instance](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/f8750e50-0ff3-4a07-965f-4879ca537887.webp)

### Setting up the Environment in the instance

Update the package lists by running:

```bash
sudo apt-get update && sudo apt-get upgrade
```

**Installing node using the NVM(Node Version Manager)**

Reference: [How To Install Node.js on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04#option-3-installing-node-using-the-node-version-manager)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

This will install the `nvm` script to your user account. To use it, you must first source your `.bashrc` file:

```bash
source ~/.bashrc
```

Now let's install node using the nvm

```bash
nvm install node
```

To check if it is installed correctly:

```bash
node --version
```

![Terminal showing Node.js version check](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/e2fbe875-ea75-4c8e-863f-0bd37b5509b9.webp)

### Starting the server on EC2

You can either upload your code on GitHub and then clone it in Ec2 or use any other viable method to get your code on the instance.

![Terminal showing Node.js server running on EC2](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/77ce1c50-d9de-48e7-898d-ae795e410d17.webp)

If you are able to see this or whatever log you added in the `app.listen()` you are good to go.

### Starting the server with pm2

Now we can do a `node index.js` and we're good to go, but this approach has its limitations. Running your application this way means it won't automatically restart if it crashes, and it won't start again if the server reboots. This is where PM2 comes in. PM2 is a production process manager for Node.js applications that ensures your application stays online, even in the face of unexpected issues. It provides features like process monitoring, automatic restarts, and load balancing, making it an essential tool for managing Node.js applications in a production environment. Let's explore how to set up and use PM2 to manage our Node.js application on EC2.

**So let's install pm2**

```bash
pnpm add -g pm2
```

Now we'll start the express app using pm2

```bash
pm2 start index.js
```

Now we have deployed the app, but it won't be accessible on the internet yet. To make it accessible, let's configure the necessary security groups and open the required ports. This will allow external traffic to reach our application.

![EC2 instance security tab](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/5e20e499-617c-40b1-833b-cf2fea46af60.webp)

Navigate to the Security tab on the Instance page. and click on the Security group which is `sg-09f5337d4845d84fb (launch-wizard-1)` here.

![Security group edit inbound rules button](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/8b2d346c-a515-4df3-aee8-7f526afea3c9.webp)

Click on `Edit inbound rules`

![Edit inbound rules page](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/8c98a4d5-0b95-499b-9892-21589eac283a.webp)

Add a new Inbound rue with Type of `Custom TCP` and PORT `3000`. To make it accessible add `0.0.0.0/0` from the CIDR block.

![Adding custom TCP rule for port 3000](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/274c4781-394f-495a-9c05-5d573867df6a.webp)

Now get the Ip from the home page of your instance

My Instance's Ip is `ec2-54-242-52-243.compute-1.amazonaws.com`, Now the app is deployed on port 300, So to access the app navigate to

`http://ec2-54-242-52-243.compute-1.amazonaws.com:3000`

And voilà! Your application is now accessible on the internet.

![Browser showing Hello World response from deployed app](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/ae71dec0-4c28-4348-b407-8c4a3258477c.webp)

But wait the url for the application is [https://ec2-54-242-52-243.compute-1.amazonaws.com:3000](http://ec2-54-242-52-243.compute-1.amazonaws.com:3000), prettly ugly to add `:3000` in the url. Have you ever seen we go to [http://google.com:5173](http://google.com). No! right, So let's fix this next

## Configuring Nginx

To make your application accessible without appending the port number to the URL, we will set up NGINX as a reverse proxy. This will allow NGINX to handle incoming traffic on the default HTTP port (80) and forward it to your Node.js application running on port 3000.

### Steps to add and Install nginx

1. **Install NGINX**

   First, install NGINX on your EC2 instance by running the following commands:

   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Start and Enable NGINX**

   Ensure that NGINX is running and set to start on boot:

   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

3. **Configure NGINX as a Reverse Proxy**

   Open the NGINX configuration file for editing:

   ```bash
   sudo vi /etc/nginx/sites-available/default
   ```

   Replace the contents of the file with the following configuration:

   ```nginx
   server {
       listen 80;
       server_name ec2-54-242-52-243.compute-1.amazonaws.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   4. Make sure to replace `ec2-54-242-52-243.compute-1.amazonaws.com` with your actual domain name or public IP address.

   5. **Test the NGINX Configuration**

      Test the NGINX configuration to ensure there are no syntax errors:

      ```bash
      sudo nginx -t
      ```

      If the test is successful, you should see a message indicating that the configuration file is okay.

      ![Terminal showing nginx configuration test success](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/8f6847e8-3efe-454e-969a-fa65b23e37b0.webp)

   6. **Restart NGINX**

      Restart NGINX to apply the new configuration:

      ```bash
      sudo systemctl restart nginx
      ```

   7. **Update Security Group to Allow HTTP Traffic**

      Ensure that your EC2 instance's security group allows inbound traffic on port 80. Navigate to the Security Groups section in the AWS Management Console, select your instance's security group, and add a rule to allow HTTP traffic on port 80 from any IP address (0.0.0.0/0) **and you may remove the 3000 port that's no more needed**

   8. **Access Your Application**

      Now, you should be able to access your Node.js application using your domain name or public IP address without appending the port number. For example:

      ```http
      http://your_domain_or_IP
      ```

      Your application should be accessible, and NGINX will forward the traffic to your Node.js application running on port 3000.

   ![Browser showing app accessible without port number](https://pulkit.blog/assets/content/blogs/deploying-nodejs-applications-on-ec2-with-pm2-and-nginx/c162d6ac-1631-4780-b34e-b90301392655.webp)

By following this guide, you have successfully deployed a Node.js application on an EC2 instance using PM2 and NGINX. This setup not only ensures that your application remains robust and scalable but also provides a clean and professional URL for your users. With PM2 managing your application processes and NGINX handling incoming traffic, you can focus on developing your application further, knowing that your deployment is in good hands. Happy coding!

## Related writing

- [AWS S3 with Node.js: Upload Files with SDK v3](https://pulkit.blog/aws-s3-with-nodejs.md): August 8, 2024
- [Coolify: Self-Host Postgres, Redis & Next.js](https://pulkit.blog/deploying-on-coolify.md): July 26, 2025
- [Branded Types in TypeScript](https://pulkit.blog/branded-types-in-typescript.md): December 26, 2025
