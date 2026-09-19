# AWS S3 with Node.js: Upload Files with SDK v3

> Integrate AWS S3 with Node.js using the @aws-sdk/client-s3 S3 client to upload files and images and manage buckets in your app.

- URL: https://pulkit.blog/aws-s3-with-nodejs/
- Published: August 8, 2024
- Tags: AWS, S3, Node.js, S3 Client, AWS SDK, File Upload, Cloud Storage, Backend

I was recently working on a project([image-tweaker](https://github.com/Pulkitxm/image-tweaker)) that required an image upload feature. I needed a reliable storage system to store the images. After researching various options, I decided to use a cloud storage service for its scalability and ease of integration. This choice allowed me to focus more on the core functionality of the project rather than worrying about storage limitations.

Among the available cloud storage services, AWS S3 stood out due to its features, reliability, and widespread adoption in the industry. AWS S3 provides a highly durable, scalable, and secure solution for storing and retrieving any amount of data from anywhere on the web. Its seamless integration with Node.js made it an ideal choice for my project, enabling efficient image uploads and management. In this article, I will walk you through the process of integrating AWS S3 with a Node.js application, simplifying the steps to help you get started quickly.

**Let's Start**

To integrate S3 with Node.js, you will need an `Access key` and a `Secret access key`. So let's start by creating one.

## Creating `Access key` and `Secret access key`

Head over to your [AWS IAM dashboard](https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/users)

![AWS IAM dashboard showing users list](https://pulkit.blog/assets/content/blogs/nodejs-s3-integration/fb2fbc95-712e-4ec4-a20a-3b404bf5c186.webp)

Go to your IAM user, and click on the `Security credentials` tab.

**Note: You can also create a new user with the necessary permissions for S3 only.**

![IAM user security credentials tab](https://pulkit.blog/assets/content/blogs/nodejs-s3-integration/6850b022-9690-4d09-8d0b-28a6af0e5052.webp)

Create a new access key

![Create access key page](https://pulkit.blog/assets/content/blogs/nodejs-s3-integration/66caf838-335e-4afe-bfbd-7f8f57c27bcf.webp)

Add local code to access the S3 bucket

![Select local code use case for access key](https://pulkit.blog/assets/content/blogs/nodejs-s3-integration/9e1bb99e-246f-49c3-9f2a-7e061c6c0b0a.webp)

Now you have you both `Access key` and `Secret access key`

![Access key and secret access key generated successfully](https://pulkit.blog/assets/content/blogs/nodejs-s3-integration/95d9f416-5220-44ac-8db4-5205f59c2fb5.webp)

Note: Please save both the keys carefully, you won't be showed the `Secret access key` again on your dashboard.

## Initialize a new Node.js Project

So let's kick things off by initializing a new Node.js project!

```bash
pnpm init
```

Next up, add `@aws-sdk/client-s3` and `dotenv` as dependencies in your project!

```bash
pnpm add @aws-sdk/client-s3 dotenv
```

## Starting with the S3 client

Starting with the S3 client is super exciting! Let's dive right in and get our hands dirty with some code!

```javascript
// client.js

const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = s3;
```

Make sure to save both the AWS keys in the .env file in the following format

```plaintext
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

## Listing S3 buckets

Listing S3 buckets is a great way to verify that our setup is working correctly. Let's write some code to list all the S3 buckets in our account.

```javascript
// index.js

require("dotenv").config();
const s3 = require("./client.js");
const { ListBucketsCommand } = require("@aws-sdk/client-s3");

const listBuckets = async () => {
  const data = await s3.send(new ListBucketsCommand({}));
  console.log("Success", data.Buckets);
};

listBuckets();
```

And guess what? We get an empty array because I don't have any S3 buckets in my account yet!

![Terminal showing empty S3 buckets array](https://pulkit.blog/assets/content/blogs/nodejs-s3-integration/0f93f326-b0e9-4cd9-856f-f5ce2ffff65f.webp)

Let's create a new method to add a bucket.

```javascript
const { CreateBucketCommand } = require("@aws-sdk/client-s3");

const createBucket = async (bucketName) => {
  const data = await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
  console.log("Bucket created successfully", data);
};

createBucket("pulkit-walkthrouh-s3");
```

![Terminal showing S3 bucket created successfully](https://pulkit.blog/assets/content/blogs/nodejs-s3-integration/af0dc97c-b1f1-493f-8982-2b38253ece39.webp)

And there, I observe a new bucket created in the S3 list within the AWS console.

![AWS S3 console showing newly created bucket](https://pulkit.blog/assets/content/blogs/nodejs-s3-integration/5ad4671f-dfe7-4c58-8fd8-fb00526603a9.webp)

If we have a `createBucket` method, why not have a `deleteBucket` method too?

```javascript
const { DeleteBucketCommand } = require("@aws-sdk/client-s3");

const deleteBucket = async (bucketName) => {
  const data = await s3.send(new DeleteBucketCommand({ Bucket: bucketName }));
  console.log("Bucket deleted successfully", data);
};

deleteBucket("pulkit-walkthrouh-s3");
```

![Terminal showing S3 bucket deleted successfully](https://pulkit.blog/assets/content/blogs/nodejs-s3-integration/f9c8acee-6b6e-418e-899e-d7e390ef9cc3.webp)

Okay so the basic create and delete is done with the SDK, now let's hop on to a specific bucket and play around some objects within that.

Before that let's move the final code to a separate file: `bucket.js`

## Uploading Objects on S3

To upload an object to S3, we need a `PutObjectCommand` method provided by the AWS SDK. Here's how you can use it:

```javascript
const { PutObjectCommand } = require("@aws-sdk/client-s3");
```

To read the object in JavaScript for uploading, we need the `fs` module. Here's how you can use it:

```javascript
const fs = require("fs");
```

finally the `uploadObject` method would look like

```javascript
async function uploadObject(pathToFile, key) {
  const uploadParams = {
    Bucket: "pulkit-walkthrouh-s3",
    Key: key,
    Body: fs.createReadStream(pathToFile),
  };

  const command = new PutObjectCommand(uploadParams);
  const response = await s3.send(command);
  console.log(response);
}

uploadObject("./test.txt", "test.txt");
```

![Terminal showing file uploaded to S3 successfully](https://pulkit.blog/assets/content/blogs/nodejs-s3-integration/62d8b52e-5425-42ad-b743-d95a7c3d53ba.webp)

**One interesting observation: if we upload an object with the same key, it will overwrite the existing object in the S3 bucket. This can be useful for updating files but be cautious as it will replace the old content.**

And yet, to delete an object from S3, we need the `DeleteObjectCommand` method provided by the AWS SDK. Here's how you can use it:

![AWS S3 console showing uploaded file in bucket](https://pulkit.blog/assets/content/blogs/nodejs-s3-integration/5b6ea3fe-1b1f-4b50-bd84-92356ee98ff1.webp)

```javascript
async function deleteObject(key) {
  const deleteParams = {
    Bucket: "pulkit-walkthrouh-s3",
    Key: key,
  };

  const command = new DeleteObjectCommand(deleteParams);
  const response = await s3.send(command);
  console.log(response);
}

deleteObject("test.txt");
```

## Upload Objects in a S3 bucket

To list objects in a bucket, we need the `ListObjectsCommand` method provided by the AWS SDK. Here's how you can use it:

```javascript
const { ListObjectsCommand } = require("@aws-sdk/client-s3");

async function listObjects() {
  const listParams = {
    Bucket: "pulkit-walkthrouh-s3",
  };

  const command = new ListObjectsCommand(listParams);
  const response = await s3.send(command);
  console.log(response.Contents);
}

listObjects();
```

![Terminal showing list of objects in S3 bucket](https://pulkit.blog/assets/content/blogs/nodejs-s3-integration/02b29ad8-d5be-476d-b3dc-60ca8f310377.webp)

I hope this guide helps you seamlessly integrate AWS S3 with your Node.js application, making your uploads feature robust and efficient. Happy coding!

## Related writing

- [Creating Your Own npx Command](https://pulkit.blog/creating-npx-command.md): July 27, 2024
- [BullMQ Cron Jobs with Redis in Node.js](https://pulkit.blog/cron-jobs-with-bullmq.md): March 29, 2026
- [Node.js on EC2 with PM2 and NGINX](https://pulkit.blog/nodejs-on-ec2.md): August 5, 2024
