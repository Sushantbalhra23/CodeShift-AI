from typing import Any, Optional


class CodeShiftException(Exception):
    """Base exception for all CodeShift AI errors."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.details = details


class PromptTemplateNotFoundError(CodeShiftException):
    """Raised when a requested prompt template or version is not found."""
    pass


class InvalidPromptSchemaError(CodeShiftException):
    """Raised when a prompt template does not conform to required schema."""
    pass


class LLMProviderError(CodeShiftException):
    """Raised when an upstream LLM API call fails or times out."""
    pass


class UnsupportedLanguageError(CodeShiftException):
    """Raised when an unsupported language pair is requested."""
    pass


class PayloadTooLargeError(CodeShiftException):
    """Raised when submitted source code exceeds max characters limit."""
    pass


class SandboxExecutionError(CodeShiftException):
    """Raised when sandbox execution fails or violates security policy."""
    pass
