# RAG Chatbot with Qdrant

> Learn how to build an intelligent chatbot using Retrieval-Augmented Generation (RAG) with Qdrant vector database, OpenAI embeddings, and Next.js. A complete guide to creating context-aware AI assistants.

- URL: https://pulkit.blog/rag-chatbot-with-qdrant/
- Published: December 11, 2025
- Tags: RAG, Qdrant, AI, Chatbot, OpenAI, Vector Database

When I first added a chatbot to my portfolio, I wanted it to actually know about my work, not just give generic responses. A standard LLM prompt won't cut it when you need answers about specific projects, blog posts, or experiences. That's where Retrieval-Augmented Generation, or RAG, comes in.

RAG solves a fundamental problem: language models are trained on general knowledge, but they don't know about your specific content. Instead of hoping the model remembers your work from its training data, RAG lets you inject relevant context at query time. The model retrieves the most relevant pieces of your content, then generates a response grounded in that information.

In this post, I'll walk through how I built PukBot, the chatbot on my portfolio, using [Qdrant](https://qdrant.tech) for vector storage and Next.js for the API. We'll focus on the core mechanics: how to create embeddings, store them in Qdrant, and retrieve context when users ask questions.

## The Architecture

At a high level, the chatbot works in two phases: an offline indexing phase and a real-time query phase.

### Offline Indexing

Your content gets processed, chunked into smaller pieces, converted to embeddings (vectors), and stored in Qdrant. This happens once or whenever your content changes.

### Real-Time Querying

When a user asks a question, the system:

1. Converts the question into an embedding
2. Searches Qdrant for the most similar content chunks
3. Builds a system prompt with that context
4. Sends everything to the LLM, which generates a response

The frontend is a simple chat interface that streams responses back to the user. The backend is a Next.js API route that orchestrates the retrieval and generation.

## Building the Indexing Pipeline

The offline indexing process converts your content into searchable vectors. Let's break it down step by step.

### Preparing Your Content

Before we can search through content, we need to break it down into manageable pieces. Large documents don't work well for retrieval, you want chunks that are semantically meaningful but not too long.

The chunking strategy depends on your content type. You might split by paragraphs, sections, or other semantic boundaries. The goal is to create pieces that are:

- Small enough to fit multiple chunks in the LLM's context window
- Large enough to contain complete thoughts or concepts
- Tagged with metadata for better organization

Here's a simplified example:

```typescript
interface ContentChunk {
  id: string;
  title: string;
  text: string;
  sourceId: string;
  metadata?: Record<string, string>;
}

function chunkContent(documents: Document[]): ContentChunk[] {
  const chunks: ContentChunk[] = [];

  for (const doc of documents) {
    // Split document into smaller sections
    // This could split by paragraphs, headings, or fixed character limits
    const sections = splitIntoSections(doc.content);

    for (const section of sections) {
      chunks.push({
        id: generateId(),
        title: doc.title,
        text: section,
        sourceId: doc.id,
        metadata: { url: doc.url },
      });
    }
  }

  return chunks;
}

// Example implementation: split by double newlines (paragraphs)
function splitIntoSections(content: string): string[] {
  // Split by double newlines to get paragraphs
  // You could also split by headings, fixed sizes, or semantic boundaries
  return content.split(/\n\n+/).filter((section) => section.trim().length > 0);
}
```

The exact chunking logic depends on your content structure. You might split by:

- Paragraphs (double newlines)
- Headings (markdown `#` or HTML `<h1>` tags)
- Fixed character limits (e.g., 500 characters with overlap)
- Semantic boundaries (using NLP libraries)

The key is consistency and meaningful boundaries that preserve context, like keeping paragraphs intact, maintaining code blocks as single units, or ensuring a heading stays with its content.

### Generating Embeddings

Once you have chunks, you need to convert them into vectors, numerical representations that capture semantic meaning. This is where embedding models come in. They take text and return a high-dimensional vector (often 1536 or 3072 dimensions) where similar texts have similar vectors.

<details>

<summary>Sample embedding</summary>

**JSON input**

```json
{
		text: "Hi there",
	};
```

**Output shape**

```json
{
	"dimensions": 3072,
	"embedding": [-0.0006984524079598486,-0.019356805831193924,-0.03219897672533989,0.012672074139118195,............]
}

```

