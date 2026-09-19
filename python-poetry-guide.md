# Python Dependency Management with Poetry

> Learn how to simplify Python dependency management using Poetry with easy installation, project setup, and a FastAPI server example

- URL: https://pulkit.blog/python-poetry-guide/
- Published: July 13, 2024
- Tags: Poetry, Python, FastAPI, Package Management, Backend

Managing Python dependencies can be hard, especially as projects get bigger. It's important to have the right packages and versions installed without conflicts. [Poetry](https://python-poetry.org) helps with this. It's a tool that makes managing project dependencies, packaging, and publishing easier. In this article, we'll show you how to use Poetry to manage Python dependencies, make your workflow smoother, and keep your project setup clean and efficient.

In this blog, you will learn how to:

- Install Poetry on your system
- Create a new Poetry project
- How to run fastapi server with poetry

## Installing Poetry

Reference: [python-poetry.org/docs/#installation](http://python-poetry.org/docs/#installation)

```plaintext
curl -ssl https://install.python-poetry.org | python3 -
```

![Terminal showing Poetry installation](https://pulkit.blog/assets/content/blogs/simplifying-python-dependency-management-with-poetry/c573a7c1-fe3f-4d92-996d-d00a14ca3002.webp)

## Create a new Poetry Project

```plaintext
poetry new awesome-project
```

This will create a fresh poetry project with a directory structure like this

![Poetry project directory structure](https://pulkit.blog/assets/content/blogs/simplifying-python-dependency-management-with-poetry/a24a1098-6c0e-436a-b6d3-baf7e2f21a61.webp)

### Pyproject.toml

Poetry manages all the dependencies with the help of the `pyproject.toml`, It is similar to the `package.json` in a node project

```plaintext
[tool.poetry]
name = "awesome-project"
version = "0.1.0"
description = ""
authors = ["Your Name <you@example.com>"]
readme = "README.md"

[tool.poetry.dependencies]
python = "^3.12"


[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

### Activate a virtual environment

You can list all the [virtual environments](https://docs.python.org/3/tutorial/venv.html) available in poetry

```plaintext
poetry shell
```

![Terminal showing Poetry shell activation](https://pulkit.blog/assets/content/blogs/simplifying-python-dependency-management-with-poetry/e4b5b000-b3fb-40ce-8a69-f448b49400c8.webp)

## Let's make a simple hello world FastAPI Server

### Adding fastapi and uvicorn as dependencies

```plaintext
poetry add fastapi uvicorn
```

![Terminal showing FastAPI and Uvicorn installation with Poetry](https://pulkit.blog/assets/content/blogs/simplifying-python-dependency-management-with-poetry/ec031e29-236e-4e62-8795-9fb7c0e0ee6b.webp)

Now if you check the pyproject.toml, fastapi and uvicorn are added as dependencies

![pyproject.toml file showing added dependencies](https://pulkit.blog/assets/content/blogs/simplifying-python-dependency-management-with-poetry/fdfbc518-fe35-464e-9829-089b274f21d6.webp)

Write a basic fastapi server

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}
```

![FastAPI server code in editor](https://pulkit.blog/assets/content/blogs/simplifying-python-dependency-management-with-poetry/8ea0f089-8cb2-4137-9159-cfe657b51cbd.webp)

To run the server lets start by using the following command

```plaintext
poetry run uvicorn main:app --reload
```

![Terminal showing FastAPI server starting with Poetry](https://pulkit.blog/assets/content/blogs/simplifying-python-dependency-management-with-poetry/19097be8-be04-4232-b5ff-98ad69a394e2.webp)

And as expected the server is in a good condition

![Browser showing Hello World response from FastAPI server](https://pulkit.blog/assets/content/blogs/simplifying-python-dependency-management-with-poetry/f076b941-a257-47ad-ad15-eb4665e8808f.webp)

By following the steps outlined in this article, you can effectively manage your Python dependencies using Poetry. This powerful tool not only simplifies dependency management but also enhances your workflow, ensuring that your projects remain clean, efficient, and free from conflicts. Whether you're starting a new project or maintaining an existing one, Poetry provides the structure and reliability needed to keep your development process smooth and hassle-free. Happy coding!

## Related writing

- [FastAPI SSE: Server-Sent Events in Python](https://pulkit.blog/sse-with-fastapi.md): July 26, 2024
- [AWS S3 with Node.js: Upload Files with SDK v3](https://pulkit.blog/aws-s3-with-nodejs.md): August 8, 2024
- [Creating Your Own npx Command](https://pulkit.blog/creating-npx-command.md): July 27, 2024
