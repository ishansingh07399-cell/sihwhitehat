import torch
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline


tokenizer = AutoTokenizer.from_pretrained("dbmdz/bert-large-cased-finetuned-conll03-english")
model = AutoModelForTokenClassification.from_pretrained("dbmdz/bert-large-cased-finetuned-conll03-english")


ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple")

# Add Zero-Shot Classifier for AI Intent Classification (SIH AI Screening)
zero_shot_classifier = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-1")

raw_fir_text = "Suspect Jonathan Vercetti was seen transferring funds at the Vice City Central Bank."


entities = ner_pipeline(raw_fir_text)

for ent in entities:
    print(f"Entity: {ent['word']} | Label: {ent['entity_group']} | Confidence: {ent['score']:.4f}")