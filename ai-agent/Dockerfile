FROM python:3.10-slim-bullseye

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    TZ=UTC

# Create non-root user
RUN addgroup --system app && adduser --system --group app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY --chown=app:app services/ /app/services/
COPY --chown=app:app .env /app/.env

# Change ownership to non-root user
RUN chown -R app:app /app

# Switch to non-root user
USER app

# Expose port
EXPOSE 3003

# Run the application with a single worker to ensure consistent key usage
CMD ["uvicorn", "services.main:app", "--host", "0.0.0.0", "--port", "3003", "--workers", "4", "--use-colors"] %                                                                          