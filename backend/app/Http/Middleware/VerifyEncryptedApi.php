<?php

namespace App\Http\Middleware;

use App\Services\PayloadCryptoService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class VerifyEncryptedApi
{
    public function __construct(private readonly PayloadCryptoService $crypto)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('OPTIONS')) {
            return $next($request);
        }

        $ts = (string) $request->header('X-API-Timestamp', '');
        $nonce = (string) $request->header('X-API-Nonce', '');
        $sig = (string) $request->header('X-API-Signature', '');

        if (!$this->crypto->verifyRequestHeaders($request->method(), '/' . ltrim($request->path(), '/'), $ts, $nonce, $sig)) {
            return response()->json(['error' => 'Unauthorized: invalid or expired API signature.'], 401);
        }

        if ($request->isMethod('POST') || $request->isMethod('PUT') || $request->isMethod('PATCH')) {
            try {
                $decrypted = $this->crypto->decryptEnvelope($request->all());
                $request->replace($decrypted);
            } catch (Throwable $e) {
                return response()->json(['error' => 'Invalid encrypted payload: ' . $e->getMessage()], 400);
            }
        }

        return $next($request);
    }
}
