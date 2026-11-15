<?php

namespace App\Http\Middleware;

use App\Models\BlockedIp;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBlockedIp
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();

        // Allow localhost loopbacks if configured, but let's check blocked IPs
        if ($ip && BlockedIp::isIpBlocked($ip)) {
            // If request is from admin trying to unblock, allow admin unblock route
            if ($request->is('api/admin/*')) {
                // Let admin requests continue if authenticated
            } else {
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'success' => false,
                        'error' => 'IP_ACCESS_BLOCKED',
                        'message' => 'Access Denied: Your IP address has been blocked by the security firewall due to repeated unauthorized URL probes.',
                        'ip' => $ip,
                        'blocked_at' => now()->toIso8601String(),
                        'support' => 'acme.info.swapan@gmail.com',
                    ], 403);
                }

                // Render beautiful branded 403 HTML page
                return response($this->renderBlockedHtml($ip), 403);
            }
        }

        return $next($request);
    }

    private function renderBlockedHtml(string $ip): string
    {
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 Forbidden - Security Shield | AMIDA</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: radial-gradient(circle at 50% 20%, #1e293b 0%, #0b1120 70%);
            color: #f1f5f9;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .shield-card {
            background: rgba(17, 24, 39, 0.96);
            border: 1px solid rgba(239, 68, 68, 0.4);
            border-radius: 16px;
            max-width: 540px;
            width: 100%;
            padding: 40px 32px;
            text-align: center;
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.15);
        }
        .shield-icon {
            width: 72px;
            height: 72px;
            background: rgba(239, 68, 68, 0.15);
            border: 2px solid #ef4444;
            color: #ef4444;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 34px;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 16px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        h1 { font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }
        .badge {
            display: inline-block;
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            font-size: 11.5px;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 20px;
            border: 1px solid rgba(239, 68, 68, 0.3);
            margin-bottom: 20px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        p { color: #94a3b8; font-size: 14.5px; line-height: 1.6; margin-bottom: 24px; }
        .meta-box {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid #334155;
            border-radius: 10px;
            padding: 14px 18px;
            text-align: left;
            margin-bottom: 24px;
            font-size: 13px;
        }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .meta-row:last-child { margin-bottom: 0; }
        .meta-label { color: #64748b; }
        .meta-val { color: #38bdf8; font-family: monospace; font-weight: 600; }
        .contact-admin {
            font-size: 12.5px;
            color: #64748b;
            line-height: 1.5;
        }
        .contact-admin a { color: #38bdf8; text-decoration: none; font-weight: 600; }
        .contact-admin a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="shield-card">
        <div class="shield-icon">🛡️</div>
        <div class="badge">Security Firewall Enforced</div>
        <h1>403 • Access Temporarily Blocked</h1>
        <p>
            Your IP address has been restricted from accessing AMIDA's network infrastructure due to repeated requests to non-existent or unauthorized URLs.
        </p>

        <div class="meta-box">
            <div class="meta-row">
                <span class="meta-label">Your Client IP:</span>
                <span class="meta-val">{$ip}</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Violation Trigger:</span>
                <span class="meta-val">Repeated 404 URL Scans</span>
            </div>
            <div class="meta-row">
                <span class="meta-label">Status:</span>
                <span class="meta-val" style="color: #ef4444;">BLOCKED BY FIREWALL</span>
            </div>
        </div>

        <div class="contact-admin">
            If you believe this is an error or need emergency unblocking, please contact the administrator:
            <br>
            <a href="mailto:acme.info.swapan@gmail.com">acme.info.swapan@gmail.com</a> • Swapan Kumar Bairagi (CEO)
        </div>
    </div>
</body>
</html>
HTML;
    }
}
