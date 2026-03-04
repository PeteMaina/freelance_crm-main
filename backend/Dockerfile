FROM python:3.11

# Set working directory inside container
WORKDIR /app

# Copy requirements file first (Docker layer optimization)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire backend code
COPY . .

# Expose port 8000 inside container
EXPOSE 8000