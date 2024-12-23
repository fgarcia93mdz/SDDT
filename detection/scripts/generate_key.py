from cryptography.fernet import Fernet

# Generar una clave de encriptación
key = Fernet.generate_key()
print(key.decode())  # Imprimir la clave para guardarla