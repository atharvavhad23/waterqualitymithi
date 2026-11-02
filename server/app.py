from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from twilio.rest import Client
import random
from flask_mail import Mail, Message

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# ---------------- Twilio Setup ----------------
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_phone_number = os.getenv('TWILIO_PHONE_NUMBER')
client = Client(account_sid, auth_token)

# ---------------- Flask-Mail Setup ----------------
app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER")
app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT", 587))
app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS") == "True"
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
mail = Mail(app)

# In-memory store for OTPs
otp_storage = {}  # format: {"phone:+91xxxx": otp, "email:user@domain.com": otp}

# ---------------- Send OTP ----------------
@app.route('/send-otp', methods=['POST'])
def send_otp():
    try:
        data = request.get_json()
        
        # ----------- Phone OTP -----------
        if 'phone' in data:
            phone_number = data.get('phone')
            if not phone_number:
                return jsonify({"success": False, "message": "Phone number is missing"}), 400

            otp_code = str(random.randint(100000, 999999))
            otp_storage[phone_number] = otp_code
            print(f"Generated OTP: {otp_code} for {phone_number}")

            # Send via Twilio
            message = client.messages.create(
                from_=twilio_phone_number,
                to=phone_number,
                body=f"Your River Monitor verification code is: {otp_code}"
            )
            print(f"Twilio message SID: {message.sid}")
            return jsonify({"success": True, "message": "OTP sent successfully"})

        # ----------- Email OTP -----------
        elif 'email' in data:
            email = data.get('email')
            if not email:
                return jsonify({"success": False, "message": "Email is missing"}), 400

            otp_code = str(random.randint(100000, 999999))
            otp_storage[email] = otp_code
            print(f"Generated OTP: {otp_code} for {email}")

            # Send email
            msg = Message(
                subject="Your River Monitor Verification Code",
                sender=os.getenv("MAIL_USERNAME"),
                recipients=[email],
                body=f"Your OTP for River Monitor is: {otp_code}"
            )
            mail.send(msg)
            return jsonify({"success": True, "message": "OTP sent successfully to email"})

        else:
            return jsonify({"success": False, "message": "Phone or email is required"}), 400

    except Exception as e:
        print(f"Error sending OTP: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

# ---------------- Verify OTP ----------------
@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json()
        otp_code = data.get('code')

        # Phone verification
        if 'phone' in data:
            phone_number = data.get('phone')
            if not phone_number or not otp_code:
                return jsonify({"success": False, "message": "Phone number or OTP code is missing"}), 400

            if otp_storage.get(phone_number) == otp_code:
                del otp_storage[phone_number]
                return jsonify({"success": True, "message": "OTP verified successfully"})
            else:
                return jsonify({"success": False, "message": "Invalid OTP. Please try again."}), 400

        # Email verification
        elif 'email' in data:
            email = data.get('email')
            if not email or not otp_code:
                return jsonify({"success": False, "message": "Email or OTP code is missing"}), 400

            if otp_storage.get(email) == otp_code:
                del otp_storage[email]
                return jsonify({"success": True, "message": "OTP verified successfully"})
            else:
                return jsonify({"success": False, "message": "Invalid OTP. Please try again."}), 400

        else:
            return jsonify({"success": False, "message": "Phone or email is required"}), 400

    except Exception as e:
        print(f"Error verifying OTP: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/')
def home():
    return jsonify({"message": "Flask backend running with Twilio & Email OTP."})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
