from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.translation import TranslationResponse


class ExperimentCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    source_language: str
    target_language: str


class ExperimentResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    source_language: str
    target_language: str
    created_at: datetime
    translations: List[TranslationResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
