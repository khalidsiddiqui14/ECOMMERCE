from django.core.mail import send_mail
from django.conf import settings
import requests
def send_otp_email(email, otp):
    subject = "ShopZone OTP - Your Login Code"
    message = f"""
Hello!

Your ShopZone OTP is: {otp}

Valid for 5 minutes only.
Don't share this code with anyone!

- ShopZone Team
"""
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'shopzone@example.com',
            [email],
            fail_silently=False,
        )
        print(f"✅ OTP {otp} sent to Email: {email}")
        return True
    except Exception as e:
        # For testing - even if email fails, we show OTP in console
        print(f"⚠️ Email sending failed: {e}")
        print(f"🔥 TEST OTP for {email}: {otp} - USE THIS TO LOGIN")
        return True


def send_otp_sms(phone, otp):
    api_key = getattr(settings, "FAST2SMS_API_KEY", "")

    if not api_key:
        print("❌ FAST2SMS_API_KEY is missing")
        return False

    phone = str(phone).strip()
    if phone.startswith("+91"):
        phone = phone[3:]
    elif phone.startswith("91") and len(phone) == 12:
        phone = phone[2:]

    phone = phone.replace(" ", "").replace("-", "")

    if len(phone) != 10 or not phone.isdigit():
        print(f"❌ Invalid Indian phone number: {phone}")
        return False

    try:
        response = requests.post(
            "https://www.fast2sms.com/dev/bulkV2",
            headers={
                "authorization": api_key,
                "Content-Type": "application/json",
            },
            json={
                "variables_values": str(otp),
                "route": "otp",
                "numbers": phone,
            },
            timeout=15,
        )

        print(f"📱 Fast2SMS response: {response.status_code} {response.text}")

        return response.ok

    except requests.RequestException as e:
        print(f"❌ Fast2SMS SMS sending failed: {e}")
        return False