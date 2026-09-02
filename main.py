
import torch
from models.nlp_extractor import ner_pipeline
from models.siamese_net import SiameseEntityResolver
from models.hetero_gnn import HeteroLinkPredictor
from pipeline.explainer import run_gnn_explainer

def run_pipeline(raw_text):
    print("1. Extracting Entities...")
    entities = ner_pipeline(raw_text)
    
    print("2. Resolving Aliases...")
    
    resolver = SiameseEntityResolver()
    
    
    print("3. Predicting Hidden Links...")
    
    gnn_model = HeteroLinkPredictor(hidden_channels=64)
    
    
    print("4. Generating AI Explanations...")
    
    

if __name__ == "__main__":
    test_report = "Suspect Jonathan Vercetti was seen transferring funds at the Vice City Central Bank."
    run_pipeline(test_report)