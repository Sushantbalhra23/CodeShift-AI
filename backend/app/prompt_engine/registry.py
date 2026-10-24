import os
from pathlib import Path
from typing import Dict, List, Optional
import yaml

from app.config import get_settings
from app.core.exceptions import PromptTemplateNotFoundError
from app.core.logging import logger
from app.prompt_engine.models import PromptTemplate


class PromptRegistry:
    def __init__(self, prompts_dir: Optional[str] = None):
        if prompts_dir is None:
            settings = get_settings()
            # Resolve relative to backend or root
            base_path = Path(__file__).resolve().parent.parent.parent
            candidate = base_path.parent / "prompts"
            if candidate.exists():
                self.prompts_dir = candidate
            else:
                self.prompts_dir = Path(settings.PROMPTS_DIR).resolve()
        else:
            self.prompts_dir = Path(prompts_dir).resolve()

        self._templates: Dict[str, Dict[str, PromptTemplate]] = {}
        self.reload_templates()

    def reload_templates(self) -> None:
        """Scan and register all prompt template YAML files."""
        self._templates.clear()
        if not self.prompts_dir.exists():
            logger.warning(f"Prompts directory not found at: {self.prompts_dir}")
            return

        for root, _, files in os.walk(self.prompts_dir):
            for file in files:
                if file.endswith((".yaml", ".yml")):
                    filepath = Path(root) / file
                    try:
                        with open(filepath, "r", encoding="utf-8") as f:
                            raw_data = yaml.safe_load(f)
                            if not isinstance(raw_data, dict):
                                continue
                            template = PromptTemplate(**raw_data)
                            key = f"{template.task}:{template.strategy}"
                            if key not in self._templates:
                                self._templates[key] = {}
                            self._templates[key][template.version] = template
                            logger.debug(f"Registered prompt template: {key} (v{template.version}) from {file}")
                    except Exception as e:
                        logger.error(f"Failed to load prompt template from {filepath}: {e}")

    def get_template(
        self,
        task: str,
        strategy: str,
        version: Optional[str] = None
    ) -> PromptTemplate:
        """Retrieve a registered prompt template by task and strategy."""
        key = f"{task}:{strategy}"
        if key not in self._templates or not self._templates[key]:
            raise PromptTemplateNotFoundError(
                f"No prompt template found for task='{task}' and strategy='{strategy}'.",
                details={"available_keys": list(self._templates.keys())}
            )

        versions = self._templates[key]
        if version:
            if version in versions:
                return versions[version]
            raise PromptTemplateNotFoundError(
                f"Version '{version}' not found for '{key}'. Available versions: {list(versions.keys())}"
            )

        # Default to latest version (sorted lexicographically or semantic)
        latest_version = sorted(versions.keys(), reverse=True)[0]
        return versions[latest_version]

    def list_strategies(self, task: Optional[str] = None) -> List[Dict[str, str]]:
        """List all available strategies and versions."""
        items = []
        for key, versions in self._templates.items():
            t_task, t_strategy = key.split(":", 1)
            if task is None or t_task == task:
                for ver, template in versions.items():
                    items.append({
                        "task": t_task,
                        "strategy": t_strategy,
                        "version": ver,
                        "description": template.description
                    })
        return items


_registry_instance: Optional[PromptRegistry] = None


def get_prompt_registry() -> PromptRegistry:
    global _registry_instance
    if _registry_instance is None:
        _registry_instance = PromptRegistry()
    return _registry_instance
