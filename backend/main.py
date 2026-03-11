import os
from datetime import datetime
from typing import List, Optional, Any, Dict
from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator
from typing_extensions import Annotated
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

@app.on_event("startup")
async def startup_db_client():
    try:
        # The client will be started when the first request is made,
        # but we can trigger a ping to verify connection now.
        await client.admin.command('ping')
        print("\n" + "!"*50)
        print("SUCCESS: CONNECTED TO MONGODB ATLAS!")
        print("!"*50 + "\n")
    except Exception as e:
        print("\n" + "X"*50)
        print(f"ERROR: COULD NOT CONNECT TO MONGODB ATLAS")
        print(f"DETAILS: {e}")
        print("X"*50 + "\n")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    # Fallback to a default or raise error if needed
    MONGODB_URI = "mongodb://localhost:27017/cms"

client = AsyncIOMotorClient(MONGODB_URI)
db = client.get_database()

# Helper for ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

# --- Models ---

class ContentTypeModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    kind: str = "collection"
    fields: List[Dict[str, Any]] = []
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class EntryModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    contentTypeId: PyObjectId
    data: Dict[str, Any] = {}
    status: str = "draft"
    scheduledAt: Optional[datetime] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True

class AssetModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: Optional[str] = None
    alternativeText: Optional[str] = None
    caption: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    formats: Optional[Dict[str, Any]] = None
    hash: Optional[str] = None
    ext: Optional[str] = None
    mime: Optional[str] = None
    size: Optional[float] = None
    url: Optional[str] = None
    previewUrl: Optional[str] = None
    provider: Optional[str] = None
    provider_metadata: Optional[Dict[str, Any]] = None
    folder: Optional[str] = None
    favorite: bool = False
    deleted: bool = False
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True

class ReleaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    description: Optional[str] = None
    scheduledAt: Optional[datetime] = None
    status: str = "pending"
    entries: List[Dict[str, str]] = []
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True

# --- API Routes ---

@app.get("/")
async def root():
    return {"message": "CMS Backend is Running", "database": "Connected"}

@app.get("/api/content-types", response_model=List[ContentTypeModel])
async def get_content_types():
    cursor = db.ContentTypeV3.find({})
    return [ContentTypeModel(**doc) async for doc in cursor]

@app.post("/api/content-types", response_model=ContentTypeModel)
async def create_content_type(body: Dict = Body(...)):
    body["createdAt"] = datetime.utcnow()
    body["updatedAt"] = datetime.utcnow()
    result = await db.ContentTypeV3.insert_one(body)
    new_doc = await db.ContentTypeV3.find_one({"_id": result.inserted_id})
    return ContentTypeModel(**new_doc)

@app.put("/api/content-types/{id}", response_model=ContentTypeModel)
async def update_content_type(id: str, body: Dict = Body(...)):
    body["updatedAt"] = datetime.utcnow()
    await db.ContentTypeV3.update_one({"_id": ObjectId(id)}, {"$set": body})
    updated_doc = await db.ContentTypeV3.find_one({"_id": ObjectId(id)})
    return ContentTypeModel(**updated_doc)

@app.delete("/api/content-types/{id}")
async def delete_content_type(id: str):
    await db.ContentTypeV3.delete_one({"_id": ObjectId(id)})
    return {"message": "Deleted"}

# ENTRIES
@app.get("/api/entries", response_model=List[EntryModel])
async def get_entries(contentTypeId: Optional[str] = Query(None)):
    query = {"contentTypeId": ObjectId(contentTypeId)} if contentTypeId else {}
    cursor = db.Entry.find(query)
    return [EntryModel(**doc) async for doc in cursor]

@app.post("/api/entries", response_model=EntryModel)
async def create_entry(body: Dict = Body(...)):
    if "contentTypeId" in body:
        body["contentTypeId"] = ObjectId(body["contentTypeId"])
    body["createdAt"] = datetime.utcnow()
    body["updatedAt"] = datetime.utcnow()
    result = await db.Entry.insert_one(body)
    new_doc = await db.Entry.find_one({"_id": result.inserted_id})
    return EntryModel(**new_doc)

@app.put("/api/entries/{id}", response_model=EntryModel)
async def update_entry(id: str, body: Dict = Body(...)):
    body["updatedAt"] = datetime.utcnow()
    await db.Entry.update_one({"_id": ObjectId(id)}, {"$set": body})
    updated_doc = await db.Entry.find_one({"_id": ObjectId(id)})
    return EntryModel(**updated_doc)

@app.delete("/api/entries/{id}")
async def delete_entry(id: str):
    await db.Entry.delete_one({"_id": ObjectId(id)})
    return {"message": "Deleted"}

# ASSETS
@app.get("/api/assets", response_model=List[AssetModel])
async def get_assets():
    cursor = db.Asset.find({})
    return [AssetModel(**doc) async for doc in cursor]

@app.post("/api/assets", response_model=AssetModel)
async def create_asset(body: Dict = Body(...)):
    body["createdAt"] = datetime.utcnow()
    body["updatedAt"] = datetime.utcnow()
    result = await db.Asset.insert_one(body)
    new_doc = await db.Asset.find_one({"_id": result.inserted_id})
    return AssetModel(**new_doc)

@app.put("/api/assets/{id}", response_model=AssetModel)
async def update_asset(id: str, body: Dict = Body(...)):
    body["updatedAt"] = datetime.utcnow()
    await db.Asset.update_one({"_id": ObjectId(id)}, {"$set": body})
    updated_doc = await db.Asset.find_one({"_id": ObjectId(id)})
    return AssetModel(**updated_doc)

@app.delete("/api/assets/{id}")
async def delete_asset(id: str):
    await db.Asset.delete_one({"_id": ObjectId(id)})
    return {"message": "Deleted"}

# RELEASES
@app.get("/api/releases", response_model=List[ReleaseModel])
async def get_releases():
    cursor = db.Release.find({})
    return [ReleaseModel(**doc) async for doc in cursor]

@app.post("/api/releases", response_model=ReleaseModel)
async def create_release(body: Dict = Body(...)):
    body["createdAt"] = datetime.utcnow()
    body["updatedAt"] = datetime.utcnow()
    result = await db.Release.insert_one(body)
    new_doc = await db.Release.find_one({"_id": result.inserted_id})
    return ReleaseModel(**new_doc)

@app.put("/api/releases/{id}", response_model=ReleaseModel)
async def update_release(id: str, body: Dict = Body(...)):
    body["updatedAt"] = datetime.utcnow()
    await db.Release.update_one({"_id": ObjectId(id)}, {"$set": body})
    updated_doc = await db.Release.find_one({"_id": ObjectId(id)})
    return ReleaseModel(**updated_doc)

@app.delete("/api/releases/{id}")
async def delete_release(id: str):
    await db.Release.delete_one({"_id": ObjectId(id)})
    return {"message": "Deleted"}

# CRON / PROCESS SCHEDULED
@app.get("/api/cron/process-scheduled")
async def process_scheduled():
    now = datetime.utcnow()
    # Find entries that are scheduled and scheduledAt <= now
    # This is a simplified version of what might be in the route.js
    result = await db.Entry.update_many(
        {"status": "scheduled", "scheduledAt": {"$lte": now}},
        {"$set": {"status": "published", "updatedAt": now}}
    )
    return {"processed": result.modified_count}

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("BACKEND IS STARTING...")
    print("CLICK THIS URL TO TEST: http://localhost:8000/api/content-types")
    print("="*50 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)
