import requests

url = 'localhost:3000/judge'

header = {
  "Authorization": "Basic WExvcjp3aGd0eGR5",
  "Content-Type": "application/json"
}

data = '''
{
	"id": "abcdefg",
	"max_time": 1,
	"max_memory": 128,
	"cases": [ "123", "abc" ],
	"checker": {
		"id": "abcdefg", "lang": "cpp"
	},
	"lang": "cpp",
	"code": "I2luY2x1ZGUgPGlvc3RyZWFtPgojaW5jbHVkZSA8dmVjdG9yPgojaW5jbHVkZSA8cmFuZG9tPgojaW5jbHVkZSA8Y3RpbWU+CnVzaW5nIG5hbWVzcGFjZSBzdGQ7CmNvbnN0IGludCBtYXhuID0gMWU5OwoKbXQxOTkzNyBybmQodGltZSgwKSk7CgppbnQgbWFpbiAoKSB7CiAgaW50IGEgPSAwOwogIHZlY3RvcjxpbnQ+IHY7CiAgZm9yIChpbnQgaSA9IDA7IGkgPCBtYXhuOyBpKyspIHsKICAgIGEgPSAoMmxsICogYSArIDFsbCAqIHJuZCgpKSAlIG1heG47CiAgfQogIGNvdXQgPDwgYSA8PCBlbmRsOwogIHJldHVybiAwOwp9"
}
'''

r = requests.post(url, data=data, header=header)