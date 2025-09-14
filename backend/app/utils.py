# utils.py
import os
from openai import OpenAI

# Initialize Hugging Face OpenAI-compatible client
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.getenv("HF_TOKEN"),  # Make sure HF_TOKEN is set in Render or Termux
)

def call_gpt_api(prompt: str) -> str:
    """
    Call Hugging Face API using OpenAI-compatible interface.
    Returns the AI response as a string.
    """
    try:
        completion = client.chat.completions.create(
            model="LLM360/K2-Think",  # Your selected model
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {e}"
