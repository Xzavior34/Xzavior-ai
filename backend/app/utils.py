import os
import openai

# Make sure your OpenAI API key is set in the environment
openai.api_key = os.getenv("OPENAI_API_KEY")

def call_gpt_api(prompt: str) -> str:
    """
    Sends a prompt to OpenAI API and returns the response text.
    Compatible with openai>=1.0.0.
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",  # change to "gpt-4" if you have access
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {e}"
