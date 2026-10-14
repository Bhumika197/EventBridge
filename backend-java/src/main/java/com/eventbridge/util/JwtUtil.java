package com.eventbridge.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Standard HMAC-SHA256 JWT generator and parser without external dependencies.
 */
public class JwtUtil {
    private static final String SECRET = "eventbridge-jwt-super-secret-key-2026-secure";

    public static String generateToken(int userId, String username, String role, String email) {
        String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        long exp = (System.currentTimeMillis() / 1000) + (7 * 24 * 3600); // 7 days
        String payload = String.format("{\"userId\":%d,\"username\":\"%s\",\"role\":\"%s\",\"email\":\"%s\",\"exp\":%d}",
                userId, escape(username), escape(role), escape(email), exp);

        String encodedHeader = base64UrlEncode(header.getBytes(StandardCharsets.UTF_8));
        String encodedPayload = base64UrlEncode(payload.getBytes(StandardCharsets.UTF_8));
        String signature = sign(encodedHeader + "." + encodedPayload, SECRET);

        return encodedHeader + "." + encodedPayload + "." + signature;
    }

    public static Map<String, Object> validateToken(String token) {
        if (token == null || token.trim().isEmpty()) return null;
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) return null;

        String expectedSig = sign(parts[0] + "." + parts[1], SECRET);
        if (!expectedSig.equals(parts[2])) {
            return null; // Invalid signature
        }

        try {
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            Map<String, Object> map = new HashMap<>();
            
            // Extract fields simply from JSON
            extractField(payloadJson, "userId", map, true);
            extractField(payloadJson, "username", map, false);
            extractField(payloadJson, "role", map, false);
            extractField(payloadJson, "email", map, false);
            extractField(payloadJson, "exp", map, true);

            if (map.containsKey("exp")) {
                long exp = ((Number) map.get("exp")).longValue();
                if (System.currentTimeMillis() / 1000 > exp) {
                    return null; // Expired
                }
            }
            return map;
        } catch (Exception e) {
            return null;
        }
    }

    private static void extractField(String json, String key, Map<String, Object> map, boolean isNumber) {
        String search = "\"" + key + "\":";
        int idx = json.indexOf(search);
        if (idx == -1) return;
        idx += search.length();
        while (idx < json.length() && (json.charAt(idx) == ' ' || json.charAt(idx) == '\t')) idx++;
        if (idx >= json.length()) return;

        if (json.charAt(idx) == '"') {
            int end = json.indexOf('"', idx + 1);
            if (end != -1) {
                map.put(key, json.substring(idx + 1, end));
            }
        } else {
            int end = idx;
            while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '-')) {
                end++;
            }
            try {
                long val = Long.parseLong(json.substring(idx, end));
                if (isNumber && val <= Integer.MAX_VALUE && val >= Integer.MIN_VALUE) {
                    map.put(key, (int) val);
                } else {
                    map.put(key, val);
                }
            } catch (Exception ignored) {}
        }
    }

    private static String sign(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Error signing JWT", e);
        }
    }

    private static String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
