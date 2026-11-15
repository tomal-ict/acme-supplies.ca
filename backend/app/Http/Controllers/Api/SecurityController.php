<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlockedIp;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityController extends Controller
{
    /**
     * Public API endpoint to report a 404 hit from the React frontend SPA.
     */
    public function report404(Request $request): JsonResponse
    {
        $ip = $request->ip();
        $path = $request->input('path') ?: $request->path();

        $result = BlockedIp::record404Attempt($ip, $path, $request->userAgent());

        return response()->json([
            'success' => true,
            'ip' => $result['ip'],
            'attempts' => $result['attempts'],
            'is_blocked' => $result['is_blocked'],
            'blocked_at' => $result['blocked_at'],
            'threshold' => (int) Setting::get('security_max_404_attempts', '2'),
            'message' => $result['is_blocked']
                ? 'Your IP address has been blocked due to multiple unauthorized URL scans.'
                : 'Unauthorized path logged.',
        ]);
    }

    /**
     * Check if the current client's IP is blocked.
     */
    public function checkStatus(Request $request): JsonResponse
    {
        $ip = $request->ip();
        $record = BlockedIp::where('ip_address', $ip)->first();

        return response()->json([
            'success' => true,
            'ip' => $ip,
            'is_blocked' => $record ? (bool)$record->is_blocked : false,
            'attempts' => $record ? $record->attempt_count : 0,
        ]);
    }

    /**
     * Server fallback for direct URLs that do not exist.
     */
    public function serverFallback(Request $request): Response
    {
        $ip = $request->ip();
        $path = $request->query('path') ?: $request->path();

        $result = BlockedIp::record404Attempt($ip, $path, $request->userAgent());

        if ($result['is_blocked']) {
            $middleware = new \App\Http\Middleware\CheckBlockedIp();
            $refMethod = new \ReflectionMethod($middleware, 'renderBlockedHtml');
            $refMethod->setAccessible(true);
            return response($refMethod->invoke($middleware, $ip), 403);
        }

        // Return a beautifully themed 404 page
        return response($this->renderThemed404Html($path, $result['attempts']), 404);
    }

    /**
     * Admin: List blocked & monitored IPs.
     */
    public function adminList(Request $request): JsonResponse
    {
        $query = BlockedIp::query()->orderBy('updated_at', 'desc');

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($b) use ($q) {
                $b->where('ip_address', 'like', "%{$q}%")
                  ->orWhere('last_path', 'like', "%{$q}%")
                  ->orWhere('reason', 'like', "%{$q}%");
            });
        }

        if ($request->input('filter') === 'blocked') {
            $query->where('is_blocked', true);
        } elseif ($request->input('filter') === 'monitored') {
            $query->where('is_blocked', false);
        }

        $items = $query->paginate($request->input('per_page', 25));

        $stats = [
            'total_tracked' => BlockedIp::count(),
            'total_blocked' => BlockedIp::where('is_blocked', true)->count(),
            'total_monitored' => BlockedIp::where('is_blocked', false)->count(),
            'total_probes' => BlockedIp::sum('attempt_count'),
            'threshold' => (int) Setting::get('security_max_404_attempts', '2'),
        ];

        return response()->json([
            'success' => true,
            'data' => $items->items(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Admin: Unblock an IP address.
     */
    public function adminUnblock(Request $request): JsonResponse
    {
        $request->validate([
            'ip_address' => 'required|string',
        ]);

        $ip = $request->input('ip_address');
        $record = BlockedIp::where('ip_address', $ip)->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'IP address not found.',
            ], 404);
        }

        $record->is_blocked = false;
        $record->attempt_count = 0; // reset attempts so they have a fresh start
        $record->notes = "Unblocked by administrator at " . now()->toDateTimeString();
        $record->save();

        return response()->json([
            'success' => true,
            'message' => "IP {$ip} has been successfully unblocked!",
            'record' => $record,
        ]);
    }

    /**
     * Admin: Manually block an IP.
     */
    public function adminBlock(Request $request): JsonResponse
    {
        $request->validate([
            'ip_address' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $ip = $request->input('ip_address');
        $reason = $request->input('reason') ?: 'Manually blocked by administrator';

        $record = BlockedIp::firstOrNew(['ip_address' => $ip]);
        $record->is_blocked = true;
        $record->blocked_at = now();
        $record->reason = $reason;
        $record->save();

        return response()->json([
            'success' => true,
            'message' => "IP {$ip} has been blocked.",
            'record' => $record,
        ]);
    }

    /**
     * Admin: Delete IP record.
     */
    public function adminDestroy(int $id): JsonResponse
    {
        $record = BlockedIp::find($id);
        if (!$record) {
            return response()->json(['success' => false, 'message' => 'Record not found'], 404);
        }

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Security log record deleted successfully.',
        ]);
    }

    /**
     * Render beautiful themed 404 page for direct server hits.
     */
    private function renderThemed404Html(string $path, int $attempts): string
    {
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: radial-gradient(circle at 50% 20%, #0f172a 0%, #020617 80%);
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .error-card {
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(14px);
            border-radius: 20px;
            max-width: 480px;
            width: 100%;
            padding: 48px 32px;
            text-align: center;
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
        }
        .code-badge {
            display: inline-block;
            font-size: 96px;
            font-weight: 900;
            line-height: 1;
            letter-spacing: -4px;
            background: linear-gradient(135deg, #38bdf8 0%, #0284c7 45%, #f97316 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 12px;
        }
        h1 { font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 24px; }
        .btn {
            display: inline-flex;
            align-items: center;
            padding: 12px 28px;
            border-radius: 8px;
            font-size: 14.5px;
            font-weight: 700;
            text-decoration: none;
            background: #f97316;
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
        }
    </style>
</head>
<body>
    <div class="error-card">
        <div class="code-badge">404</div>
        <h1>Page Not Found</h1>
        <div>
            <a href="./#/" class="btn">Back to Home &rarr;</a>
        </div>
    </div>
</body>
</html>
HTML;
    }
HTML;
    }
}
