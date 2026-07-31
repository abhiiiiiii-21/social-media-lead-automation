import time
import logging
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.core.config import settings
from app.models.ai_discovery import AIDiscovery
from app.ai.discovery.schemas import DiscoveryRequest, DiscoveryResponse
from app.ai.discovery.cache import get_cached_discovery, normalize_prompt
from app.ai.discovery.groq_client import GroqClientManager
from app.ai.discovery.prompt_builder import build_system_prompt
from app.ai.discovery.response_parser import parse_ai_response
from app.ai.discovery.validator import validate_filters
from app.ai.discovery.fallback import generate_fallback_filters
from app.ai.discovery.monitoring import metrics_tracker

logger = logging.getLogger(__name__)

# Initialize Groq client manager
groq_manager = GroqClientManager()


def estimate_metrics(filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Heuristics to estimate leads, search size, and runtime using configuration constants.
    """
    keywords_count = len(filters.get("keywords", [])) or 1
    locations_count = len(filters.get("locations", [])) or 1

    # Base heuristic
    estimated_search_size = keywords_count * \
        locations_count * settings.ESTIMATION_LEADS_PER_KEYWORD

    # Restrictive filters reduce the estimate
    if filters.get("minimum_followers") and filters["minimum_followers"] > 5000:
        estimated_search_size = int(estimated_search_size * 0.5)
    if filters.get("verified_only"):
        estimated_search_size = int(estimated_search_size * 0.1)
    if filters.get("website_required"):
        estimated_search_size = int(estimated_search_size * 0.7)

    estimated_leads = estimated_search_size
    estimated_requests = estimated_leads * settings.ESTIMATION_REQUESTS_PER_LEAD
    estimated_runtime_mins = max(
        1.0,
        estimated_leads *
        settings.ESTIMATION_MINUTES_PER_LEAD)

    return {
        "estimated_search_size": estimated_search_size,
        "estimated_leads": estimated_leads,
        "estimated_requests": estimated_requests,
        "estimated_runtime_minutes": estimated_runtime_mins
    }


async def process_discovery_prompt(
        request: DiscoveryRequest,
        session: AsyncSession) -> DiscoveryResponse:
    start_time = time.time()
    prompt_text = request.prompt.strip()
    norm_prompt = normalize_prompt(prompt_text)

    logger.info(f"Discovery Started: '{prompt_text[:50]}...'")
    metrics_tracker.record_request()

    # 1. Check Cache
    cached = await get_cached_discovery(norm_prompt, session)
    if cached:
        logger.info("Cache Hit for discovery prompt.")
        metrics_tracker.record_cache_hit()

        metrics = estimate_metrics(cached.parsed_filters)
        return DiscoveryResponse(
            campaign_name="AI Generated Campaign",
            filters=cached.parsed_filters,
            estimated_leads=metrics["estimated_leads"],
            estimated_search_size=metrics["estimated_search_size"],
            estimated_requests=metrics["estimated_requests"],
            estimated_runtime_minutes=metrics["estimated_runtime_minutes"]
        )

    logger.info("Cache Miss. Initiating AI Request...")
    metrics_tracker.record_cache_miss()

    # 2. Prepare Database Record
    discovery_record = AIDiscovery(
        original_prompt=prompt_text,
        normalized_prompt=norm_prompt,
        prompt_version=settings.AI_PROMPT_VERSION,
        status="PROCESSING",
        cached=False
    )
    session.add(discovery_record)
    await session.commit()

    api_key_idx = None
    prompt_tokens = 0
    completion_tokens = 0
    total_tokens = 0
    retry_count = 0

    try:
        # 3. Call AI
        system_prompt = build_system_prompt()
        metrics_tracker.record_groq_request()

        response_dict = await groq_manager.generate_json(system_prompt, prompt_text)

        raw_response = response_dict["content"]
        api_key_idx = response_dict["api_key_index"]
        prompt_tokens = response_dict["prompt_tokens"]
        completion_tokens = response_dict["completion_tokens"]
        total_tokens = response_dict["total_tokens"]
        retry_count = response_dict["retry_count"]

        logger.info(
            f"Groq Request successful on key index {api_key_idx}. Tokens: {total_tokens}")

        if retry_count > 0:
            for _ in range(retry_count):
                metrics_tracker.record_rate_limit()

        # 4. Parse & Validate
        parsed_json = parse_ai_response(raw_response)
        validated_filters = validate_filters(parsed_json)
        filters_dict = validated_filters.model_dump()

        logger.info("Validation Passed for AI output.")

        # Update Record
        discovery_record.parsed_filters = filters_dict
        discovery_record.api_key_index = api_key_idx
        discovery_record.groq_model = groq_manager.model
        discovery_record.prompt_tokens = prompt_tokens
        discovery_record.completion_tokens = completion_tokens
        discovery_record.total_tokens = total_tokens
        discovery_record.retry_count = retry_count
        discovery_record.status = "SUCCESS"

    except HTTPException as e:
        # Pass 429 Too Many Requests directly to the client
        logger.warning(f"Rate Limit reached: {e.detail}")
        metrics_tracker.record_rate_limit()
        discovery_record.status = "FAILED"
        discovery_record.error_message = str(e.detail)
        await session.commit()
        raise

    except Exception as e:
        logger.error(f"Validation Failed or AI Error: {e}")
        metrics_tracker.record_failure()

        # 5. Fallback
        filters_dict = generate_fallback_filters(prompt_text, str(e))
        discovery_record.parsed_filters = filters_dict
        discovery_record.error_message = str(e)
        discovery_record.status = "FAILED"

    # Finalize Record
    processing_time_ms = int((time.time() - start_time) * 1000)
    discovery_record.processing_time_ms = processing_time_ms
    await session.commit()

    if discovery_record.status == "SUCCESS":
        metrics_tracker.record_success(processing_time_ms, total_tokens)
        logger.info(f"Final Status: SUCCESS ({processing_time_ms}ms)")
    else:
        logger.warning(
            f"Final Status: FAILED - Using fallback filters ({processing_time_ms}ms)")

    # 6. Generate Estimations
    metrics = estimate_metrics(filters_dict)

    return DiscoveryResponse(
        campaign_name="AI Generated Campaign",
        filters=filters_dict,
        estimated_leads=metrics["estimated_leads"],
        estimated_search_size=metrics["estimated_search_size"],
        estimated_requests=metrics["estimated_requests"],
        estimated_runtime_minutes=metrics["estimated_runtime_minutes"]
    )
