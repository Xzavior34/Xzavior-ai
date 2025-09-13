from fastapi import FastAPI, WebSocket, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.utils import call_gpt_api

app = FastAPI()

# Allow frontend (network + localhost) to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# WebSocket for chat
# -------------------
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    while True:
        try:
            # Receive message from frontend
            data = await ws.receive_text()
            
            # Call GPT API
            response_text = call_gpt_api(data)
            
            # Send GPT response back
            await ws.send_text(response_text)
        except Exception as e:
            await ws.close()
            print("WebSocket closed:", e)
            break

# -------------------
# File upload endpoint
# -------------------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        # Optional: send content to GPT for analysis
        analysis = call_gpt_api(f"Analyze this file content:\n{content.decode()}")
        return {"filename": file.filename, "analysis": analysis}
    except Exception as e:
        return {"error": str(e)}
