import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def generate_fallback_filters(prompt: str, error_message: str) -> Dict[str, Any]:
    """
    Returns a safe, empty/default set of filters if AI parsing completely fails.
    This ensures the backend never crashes and allows the frontend to show the error.
    """
    logger.error(
        f"Using fallback filters for prompt '{prompt[:50]}...'. Error: {error_message}")

    return {
        "keywords": [],
        "locations": [],
        "business_account_only": True,
        "minimum_followers": None,
        "maximum_followers": None,
        "minimum_posts": None,
        "maximum_posts": None,
        "website_required": False,
        "verified_only": False,
        "recently_active": False,
        "language": None,
        "business_category": None,
        "skip_duplicates": True
    }
