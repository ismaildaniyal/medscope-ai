import os
import json
import numpy as np
import pandas as pd
from fastapi import FastAPI, Request, Response
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

genai.configure(api_key=GEMINI_API_KEY)

# Request schema
class QueryRequest(BaseModel):
    query: str
@app.get("/rag")
def dummy_get():
    return {"message": "Use POST request for /rag"}
@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)  # No Content

@app.post("/rag")
def rag_endpoint(req: QueryRequest):
    try:
        query = req.query
        query_embedding = model.encode([query])[0]
        distances, indices = index.search(np.array([query_embedding], dtype='float32'), 10)
        retrieved_chunks = chunked_df.iloc[indices[0]]["chunk"].tolist()
        context = " ".join(retrieved_chunks)

        prompt = (
    f"You are a virtual medical assistant. Your job is to answer the user's medical query only if it is clearly medical-related.\n\n"
    f"Question: {query}\n"
    f"Context: {context}\n\n"
    f"Instructions:\n"
    f"- First, determine if the question is related to a medical or clinical topic (e.g., symptoms, treatment, diagnosis, medication, healthcare).\n"
    f"- If it is not a medical-related question, respond with: \"I'm only able to assist with medical-related queries.\"\n"
    f"- If it is a medical query, use the context to answer if it provides enough information.\n"
    f"- If context is insufficient, rely on medically accurate and reliable knowledge to complete the answer.\n"
    f"- Be concise and clinically relevant.\n"
    f"- Never fabricate symptoms, treatments, or diagnoses.\n"
    f"- Format the answer clearly (prefer bullet points for lists, otherwise use 2–3 short paragraphs)."
)


        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        response = gemini_model.generate_content(prompt)
        print("Response:", response)
        return {"response": response["generated_content"]}
        
    except Exception as e:
        return {"error": str(e)}
