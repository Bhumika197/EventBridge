import sqlite3

conn = sqlite3.connect('backend/data/eventbridge.db')
cursor = conn.cursor()

# bcrypt hash of '12345678'
hash_val = '$2a$10$1Rj9boe106R3YHnAoJ7nhe6RpfQZx89xqxD1wMa2U3cFrrO62.sRu'

# 1. Update all existing passwords to '12345678'
cursor.execute('UPDATE USER SET passwordHash = ?', (hash_val,))

# 2. dev@student.com
cursor.execute('''
INSERT INTO USER (name, username, email, passwordHash, collegeId, department, year, phone, role, status)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(username) DO UPDATE SET passwordHash = excluded.passwordHash, role = excluded.role, status = excluded.status
''', ('Dev Student', 'dev@student.com', 'dev@student.com', hash_val, 7, 'Computer Science', 3, '9876543210', 'STUDENT', 'ACTIVE'))

cursor.execute('''
INSERT INTO USER (name, username, email, passwordHash, collegeId, department, year, phone, role, status)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(username) DO UPDATE SET passwordHash = excluded.passwordHash, role = excluded.role, status = excluded.status
''', ('Dev Student', 'dev', 'dev.alias@student.com', hash_val, 7, 'Computer Science', 3, '9876543210', 'STUDENT', 'ACTIVE'))

# 3. bhumika@admin.com
cursor.execute('''
INSERT INTO USER (name, username, email, passwordHash, collegeId, department, year, phone, role, status)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(username) DO UPDATE SET passwordHash = excluded.passwordHash, role = excluded.role, status = excluded.status
''', ('Bhumika Admin', 'bhumika@admin.com', 'bhumika@admin.com', hash_val, 7, 'Administration', None, '9876543211', 'PLATFORM_ADMIN', 'ACTIVE'))

# 4. mrunali.rbunagpur.in and mrunali@rbunagpur.in
cursor.execute('''
INSERT INTO USER (name, username, email, passwordHash, collegeId, department, year, phone, role, status)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(username) DO UPDATE SET passwordHash = excluded.passwordHash, role = excluded.role, status = excluded.status
''', ('Mrunali Organizer', 'mrunali.rbunagpur.in', 'mrunali@rbunagpur.in', hash_val, 7, 'Technical Events Cell', None, '9876543212', 'EVENT_ORGANIZER', 'ACTIVE'))

cursor.execute('''
INSERT INTO USER (name, username, email, passwordHash, collegeId, department, year, phone, role, status)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(username) DO UPDATE SET passwordHash = excluded.passwordHash, role = excluded.role, status = excluded.status
''', ('Mrunali Organizer', 'mrunali@rbunagpur.in', 'mrunali.organizer@rbunagpur.in', hash_val, 7, 'Technical Events Cell', None, '9876543212', 'EVENT_ORGANIZER', 'ACTIVE'))

conn.commit()

rows = cursor.execute('SELECT userId, name, username, email, role FROM USER WHERE username IN (\'dev@student.com\', \'dev\', \'bhumika@admin.com\', \'mrunali.rbunagpur.in\', \'mrunali@rbunagpur.in\')').fetchall()
print('Seeded Users successfully:')
for r in rows:
    print(r)
conn.close()
