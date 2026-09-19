# FastAPI SSE: Server-Sent Events in Python

> Stream real-time Server-Sent Events from FastAPI with sse-starlette's EventSourceResponse for long-running tasks and live updates. Full Python code.

- URL: https://pulkit.blog/sse-with-fastapi/
- Published: July 26, 2024
- Tags: FastAPI, SSE, Server-Sent Events, sse-starlette, EventSourceResponse, Python, Real-time, Streaming, Backend

During my recent internship, I faced a task where the server needed to run a long-running process. This couldn't be done with just a POST request because the task could take up to 15 minutes to complete. So, we needed an alternative for this use case. And yes, you guessed it right, the solution is server-sent events.

## What exactly is the server-sent event?

It is a standard allowing servers to push updates to the client over a single HTTP connection. This is useful for tasks that take a long time to complete, as it keeps the client informed about the progress without needing to constantly poll the server.

SSEs (Server-Sent Events) are essentially a subset of a WebSocket connection. While WebSockets provide a two-way communication channel, SSEs offer a one-way connection from the server to the client. This allows the server to send updates to the client without the client needing to request them repeatedly.

Since the client of our app doesn't need to push any updates to the server for this task, it fits well with the use case.

![Server-Sent Events diagram showing client-server communication](https://pulkit.blog/assets/content/blogs/server-sent-events-with-fastapi/987f4d84-ef91-44d1-89e0-e35ad93742ec.webp)

## Use Cases for a Server-Sent Events (SSE) Server

Server-Sent Events (SSE) provide a way for servers to push real-time updates to clients over a single HTTP connection. This is particularly useful for applications that require live data updates without the need for constant polling.

1. **Real-Time Notifications**: SSE is perfect for sending instant notifications to users, such as updates on social media platforms, email alerts, or system notifications in web applications.
2. **Live Sports Scores**: Applications that provide live sports updates can use SSE to push real-time scores and game updates to users, ensuring they receive the latest information without delay.
3. **Stock Market Updates**: Financial applications can leverage SSE to deliver real-time stock market data, keeping users informed about the latest market trends and changes as they happen.

## Basic FastAPI Server Initialization

Follow these steps to create an SSE endpoint, and watch your server push updates to the client with lightning speed and efficiency!

```bash
python3 -m venv venv
source venv/bin/activate
```

![Terminal showing Python virtual environment activation](https://pulkit.blog/assets/content/blogs/server-sent-events-with-fastapi/bc758d6d-c914-4c4a-bf5d-8dfbf2ce3183.webp)

```bash
pip install fastapi sse-starlette uvicorn asyncio
```

![Terminal showing FastAPI dependencies installation](https://pulkit.blog/assets/content/blogs/server-sent-events-with-fastapi/2c5d09d7-fa01-46f2-9f38-21ebc2587012.webp)

Let's set up a basic FastAPI server.

```python
from fastapi import FastAPI, Response

app= FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

![Terminal showing FastAPI server running](https://pulkit.blog/assets/content/blogs/server-sent-events-with-fastapi/6c00af74-1de9-46c1-b6e3-eee5ff533c99.webp)

```bash
uvicorn main:app --reload
```

And the server runs as expected.

## Adding the SSE (Server-Sent Events)

```python
from sse_starlette.sse import EventSourceResponse
```

Import the `EventSourceResponse` from `sse_starlette`. The `EventSourceResponse` is used to create a Server-Sent Events (SSE) endpoint that can push updates to the client in real-time.

**Note:** For now, I am adding a test `event_generator` function that works as a long-running task.

```python
async def event_generator():
    i= 1
    while i<=5:
        await asyncio.sleep(1)
        i+=1
        yield {"data": "New update"}
```

Just like we return a response with `return {"message": "Hello World"}`, we will now yield updates from our event generator function. This allows the server to push new data to the client continuously.yield is simply a way to send data back to the client without closing the connection.

So the final code looks like

```python
from fastapi import FastAPI, Response
from sse_starlette.sse import EventSourceResponse
import asyncio

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/sse")
async def sse_endpoint():
    async def event_generator():
        i= 1
        while i<=5:
            await asyncio.sleep(1)
            i+=1
            yield {"data": "New update"}

    return EventSourceResponse(event_generator())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
```

Now if we send a GET request to `http://127.0.0.1:8000/sse`

![Browser showing SSE stream response](https://pulkit.blog/assets/content/blogs/server-sent-events-with-fastapi/99b548a0-2158-4379-9306-8f6175079f12.webp)

You can even see the same response in the developer tools.

![Browser developer tools showing SSE events](https://pulkit.blog/assets/content/blogs/server-sent-events-with-fastapi/215331ad-97a2-4797-b0cb-647eea17584f.webp)

Now if we send a GET request to <http://127.0.0.1:8000/sse>, you will see a stream of updates being sent from the server to the client in real-time, which you can also observe in the developer tools, providing a seamless and efficient way to handle real-time data updates in your application.

I hope this guide helps you implement Server-Sent Events with FastAPI smoothly. Happy coding! 🚀

## Related writing

- [Python Dependency Management with Poetry](https://pulkit.blog/python-poetry-guide.md): July 13, 2024
- [AWS S3 with Node.js: Upload Files with SDK v3](https://pulkit.blog/aws-s3-with-nodejs.md): August 8, 2024
- [Creating Your Own npx Command](https://pulkit.blog/creating-npx-command.md): July 27, 2024
