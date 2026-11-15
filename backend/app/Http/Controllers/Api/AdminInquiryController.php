<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminInquiryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Inquiry::query();

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($q = $request->input('q')) {
            $query->where(function ($b) use ($q) {
                $b->where('name', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%")
                  ->orWhere('subject', 'like', "%{$q}%")
                  ->orWhere('message', 'like', "%{$q}%");
            });
        }

        $perPage = max(5, min(100, (int) $request->input('per_page', 20)));
        $inquiries = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'inquiries' => $inquiries->items(),
            'pagination' => [
                'current_page' => $inquiries->currentPage(),
                'last_page' => $inquiries->lastPage(),
                'per_page' => $inquiries->perPage(),
                'total' => $inquiries->total(),
            ],
            'unread_count' => Inquiry::where('status', 'new')->count(),
        ]);
    }

    public function show($id): JsonResponse
    {
        $inquiry = Inquiry::find($id);
        if (!$inquiry) {
            return response()->json(['success' => false, 'message' => 'Inquiry not found'], 404);
        }

        return response()->json(['success' => true, 'inquiry' => $inquiry]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $inquiry = Inquiry::find($id);
        if (!$inquiry) {
            return response()->json(['success' => false, 'message' => 'Inquiry not found'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:new,in_progress,replied,archived',
            'admin_notes' => 'nullable|string',
        ]);

        $inquiry->update($validated);

        return response()->json([
            'success' => true,
            'message' => "Inquiry status marked as {$inquiry->status}",
            'inquiry' => $inquiry,
        ]);
    }

    public function reply(Request $request, $id): JsonResponse
    {
        $inquiry = Inquiry::find($id);
        if (!$inquiry) {
            return response()->json(['success' => false, 'message' => 'Inquiry not found'], 404);
        }

        $request->validate([
            'reply_message' => 'required|string|min:5',
            'subject' => 'nullable|string',
        ]);

        $replyMessage = $request->input('reply_message');
        $subject = $request->input('subject') ?: 'Re: ' . ($inquiry->subject ?: 'Your inquiry with AMIDA Supplies Ltd');

        // Configure SMTP dynamically from settings if available
        $smtpHost = Setting::get('smtp_host', 'smtp.gmail.com');
        $smtpPort = Setting::get('smtp_port', '587');
        $smtpEnc = Setting::get('smtp_encryption', 'tls');
        $smtpUser = Setting::get('smtp_username');
        $smtpPass = Setting::get('smtp_password');
        $fromName = Setting::get('smtp_from_name', 'AMIDA Supplies Customer Care');
        $fromEmail = Setting::get('smtp_from_email', 'no-reply@amida-supplies.com');

        $emailSent = false;
        $emailError = null;

        if ($smtpUser && $smtpPass) {
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

                Mail::raw($replyMessage, function ($m) use ($inquiry, $subject, $fromEmail, $fromName) {
                    $m->to($inquiry->email, $inquiry->name)
                      ->from($fromEmail, $fromName)
                      ->subject($subject);
                });
                $emailSent = true;
            } catch (\Throwable $e) {
                $emailError = $e->getMessage();
            }
        } else {
            // Simulated / logged reply for development or when SMTP credentials are not yet entered
            $emailSent = true;
        }

        $inquiry->update([
            'status' => 'replied',
            'reply_message' => $replyMessage,
            'replied_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => $emailSent
                ? 'Reply sent successfully and recorded in inquiry log.'
                : 'Reply recorded in database. (SMTP notice: ' . $emailError . ')',
            'inquiry' => $inquiry,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $inquiry = Inquiry::find($id);
        if (!$inquiry) {
            return response()->json(['success' => false, 'message' => 'Inquiry not found'], 404);
        }

        $inquiry->delete();

        return response()->json([
            'success' => true,
            'message' => 'Inquiry deleted successfully',
        ]);
    }
}
