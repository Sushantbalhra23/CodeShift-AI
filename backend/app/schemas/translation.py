from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field


class TranslationRequest(BaseModel):
    source_code: str = Field(..., description="The original source code to translate")
    source_language: str = Field(..., description="Source programming language ('java' or 'python')")
    target_language: str = Field(..., description="Target programming language ('java' or 'python')")
    strategy: str = Field(
        default="zero_shot",
        description="Prompt engineering strategy ('zero_shot', 'few_shot', 'chain_of_thought', 'role_expert')"
    )
    prompt_version: Optional[str] = Field(default=None, description="Specific prompt template version")
    temperature: Optional[float] = Field(default=0.2, ge=0.0, le=2.0)


class TranslationMetadata(BaseModel):
    strategy: str
    prompt_version: str
    model: str
    provider: str
    latency_ms: float
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    ast_valid: bool = False
    ast_error: Optional[str] = None


class TranslationResponse(BaseModel):
    id: Optional[int] = None
    source_language: str
    target_language: str
    source_code: str
    translated_code: str
    explanation: Optional[str] = None
    metadata: TranslationMetadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BatchTranslationRequest(BaseModel):
    source_code: str
    source_language: str
    target_language: str
    strategies: List[str] = Field(
        default=["zero_shot", "few_shot", "chain_of_thought", "role_expert"],
        description="List of strategies to execute in parallel for comparative benchmarking"
    )
    temperature: Optional[float] = Field(default=0.2, ge=0.0, le=2.0)


class BatchTranslationResponse(BaseModel):
    results: List[TranslationResponse]
