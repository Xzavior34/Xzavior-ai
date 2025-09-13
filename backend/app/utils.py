import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")  # Make sure to set this in Termux

def call_gpt_api(prompt: str) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=500
    )
    return response.choices[0].message.content.strip()
