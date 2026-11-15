<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminSettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $grouped = Setting::getAllGrouped();

        // Also provide flat key-value pairs for easy form binding
        $flat = [];
        foreach (Setting::all() as $s) {
            $flat[$s->key] = $s->value;
        }

        return response()->json([
            'success' => true,
            'settings' => $flat,
            'grouped' => $grouped,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $settings = $request->input('settings', []);
        $group = $request->input('group', 'general');

        foreach ($settings as $key => $val) {
            Setting::set($key, $val, $group);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings saved successfully',
            'settings' => Setting::getAllGrouped(),
        ]);
    }

    public function testSmtp(Request $request): JsonResponse
    {
        $request->validate([
            'test_email' => 'required|email',
        ]);

        $testEmail = $request->input('test_email');
        $smtpHost = $request->input('smtp_host') ?: Setting::get('smtp_host', 'smtp.gmail.com');
        $smtpPort = $request->input('smtp_port') ?: Setting::get('smtp_port', '587');
        $smtpEnc = $request->input('smtp_encryption') ?: Setting::get('smtp_encryption', 'tls');
        $smtpUser = $request->input('smtp_username') ?: Setting::get('smtp_username');
        $smtpPass = $request->input('smtp_password') ?: Setting::get('smtp_password');
        $fromName = $request->input('smtp_from_name') ?: Setting::get('smtp_from_name', 'AMIDA Supplies');
        $fromEmail = $request->input('smtp_from_email') ?: Setting::get('smtp_from_email', 'no-reply@amida-supplies.com');

        if (!$smtpUser || !$smtpPass) {
            return response()->json([
                'success' => false,
                'message' => 'SMTP Username and Password/App Password are required to send test email.',
            ], 422);
        }

        try {
            config([
                'mail.mailers.smtp.host' => $smtpHost,
                'mail.mailers.smtp.port' => (int) $smtpPort,
                'mail.mailers.smtp.encryption' => $smtpEnc,
                'mail.mailers.smtp.username' => $smtpUser,
                'mail.mailers.smtp.password' => $smtpPass,
                'mail.from.address' => $fromEmail,
                'mail.from.name' => $fromName,
            ]);

            Mail::raw("Congratulations!\n\nYour SMTP email configuration on AMIDA Supplies Ltd Admin Panel is working perfectly.\n\nServer: {$smtpHost}:{$smtpPort}\nEncryption: {$smtpEnc}\nTime: " . now()->toDateTimeString(), function ($m) use ($testEmail, $fromEmail, $fromName) {
                $m->to($testEmail)
                  ->from($fromEmail, $fromName)
                  ->subject('AMIDA Supplies Ltd - SMTP Configuration Test Successful');
            });

            return response()->json([
                'success' => true,
                'message' => "Test email successfully sent to {$testEmail}!",
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'SMTP Connection failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
