<?php

namespace App\Services;

use RuntimeException;

class PayloadCryptoService
{
    private string $aesKey;
    private string $hmacKey;

    public function __construct()
    {
        $rawAes = base64_decode((string) config('api_security.payload_key'), true);
        $rawHmac = base64_decode((string) config('api_security.hmac_secret'), true);

        if ($rawAes === false || strlen($rawAes) !== 32) {
            throw new RuntimeException('Invalid API_PAYLOAD_KEY length; expected 32-byte base64 key.');
        }
        if ($rawHmac === false || strlen($rawHmac) < 16) {
            throw new RuntimeException('Invalid API_HMAC_SECRET.');
        }

        $this->aesKey = $rawAes;
        $this->hmacKey = $rawHmac;
    }

    public function encryptEnvelope(array $payload): array
    {
        $plaintext = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        $iv = random_bytes(12);
        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            'aes-256-gcm',
            $this->aesKey,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            16
        );

        if ($ciphertext === false) {
            throw new RuntimeException('AES-256-GCM encryption failed.');
        }

        $ivB64 = base64_encode($iv);
        $tagB64 = base64_encode($tag);
        $dataB64 = base64_encode($ciphertext);
        $ts = time();

        $sig = base64_encode(
            hash_hmac('sha256', "{$ivB64}.{$tagB64}.{$dataB64}.{$ts}", $this->hmacKey, true)
        );

        return [
            'encrypted' => true,
            'alg' => 'AES-256-GCM+HMAC-SHA256',
            'iv' => $ivB64,
            'tag' => $tagB64,
            'data' => $dataB64,
            'ts' => $ts,
            'sig' => $sig,
        ];
    }

    public function decryptEnvelope(array $envelope): array
    {
        foreach (['iv', 'tag', 'data', 'ts', 'sig'] as $field) {
            if (!isset($envelope[$field])) {
                throw new RuntimeException("Missing encrypted field: {$field}");
            }
        }

        $ts = (int) $envelope['ts'];
        $window = (int) config('api_security.replay_window_seconds', 120);
        if (abs(time() - $ts) > $window) {
            throw new RuntimeException('Request timestamp expired (anti-replay check).');
        }

        $expectedSig = base64_encode(
            hash_hmac(
                'sha256',
                "{$envelope['iv']}.{$envelope['tag']}.{$envelope['data']}.{$ts}",
                $this->hmacKey,
                true
            )
        );

        if (!hash_equals($expectedSig, (string) $envelope['sig'])) {
            throw new RuntimeException('Invalid HMAC signature.');
        }

        $iv = base64_decode((string) $envelope['iv'], true);
        $tag = base64_decode((string) $envelope['tag'], true);
        $ciphertext = base64_decode((string) $envelope['data'], true);

        if ($iv === false || $tag === false || $ciphertext === false) {
            throw new RuntimeException('Malformed base64 payload.');
        }

        $plaintext = openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            $this->aesKey,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($plaintext === false) {
            throw new RuntimeException('AES-256-GCM decryption failed.');
        }

        $decoded = json_decode($plaintext, true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Decrypted payload is not valid JSON.');
        }

        return $decoded;
    }

    public function verifyRequestHeaders(string $method, string $path, string $ts, string $nonce, string $sig): bool
    {
        $window = (int) config('api_security.replay_window_seconds', 120);
        if (abs(time() - (int) $ts) > $window || strlen($nonce) < 8) {
            return false;
        }

        $expected = base64_encode(
            hash_hmac('sha256', strtoupper($method) . "|{$path}|{$ts}|{$nonce}", $this->hmacKey, true)
        );

        return hash_equals($expected, $sig);
    }
}
