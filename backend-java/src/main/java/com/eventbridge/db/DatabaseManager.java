package com.eventbridge.db;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * SINGLETON DESIGN PATTERN
 * 
 * Ensures a single thread-safe connection to the SQLite database.
 */
public class DatabaseManager {
    private static DatabaseManager instance;
    private Connection connection;
    private final String dbUrl;

    private DatabaseManager() {
        String dataDir = "data";
        File dir = new File(dataDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        this.dbUrl = "jdbc:sqlite:" + dataDir + "/eventbridge.db";
        try {
            Class.forName("org.sqlite.JDBC");
            this.connection = DriverManager.getConnection(dbUrl);
            createTables();
        } catch (ClassNotFoundException | SQLException e) {
            System.err.println("Error initializing SQLite Database: " + e.getMessage());
        }
    }

    public static synchronized DatabaseManager getInstance() {
        if (instance == null) {
            instance = new DatabaseManager();
        }
        return instance;
    }

    public Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            connection = DriverManager.getConnection(dbUrl);
        }
        return connection;
    }

    private void createTables() {
        try (Statement stmt = connection.createStatement()) {
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS COLLEGE (
                    collegeId INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    code TEXT NOT NULL UNIQUE,
                    location TEXT NOT NULL,
                    emailDomain TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'ACTIVE',
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS USER (
                    userId INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    username TEXT NOT NULL UNIQUE,
                    email TEXT NOT NULL UNIQUE,
                    passwordHash TEXT NOT NULL,
                    collegeId INTEGER NOT NULL,
                    department TEXT,
                    year INTEGER,
                    phone TEXT,
                    role TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'ACTIVE',
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS EVENT (
                    eventId INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    category TEXT NOT NULL,
                    eventType TEXT NOT NULL,
                    collegeId INTEGER NOT NULL,
                    organizerId INTEGER NOT NULL,
                    organizerName TEXT NOT NULL,
                    date TEXT NOT NULL,
                    startTime TEXT NOT NULL,
                    endTime TEXT NOT NULL,
                    venue TEXT NOT NULL,
                    registrationDeadline TEXT NOT NULL,
                    capacity INTEGER NOT NULL,
                    currentRegistrations INTEGER NOT NULL DEFAULT 0,
                    registrationFee REAL NOT NULL DEFAULT 0.0,
                    eligibilityDescription TEXT NOT NULL,
                    status TEXT NOT NULL,
                    contactInformation TEXT NOT NULL,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS REGISTRATION (
                    registrationId INTEGER PRIMARY KEY AUTOINCREMENT,
                    eventId INTEGER NOT NULL,
                    studentId INTEGER NOT NULL,
                    registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status TEXT NOT NULL DEFAULT 'CONFIRMED',
                    UNIQUE(eventId, studentId)
                );
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS NOTIFICATION (
                    notificationId INTEGER PRIMARY KEY AUTOINCREMENT,
                    userId INTEGER NOT NULL,
                    eventId INTEGER,
                    type TEXT NOT NULL,
                    channel TEXT NOT NULL,
                    message TEXT NOT NULL,
                    readStatus INTEGER NOT NULL DEFAULT 0,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """);

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS CONTACT_REQUEST (
                    contactId INTEGER PRIMARY KEY AUTOINCREMENT,
                    studentId INTEGER NOT NULL,
                    organizerId INTEGER NOT NULL,
                    eventId INTEGER NOT NULL,
                    subject TEXT NOT NULL,
                    message TEXT NOT NULL,
                    reply TEXT,
                    status TEXT NOT NULL DEFAULT 'PENDING',
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """);
        } catch (SQLException e) {
            System.err.println("Error creating SQLite tables: " + e.getMessage());
        }
    }
}
