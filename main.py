from fastapi import FastAPI
from backend.routes import products, orders, cart, chatbot
import os
import uvicorn
import logfire

#initialize the fastapi app
app = FastAPI()

#configure logfire
logfire.configure(send_to_logfire='if-token-present')
logfire.instrument_fastapi(app)
logfire.instrument_pydantic()

#create uploads forlder for product images
UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

#include api routes
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(chatbot.router)

# serve uploaded files statically
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
