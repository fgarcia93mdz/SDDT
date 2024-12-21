import unittest
from email_service import EmailService

class TestEmailService(unittest.TestCase):
    def setUp(self):
        self.email_service = EmailService('config/config.yaml')

    def test_send_email(self):
        subject = "Test Email"
        body = "This is a test email."
        image_path = "test_image.jpg"
        self.email_service.send_email(subject, body, image_path)
        # Verifica que el correo se haya enviado correctamente (puedes usar mocks)

if __name__ == '__main__':
    unittest.main()