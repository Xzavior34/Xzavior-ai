import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def call_gpt_api(prompt: str) -> str:
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",  # or "gpt-4" if you have access
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"GPT API Error: {e}")  # logs error in Render console
        return f"Error: {e}"
