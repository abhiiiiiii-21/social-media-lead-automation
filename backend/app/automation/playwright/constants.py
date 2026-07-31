from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
SESSIONS_DIR = ROOT_DIR / "storage" / "sessions"

# Instagram URLs
INSTAGRAM_BASE_URL = "https://www.instagram.com/"
INSTAGRAM_LOGIN_URL = "https://www.instagram.com/accounts/login/"
INSTAGRAM_CHALLENGE_URL_PATTERN = "instagram.com/challenge"

# Timeouts
DEFAULT_TIMEOUT_MS = 30000
NAVIGATION_TIMEOUT_MS = 60000
LOGIN_TIMEOUT_MS = 90000

# Session Statuses
SESSION_STATUS_VALID = "Valid"
SESSION_STATUS_EXPIRED = "Expired"
SESSION_STATUS_INVALID = "Invalid"
SESSION_STATUS_CHECKPOINT = "Checkpoint Required"
SESSION_STATUS_ERROR = "Error"

# Default Browser Settings
DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
DEFAULT_VIEWPORT = {"width": 1280, "height": 800}
