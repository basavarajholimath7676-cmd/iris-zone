package com.geocapture.service;

import com.geocapture.dto.CaptureRequest;
import com.geocapture.model.UserData;
import com.geocapture.repository.UserDataRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
public class UserDataService {

    private final UserDataRepository repository;
    private final GeocodingService geocodingService;

    public UserDataService(UserDataRepository repository, GeocodingService geocodingService) {
        this.repository = repository;
        this.geocodingService = geocodingService;
    }

    /**
     * Processes a capture request:
     * 1. Reverse-geocodes the coordinates to an address
     * 2. Decodes the Base64 photo to bytes
     * 3. Saves everything to the database
     * 4. Returns the saved record ID
     */
    public Long processCapture(CaptureRequest request) {
        // Reverse-geocode
        String address = geocodingService.reverseGeocode(
                request.getLatitude(), request.getLongitude());

        // Decode Base64 photo (strip data URI prefix if present)
        String photoData = request.getPhoto();
        if (photoData.contains(",")) {
            photoData = photoData.substring(photoData.indexOf(",") + 1);
        }
        byte[] photoBytes = Base64.getDecoder().decode(photoData);

        // Build entity
        UserData userData = new UserData();
        userData.setLatitude(request.getLatitude());
        userData.setLongitude(request.getLongitude());
        userData.setAddress(address);
        userData.setTimestamp(LocalDateTime.now());
        userData.setPhoto(photoBytes);

        // Save
        UserData saved = repository.save(userData);
        return saved.getId();
    }

    /**
     * Returns all captured records (photo bytes excluded in the response
     * for performance — handled at controller level).
     */
    public List<UserData> getAllCaptures() {
        return repository.findAll();
    }
}
