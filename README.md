# 🥗 HackTheFork 2025: Food Alternative suggestions

This repository contains the code for the demo presented at the Hack The Fork hackathon at Ecole 44 in Paris 13 - 14 December

**HackTheFork** is an AI-powered full-stack application designed to analyze food data, suggest alternatives, and provide insights using RAG (Retrieval-Augmented Generation).

It combines a **React** frontend with a **Python/Flask** backend, utilizing **LangChain** and **Mistral AI** to query specific documents (PDFs, CSVs) about food composition and pairings.

## 🚀 Features

- **AI Chat Interface:** Ask questions about food alternatives and pairings.
- **RAG Engine:** Context-aware answers based on provided PDFs (`Fast_Food_Alternatives.pdf`, `food_pairings.pdf`, etc.).
- **Smart Caching:** Fast startup times using local FAISS vector store (no need to re-process PDFs on every restart).
- **Dual-Build System:** Automated setup and concurrent execution of Frontend and Backend.

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Python 3.11, Flask, Flask-CORS
- **AI & Data:** LangChain, FAISS (Vector Store), Mistral AI (LLM), HuggingFace Embeddings, Pandas

## 📋 Prerequisites

Before starting, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Python 3.11** (Required for compatibility with AI libraries)
- **Mistral API Key**

## ⚡ Quick Start

We have automated the setup process. You can run the entire project with two commands.

### 1. First Setup (Installation)
This command creates the Python virtual environment (`venv`), installs all Python/Node dependencies, and sets up the project.

```bash
npm run setup