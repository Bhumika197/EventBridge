package com.eventbridge.util;

import com.eventbridge.model.*;
import java.util.*;

/**
 * Lightweight JSON parser and serializer without external libraries.
 */
public class JsonUtil {

    public static String toJson(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof String) {
            return "\"" + escapeJson((String) obj) + "\"";
        }
        if (obj instanceof Number || obj instanceof Boolean) {
            return String.valueOf(obj);
        }
        if (obj instanceof Map) {
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?, ?> entry : ((Map<?, ?>) obj).entrySet()) {
                if (!first) sb.append(",");
                sb.append("\"").append(escapeJson(String.valueOf(entry.getKey()))).append("\":");
                sb.append(toJson(entry.getValue()));
                first = false;
            }
            sb.append("}");
            return sb.toString();
        }
        if (obj instanceof Collection) {
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (Object item : (Collection<?>) obj) {
                if (!first) sb.append(",");
                sb.append(toJson(item));
                first = false;
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof Event) {
            return eventToJson((Event) obj);
        }
        if (obj instanceof User) {
            return userToJson((User) obj);
        }
        if (obj instanceof College) {
            return collegeToJson((College) obj);
        }
        if (obj instanceof Registration) {
            return registrationToJson((Registration) obj);
        }
        if (obj instanceof NotificationRecord) {
            return notificationToJson((NotificationRecord) obj);
        }

        return "\"" + escapeJson(obj.toString()) + "\"";
    }

    public static String eventToJson(Event e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("eventId", e.getEventId());
        m.put("title", e.getTitle());
        m.put("description", e.getDescription());
        m.put("category", e.getCategory());
        m.put("eventType", e.getEventType());
        m.put("collegeId", e.getCollegeId());
        m.put("organizingCollegeName", e.getOrganizingCollegeName());
        m.put("organizerId", e.getOrganizerId());
        m.put("organizerName", e.getOrganizerName());
        m.put("date", e.getDate());
        m.put("startTime", e.getStartTime());
        m.put("endTime", e.getEndTime());
        m.put("venue", e.getVenue());
        m.put("registrationDeadline", e.getRegistrationDeadline());
        m.put("capacity", e.getCapacity());
        m.put("currentRegistrations", e.getCurrentRegistrations());
        m.put("registrationFee", e.getRegistrationFee());
        m.put("eligibilityDescription", e.getEligibilityDescription());
        m.put("status", e.getStatus());
        m.put("contactInformation", e.getContactInformation());
        m.put("prizePool", e.getPrizePool());
        m.put("minTeamSize", e.getMinTeamSize());
        m.put("maxTeamSize", e.getMaxTeamSize());
        m.put("speakers", e.getSpeakers());
        m.put("sponsors", e.getSponsors());
        m.put("rejectionReason", e.getRejectionReason());
        return toJson(m);
    }

    public static String userToJson(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("userId", u.getUserId());
        m.put("name", u.getName());
        m.put("username", u.getUsername());
        m.put("email", u.getEmail());
        m.put("collegeId", u.getCollegeId());
        m.put("collegeName", u.getCollegeName());
        m.put("role", u.getRole());
        m.put("status", u.getStatus());
        return toJson(m);
    }

    public static String collegeToJson(College c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("collegeId", c.getCollegeId());
        m.put("name", c.getName());
        m.put("code", c.getCode());
        m.put("location", c.getLocation());
        m.put("emailDomain", c.getEmailDomain());
        m.put("status", c.getStatus());
        return toJson(m);
    }

    public static String registrationToJson(Registration r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("registrationId", r.getRegistrationId());
        m.put("eventId", r.getEventId());
        m.put("studentId", r.getStudentId());
        m.put("registeredAt", r.getRegisteredAt());
        m.put("status", r.getStatus());
        m.put("eventTitle", r.getEventTitle());
        m.put("eventCategory", r.getEventCategory());
        m.put("eventType", r.getEventType());
        m.put("eventDate", r.getEventDate());
        m.put("venue", r.getVenue());
        m.put("organizingCollegeName", r.getOrganizingCollegeName());
        return toJson(m);
    }

    public static String notificationToJson(NotificationRecord n) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("notificationId", n.getNotificationId());
        m.put("userId", n.getUserId());
        m.put("eventId", n.getEventId());
        m.put("type", n.getType());
        m.put("channel", n.getChannel());
        m.put("message", n.getMessage());
        m.put("readStatus", n.getReadStatus());
        return toJson(m);
    }

    public static String escapeJson(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < ' ') {
                        String t = "000" + Integer.toHexString(c);
                        sb.append("\\u").append(t.substring(t.length() - 4));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    /**
     * Parses a flat/simple JSON string into a Map<String, Object>.
     */
    public static Map<String, Object> parseJsonObject(String json) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (json == null) return map;
        json = json.trim();
        if (!json.startsWith("{") || !json.endsWith("}")) return map;
        json = json.substring(1, json.length() - 1).trim();
        if (json.isEmpty()) return map;

        int len = json.length();
        int i = 0;
        while (i < len) {
            // Find key start
            while (i < len && (json.charAt(i) == ' ' || json.charAt(i) == ',' || json.charAt(i) == '\n' || json.charAt(i) == '\r' || json.charAt(i) == '\t')) i++;
            if (i >= len) break;
            if (json.charAt(i) != '"') break;
            i++; // skip open quote
            int keyStart = i;
            while (i < len && json.charAt(i) != '"') {
                if (json.charAt(i) == '\\') i++;
                i++;
            }
            String key = unescapeJson(json.substring(keyStart, i));
            i++; // skip closing quote

            while (i < len && (json.charAt(i) == ' ' || json.charAt(i) == ':')) i++;
            if (i >= len) break;

            // Value
            Object val;
            char firstChar = json.charAt(i);
            if (firstChar == '"') {
                i++;
                int valStart = i;
                while (i < len && json.charAt(i) != '"') {
                    if (json.charAt(i) == '\\') i++;
                    i++;
                }
                val = unescapeJson(json.substring(valStart, i));
                i++;
            } else if (firstChar == '{') {
                int braceCount = 1;
                int startObj = i;
                i++;
                while (i < len && braceCount > 0) {
                    if (json.charAt(i) == '{') braceCount++;
                    else if (json.charAt(i) == '}') braceCount--;
                    else if (json.charAt(i) == '"') {
                        i++;
                        while (i < len && json.charAt(i) != '"') {
                            if (json.charAt(i) == '\\') i++;
                            i++;
                        }
                    }
                    i++;
                }
                val = parseJsonObject(json.substring(startObj, i));
            } else if (firstChar == '[') {
                int bracketCount = 1;
                int startArr = i;
                i++;
                while (i < len && bracketCount > 0) {
                    if (json.charAt(i) == '[') bracketCount++;
                    else if (json.charAt(i) == ']') bracketCount--;
                    else if (json.charAt(i) == '"') {
                        i++;
                        while (i < len && json.charAt(i) != '"') {
                            if (json.charAt(i) == '\\') i++;
                            i++;
                        }
                    }
                    i++;
                }
                val = json.substring(startArr, i);
            } else {
                int valStart = i;
                while (i < len && json.charAt(i) != ',' && json.charAt(i) != '}' && json.charAt(i) != '\n' && json.charAt(i) != ' ') {
                    i++;
                }
                String rawVal = json.substring(valStart, i).trim();
                if ("true".equalsIgnoreCase(rawVal)) val = true;
                else if ("false".equalsIgnoreCase(rawVal)) val = false;
                else if ("null".equalsIgnoreCase(rawVal)) val = null;
                else {
                    try {
                        if (rawVal.contains(".")) {
                            val = Double.parseDouble(rawVal);
                        } else {
                            val = Long.parseLong(rawVal);
                        }
                    } catch (Exception e) {
                        val = rawVal;
                    }
                }
            }
            map.put(key, val);
        }
        return map;
    }

    private static String unescapeJson(String s) {
        return s.replace("\\\"", "\"")
                .replace("\\\\", "\\")
                .replace("\\n", "\n")
                .replace("\\r", "\r")
                .replace("\\t", "\t");
    }
}
