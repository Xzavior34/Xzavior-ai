from fastapi import FastAPI, WebSocket
from utils import call_gpt_api

app = FastAPI()

@app.websocket("/ws")
async def chat(ws: WebSocket):
    await ws.accept()
    while True:
        data = await ws.receive_text()
        response = call_gpt_api(data)
        await ws.send_text(response)
