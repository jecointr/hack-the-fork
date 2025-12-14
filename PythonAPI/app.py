## App.py script with Flask API
import os
from dotenv import load_dotenv
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.document_loaders import PyPDFLoader, CSVLoader
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mistralai.chat_models import ChatMistralAI
from langchain_classic.chains import RetrievalQA
from langchain_classic.schema import Document

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

load_dotenv() # Charge les variables du fichier .env

# Mistral API key
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
model = "mistral-large-latest"

# Global variables to store RAG chain
vector_store = None
rag_chain = None

def get_embeddings():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def process_pdf(file_path):
    loader = PyPDFLoader(file_path)
    docs = loader.load_and_split()
    return docs

def create_vector_store(docs, embeddings):
    return FAISS.from_documents(docs, embeddings)

def get_llm():
    return ChatMistralAI(mistral_api_key=MISTRAL_API_KEY)

def get_rag_chain(vector_store, llm):    
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})
    return RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        return_source_documents=True,
        chain_type="stuff",
    )

def docs_from_df(df):
    docs = []
    for i, row in df.iterrows():
        content = "\n".join(f"{col}: {row[col]}" for col in df.columns)
        docs.append(Document(page_content=content, metadata={"row": i}))
    return docs

def initialize_rag_system():
    """Initialize the RAG system with persistent caching"""
    global vector_store, rag_chain
    
    # Nom du dossier où on va sauvegarder le cerveau
    DB_FAISS_PATH = 'vectorstore_db'
    
    print("Initializing RAG system...")
    embeddings = get_embeddings()
    
    # 1. CAS RAPIDE : Si la sauvegarde existe déjà, on la charge !
    if os.path.exists(DB_FAISS_PATH):
        print("⚡ Chargement de l'index existant depuis le disque (Rapide)...")
        try:
            vector_store = FAISS.load_local(
                DB_FAISS_PATH, 
                embeddings, 
                allow_dangerous_deserialization=True # Nécessaire pour les nouvelles versions
            )
            print("✅ Index chargé !")
        except Exception as e:
            print(f"Erreur de chargement, on recrée tout : {e}")
            # Si erreur, on continue vers la création (étape 2)
    
    # 2. CAS LENT : Si pas de sauvegarde (ou vector_store vide), on crée tout
    if vector_store is None:
        print("🐢 Création de l'index depuis zéro (Lent la première fois)...")
        test_files = ["b29807980.pdf", "food_pairings.pdf"] # Ajoute tes autres fichiers ici
        
        all_docs = []
        for file_path in test_files:
            if os.path.exists(file_path) and file_path.endswith(".pdf"):
                print(f"Loading {file_path}...")
                all_docs.extend(process_pdf(file_path))
        
        if not all_docs:
            print("Warning: No documents loaded!")
            return False
            
        vector_store = create_vector_store(all_docs, embeddings)
        
        # SAUVEGARDE POUR LA PROCHAINE FOIS
        vector_store.save_local(DB_FAISS_PATH)
        print(f"💾 Index sauvegardé dans le dossier '{DB_FAISS_PATH}'")

    # Initialisation du LLM
    llm = get_llm()
    rag_chain = get_rag_chain(vector_store, llm)

    # Compte le nombre de vecteurs dans la base (marche dans les deux cas !)
    nb_chunks = vector_store.index.ntotal
    print(f"✅ RAG system initialized with {nb_chunks} document chunks ready.")
    
    return True

# Flask API Endpoints

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "rag_initialized": rag_chain is not None
    })

@app.route('/api/query', methods=['POST'])
def process_query():
    """Process user query through RAG chain"""
    try:
        # Get query from request
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                "error": "Query cannot be empty"
            }), 400
        
        # Check if RAG system is initialized
        if rag_chain is None:
            return jsonify({
                "error": "RAG system not initialized"
            }), 500
        
        print(f"Processing query: {query}")
        
        # Process query through RAG chain
        result = rag_chain.invoke({"query": query})
        
        # Format source documents
        sources = []
        for i, doc in enumerate(result["source_documents"][:3], 1):
            page = doc.metadata.get("page", "?")
            preview = doc.page_content.strip().replace("\n", " ")[:200]
            sources.append({
                "index": i,
                "page": page,
                "preview": preview
            })
        
        # Return response
        return jsonify({
            "result": result["result"].strip(),
            "sources": sources,
            "query": query
        })
    
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        return jsonify({
            "error": f"Error processing query: {str(e)}"
        }), 500

@app.route('/api/initialize', methods=['POST'])
def initialize():
    """Manually initialize/reinitialize the RAG system"""
    try:
        success = initialize_rag_system()
        if success:
            return jsonify({
                "status": "success",
                "message": "RAG system initialized successfully"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to initialize RAG system"
            }), 500
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

def main_cli():
    """Original CLI interface"""
    initialize_rag_system()
    
    while True:
        query = input("\nEnter your query (or type 'exit' to quit): ").strip()
        if query.lower() == "exit":
            break

        print("Analyzing and generating insights...")
        result = rag_chain.invoke({"query": query})
        print("\nResult")
        print(result["result"].strip())
        print("\nHere are the Source Documents used")
        for i, doc in enumerate(result["source_documents"][:3], 1):
            page = doc.metadata.get("page", "?")
            preview = doc.page_content.strip().replace("\n", " ")
            print(f"[{i}] Page {page}: {preview[:200]}...")

if __name__ == "__main__":
    import sys
    
    # Check if running in CLI mode or API mode
    if len(sys.argv) > 1 and sys.argv[1] == "cli":
        # Run CLI mode
        main_cli()
    else:
        # Run Flask API mode
        print("Starting Flask API server...")
        initialize_rag_system()
        app.run(host='0.0.0.0', port=5001, debug=True)