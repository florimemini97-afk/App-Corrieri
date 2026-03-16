from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import uuid
from datetime import datetime, timezone
import httpx
import logging
from dotenv import load_dotenv

load_dotenv()

MONGO_URL            = os.environ["MONGO_URL"]
DB_NAME              = os.environ.get("DB_NAME", "app_corrieri")
TELEGRAM_BOT_TOKEN   = os.environ["TELEGRAM_BOT_TOKEN"]
TELEGRAM_CHAT_ID     = os.environ["TELEGRAM_CHAT_ID"]
ADMIN_PASSWORD       = os.environ.get("ADMIN_PASSWORD", "pizzeria2024")

mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]

app = FastAPI(title="App Corrieri")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class CorriereCreate(BaseModel):
    nome: str
    cognome: str
    telefono: Optional[str] = None

class Corriere(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    cognome: str
    telefono: Optional[str] = None
    creato_il: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VeicoloCreate(BaseModel):
    targa: str
    descrizione: Optional[str] = None

class Veicolo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    targa: str
    descrizione: Optional[str] = None
    creato_il: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CheckoutRequest(BaseModel):
    corriere_id: str
    veicolo_targa: str

class CheckinRequest(BaseModel):
    corriere_id: str

class AdminLogin(BaseModel):
    password: str

def ora_italiana(dt: datetime) -> str:
    from datetime import timedelta
    ora_it = dt + timedelta(hours=1)
    return ora_it.strftime("%d/%m/%Y alle %H:%M")

async def telegram(msg: str):
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        async with httpx.AsyncClient(timeout=10) as c:
            await c.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "HTML"})
    except Exception as e:
        logger.error(f"Telegram error: {e}")

@app.post("/api/corrieri", response_model=Corriere)
async def crea_corriere(data: CorriereCreate):
    existing = await db.corrieri.find_one({"nome": data.nome.strip(), "cognome": data.cognome.strip()})
    if existing:
        existing.pop("_id", None)
        return existing
    corriere = Corriere(nome=data.nome.strip(), cognome=data.cognome.strip(), telefono=data.telefono)
    await db.corrieri.insert_one(corriere.model_dump())
    return corriere

@app.get("/api/corrieri", response_model=List[Corriere])
async def lista_corrieri():
    return await db.corrieri.find({}, {"_id": 0}).to_list(1000)

@app.delete("/api/corrieri/{corriere_id}")
async def elimina_corriere(corriere_id: str):
    await db.usi_attivi.delete_many({"corriere_id": corriere_id})
    result = await db.corrieri.delete_one({"id": corriere_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Corriere non trovato")
    return {"ok": True}

@app.post("/api/veicoli", response_model=Veicolo)
async def crea_veicolo(data: VeicoloCreate):
    targa = data.targa.upper().strip()
    if await db.veicoli.find_one({"targa": targa}):
        raise HTTPException(status_code=400, detail="Veicolo già esistente")
    veicolo = Veicolo(targa=targa, descrizione=data.descrizione)
    await db.veicoli.insert_one(veicolo.model_dump())
    return veicolo

@app.get("/api/veicoli", response_model=List[Veicolo])
async def lista_veicoli():
    return await db.veicoli.find({}, {"_id": 0}).to_list(1000)

@app.delete("/api/veicoli/{veicolo_id}")
async def elimina_veicolo(veicolo_id: str):
    await db.usi_attivi.delete_many({"veicolo_id": veicolo_id})
    result = await db.veicoli.delete_one({"id": veicolo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Veicolo non trovato")
    return {"ok": True}

@app.post("/api/checkout")
async def checkout(data: CheckoutRequest):
    corriere = await db.corrieri.find_one({"id": data.corriere_id}, {"_id": 0})
    if not corriere:
        raise HTTPException(status_code=404, detail="Corriere non trovato. Registrati prima.")
    targa = data.veicolo_targa.upper().strip()
    veicolo = await db.veicoli.find_one({"targa": targa}, {"_id": 0})
    if not veicolo:
        raise HTTPException(status_code=404, detail=f"Veicolo {targa} non trovato")
    uso_veicolo = await db.usi_attivi.find_one({"veicolo_targa": targa})
    if uso_veicolo:
        raise HTTPException(status_code=400, detail=f"⚠️ Il veicolo {targa} è già in uso da {uso_veicolo['corriere_nome']}")
    uso_corriere = await db.usi_attivi.find_one({"corriere_id": data.corriere_id})
    if uso_corriere:
        raise HTTPException(status_code=400, detail=f"⚠️ Hai già preso il veicolo {uso_corriere['veicolo_targa']}. Restituiscilo prima.")
    now = datetime.now(timezone.utc)
    nome = f"{corriere['nome']} {corriere['cognome']}"
    await db.usi_attivi.insert_one({"id": str(uuid.uuid4()), "corriere_id": data.corriere_id, "corriere_nome": nome, "veicolo_id": veicolo["id"], "veicolo_targa": targa, "veicolo_descrizione": veicolo.get("descrizione", ""), "checkout_at": now.isoformat()})
    await db.movimenti.insert_one({"id": str(uuid.uuid4()), "corriere_id": data.corriere_id, "corriere_nome": nome, "veicolo_targa": targa, "tipo": "checkout", "timestamp": now.isoformat()})
    await telegram(f"🚗 <b>VEICOLO PRESO</b>\n👤 Corriere: <b>{nome}</b>\n🚙 Targa: <b>{targa}</b>\n🕐 Orario: {ora_italiana(now)}")
    return {"ok": True, "messaggio": f"✅ Hai preso il veicolo {targa}!"}

@app.post("/api/checkin")
async def checkin(data: CheckinRequest):
    corriere = await db.corrieri.find_one({"id": data.corriere_id}, {"_id": 0})
    if not corriere:
        raise HTTPException(status_code=404, detail="Corriere non trovato. Registrati prima.")
    uso = await db.usi_attivi.find_one({"corriere_id": data.corriere_id})
    if not uso:
        raise HTTPException(status_code=400, detail="⚠️ Non hai nessun veicolo in uso al momento.")
    targa = uso["veicolo_targa"]
    now = datetime.now(timezone.utc)
    nome = f"{corriere['nome']} {corriere['cognome']}"
    await db.usi_attivi.delete_one({"corriere_id": data.corriere_id})
    await db.movimenti.insert_one({"id": str(uuid.uuid4()), "corriere_id": data.corriere_id, "corriere_nome": nome, "veicolo_targa": targa, "tipo": "checkin", "timestamp": now.isoformat()})
    await telegram(f"🏠 <b>VEICOLO RESTITUITO</b>\n👤 Corriere: <b>{nome}</b>\n🚙 Targa: <b>{targa}</b>\n🕐 Orario: {ora_italiana(now)}")
    return {"ok": True, "messaggio": f"✅ Hai restituito il veicolo {targa}!"}

@app.get("/api/dashboard")
async def dashboard():
    return {
        "usi_attivi": await db.usi_attivi.find({}, {"_id": 0}).to_list(1000),
        "veicoli": await db.veicoli.find({}, {"_id": 0}).to_list(1000),
        "corrieri": await db.corrieri.find({}, {"_id": 0}).to_list(1000),
        "movimenti_recenti": await db.movimenti.find({}, {"_id": 0}).sort("timestamp", -1).to_list(50)
    }

@app.post("/api/admin/login")
async def admin_login(data: AdminLogin):
    if data.password == ADMIN_PASSWORD:
        return {"ok": True}
    raise HTTPException(status_code=401, detail="Password errata")

@app.get("/api/")
async def root():
    return {"status": "ok", "app": "App Corrieri"}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
