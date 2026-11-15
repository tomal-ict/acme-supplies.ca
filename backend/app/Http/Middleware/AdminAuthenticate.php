<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminAuthenticate
{
    public function handle(Request $request, Closure $next, ?string $permission = null): Response
    {
        $token = $request->bearerToken() ?: $request->header('X-Admin-Token');

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Admin authentication required. Please login.',
            ], 401);
        }

        $user = User::validateAuthToken($token);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Session expired or invalid credentials. Please login again.',
            ], 401);
        }

        if ($permission && !$user->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'message' => 'Permission denied: Insufficient privileges for this operation.',
            ], 403);
        }

        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
