import csv

# Data fetched from the API
users_data = [
    {
        "id": 1,
        "name": "Leanne Graham",
        "username": "Bret",
        "email": "Sincere@april.biz"
        },
    {
        "id": 2,
        "name": "Ervin Howell",
        "username": "Antonette",
        "email": "Shanna@melissa.tv"
        },
    {
        "id": 3,
        "name": "Clementine Bauch",
        "username": "Samantha",
        "email": "Nathan@yesenia.net"
        },
    {
        "id": 4,
        "name": "Patricia Lebsack",
        "username": "Karianne",
        "email": "Julianne.OConner@kory.org"
        },
    {
        "id": 5,
        "name": "Chelsey Dietrich",
        "username": "Kamren",
        "email": "Lucio_Hettinger@annie.ca"
        }
    ]

# Extracting names and email addresses
contacts = [[user['name'], user['email']] for user in users_data]

# Saving the data to a CSV file
with open('/workspace/contacts.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['Name', 'Email'])
    writer.writerows(contacts)
