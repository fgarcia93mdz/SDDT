import unittest
import os
from email_service import EmailService

class TestEmailService(unittest.TestCase):
    def setUp(self):
        self.email_service = EmailService('config/config.yaml')
        self.image_path = os.path.join(os.path.dirname(__file__), 'test_image.jpg')
        print(f"Image path: {self.image_path}")  # Agregar print para verificar la ruta de la imagen

    def test_send_email(self):
        subject = "Test Email"
        body = "This is a test email."
        if os.path.exists(self.image_path):
            self.email_service.send_email(subject, body, self.image_path)
        else:
            self.email_service.send_email(subject, body, None)
        # Verifica que el correo se haya enviado correctamente (puedes usar mocks)

if __name__ == '__main__':
    unittest.main()