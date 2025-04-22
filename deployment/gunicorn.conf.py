# Production deployment configuration for Gunicorn
import multiprocessing
import os

# Gunicorn config
bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
keepalive = 65

# Logging
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"

# Worker configurations
worker_connections = 1000
timeout = 300
graceful_timeout = 30

# SSL (if not terminating SSL at nginx)
# keyfile = "/etc/ssl/private/cert.key"
# certfile = "/etc/ssl/certs/cert.pem"

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190
