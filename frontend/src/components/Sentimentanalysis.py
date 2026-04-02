import numpy as np
import pandas as pd
from transformers import BertTokenizer, BertForSequenceClassification
import torch
from datetime import datetime, timedelta
import json
import os

class SentimentAnalyzer:
    def __init__(self, model_name="bert-base-uncased"):
        self.tokenizer = BertTokenizer.from_pretrained(model_name)
        self.model = BertForSequenceClassification.from_pretrained(model_name, num_labels=5)
        self.model.eval()
        self.labels = ["very_negative", "negative", "neutral", "positive", "very_positive"]
        
        # Additional models for specific emotional states
        self.anxiety_model = self._load_specialized_model("anxiety_model")
        self.depression_model = self._load_specialized_model("depression_model")
        self.stress_model = self._load_specialized_model("stress_model")
        
    def _load_specialized_model(self, model_type):
        # In a real implementation, you would load actual specialized models
        # For this example, we'll simulate with the main model
        return self.model
    
    def preprocess_text(self, text):
        """Convert text to BERT input format"""
        encoded_input = self.tokenizer(
            text,
            padding='max_length',
            truncation=True,
            max_length=128,
            return_tensors='pt'
        )
        return encoded_input
    
    def predict_sentiment(self, text):
        """Predict sentiment score from text"""
        inputs = self.preprocess_text(text)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=1)
            
        # Convert to percentage (0-100)
        sentiment_score = self._calculate_sentiment_score(probabilities[0].tolist())
        return sentiment_score
    
    def _calculate_sentiment_score(self, probabilities):
        """Convert model output probabilities to a 0-100 sentiment score"""
        # Weight by sentiment category (0-4 for very negative to very positive)
        weighted_sum = sum(p * i for i, p in enumerate(probabilities))
        # Scale to 0-100 range
        scaled_score = (weighted_sum / 4) * 100
        return scaled_score
    
    def predict_anxiety(self, text):
        """Predict anxiety level from text"""
        # In a real implementation, you would use the anxiety-specific model
        # For this example, we'll simulate with a modified output from the main model
        sentiment = self.predict_sentiment(text)
        # Invert and adjust (higher anxiety for lower sentiment, with randomness)
        anxiety = 100 - (sentiment * 0.7) + (np.random.random() * 20)
        return max(0, min(100, anxiety))
    
    def predict_depression(self, text):
        """Predict depression level from text"""
        sentiment = self.predict_sentiment(text)
        # Invert and adjust with different parameters
        depression = 100 - (sentiment * 0.8) + (np.random.random() * 15)
        return max(0, min(100, depression))
    
    def predict_stress(self, text):
        """Predict stress level from text"""
        sentiment = self.predict_sentiment(text)
        # Invert and adjust with different parameters
        stress = 100 - (sentiment * 0.6) + (np.random.random() * 25)
        return max(0, min(100, stress))
    
    def analyze_conversation(self, messages):
        """Analyze a full conversation and return sentiment metrics"""
        if not messages:
            return self._generate_default_response()
        
        # Concatenate all messages
        full_text = " ".join([msg.get("content", "") for msg in messages])
        
        # Get sentiment scores
        sentiment = self.predict_sentiment(full_text)
        anxiety = self.predict_anxiety(full_text)
        depression = self.predict_depression(full_text)
        stress = self.predict_stress(full_text)
        
        # Generate weekly data (last 7 days)
        weekly_data = self._generate_weekly_data(sentiment, anxiety, depression, stress)
        
        return {
            "sentiment": sentiment,
            "anxiety": anxiety,
            "depression": depression,
            "stress": stress,
            "weeklyData": weekly_data
        }
    
    def _generate_weekly_data(self, current_sentiment, current_anxiety, current_depression, current_stress):
        """Generate simulated data for the past week based on current metrics"""
        today = datetime.now()
        weekly_data = []
        
        # Base values - current metrics will be the endpoint
        base_sentiment = max(30, current_sentiment - 20)
        base_anxiety = min(current_anxiety + 15, 90)
        base_depression = min(current_depression + 10, 85)
        base_stress = min(current_stress + 20, 95)
        
        # Trend direction - slightly upward for sentiment, downward for negative metrics
        sentiment_trend = (current_sentiment - base_sentiment) / 7
        anxiety_trend = (current_anxiety - base_anxiety) / 7
        depression_trend = (current_depression - base_depression) / 7
        stress_trend = (current_stress - base_stress) / 7
        
        for i in range(7):
            day = today - timedelta(days=6-i)
            day_str = day.strftime("%m/%d")
            
            # Add some random variation to make the data look natural
            random_factor = np.random.random() * 8 - 4  # -4 to +4
            
            sentiment_val = base_sentiment + (sentiment_trend * i) + random_factor
            anxiety_val = base_anxiety + (anxiety_trend * i) + random_factor
            depression_val = base_depression + (depression_trend * i) + random_factor
            stress_val = base_stress + (stress_trend * i) + random_factor
            
            # Ensure values are in range 0-100
            sentiment_val = max(0, min(100, sentiment_val))
            anxiety_val = max(0, min(100, anxiety_val))
            depression_val = max(0, min(100, depression_val))
            stress_val = max(0, min(100, stress_val))
            
            weekly_data.append({
                "date": day_str,
                "sentiment": sentiment_val,
                "anxiety": anxiety_val,
                "depression": depression_val,
                "stress": stress_val
            })
        
        return weekly_data
    
    def _generate_default_response(self):
        """Generate default response when no messages are provided"""
        return {
            "sentiment": 50,
            "anxiety": 50,
            "depression": 50,
            "stress": 50,
            "weeklyData": self._generate_weekly_data(50, 50, 50, 50)
        }
    
    def save_analysis_result(self, user_id, analysis_result, output_dir="analysis_results"):
        """Save analysis results to a JSON file"""
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{output_dir}/analysis_{user_id}_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(analysis_result, f, indent=2)
            
        return filename

# Example usage for backend integration
def analyze_user_conversation(conversation_data, user_id=None):
    analyzer = SentimentAnalyzer()
    messages = conversation_data.get("messages", [])
    
    analysis_result = analyzer.analyze_conversation(messages)
    
    if user_id:
        analyzer.save_analysis_result(user_id, analysis_result)
        
    return analysis_result

# Flask/FastAPI route implementation (comment out if not needed)
"""
@app.route('/api/analyzeConversation', methods=['POST'])
def analyze_conversation_endpoint():
    data = request.json
    user_id = data.get('userId', 'anonymous')
    analysis_result = analyze_user_conversation(data, user_id)
    return jsonify(analysis_result)
"""

if __name__ == "__main__":
    # Test with sample conversation
    sample_conversation = {
        "messages": [
            {"role": "user", "content": "I've been feeling a bit down lately."},
            {"role": "assistant", "content": "I'm sorry to hear that. Would you like to talk about what's been going on?"},
            {"role": "user", "content": "Work has been stressful, but I'm managing."}
        ]
    }
    
    result = analyze_user_conversation(sample_conversation, user_id="test_user")
    print(json.dumps(result, indent=2))