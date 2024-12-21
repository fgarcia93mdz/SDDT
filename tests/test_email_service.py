import unittest
import os
from email_service import EmailService

class TestEmailService(unittest.TestCase):
    def setUp(self):
        self.email_service = EmailService('config/config.yaml')
        self.image_path = os.path.join(os.path.dirname(__file__), 'test_image.jpg')
        if not os.path.exists(self.image_path):
            raise FileNotFoundError(f"Test image not found: {self.image_path}")

    def test_send_email(self):
        subject = "Test Email"
        body = "This is a test email."
        self.email_service.send_email(subject, body, self.image_path)
        # Verifica que el correo se haya enviado correctamente (puedes usar mocks)

if __name__ == '__main__':
    unittest.main()