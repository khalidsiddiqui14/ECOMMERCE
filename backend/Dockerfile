FROM python:3.14-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "python3 manage.py migrate && python3 manage.py shell -c \"import os; from apps.accounts.models import User; email=os.environ['DJANGO_SUPERUSER_EMAIL']; username=os.environ['DJANGO_SUPERUSER_USERNAME']; password=os.environ['DJANGO_SUPERUSER_PASSWORD']; user=User.objects.filter(email=email).first(); user=user or User.objects.create_user(email=email, username=username, password=password); user.set_password(password); user.is_staff=True; user.is_superuser=True; user.is_active=True; user.save(); print('PRODUCTION SUPERUSER READY:', user.email)\" && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]