In practice, you would repeat this for every chunk and store the resulting vectors in your vector database.

</details>

For PukBot, I use OpenAI's text-embedding-3-large model, which produces 3072-dimensional vectors. The embedding API is straightforward:

```typescript
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
  });

  return response.data[0].embedding;
}
```

When processing many chunks, you'll want to batch requests and handle rate limits. You also want to avoid regenerating embeddings for unchanged content. A common approach is to hash each chunk's text and cache the embeddings:

```typescript
interface ChunkWithVector extends ContentChunk {
  vector: number[];
  hash: string;
}

async function processChunks(
  chunks: ContentChunk[],
): Promise<ChunkWithVector[]> {
  const processed: ChunkWithVector[] = [];
  const cache = loadEmbeddingCache(); // Load from disk or database

  for (const chunk of chunks) {
    const hash = hashText(chunk.text);
    const cached = cache.get(hash);

    if (cached) {
      processed.push({ ...chunk, vector: cached.vector, hash });
    } else {
      const vector = await generateEmbedding(chunk.text);
      processed.push({ ...chunk, vector, hash });
      cache.set(hash, { vector, timestamp: Date.now() });
    }
  }

  saveEmbeddingCache(cache);
  return processed;
}
```

This way, you only pay for embeddings when content actually changes. The hash-based approach is simple and effective for most use cases.

### Storing Vectors in Qdrant

Qdrant is a vector database designed for similarity search. It stores your embeddings along with metadata (payloads) and lets you search for similar vectors efficiently.

Setting up a collection is straightforward:

```typescript
import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

async function initializeCollection() {
  const collectionName = "content_vectors";
  const vectorSize = 3072; // Must match your embedding model

  try {
    await client.getCollection(collectionName);
    console.log("Collection already exists");
  } catch {
    await client.createCollection(collectionName, {
      vectors: {
        size: vectorSize,
        distance: "Cosine", // Cosine similarity for semantic search
      },
    });
    console.log("Collection created");
  }
}
```

Once the collection exists, you can upload your chunks. Qdrant stores each chunk as a "point" with an ID, a vector, and a payload (your metadata):

```typescript
async function uploadChunks(chunks: ChunkWithVector[]) {
  const points = chunks.map((chunk, index) => ({
    id: index,
    vector: chunk.vector,
    payload: {
      text: chunk.text,
      title: chunk.title,
      sourceId: chunk.sourceId,
      hash: chunk.hash,
      ...chunk.metadata,
    },
  }));

  const batchSize = 100;
  for (let i = 0; i < points.length; i += batchSize) {
    const batch = points.slice(i, i + batchSize);
    await client.upsert(collectionName, {
      points: batch,
      wait: true,
    });
  }
}
```

The payload is crucial, it stores the actual text and metadata you'll retrieve later. The vector is what enables fast similarity search.

## Building the Query Pipeline

When a user asks a question, the system needs to retrieve relevant context and generate a response. Here's how the real-time query process works.

### Retrieving Context at Query Time

When a user asks a question, you need to find the most relevant chunks. The process mirrors what you did during indexing:

1. Convert the question to an embedding
2. Search Qdrant for similar vectors
3. Extract the top-k results (usually 3-5 chunks)

Here's how that looks:

```typescript
async function getRelevantContext(
  question: string,
  limit: number = 5,
  filters?: Record<string, any>,
): Promise<ContextChunk[]> {
  // Generate embedding for the question
  const queryEmbedding = await generateEmbedding(question);

  // Search Qdrant
  const results = await client.search(collectionName, {
    vector: queryEmbedding,
    limit,
    with_payload: true, // Include the text and metadata
    filter: filters
      ? {
          must: Object.entries(filters).map(([key, value]) => ({
            key: key,
            match: { value },
          })),
        }
      : undefined,
  });

  // Map results to a simpler format
  return results.map((result) => ({
    text: result.payload.text as string,
    title: result.payload.title as string,
    sourceId: result.payload.sourceId as string,
    score: result.score, // Similarity score (0-1)
  }));
}
```

The `score` tells you how similar the chunk is to the query. Higher scores mean better matches. You can use this to filter out low-confidence results or adjust how many chunks you include.

