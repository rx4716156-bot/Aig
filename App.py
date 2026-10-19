from flask import Flask, request, jsonify
from google import genai
import os

app = Flask(__name__)

# Initialize the Gemini client
# Assumes GEMINI_API_KEY is set in your environment variables
client = genai.Client()

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    try:
        # Use the recommended default model 'gemini-2.5-flash'
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return jsonify({'response': response.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the server on port 5000
    app.run(host='0.0.0.0', port=5000)
  
