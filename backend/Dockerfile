FROM python:3.11

# Set working directory inside container
WORKDIR /app

# Copy requirements file first (Docker layer optimization)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire backend code
COPY . .

# Expose port 8000 inside container (Note: Render provides $PORT env var)
EXPOSE 8000

# Start command using gunicorn with uvicorn workers for production
# This handles the dynamic $PORT provided by Render
# We use a shell-form CMD to allow environment variable expansion of $PORT
CMD gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:${PORT:-8000}