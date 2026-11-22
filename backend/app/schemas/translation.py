from datetime import datetime, timezone
from typing import List, Optional
from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator, model_validator

SUPPORTED_LANGUAGES = {"java", "python"}
SUPPORTED_STRATEGIES = {
    "baseline",
    "zero_shot",
    "few_shot",
    "chain_of_thought",
    "role_expert",
}
MAX_SOURCE_CODE_LENGTH = 50000


class LLMTranslationPayload(BaseModel):
    """Validated structured output expected from the LLM."""

    translated_code: str = Field(..., min_length=1)
    explanation: str = ""
    assumptions: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

    @field_validator("translated_code", "explanation", mode="before")
    @classmethod
    def coerce_str(cls, v: object) -> str:
        if v is None:
            return ""
        return str(v)

    @field_validator("assumptions", "warnings", mode="before")
    @classmethod
    def coerce_str_list(cls, v: object) -> List[str]:
        if v is None:
            return []
        if isinstance(v, list):
            return [str(item) for item in v]
        return [str(v)]


class TranslationRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    source_code: str = Field(
        ...,
        description="The original source code to translate",
    )
    source_language: str = Field(
        ...,
        description="Source programming language ('java' or 'python')",
    )
    target_language: str = Field(
        ...,
        description="Target programming language ('java' or 'python')",
    )
    prompt_strategy: str = Field(
        default="baseline",
        validation_alias=AliasChoices("prompt_strategy", "strategy"),
        description="Prompt engineering strategy ('baseline', 'zero_shot', 'few_shot', 'chain_of_thought', 'role_expert')",
    )
    prompt_version: Optional[str] = Field(default=None, description="Optional prompt template version")
    temperature: Optional[float] = Field(default=0.1, ge=0.0, le=2.0)

    @field_validator("source_code")
    @classmethod
    def validate_source_code(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("source_code cannot be empty or whitespace.")
        if len(v) > MAX_SOURCE_CODE_LENGTH:
            raise ValueError(
                f"source_code length ({len(v)} characters) exceeds maximum allowed limit of {MAX_SOURCE_CODE_LENGTH} characters."
            )
        return v

    @field_validator("source_language")
    @classmethod
    def validate_source_language(cls, v: str) -> str:
        normalized = v.strip().lower()
        if normalized not in SUPPORTED_LANGUAGES:
            raise ValueError(
                f"Unsupported source language: '{v}'. Supported languages are: {sorted(list(SUPPORTED_LANGUAGES))}."
            )
        return normalized

    @field_validator("target_language")
    @classmethod
    def validate_target_language(cls, v: str) -> str:
        normalized = v.strip().lower()
        if normalized not in SUPPORTED_LANGUAGES:
            raise ValueError(
                f"Unsupported target language: '{v}'. Supported languages are: {sorted(list(SUPPORTED_LANGUAGES))}."
            )
        return normalized

    @field_validator("prompt_strategy")
    @classmethod
    def validate_prompt_strategy(cls, v: str) -> str:
        normalized = v.strip().lower()
        if normalized not in SUPPORTED_STRATEGIES:
            raise ValueError(
                f"Unsupported prompt_strategy: '{v}'. Supported strategies are: {sorted(list(SUPPORTED_STRATEGIES))}."
            )
        return normalized

    @model_validator(mode="after")
    def validate_distinct_languages(self) -> "TranslationRequest":
        if self.source_language == self.target_language:
            raise ValueError(
                f"source_language and target_language must be different. Received '{self.source_language}' -> '{self.target_language}'."
            )
        return self


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
    translated_code: str = Field(..., description="The translated target code")
    explanation: str = Field(..., description="Explanation of language differences and rationale")
    assumptions: List[str] = Field(default_factory=list, description="Assumptions made during translation")
    warnings: List[str] = Field(default_factory=list, description="Warnings regarding semantics, types, or performance")
    
    # Contextual metadata
    id: Optional[int] = None
    source_language: Optional[str] = None
    target_language: Optional[str] = None
    metadata: Optional[TranslationMetadata] = None
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))


class BatchTranslationRequest(BaseModel):
    source_code: str
    source_language: str
    target_language: str
    strategies: List[str] = Field(
        default=["baseline", "few_shot", "chain_of_thought", "role_expert"],
        description="List of strategies to execute for comparative benchmarking",
    )
    temperature: Optional[float] = Field(default=0.1, ge=0.0, le=2.0)


class BatchTranslationResponse(BaseModel):
    results: List[TranslationResponse]
