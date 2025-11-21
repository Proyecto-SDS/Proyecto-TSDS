from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def Hola():
    return {"ok": True}