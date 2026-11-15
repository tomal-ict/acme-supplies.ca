<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class AdminAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $ip = $request->ip();
        $throttleKey = 'admin-login:' . StrToLower($request->input('login')) . '|' . $ip;

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'success' => false,
                'message' => "Too many failed attempts. Security lock engaged. Please retry in {$seconds} seconds.",
            ], 429);
        }

        $login = $request->input('login');
        $user = User::where('email', $login)
            ->orWhere('username', $login)
            ->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            RateLimiter::hit($throttleKey, 300);
            return response()->json([
                'success' => false,
                'message' => 'Invalid username/email or password.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'This admin account has been suspended. Contact super administrator.',
            ], 403);
        }

        RateLimiter::clear($throttleKey);

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ]);

        $token = $user->generateAuthToken(24);

        return response()->json([
            'success' => true,
            'message' => 'Login successful. Welcome back, ' . $user->name,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'permissions' => $user->permissions,
                'last_login_at' => $user->last_login_at?->toIso8601String(),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'permissions' => $user->permissions,
                'last_login_at' => $user->last_login_at?->toIso8601String(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}
