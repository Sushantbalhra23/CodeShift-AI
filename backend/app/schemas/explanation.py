from typing import List, Optional
from pydantic import BaseModel, Field


class ParadigmDifference(BaseModel):
    category: str = Field(..., description="e.g. Type System, Memory & Garbage Collection, Concurrency, Idioms, Standard Library")
    source_concept: str
    target_concept: str
    explanation: str
    code_snippet_source: Optional[str] = None
    code_snippet_target: Optional[str] = None


class ExplanationRequest(BaseModel):
    source_code: str
    translated_code: str
    source_language: str
    target_language: str


class ExplanationResponse(BaseModel):
    summary: str
    differences: List[ParadigmDifference]
    gotchas_and_caveats: List[str]
    runtime_differences: List[str]
