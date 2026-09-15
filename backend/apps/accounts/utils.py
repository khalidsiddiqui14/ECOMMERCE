from django.core.mail import send_mail
from django.conf import settings

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
    # FREE METHOD - For testing we print OTP in console
    # Later you can add Fast2SMS API for real SMS
    print(f"📱 SMS OTP for {phone}: {otp}")
    print(f"🔥 TEST OTP for {phone}: {otp} - USE THIS TO LOGIN")
    return True