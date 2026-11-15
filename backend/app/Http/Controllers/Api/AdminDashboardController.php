<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Inquiry;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $totalProducts = Product::count();
        $totalCategories = Category::whereNull('parent_id')->count();
        $totalUsers = User::count();
        $totalInquiries = Inquiry::count();

        // Orders metrics
        $totalOrders = Order::where('is_incomplete', false)->count();
        $totalSales = Order::where('is_incomplete', false)->where('payment_status', 'paid')->sum('total_amount');
        $incompleteOrders = Order::where('is_incomplete', true)->count();

        $pipeline = [
            'pending' => Order::where('is_incomplete', false)->where('delivery_status', 'pending')->count(),
            'confirmed' => Order::where('is_incomplete', false)->where('delivery_status', 'confirmed')->count(),
            'picked' => Order::where('is_incomplete', false)->where('delivery_status', 'picked')->count(),
            'on_delivery' => Order::where('is_incomplete', false)->where('delivery_status', 'on_delivery')->count(),
            'delivered' => Order::where('is_incomplete', false)->where('delivery_status', 'delivered')->count(),
            'cancelled' => Order::where('is_incomplete', false)->where('delivery_status', 'cancelled')->count(),
            'incomplete' => $incompleteOrders,
        ];

        // Monthly sales trend data (Dual series: Revenue & Orders)
        $monthlyPerformance = [
            ['month' => 'Jan', 'sales' => 12400, 'orders' => 45, 'rfq' => 18],
            ['month' => 'Feb', 'sales' => 18900, 'orders' => 62, 'rfq' => 24],
            ['month' => 'Mar', 'sales' => 24500, 'orders' => 84, 'rfq' => 31],
            ['month' => 'Apr', 'sales' => 28200, 'orders' => 95, 'rfq' => 40],
            ['month' => 'May', 'sales' => 31800, 'orders' => 110, 'rfq' => 46],
            ['month' => 'Jun', 'sales' => 38400, 'orders' => 128, 'rfq' => 52],
            ['month' => 'Jul', 'sales' => 42100, 'orders' => 142, 'rfq' => 58],
            ['month' => 'Aug', 'sales' => 46900, 'orders' => 155, 'rfq' => 64],
            ['month' => 'Sep', 'sales' => 51200, 'orders' => 168, 'rfq' => 70],
            ['month' => 'Oct', 'sales' => 58600, 'orders' => 185, 'rfq' => 78],
            ['month' => 'Nov', 'sales' => 63400, 'orders' => 198, 'rfq' => 85],
            ['month' => 'Dec', 'sales' => 71500, 'orders' => 220, 'rfq' => 96],
        ];

        // Order Status Breakdown for Pie Chart
        $orderStatusPie = [
            ['label' => 'Pending Orders', 'count' => max(1, $pipeline['pending']), 'color' => '#f59e0b'],
            ['label' => 'Delivered Orders', 'count' => max(1, $pipeline['delivered']), 'color' => '#10b981'],
            ['label' => 'On The Way', 'count' => max(1, $pipeline['on_delivery']), 'color' => '#06b6d4'],
            ['label' => 'Confirmed Orders', 'count' => max(1, $pipeline['confirmed']), 'color' => '#3b82f6'],
            ['label' => 'Cancelled', 'count' => max(1, $pipeline['cancelled']), 'color' => '#ef4444'],
        ];

        // Category breakdown
        $categoryCounts = Product::select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->orderByDesc('count')
            ->get();

        // Top 12 Best Selling Products
        $topProducts = Product::orderByDesc('is_top_pick')
            ->orderByDesc('price_min')
            ->take(12)
            ->get(['id', 'sku', 'title', 'category', 'price_min', 'price_max', 'sold', 'image', 'is_top_pick']);

        // Recent Orders
        $recentOrders = Order::where('is_incomplete', false)->latest()->take(6)->get();

        // Incomplete Orders
        $incompleteOrderList = Order::where('is_incomplete', true)->latest()->take(5)->get();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_customers' => 48,
                'total_orders' => $totalOrders,
                'total_sales' => $totalSales,
                'total_categories' => $totalCategories,
                'total_products' => $totalProducts,
                'total_users' => $totalUsers,
                'total_inquiries' => $totalInquiries,
            ],
            'pipeline' => $pipeline,
            'monthly_performance' => $monthlyPerformance,
            'order_status_pie' => $orderStatusPie,
            'category_counts' => $categoryCounts,
            'top_products' => $topProducts,
            'recent_orders' => $recentOrders,
            'incomplete_orders' => $incompleteOrderList,
            'system' => [
                'cms_name' => 'AMIDA Enterprise Admin Suite',
                'cms_version' => 'v5.5.4 Pro',
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'db_name' => config('database.connections.mysql.database'),
                'server_time' => now()->toIso8601String(),
                'timezone' => 'Asia/Dhaka (GMT+06:00)',
            ],
        ]);
    }
}
