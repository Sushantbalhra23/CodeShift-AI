from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


def _safe_format(template_str: str, **kwargs: Any) -> str:
    """Safely replaces {key} without crashing on literal JSON braces."""
    if not kwargs:
        return template_str
    result = template_str
    for key, val in kwargs.items():
        result = result.replace(f"{{{key}}}", str(val))
    return result


class PromptParameters(BaseModel):
    temperature: float = 0.2
    max_tokens: int = 4096
    top_p: Optional[float] = 0.95
    stop_sequences: Optional[list[str]] = None


class PromptTemplate(BaseModel):
    version: str = Field(..., description="Semantic version string, e.g. '1.0.0'")
    task: str = Field(..., description="Task category: translation, explanation, test_generation, repair")
    strategy: str = Field(..., description="Strategy identifier: zero_shot, few_shot, chain_of_thought, role_expert, etc.")
    description: str = Field(..., description="Academic description of the prompt design")
    parameters: PromptParameters = Field(default_factory=PromptParameters)
    system_prompt: str = Field(..., description="System instructions")
    user_template: str = Field(..., description="Parameterized template string")

    def render_system(self, **kwargs: Any) -> str:
        return _safe_format(self.system_prompt, **kwargs)

    def render_user(self, **kwargs: Any) -> str:
        return _safe_format(self.user_template, **kwargs)
