"""Small date helpers. Timezone is APP_TZ (default Asia/Jakarta)."""

import os
from datetime import datetime
from zoneinfo import ZoneInfo

APP_TZ = ZoneInfo(os.environ.get("APP_TZ", "Asia/Jakarta"))


def today_iso() -> str:
    return datetime.now(APP_TZ).date().isoformat()