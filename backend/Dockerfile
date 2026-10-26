FROM python:3.12-slim

WORKDIR /app

# install dependencies first so Docker can cache this step
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

# 0.0.0.0 so the server is reachable from outside the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
