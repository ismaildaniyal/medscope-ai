import os
import json
import numpy as np
import pandas as pd
from fastapi import FastAPI, Request
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import faiss
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS (for frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and index on startup
model = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.read_index("mimic_iv_chunks.index")
chunked_df = pd.read_pickle("chunked_data.pkl")

# Gemini config
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Request schema
class QueryRequest(BaseModel):
    query: str

@app.post("/rag")
def rag_endpoint(req: QueryRequest):
    try:
        query = req.query
        query_embedding = model.encode([query])[0]
        distances, indices = index.search(np.array([query_embedding], dtype='float32'), 10)
        retrieved_chunks = chunked_df.iloc[indices[0]]["chunk"].tolist()
        context = " ".join(retrieved_chunks)

        prompt = (
            f"You're a virtual medical assistant. Your job is to answer the user's medical query using the provided clinical context.\n\n"
            f"Question: {query}\n"
            f"Context: {context}\n\n"
            f"Instructions:\n"
            f"- Use only the context to answer if it provides enough information.\n"
            f"- If context is insufficient, rely on medically accurate and reliable knowledge to complete the answer.\n"
            f"- Be concise and clinically relevant.\n"
            f"- Never fabricate symptoms, treatments, or diagnoses.\n"
            f"- Format the answer clearly (prefer bullet points for lists, else 2-3 short paragraphs)."
        )

        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        response = gemini_model.generate_content(prompt)

        return {
            "query": query,
            "response": response.text,
            "retrieved_chunks": retrieved_chunks,
        }
    except Exception as e:
        return {"error": str(e)}
