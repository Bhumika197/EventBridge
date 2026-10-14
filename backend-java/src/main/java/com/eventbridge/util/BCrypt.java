package com.eventbridge.util;

/**
 * Standard BCrypt wrapper delegating to org.mindrot.jbcrypt.BCrypt.
 */
public class BCrypt {
    public static boolean checkpw(String plaintext, String hashed) {
        if (plaintext == null || hashed == null || hashed.isEmpty()) return false;
        try {
            return org.mindrot.jbcrypt.BCrypt.checkpw(plaintext, hashed);
        } catch (Exception e) {
            return false;
        }
    }

    public static String hashpw(String password, String salt) {
        return org.mindrot.jbcrypt.BCrypt.hashpw(password, salt);
    }

    public static String gensalt(int logRounds) {
        return org.mindrot.jbcrypt.BCrypt.gensalt(logRounds);
    }

    public static String gensalt() {
        return org.mindrot.jbcrypt.BCrypt.gensalt(10);
    }
}
