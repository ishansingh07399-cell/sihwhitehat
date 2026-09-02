import torch
from torch_geometric.explain import Explainer, GNNExplainer

def run_gnn_explainer(model, data, edge_index_to_explain=0):
    """
    Explains why the AI predicted a specific link in the criminal network.
    
    Args:
        model (torch.nn.Module): The trained PyTorch Geometric model.
        data (HeteroData): The graph data containing suspects and accounts.
        edge_index_to_explain (int): The index of the predicted connection to audit.
        
    Returns:
        explanation: The PyG Explanation object containing edge weights.
    """
    
    
    explainer = Explainer(
        model=model,
        algorithm=GNNExplainer(epochs=200),
        explanation_type='model',
        edge_mask_type='object',
        model_config=dict(
            mode='binary_classification',
            task_level='edge',
            return_type='probs',
        ),
    )

    
    
    explanation = explainer(
        x=data.x_dict, 
        edge_index=data.edge_index_dict, 
        index=edge_index_to_explain,
        
        src_type='suspect', 
        dst_type='bank_account', 
        edge_type=('suspect', 'transfers_to', 'bank_account')
    )

    print("\n--- XAI: GNNExplainer Audit ---")
    print(f"Evidence Weights for predicting edge index {edge_index_to_explain}:")
    print(explanation.edge_mask)
    
    return explanation


if __name__ == "__main__":
    print("Explainer module is clean and ready. Import 'run_gnn_explainer' in main.py to execute.")