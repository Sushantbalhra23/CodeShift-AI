from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class TestCase(BaseModel):
    name: str
    description: Optional[str] = None
    input_values: Dict[str, Any] = Field(default_factory=dict)
    expected_output: Any = None


class TestGenerationRequest(BaseModel):
    source_code: str
    translated_code: str
    source_language: str
    target_language: str
    num_tests: int = Field(default=3, ge=1, le=10)


class TestGenerationResponse(BaseModel):
    target_language: str
    test_framework: str  # pytest or junit
    test_code: str
    test_cases: List[TestCase]
    explanation: Optional[str] = None


class ASTValidationResult(BaseModel):
    is_valid: bool
    language: str
    error_message: Optional[str] = None
    node_count: int = 0
    symbols: List[str] = Field(default_factory=list)
    classes: List[str] = Field(default_factory=list)
    functions: List[str] = Field(default_factory=list)


class RepairRequest(BaseModel):
    source_code: str
    current_code: str
    source_language: str
    target_language: str
    error_feedback: str
    iteration: int = Field(default=1, ge=1)
    max_iterations: int = Field(default=3, ge=1, le=5)


class RepairResponse(BaseModel):
    iteration: int
    repaired_code: str
    explanation_of_fix: str
    is_ast_valid: bool
    ast_error: Optional[str] = None
    converged: bool
