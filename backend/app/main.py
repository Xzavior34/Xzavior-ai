# utils.py
import os
from openai import OpenAI

# Initialize Hugging Face client
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.getenv("HF_TOKEN"),  # Make sure HF_TOKEN is in Render environment
)

def call_gpt_api(prompt: str) -> str:
    """
    Call Hugging Face AI via OpenAI-compatible API.
    Returns AI response as string.
    """
    try:
        completion = client.chat.completions.create(
            model="moonshotai/Kimi-K2-Instruct",
            messages=[{"role": "user", "content": prompt}],
        )
        return completion.choices[0].message["content"].strip()
    except Exception as e:
        return f"Error: {e}"
