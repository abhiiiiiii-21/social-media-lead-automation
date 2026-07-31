import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


class MetricsTracker:
    def __init__(self):
        self.total_requests = 0
        self.cache_hits = 0
        self.cache_misses = 0
        self.groq_requests = 0
        self.rate_limited_requests = 0
        self.failed_requests = 0
        self.successful_requests = 0

        # Moving averages
        self.total_processing_time_ms = 0
        self.total_tokens_used = 0

    def record_request(self):
        self.total_requests += 1

    def record_cache_hit(self):
        self.cache_hits += 1

    def record_cache_miss(self):
        self.cache_misses += 1

    def record_groq_request(self):
        self.groq_requests += 1

    def record_rate_limit(self):
        self.rate_limited_requests += 1

    def record_failure(self):
        self.failed_requests += 1

    def record_success(self, processing_time_ms: int, tokens_used: int):
        self.successful_requests += 1
        self.total_processing_time_ms += processing_time_ms
        self.total_tokens_used += tokens_used

    def get_metrics(self) -> Dict[str, Any]:
        avg_processing_time = (
            self.total_processing_time_ms // self.successful_requests
            if self.successful_requests > 0 else 0
        )
        avg_tokens = (
            self.total_tokens_used // self.successful_requests
            if self.successful_requests > 0 else 0
        )

        return {
            "total_requests": self.total_requests,
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "groq_requests": self.groq_requests,
            "rate_limited_requests": self.rate_limited_requests,
            "failed_requests": self.failed_requests,
            "successful_requests": self.successful_requests,
            "average_processing_time_ms": avg_processing_time,
            "average_tokens_used": avg_tokens
        }


metrics_tracker = MetricsTracker()
