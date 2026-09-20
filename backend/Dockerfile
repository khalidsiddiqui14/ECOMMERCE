FROM python:3.14-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "python3 manage.py migrate && (python3 manage.py createsuperuser --noinput --email \"$DJANGO_SUPERUSER_EMAIL\" || true) && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]