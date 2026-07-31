import asyncio
import logging
import time
import random
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from groq import AsyncGroq, RateLimitError, APIError, APITimeoutError, AuthenticationError
from app.core.config import settings

logger = logging.getLogger(__name__)


class GroqClientManager:
    def __init__(self):
        # Initialize available keys
        self.api_keys: List[str] = []
        if settings.GROQ_API_KEY_1:
            self.api_keys.append(settings.GROQ_API_KEY_1)
        if settings.GROQ_API_KEY_2:
            self.api_keys.append(settings.GROQ_API_KEY_2)
        if settings.GROQ_API_KEY_3:
            self.api_keys.append(settings.GROQ_API_KEY_3)

        if not self.api_keys:
            logger.warning("No Groq API keys configured!")

        # Random start to load balance across keys across multiple worker restarts
        self.current_key_index = random.randint(
            0, len(self.api_keys) - 1) if self.api_keys else 0

        # Blacklist tracking: {index: timestamp_when_unblacklisted}
        self.blacklisted_until: Dict[int, float] = {}

        self.model = settings.DEFAULT_MODEL
        self.cooldown_sec = settings.AI_RATE_LIMIT_COOLDOWN_SEC
        self.max_retries = settings.AI_MAX_RETRIES
        self.timeout = settings.AI_DEFAULT_TIMEOUT

    def _get_available_key_index(self) -> Optional[int]:
        if not self.api_keys:
            return None

        now = time.time()

        for _ in range(len(self.api_keys)):
            index = self.current_key_index
            unblacklist_time = self.blacklisted_until.get(index, 0.0)

            if now >= unblacklist_time:
                return index

            # Move to next key
            self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)

        return None  # All keys are currently blacklisted

    def _blacklist_current_key(self):
        if not self.api_keys:
            return

        # Blacklist for configured cooldown
        self.blacklisted_until[self.current_key_index] = time.time() + self.cooldown_sec
        logger.warning(
            f"Groq API key index {
                self.current_key_index} blacklisted for {
                self.cooldown_sec}s.")

        # Move to next key
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)

    async def generate_json(self, system_prompt: str,
                            user_prompt: str) -> Dict[str, Any]:
        """
        Sends the request to Groq.
        Returns a dict containing: content, api_key_index, prompt_tokens, completion_tokens, total_tokens, retry_count.
        """
        if not self.api_keys:
            raise ValueError("No Groq API keys available.")

        retries = 0
        while retries <= self.max_retries:
            key_index = self._get_available_key_index()

            if key_index is None:
                logger.error(
                    "All Groq API keys are currently exhausted or blacklisted.")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. All AI providers are currently at capacity. Please try again later.")

            api_key = self.api_keys[key_index]
            client = AsyncGroq(api_key=api_key, timeout=self.timeout)

            try:
                logger.info(
                    f"Attempting Groq request with key index {key_index} (Attempt {
                        retries + 1})")
                response = await client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.1,  # Low temperature for strict schema adherence
                )

                content = response.choices[0].message.content

                # Extract Token Usage safely
                prompt_tokens = 0
                completion_tokens = 0
                total_tokens = 0

                if hasattr(response, "usage") and response.usage:
                    prompt_tokens = getattr(response.usage, "prompt_tokens", 0)
                    completion_tokens = getattr(response.usage, "completion_tokens", 0)
                    total_tokens = getattr(response.usage, "total_tokens", 0)

                return {
                    "content": content,
                    "api_key_index": key_index,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": total_tokens,
                    "retry_count": retries
                }

            except RateLimitError:
                logger.warning(f"Rate limit exceeded on key index {key_index}.")
                self._blacklist_current_key()
                retries += 1

            except (AuthenticationError, APIError) as e:
                logger.error(f"Authentication/API error on key index {key_index}: {e}.")
                # Treat auth/API error as a reason to blacklist it for a while so we
                # don't spam it
                self._blacklist_current_key()
                retries += 1

            except APITimeoutError:
                logger.error(f"Groq API Timeout on key index {key_index}.")
                # Don't strictly blacklist for timeouts, just rotate and sleep
                self.current_key_index = (
                    self.current_key_index + 1) % len(self.api_keys)
                retries += 1
                await asyncio.sleep(2)

            except Exception as e:
                logger.error(f"Unexpected Groq API error on key index {key_index}: {e}")
                raise

        logger.error("Exceeded maximum retries for Groq API across all available keys.")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Exceeded maximum retries for AI generation."
        )
