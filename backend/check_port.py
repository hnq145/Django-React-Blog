
import socket
import os

def check_port():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', 8001))
    sock.close()
    
    with open('port_check_result.txt', 'w') as f:
        if result == 0:
            f.write("OPEN")
        else:
            f.write(f"CLOSED: {result}")

if __name__ == "__main__":
    check_port()
