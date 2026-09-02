# Criminal Network Intel Platform

This platform is a comprehensive intelligence analysis suite built for identifying, analyzing, and visualizing criminal networks from raw intelligence reports and financial records.

## AI Architecture

The system utilizes state-of-the-art Machine Learning models and algorithms:

1. **Named Entity Recognition (NER)**: 
   Uses a fine-tuned Deep Learning Transformer model (`dbmdz/bert-large-cased-finetuned-conll03-english` based on **BERT**) via PyTorch and HuggingFace. This extracts Persons, Organizations, and Locations from raw, unstructured intelligence text.

2. **Intent & Legal Classification (Zero-Shot AI)**:
   Instead of using hardcoded rules, the system dynamically classifies the intent of intelligence reports using **Zero-Shot Classification** (`facebook/bart-large-mnli` architecture). The AI predicts whether a text discusses "Murder", "Fraud", "Conspiracy", or "Arms Dealing", mapping it securely to actual legal sections (IPC, Arms Act).

3. **Graph Theory & Network Analysis**:
   Uses `networkx` to compute complex topological metrics on the generated criminal graphs:
   - **PageRank Algorithm**: Determines the most influential suspects within the network.
   - **Betweenness Centrality**: Identifies "brokers" or mules who connect disparate criminal factions.
   - **Community Detection**: Uses greedy modularity algorithms to cluster associated crime rings.

4. **Dynamic Geo-Spatial Intelligence**:
   Automatically reverse-geocodes extracted locations via the **Geopy API** (Nominatim). It dynamically clusters geographically overlapping entities to ensure visually accurate heatmaps and travel arcs.

## Tech Stack
- **Backend**: FastAPI, Python, PyTorch, Transformers, NetworkX, Pandas
- **Frontend**: React, Vite, Framer Motion, React-Simple-Maps, D3 (Geometries)

## Getting Started

1. Install backend requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn api_server:app --reload
   ```
3. Install frontend dependencies and start UI:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
