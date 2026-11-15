<?php

return [
    // 32-byte (256-bit) base64-encoded AES-256-GCM key
    'payload_key' => env('API_PAYLOAD_KEY', 'YWNtZS1zZWN1cmUtMjU2LWJpdC1hZXMtZ2NtLWtleSE='),
    // 32-byte HMAC-SHA256 signing secret
    'hmac_secret' => env('API_HMAC_SECRET', 'YWNtZS1obWFjLXNoYTI1Ni1zaWduaW5nLXNlY3JldCE='),
    // Maximum allowed clock skew / replay window in seconds
    'replay_window_seconds' => 120,
];
