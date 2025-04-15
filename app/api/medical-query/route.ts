import { NextResponse } from "next/server"
// External API endpoint
const RAG_API_ENDPOINT = "http://127.0.0.1:8000/rag"

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 })
    }

    console.log("Processing query:", query)

    // Wait for the RAG API response (no timeout)
    const response = await fetch(RAG_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({ error: `API returned status ${response.status}` }, { status: response.status })
    }

    const result = await response.json()
    console.log("Received response from RAG API:", result)

    return NextResponse.json({
      response: result.response || "",
      retrievedChunks: result.retrieved_chunks || [],
    })

  } catch (error) {
    console.error("Error contacting RAG API:", error)
    return NextResponse.json(
      {
        error: "Failed to contact RAG API",
        response: "RAG API not responding or request failed. Please try again.",
      },
      { status: 500 }
    )
  }
}