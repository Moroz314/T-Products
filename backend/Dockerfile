FROM python:3.12-slim
RUN pip install --no-cache-dir --upgrade pip

ENV PYTHONUNBUFFERED=1

WORKDIR /backend

COPY src/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["python", "-m", "src.app"]