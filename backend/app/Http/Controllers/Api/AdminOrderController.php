<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::query();

        // Incomplete filter
        if ($request->has('incomplete') && $request->boolean('incomplete')) {
            $query->where('is_incomplete', true);
        } elseif ($request->has('active_only') && $request->boolean('active_only')) {
            $query->where('is_incomplete', false);
        }

        if ($delivery = $request->input('delivery_status')) {
            if ($delivery !== 'all') {
                $query->where('delivery_status', $delivery);
            }
        }

        if ($payment = $request->input('payment_status')) {
            if ($payment !== 'all') {
                $query->where('payment_status', $payment);
            }
        }

        if ($q = $request->input('q')) {
            $query->where(function ($b) use ($q) {
                $b->where('order_code', 'like', "%{$q}%")
                  ->orWhere('customer_name', 'like', "%{$q}%")
                  ->orWhere('customer_email', 'like', "%{$q}%")
                  ->orWhere('customer_phone', 'like', "%{$q}%");
            });
        }

        $perPage = max(5, min(100, (int) $request->input('per_page', 15)));
        $orders = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'orders' => $orders->items(),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
            'counts' => [
                'total_orders' => Order::where('is_incomplete', false)->count(),
                'pending' => Order::where('is_incomplete', false)->where('delivery_status', 'pending')->count(),
                'confirmed' => Order::where('is_incomplete', false)->where('delivery_status', 'confirmed')->count(),
                'on_delivery' => Order::where('is_incomplete', false)->where('delivery_status', 'on_delivery')->count(),
                'delivered' => Order::where('is_incomplete', false)->where('delivery_status', 'delivered')->count(),
                'cancelled' => Order::where('is_incomplete', false)->where('delivery_status', 'cancelled')->count(),
                'incomplete_orders' => Order::where('is_incomplete', true)->count(),
            ],
        ]);
    }

    public function show($id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        return response()->json(['success' => true, 'order' => $order]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $validated = $request->validate([
            'delivery_status' => 'sometimes|in:pending,confirmed,picked,on_delivery,delivered,cancelled',
            'payment_status' => 'sometimes|in:unpaid,paid',
            'payment_method' => 'nullable|string|max:100',
            'delivery_area' => 'nullable|string|max:100',
            'delivery_charge' => 'nullable|numeric|min:0',
            'total_amount' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $order->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully',
            'order' => $order,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order record deleted',
        ]);
    }
}