Optional filters let you narrow results by metadata. For example, if the user is on a specific page, you might filter by `sourceId` to prioritize content from that source.

### Building the System Prompt

Once you have relevant chunks, you need to format them into a prompt that guides the LLM. The system prompt should:

- Explain the assistant's role
- Provide the retrieved context
- Set response guidelines

Here's a simplified version:

```typescript
function buildSystemPrompt(contextChunks: ContextChunk[]): string {
  const contextText = contextChunks
    .map((chunk) => `${chunk.title}:\n${chunk.text}`)
    .join("\n\n---\n\n");

  return `You are an AI assistant helping answer questions based on the provided context.

Here is relevant context:
${contextText}

Guidelines:
- Answer based only on the provided context
- Be concise and direct
- If you don't know something, say so
- Use natural language, avoid phrases like "according to the context"`;
}
```

The key is making the context easy for the model to parse and reference. Clear formatting and explicit instructions help the model stay grounded in your content.

### Wiring It Into Next.js

The chat API route ties everything together. It's a standard Next.js API route (or [Hono handler](https://hono.dev/docs/getting-started/nextjs)) that:

1. Validates the incoming request
2. Retrieves context from Qdrant
3. Builds the system prompt
4. Calls the LLM with streaming
5. Returns the response

```typescript
export async function POST(req: Request) {
  const { messages } = await req.json();

  const lastMessage = messages[messages.length - 1];

  // Get relevant context from Qdrant
  const context = await getRelevantContext(lastMessage.content, 5);

  // Build system prompt with context
  const systemPrompt = buildSystemPrompt(context);

  // Call LLM with streaming
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    stream: true,
    temperature: 0.7,
  });

  // Stream response back to client
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          controller.enqueue(new TextEncoder().encode(content));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

The frontend sends messages to this endpoint, and streaming gives users immediate feedback instead of waiting for the full response.

## Frontend Experience

The frontend is a standard chat UI with a few enhancements:

- **Streaming responses**: Display tokens as they arrive for a responsive feel
- **Message history**: Maintain conversation context across multiple turns
- **Error handling**: Gracefully handle API errors and rate limits

## Lessons Learned

Building PukBot taught me a few practical lessons:

**Chunk size matters**: Too small, and you lose context. Too large, and retrieval becomes less precise. Aim for 200-500 words per chunk, adjusted for your content.

**Top-k tuning**: Start with 3-5 chunks. More isn't always better, too much context can confuse the model or hit token limits. Monitor what gets retrieved and adjust based on response quality.

**Caching embeddings**: Regenerating embeddings for unchanged content is wasteful. Hash-based caching saves time and money, especially as your content grows.

**Similarity thresholds**: Not all retrieved chunks are equally relevant. Consider filtering by score (e.g., only include chunks with score > 0.7) to improve response quality.

**Metadata is your friend**: Store rich metadata in Qdrant payloads. It helps with filtering, debugging, and understanding what the model is referencing.

**Monitor and iterate**: Log queries, retrieved chunks, and responses (in development). This helps you understand what's working and what needs improvement.

## Wrapping Up

RAG transforms a generic chatbot into one that actually knows your content. The combination of Qdrant for fast vector search and Next.js for the API makes it straightforward to build and deploy.

The core pattern is simple: index your content offline, retrieve relevant chunks at query time, and let the LLM generate grounded responses. The implementation details, chunking strategies, embedding models, prompt engineering, are where you fine-tune for your specific use case.

If you're building a portfolio chatbot, documentation assistant, or any application where context matters, RAG with Qdrant is a solid foundation. Start with the basics, iterate based on real usage, and you'll have a chatbot that feels genuinely helpful.

You can see PukBot in action on my portfolio, and I'm happy to answer questions about the implementation. The patterns here apply to any RAG system, whether you're using Qdrant, Pinecone, Weaviate, or another vector database.

## Related writing

- [Git Worktrees](https://pulkit.blog/git-worktrees.md): May 29, 2026
- [How I Use Cursor to Build at 1000x Speed](https://pulkit.blog/how-i-use-cursor.md): February 26, 2026
- [An MCP Server That Writes Itself](https://pulkit.blog/mcp-server-that-writes-itself.md): April 22, 2026
