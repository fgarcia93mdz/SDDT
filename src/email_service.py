import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import yaml

class EmailService:
    def __init__(self, config_path):
        with open(config_path, 'r') as file:
            config = yaml.safe_load(file)
        self.smtp_server = config['smtp']['server']
        self.smtp_port = config['smtp']['port']
        self.smtp_user = config['smtp']['user']
        self.smtp_password = config['smtp']['password']
        self.to_email = config['smtp']['to_email']

    def send_email(self, subject, body, image_path):
        msg = MIMEMultipart()
        msg['From'] = self.smtp_user
        msg['To'] = self.to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        with open(image_path, 'rb') as f:
            img_data = f.read()
        image = MIMEImage(img_data, name='incendio.jpg')
        msg.attach(image)

        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            text = msg.as_string()
            server.sendmail(self.smtp_user, self.to_email, text)
            server.quit()
            print("Email sent successfully")
        except Exception as e:
            print(f"Failed to send email: {e}")