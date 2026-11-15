<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CustomerOrderController extends Controller
{
    /**
     * Customer Registration
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:190',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:40',
            'company' => 'nullable|string|max:150',
        ]);

        $existing = User::where('email', $validated['email'])->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'An account with this email already exists. Please sign in instead.',
            ], 422);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'customer',
            'is_active' => true,
            'permissions' => ['customer.orders', 'customer.profile'],
        ]);

        $tokenPayload = [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => 'customer',
            'expires_at' => now()->addDays(30)->timestamp,
        ];
        $token = Crypt::encryptString(json_encode($tokenPayload));

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully! Welcome to AMIDA Office Supplies.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'customer',
                'phone' => $validated['phone'] ?? '',
                'company' => $validated['company'] ?? '',
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Customer Sign In
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email address or password.',
            ], 401);
        }

        $tokenPayload = [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'expires_at' => now()->addDays(30)->timestamp,
        ];
        $token = Crypt::encryptString(json_encode($tokenPayload));

        return response()->json([
            'success' => true,
            'message' => "Welcome back, {$user->name}!",
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Complete Order / Checkout (Supports both Logged In Customers and Guests)
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_email' => 'required|email|max:190',
            'customer_phone' => 'nullable|string|max:50',
            'shipping_address' => 'required|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.title' => 'required|string',
            'items.*.sku' => 'nullable|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.image' => 'nullable|string',
            'notes' => 'nullable|string|max:1000',
            'payment_method' => 'nullable|string|max:100',
            'total_amount' => 'nullable|numeric',
        ]);

        // Calculate total amount from items
        $calculatedTotal = 0;
        foreach ($validated['items'] as $item) {
            $calculatedTotal += floatval($item['price']) * intval($item['quantity']);
        }

        $total = $validated['total_amount'] ?? $calculatedTotal;
        $orderCode = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(5));

        $order = Order::create([
            'order_code' => $orderCode,
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'] ?? '',
            'shipping_address' => $validated['shipping_address'],
            'total_amount' => $total,
            'delivery_status' => 'pending',
            'payment_status' => 'unpaid',
            'is_incomplete' => false,
            'items' => $validated['items'],
            'notes' => ($validated['payment_method'] ? "Payment Method: " . $validated['payment_method'] . ". " : "") . ($validated['notes'] ?? ''),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order completed successfully! Thank you for your business.',
            'order' => $order,
        ], 201);
    }

    /**
     * Incomplete / Abandoned Order tracking
     */
    public function trackIncomplete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:150',
            'customer_email' => 'required|email|max:190',
            'customer_phone' => 'nullable|string|max:50',
            'items' => 'nullable|array',
            'total_amount' => 'nullable|numeric',
        ]);

        $orderCode = 'INC-' . date('Ymd') . '-' . strtoupper(Str::random(4));

        $order = Order::create([
            'order_code' => $orderCode,
            'customer_name' => $validated['customer_name'] ?? 'Guest Visitor',
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'] ?? '',
            'shipping_address' => 'Abandoned Cart Checkout Session',
            'total_amount' => $validated['total_amount'] ?? 0,
            'delivery_status' => 'pending',
            'payment_status' => 'unpaid',
            'is_incomplete' => true,
            'items' => $validated['items'] ?? [],
            'notes' => 'Customer initiated checkout session without completion.',
        ]);

        return response()->json([
            'success' => true,
            'order_code' => $orderCode,
        ]);
    }

    /**
     * Customer Orders History
     */
    public function customerOrders(Request $request): JsonResponse
    {
        $email = $request->query('email');
        if (!$email) {
            return response()->json(['success' => false, 'orders' => []]);
        }

        $orders = Order::where('customer_email', $email)
            ->where('is_incomplete', false)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);
    }
}
