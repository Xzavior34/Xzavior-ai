from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from app.utils import call_gpt_api
import os

app = FastAPI()

# Allow frontend (network + localhost) to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# Chat endpoint (HTTP POST)
# -------------------
@app.post("/chat")
async def chat(message: str = Form(...)):
    try:
        response_text = call_gpt_api(message)
        # Return field "reply" to match frontend
        return {"reply": response_text}
    except Exception as e:
        return {"error": str(e)}

# -------------------
# File upload endpoint
# -------------------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        analysis = call_gpt_api(f"Analyze this file content:\n{content.decode()}")
        return {"filename": file.filename, "analysis": analysis}
    except Exception as e:
        return {"error": str(e)}

# -------------------
# Run with dynamic Render port
# -------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
