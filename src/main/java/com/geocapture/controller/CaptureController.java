package com.geocapture.controller;

import com.geocapture.dto.CaptureRequest;
import com.geocapture.model.UserData;
import com.geocapture.service.UserDataService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CaptureController {

    private final UserDataService userDataService;

    public CaptureController(UserDataService userDataService) {
        this.userDataService = userDataService;
    }

    /**
     * POST /api/capture
     * Accepts JSON { latitude, longitude, photo (base64) }
     * Returns 201 with { id: ... }
     */
    @PostMapping("/capture")
    public ResponseEntity<Map<String, Object>> capture(@Valid @RequestBody CaptureRequest request) {
        Long id = userDataService.processCapture(request);

        Map<String, Object> response = new HashMap<>();
        response.put("id", id);
        response.put("message", "Capture saved successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/captures
     * Lists all captured records (photo bytes omitted for performance).
     */
    @GetMapping("/captures")
    public ResponseEntity<List<Map<String, Object>>> getAllCaptures() {
        List<UserData> captures = userDataService.getAllCaptures();

        List<Map<String, Object>> result = captures.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("latitude", c.getLatitude());
            map.put("longitude", c.getLongitude());
            map.put("address", c.getAddress());
            map.put("timestamp", c.getTimestamp().toString());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
