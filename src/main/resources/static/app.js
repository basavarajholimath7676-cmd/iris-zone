/* ═══════════════════════════════════════════════
   GeoCapture — App Logic (Location + Camera + Submit)
   ═══════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── State ──
    const state = {
        latitude: null,
        longitude: null,
        photoBase64: null,
        cameraStream: null,
    };

    // ── DOM References ──
    const $ = (id) => document.getElementById(id);

    const btnLocation = $('btn-location');
    const locationResult = $('location-result');
    const latValue = $('lat-value');
    const lngValue = $('lng-value');
    const addressValue = $('address-value');

    const btnCamera = $('btn-camera');
    const cameraArea = $('camera-area');
    const videoPreview = $('video-preview');
    const btnSnapshot = $('btn-snapshot');
    const photoPreview = $('photo-preview');
    const photoThumb = $('photo-thumb');
    const btnRetake = $('btn-retake');
    const snapshotCanvas = $('snapshot-canvas');

    const statusLocationDot = $('status-location');
    const statusLocationText = $('status-location-text');
    const statusPhotoDot = $('status-photo');
    const statusPhotoText = $('status-photo-text');
    const btnSubmit = $('btn-submit');
    const submitLoader = $('submit-loader');

    const toastEl = $('toast');
    const toastIcon = $('toast-icon');
    const toastMsg = $('toast-msg');

    // ═══════════════════════════════════════════
    //  LOCATION CAPTURE
    // ═══════════════════════════════════════════
    btnLocation.addEventListener('click', () => {
        if (!navigator.geolocation) {
            showToast('error', 'Geolocation is not supported by your browser.');
            return;
        }

        btnLocation.disabled = true;
        btnLocation.querySelector('.btn__text').textContent = 'Locating…';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                state.latitude = position.coords.latitude;
                state.longitude = position.coords.longitude;

                latValue.textContent = state.latitude.toFixed(6);
                lngValue.textContent = state.longitude.toFixed(6);
                addressValue.textContent = 'Resolving address…';
                locationResult.style.display = 'block';

                btnLocation.querySelector('.btn__text').textContent = 'Location Captured ✓';
                btnLocation.classList.add('pulse');

                updateStatus();
                resolveAddress(state.latitude, state.longitude);
            },
            (error) => {
                btnLocation.disabled = false;
                btnLocation.querySelector('.btn__text').textContent = 'Get My Location';

                const messages = {
                    1: 'Location permission denied. Please allow access in your browser settings.',
                    2: 'Unable to determine your position. Please try again.',
                    3: 'Location request timed out. Please try again.',
                };
                showToast('error', messages[error.code] || 'Failed to get location.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    });

    function resolveAddress(lat, lon) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

        fetch(url, {
            headers: { 'Accept': 'application/json' },
        })
            .then((res) => res.json())
            .then((data) => {
                addressValue.textContent = data.display_name || 'Address not found';
            })
            .catch(() => {
                addressValue.textContent = 'Could not resolve address';
            });
    }

    // ═══════════════════════════════════════════
    //  CAMERA CAPTURE
    // ═══════════════════════════════════════════
    btnCamera.addEventListener('click', () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showToast('error', 'Camera access is not supported by your browser.');
            return;
        }

        btnCamera.disabled = true;
        btnCamera.querySelector('.btn__text').textContent = 'Opening Camera…';

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } } })
            .then((stream) => {
                state.cameraStream = stream;
                videoPreview.srcObject = stream;
                cameraArea.style.display = 'block';
                photoPreview.style.display = 'none';
                btnCamera.style.display = 'none';
            })
            .catch((err) => {
                btnCamera.disabled = false;
                btnCamera.querySelector('.btn__text').textContent = 'Open Camera';

                if (err.name === 'NotAllowedError') {
                    showToast('error', 'Camera permission denied. Please allow access in your browser settings.');
                } else {
                    showToast('error', 'Could not access camera: ' + err.message);
                }
            });
    });

    btnSnapshot.addEventListener('click', () => {
        const ctx = snapshotCanvas.getContext('2d');
        snapshotCanvas.width = videoPreview.videoWidth;
        snapshotCanvas.height = videoPreview.videoHeight;
        ctx.drawImage(videoPreview, 0, 0);

        state.photoBase64 = snapshotCanvas.toDataURL('image/jpeg', 0.85);
        photoThumb.src = state.photoBase64;

        // Stop camera
        stopCamera();
        cameraArea.style.display = 'none';
        photoPreview.style.display = 'block';

        updateStatus();
        showToast('success', 'Photo captured!');
    });

    btnRetake.addEventListener('click', () => {
        state.photoBase64 = null;
        photoPreview.style.display = 'none';
        btnCamera.style.display = 'inline-flex';
        btnCamera.disabled = false;
        btnCamera.querySelector('.btn__text').textContent = 'Open Camera';
        updateStatus();
    });

    function stopCamera() {
        if (state.cameraStream) {
            state.cameraStream.getTracks().forEach((t) => t.stop());
            state.cameraStream = null;
        }
    }

    // ═══════════════════════════════════════════
    //  SUBMIT
    // ═══════════════════════════════════════════
    btnSubmit.addEventListener('click', () => {
        if (!state.latitude || !state.photoBase64) return;

        btnSubmit.disabled = true;
        btnSubmit.querySelector('.btn__text').textContent = 'Submitting…';
        submitLoader.style.display = 'inline-block';

        const payload = {
            latitude: state.latitude,
            longitude: state.longitude,
            photo: state.photoBase64,
        };

        fetch('/api/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Server returned ' + res.status);
                return res.json();
            })
            .then((data) => {
                showToast('success', `Data saved successfully! Record #${data.id}`);
                resetForm();
            })
            .catch((err) => {
                showToast('error', 'Submission failed: ' + err.message);
                btnSubmit.disabled = false;
                btnSubmit.querySelector('.btn__text').textContent = 'Submit Capture';
                submitLoader.style.display = 'none';
            });
    });

    // ═══════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════
    function updateStatus() {
        const locDone = state.latitude !== null;
        const photoDone = state.photoBase64 !== null;

        statusLocationDot.classList.toggle('done', locDone);
        statusLocationText.textContent = locDone ? 'Location captured ✓' : 'Location not captured';

        statusPhotoDot.classList.toggle('done', photoDone);
        statusPhotoText.textContent = photoDone ? 'Photo captured ✓' : 'Photo not captured';

        btnSubmit.disabled = !(locDone && photoDone);
    }

    function resetForm() {
        state.latitude = null;
        state.longitude = null;
        state.photoBase64 = null;
        stopCamera();

        locationResult.style.display = 'none';
        cameraArea.style.display = 'none';
        photoPreview.style.display = 'none';

        btnLocation.disabled = false;
        btnLocation.querySelector('.btn__text').textContent = 'Get My Location';
        btnLocation.classList.remove('pulse');

        btnCamera.style.display = 'inline-flex';
        btnCamera.disabled = false;
        btnCamera.querySelector('.btn__text').textContent = 'Open Camera';

        btnSubmit.querySelector('.btn__text').textContent = 'Submit Capture';
        submitLoader.style.display = 'none';

        updateStatus();
    }

    let toastTimer;
    function showToast(type, message) {
        clearTimeout(toastTimer);
        toastEl.className = 'toast toast--' + type;
        toastIcon.textContent = type === 'success' ? '✅' : '❌';
        toastMsg.textContent = message;
        toastEl.classList.add('show');

        toastTimer = setTimeout(() => {
            toastEl.classList.remove('show');
        }, 4000);
    }
})();
