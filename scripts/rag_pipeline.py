import os
import json
import sys
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import google.generativeai as genai

# Get the query from command line arguments
query = sys.argv[1] if len(sys.argv) > 1 else "What are common symptoms of the flu?"

# Set up Gemini API key
GEMINI_API_KEY = "AIzaSyDZgKEnuVQHQLSU39zqc66bRsbgz5DP9cU"  # Replace with your actual API key
genai.configure(api_key=GEMINI_API_KEY)

# Load the embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load the FAISS index and chunked data
# Adjust these paths to where your files are stored
index = faiss.read_index("C:\Users\SMART TECH\Desktop\virtual-doctor\mimic_iv_chunks.index")
chunked_df = pd.read_pickle("C:\Users\SMART TECH\Desktop\virtual-doctor\chunked_data.pkl")

# RAG pipeline function
def rag_pipeline(query, top_k=10):
    # Convert query to embedding
    query_embedding = model.encode([query])[0]
    
    # Search FAISS for top-k chunks
    distances, indices = index.search(np.array([query_embedding], dtype='float32'), top_k)
    
    # Extract the retrieved chunks
    retrieved_chunks = chunked_df.iloc[indices[0]]['chunk'].tolist()
    
    # Combine the chunks into context
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
    
    # Call Gemini Flash model
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    response = gemini_model.generate_content(prompt)
    
    # Extract the generated answer
    answer = response.text
    
    return retrieved_chunks, answer

# Run the pipeline
try:
    retrieved_chunks, answer = rag_pipeline(query)
    
    # Return the results as JSON
    result = {
        "query": query,
        "retrieved_chunks": retrieved_chunks,
        "answer": answer
    }
    
    print(json.dumps(result))
except Exception as e:
    error_result = {
        "error": str(e),
        "answer": "I encountered an error while processing your query. Please try again."
    }
    print(json.dumps(error_result))
