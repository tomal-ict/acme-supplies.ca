<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminAndSettingsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Super Admin User
        $admin = User::updateOrCreate(
            ['email' => 'admin@acme.com'],
            [
                'name' => 'Tomal Krishna Howlader',
                'username' => 'admin',
                'password' => Hash::make('AcmeAdmin@2027#Secure'),
                'role' => 'super_admin',
                'permissions' => [
                    'all',
                    'products.manage',
                    'categories.manage',
                    'inquiries.manage',
                    'settings.manage',
                    'users.manage',
                    'seo.manage',
                ],
                'is_active' => true,
            ]
        );

        // 2. Seed Default Settings
        $defaultSettings = [
            // General Group
            'site_name' => ['AMIDA OFFICE SUPPLIES LIMITED', 'general'],
            'site_tagline' => ['Price Quality Service', 'general'],
            'site_url' => ['https://www.acme-supplies.ca', 'general'],
            'contact_email' => ['acme.info.swapan@gmail.com', 'general'],
            'contact_phone' => ['+1 604 316 8138', 'general'],
            'contact_address' => ['126 Main Street, Acme, AB T0M 0A0, Canada', 'general'],
            'contact_hours' => ['AM 9:00 - PM 22:00', 'general'],
            'ceo_name' => ['Swapan Kumar Bairagi', 'general'],
            'ceo_title' => ['Chief Executive Officer (CEO)', 'general'],
            'currency' => ['USD', 'general'],
            'timezone' => ['Asia/Dhaka', 'general'],
            'date_format' => ['Y-m-d H:i:s', 'general'],

            // Header & Footer Group
            'logo_url' => ['./images/logo.png', 'header_footer'],
            'announcement_text' => ['Welcome to AMIDA OFFICE SUPPLIES LIMITED • Price Quality Service', 'header_footer'],
            'footer_copyright' => ['© 2027 Tomal Krishna Howlader. All rights reserved.', 'header_footer'],
            'footer_tagline' => ['Price Quality Service • 126 Main Street, Acme, AB T0M 0A0, Canada', 'header_footer'],
            'facebook_url' => ['https://facebook.com', 'header_footer'],
            'linkedin_url' => ['https://linkedin.com', 'header_footer'],
            'youtube_url' => ['https://youtube.com', 'header_footer'],

            // SMTP & Email Server Group
            'smtp_enabled' => ['1', 'smtp'],
            'smtp_host' => ['smtp.gmail.com', 'smtp'],
            'smtp_port' => ['587', 'smtp'],
            'smtp_encryption' => ['tls', 'smtp'],
            'smtp_username' => ['admin@acme.com', 'smtp'],
            'smtp_password' => ['acme_app_password_2027', 'smtp'],
            'smtp_from_name' => ['Amida Supplies Customer Care', 'smtp'],
            'smtp_from_email' => ['no-reply@acme-supplies.com', 'smtp'],
            'admin_notify_email' => ['admin@acme.com', 'smtp'],
            'autoresponder_enabled' => ['1', 'smtp'],
            'autoresponder_subject' => ['Welcome to Amida Supplies Ltd - We Have Received Your Request', 'smtp'],
            'autoresponder_body' => ["Dear Valued Partner,\n\nThank you for reaching out to AMIDA OFFICE SUPPLIES LIMITED. We have received your inquiry / RFQ specifications.\n\nOur export engineering team is reviewing your requirements and a dedicated account manager will respond with tiered FOB pricing within 2 hours.\n\nBest Regards,\nAmida Supplies Sales & Export Team\nhttps://acme-supplies.com", 'smtp'],

            // SEO & Marketing Group
            'meta_title' => ['Amida Supplies Ltd | Premium Compatible Toner Cartridges & Inks', 'seo'],
            'meta_description' => ['Direct manufacturer of compatible toner cartridges, bulk refill inks, patent gear toner, and thermal POS printers with global export to 120+ countries.', 'seo'],
            'meta_keywords' => ['toner cartridge, wholesale toner, compatible toner, HP 85A, bulk ink, thermal printer, Amida Supplies, printer consumables', 'seo'],
            'google_tag_manager_id' => ['GTM-5F8K9LM', 'seo'],
            'google_analytics_id' => ['G-7X9B3M1K2P', 'seo'],
            'google_search_console_code' => ['google-site-verification=Xv8K_AcmeVerifyToken2027', 'seo'],
            'sitemap_enabled' => ['1', 'seo'],
            'robots_txt' => ["User-agent: *\nAllow: /\nDisallow: /myadmin\nDisallow: /api/\nSitemap: /sitemap.xml", 'seo'],
        ];

        foreach ($defaultSettings as $key => [$value, $group]) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value, 'group' => $group]);
        }

        // 3. Seed Categories & Sub-Categories
        $categoryTree = [
            'Monochrome Cartridges' => [
                'name' => 'Amida Compatible',
                'subs' => ['for HP', 'for Canon', 'for Brother', 'for Samsung', 'for Epson'],
            ],
            'Patent Gear Products' => [
                'name' => 'Amida Patent Product Toner',
                'subs' => ['for Brother', 'for HP'],
            ],
            'Color Cartridges' => [
                'name' => 'Amida Color Toner',
                'subs' => ['for HP', 'for Samsung', 'for Canon', 'for Brother'],
            ],
            'Inks & Inkjets' => [
                'name' => 'Amida Ink Cartridge',
                'subs' => ['for HP', 'for Epson'],
            ],
            'Bulk Inks' => [
                'name' => 'Amida Bulk Ink',
                'subs' => ['Bulk Ink', 'for Canon', 'for Epson', 'for Brother', 'for HP'],
            ],
            'Toner Powder' => [
                'name' => 'Amida Toner Powder',
                'subs' => ['Bulk Toner', 'for HP', 'for Brother'],
            ],
            'Printers' => [
                'name' => 'Amida Printer (A4 Laser)',
                'subs' => ['A4 Laser'],
            ],
            'Thermal Printers' => [
                'name' => 'Amida Thermal Printer (POS)',
                'subs' => ['Thermal POS'],
            ],
            'Toner Chips' => [
                'name' => 'Amida Toner Chip',
                'subs' => ['Smart Chips', 'for HP', 'for Canon'],
            ],
        ];

        $order = 1;
        foreach ($categoryTree as $slug => $data) {
            $cat = Category::updateOrCreate(
                ['slug' => Str::slug($slug)],
                [
                    'name' => $slug,
                    'sort_order' => $order++,
                    'is_active' => true,
                ]
            );

            $subOrder = 1;
            foreach ($data['subs'] as $sub) {
                Category::updateOrCreate(
                    ['slug' => Str::slug($slug . '-' . $sub)],
                    [
                        'name' => $sub,
                        'parent_id' => $cat->id,
                        'sort_order' => $subOrder++,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}

