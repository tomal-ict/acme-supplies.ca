<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Setting;

$updates = [
    // General
    'site_name' => 'ACME OFFICE SUPPLIES LIMITED',
    'site_tagline' => 'Price Quality Service',
    'site_url' => 'https://www.acme-supplies.ca',
    'contact_email' => 'acme.info.swapan@gmail.com',
    'contact_phone' => '+1 604 316 8138',
    'contact_address' => '126 Main Street, Acme, AB T0M 0A0, Canada',
    'contact_hours' => 'AM 9:00 - PM 22:00',
    'ceo_name' => 'Swapan Kumar Bairagi',
    'ceo_title' => 'Chief Executive Officer (CEO)',
    
    // Header & Footer
    'announcement_text' => 'Welcome to ACME OFFICE SUPPLIES LIMITED • Price Quality Service',
    'footer_tagline' => 'Price Quality Service • 126 Main Street, Acme, AB T0M 0A0, Canada',
    'footer_copyright' => '© 2027 Tomal Krishna Howlader. All rights reserved.',
    
    // SEO
    'meta_title' => 'ACME OFFICE SUPPLIES LIMITED | Price Quality Service',
    'meta_description' => 'ACME OFFICE SUPPLIES LIMITED - Direct manufacturer & supplier of compatible toner cartridges, inks, toner powder and POS thermal printers. 126 Main Street, Acme, AB T0M 0A0, Canada.',
    
    // Autoresponder
    'smtp_from_name' => 'ACME OFFICE SUPPLIES LIMITED',
    'smtp_from_email' => 'acme.info.swapan@gmail.com',
    'autoresponder_subject' => 'Welcome to ACME OFFICE SUPPLIES LIMITED - Request Received',
    'autoresponder_body' => "Dear Valued Partner,\n\nThank you for reaching out to ACME OFFICE SUPPLIES LIMITED.\n\nOur team under the leadership of Swapan Kumar Bairagi (CEO) has received your request.\n\nCorporate Office: 126 Main Street, Acme, AB T0M 0A0, Canada\nTel: +1 604 316 8138\nWeb: www.acme-supplies.ca\n\nBest Regards,\nACME OFFICE SUPPLIES LIMITED",
];

foreach ($updates as $key => $val) {
    Setting::set($key, $val, 'general');
    echo "Updated setting: {$key} => {$val}\n";
}

echo "All visiting card settings saved to database successfully.\n";
