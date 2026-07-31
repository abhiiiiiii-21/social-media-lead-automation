import logging
from typing import Dict, Any
from pydantic import ValidationError
from app.ai.discovery.schemas import DiscoveryFilters

logger = logging.getLogger(__name__)


def validate_filters(parsed_json: Dict[str, Any]) -> DiscoveryFilters:
    """
    Validates that the parsed JSON strictly conforms to the DiscoveryFilters schema.
    Applies any additional business logic validation.
    """
    try:
        # Relies on Pydantic schema validation including the custom @model_validator
        filters = DiscoveryFilters(**parsed_json)
        return filters
    except ValidationError as e:
        logger.error(f"Pydantic schema validation failed: {e}")
        raise ValueError(f"Schema validation failed: {e}")
    except Exception as e:
        logger.error(f"Business logic validation failed: {e}")
        raise ValueError(str(e))
