package com.geocapture.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeocodingService {

    private static final String NOMINATIM_URL =
            "https://nominatim.openstreetmap.org/reverse?format=json&lat=%s&lon=%s";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeocodingService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Converts latitude/longitude coordinates to a human-readable address
     * using the Nominatim (OpenStreetMap) reverse-geocoding API.
     */
    public String reverseGeocode(double latitude, double longitude) {
        try {
            String url = String.format(NOMINATIM_URL, latitude, longitude);

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "GeoCapture/1.0 (geocapture-app)");
            headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);

            HttpEntity<Void> request = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode displayName = root.get("display_name");
                if (displayName != null && !displayName.isNull()) {
                    return displayName.asText();
                }
            }
        } catch (Exception e) {
            System.err.println("Reverse geocoding failed: " + e.getMessage());
        }
        return "Unknown address";
    }
}
