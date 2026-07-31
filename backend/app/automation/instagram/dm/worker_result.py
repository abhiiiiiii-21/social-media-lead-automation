from enum import Enum
from dataclasses import dataclass
from typing import Optional


class WorkerResultStatus(str, Enum):
    SUCCESS = "SUCCESS"
    SKIPPED_ALREADY_CONTACTED = "SKIPPED_ALREADY_CONTACTED"
    FAILED_PRIVATE_ACCOUNT = "FAILED_PRIVATE_ACCOUNT"
    FAILED_CANNOT_MESSAGE = "FAILED_CANNOT_MESSAGE"
    FAILED_SESSION_EXPIRED = "FAILED_SESSION_EXPIRED"
    FAILED_TIMEOUT = "FAILED_TIMEOUT"
    FAILED_BROWSER_ERROR = "FAILED_BROWSER_ERROR"
    FAILED_UNKNOWN = "FAILED_UNKNOWN"
    FAILED_USER_NOT_FOUND = "FAILED_USER_NOT_FOUND"


@dataclass
class WorkerResult:
    status: WorkerResultStatus
    message: Optional[str] = None
