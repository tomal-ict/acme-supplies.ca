<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::select('id', 'name', 'username', 'email', 'role', 'permissions', 'is_active', 'last_login_at', 'last_login_ip', 'created_at')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:128',
            'username' => 'nullable|string|max:64|unique:users,username',
            'email' => 'required|email|max:128|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:super_admin,admin,sales_manager,editor',
            'permissions' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'] ?: strtolower(str_replace(' ', '', $validated['name'])),
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'permissions' => $validated['permissions'] ?? ['products.manage', 'inquiries.manage'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'New user account created successfully',
            'user' => $user,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:128',
            'username' => "nullable|string|max:64|unique:users,username,{$id}",
            'email' => "sometimes|required|email|max:128|unique:users,email,{$id}",
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|required|in:super_admin,admin,sales_manager,editor',
            'permissions' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User profile updated successfully',
            'user' => $user,
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $currentUser = $request->user();
        if ($currentUser && $currentUser->id == $id) {
            return response()->json([
                'success' => false,
                'message' => 'Security Error: You cannot delete your own logged-in administrator account.',
            ], 422);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User account permanently removed',
        ]);
    }
}
