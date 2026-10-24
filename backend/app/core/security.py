from typing import Set
from app.config import get_settings
from app.core.exceptions import PayloadTooLargeError, UnsupportedLanguageError

SUPPORTED_LANGUAGES: Set[str] = {"java", "python"}


def validate_language_pair(source_lang: str, target_lang: str) -> None:
    s = source_lang.strip().lower()
    t = target_lang.strip().lower()
    if s not in SUPPORTED_LANGUAGES:
        raise UnsupportedLanguageError(f"Unsupported source language: '{source_lang}'. Must be 'java' or 'python'.")
    if t not in SUPPORTED_LANGUAGES:
        raise UnsupportedLanguageError(f"Unsupported target language: '{target_lang}'. Must be 'java' or 'python'.")
    if s == t:
        raise UnsupportedLanguageError(f"Source and target languages must be different. Received {s} -> {t}.")


def validate_code_payload(code: str) -> str:
    settings = get_settings()
    if not code or not code.strip():
        raise ValueError("Source code payload cannot be empty.")
    if len(code) > settings.MAX_CODE_CHARS:
        raise PayloadTooLargeError(
            f"Code length ({len(code)} chars) exceeds maximum allowed ({settings.MAX_CODE_CHARS} chars)."
        )
    return code
