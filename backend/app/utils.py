# utils.py
import os
import openai

# Make sure your environment variable is set: OPENAI_API_KEY
openai.api_key = os.getenv("OPENAI_API_KEY")

def call_gpt_api(prompt: str) -> str:
    """
    Call OpenAI API using the latest interface (openai>=1.0.0).
    Returns the AI response as string.
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",        # Safe default model
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content.strip()
    except openai.error.OpenAIError as e:
        # Catch API errors and return them
        return f"Error: {e}"
    except Exception as e:
        # Catch any other unexpected errors
        return f"Unexpected Error: {e}"
