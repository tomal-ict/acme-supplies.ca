<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Product;
use App\Models\Setting;
use App\Services\PayloadCryptoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class StorefrontController extends Controller
{
    public function __construct(private readonly PayloadCryptoService $crypto)
    {
    }

    public function publicSettings(): JsonResponse
    {
        $keys = [
            'site_name',
            'site_tagline',
            'logo_url',
            'announcement_text',
            'contact_email',
            'contact_phone',
            'contact_hours',
            'contact_address',
            'ceo_name',
            'ceo_title',
            'site_url',
            'campaign_bar_text',
            'footer_copyright',
            'footer_tagline',
            'meta_title',
            'meta_description',
            'meta_keywords',
            'google_tag_manager_id',
            'google_analytics_id',
            'home_sliders',
            'section_banners',
        ];

        $settings = [];
        foreach ($keys as $k) {
            $settings[$k] = Setting::get($k, '');
        }

        return response()->json(
            $this->crypto->encryptEnvelope(['settings' => $settings])
        );
    }

    public function products(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($category = $request->query('category')) {
            if ($category === 'TopPicks') {
                $query->where('is_top_pick', true);
            } elseif ($category !== 'All') {
                $query->where('category', $category);
            }
        }

        if ($subCategory = $request->query('sub')) {
            $query->where('sub_category', $subCategory);
        }

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('promo')) {
            $query->where('promo_discount', '>', 0);
        }

        switch ($request->query('sort')) {
            case 'price-asc':
                $query->orderBy('price_min', 'asc');
                break;
            case 'price-desc':
                $query->orderBy('price_min', 'desc');
                break;
            case 'newest':
                $query->orderBy('id', 'desc');
                break;
            default:
                $query->orderBy('id', 'asc');
        }

        return response()->json(
            $this->crypto->encryptEnvelope(['data' => $query->get()->toArray()])
        );
    }

    public function storeInquiry(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:120',
            'email' => 'required|email|max:160',
            'subject' => 'required|string|max:255',
            'quantity' => 'nullable|integer|min:1',
            'message' => 'required|string|max:3000',
            'type' => 'nullable|in:rfq,chat',
        ]);

        $inquiry = Inquiry::create([
            'name' => $validated['name'] ?? 'B2B Buyer',
            'email' => $validated['email'],
            'subject' => $validated['subject'],
            'quantity' => $validated['quantity'] ?? null,
            'message' => $validated['message'],
            'type' => $validated['type'] ?? 'rfq',
            'status' => 'new',
        ]);

        // Attempt automated SMTP auto-responder & Admin Notification
        $this->dispatchEmailTriggers($inquiry);

        return response()->json(
            $this->crypto->encryptEnvelope([
                'message' => 'Inquiry received successfully! A confirmation has been sent to your email.',
                'inquiry_id' => $inquiry->id,
            ]),
            201
        );
    }

    private function dispatchEmailTriggers(Inquiry $inquiry): void
    {
        try {
            $smtpUser = Setting::get('smtp_username');
            $smtpPass = Setting::get('smtp_password');
            $smtpHost = Setting::get('smtp_host', 'smtp.gmail.com');
            $smtpPort = Setting::get('smtp_port', '587');
            $smtpEnc = Setting::get('smtp_encryption', 'tls');
            $fromName = Setting::get('smtp_from_name', 'AMIDA Supplies Customer Care');
            $fromEmail = Setting::get('smtp_from_email', 'no-reply@amida-supplies.com');

            if (!$smtpUser || !$smtpPass) {
                return;
            }

            config([
                'mail.mailers.smtp.host' => $smtpHost,
                'mail.mailers.smtp.port' => (int) $smtpPort,
                'mail.mailers.smtp.encryption' => $smtpEnc,
                'mail.mailers.smtp.username' => $smtpUser,
                'mail.mailers.smtp.password' => $smtpPass,
                'mail.from.address' => $fromEmail,
                'mail.from.name' => $fromName,
            ]);

            // 1. Send Autoresponder to customer
            if (Setting::get('autoresponder_enabled', '1') === '1') {
                $sub = Setting::get('autoresponder_subject', 'Welcome to AMIDA OFFICE SUPPLIES LIMITED - Feedback Received');
                $body = Setting::get('autoresponder_body', "Hello {$inquiry->name},\n\nThank you for reaching out to AMIDA OFFICE SUPPLIES LIMITED. We have received your inquiry regarding \"{$inquiry->subject}\".\n\nOur sales engineering team is reviewing your specifications and will respond shortly.\n\nBest Regards,\nAMIDA Supplies Sales Team");

                Mail::raw($body, function ($m) use ($inquiry, $sub, $fromEmail, $fromName) {
                    $m->to($inquiry->email, $inquiry->name)
                      ->from($fromEmail, $fromName)
                      ->subject($sub);
                });
            }

            // 2. Send Alert Notification to Admin
            $adminEmail = Setting::get('admin_notify_email');
            if ($adminEmail) {
                $adminSubject = "[New {$inquiry->type} Alert] {$inquiry->subject} - from {$inquiry->name}";
                $adminBase = Setting::get('site_url') ?: request()->root();
                $adminUrl = rtrim($adminBase, '/') . '/#/myadmin';
                $adminBody = "A new customer inquiry has arrived on AMIDA Storefront:\n\nName: {$inquiry->name}\nEmail: {$inquiry->email}\nSubject: {$inquiry->subject}\nQuantity: " . ($inquiry->quantity ?: 'N/A') . "\nMessage:\n{$inquiry->message}\n\nLogin to Admin Panel to reply:\n{$adminUrl}";

                Mail::raw($adminBody, function ($m) use ($adminEmail, $adminSubject, $fromEmail, $fromName) {
                    $m->to($adminEmail)
                      ->from($fromEmail, $fromName)
                      ->subject($adminSubject);
                });
            }
        } catch (\Throwable $e) {
            // Silently log; does not disrupt client response
        }
    }

    public function companyProfile(): JsonResponse
    {
        return response()->json(
            $this->crypto->encryptEnvelope([
                'companyName' => Setting::get('site_name', 'AMIDA OFFICE SUPPLIES LIMITED'),
                'brandName' => 'AMIDA®',
                'slogan' => Setting::get('site_tagline', 'Global OEM / ODM Imaging Solutions & Consumables Manufacturer'),
                'established' => 1999,
                'rating' => 4.9,
                'reviewsCount' => 12,
                'platformYears' => 18,
                'floorspace' => '75,000 m²',
                'productionLines' => 48,
                'monthlyOutput' => '1,000,000 Pieces',
                'annualRevenue' => 'US $50M – $100M',
                'certifications' => ['ISO9001', 'ISO14001', 'REACH', 'RoHS', 'CE', 'STMC'],
            ])
        );
    }
}
