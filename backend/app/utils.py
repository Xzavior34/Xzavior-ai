import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def call_gpt_api(prompt: str) -> str:
    # Using the new 'chat.completions.create' method
    response = openai.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=500
    )
    return response.choices[0].message.content
