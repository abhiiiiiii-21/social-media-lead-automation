import json
import logging
from typing import Dict, Any


logger = logging.getLogger(__name__)


def parse_ai_response(response_content: str) -> Dict[str, Any]:
    """
    Parses the raw JSON response from Groq into a dictionary.
    Handles potential markdown formatting.
    """
    try:
        content = response_content.strip()
        # Handle case where AI wraps response in markdown code blocks
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]

        if content.endswith("```"):
            content = content[:-3]

        return json.loads(content.strip())

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON response from Groq: {e}")
        raise ValueError(f"Invalid JSON returned by AI: {e}")
