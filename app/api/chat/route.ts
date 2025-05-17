import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Add system message if it's not already included
  const systemMessage = {
    role: "system",
    content: `You are a helpful 3D printing and STL file expert. 
    Help users understand their 3D models, provide printing advice, 
    suggest optimizations, and answer questions about 3D modeling and printing.
    Keep your answers concise and practical.`,
  }

  // Check if the first message is a system message
  const hasSystemMessage = messages.length > 0 && messages[0].role === "system"

  // Create the final messages array
  const finalMessages = hasSystemMessage ? messages : [systemMessage, ...messages]

  const result = streamText({
    model: openai("gpt-4o"),
    messages: finalMessages,
  })

  return result.toDataStreamResponse()
}
