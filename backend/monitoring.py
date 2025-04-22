import logging
from prometheus_client import Counter, Histogram, start_http_server
import time
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
import os

# Initialize Sentry
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN", ""),
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
    environment=os.getenv("ENVIRONMENT", "production")
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Prometheus metrics
ws_connections = Counter(
    'websocket_connections_total',
    'Total WebSocket connections'
)

ws_messages = Counter(
    'websocket_messages_total',
    'Total WebSocket messages',
    ['type']
)

message_latency = Histogram(
    'message_latency_seconds',
    'Message processing latency'
)

class MetricsCollector:
    def __init__(self, port=9090):
        start_http_server(port)
    
    def track_connection(self):
        ws_connections.inc()
    
    def track_message(self, message_type):
        ws_messages.labels(type=message_type).inc()
    
    @message_latency.time()
    def measure_latency(self):
        pass  # This decorator will automatically measure the execution time

class HealthCheck:
    @staticmethod
    async def check_mongodb(db):
        try:
            await db.command("ping")
            return True
        except Exception as e:
            logger.error(f"MongoDB health check failed: {str(e)}")
            return False
    
    @staticmethod
    async def check_redis(redis):
        try:
            await redis.ping()
            return True
        except Exception as e:
            logger.error(f"Redis health check failed: {str(e)}")
            return False
