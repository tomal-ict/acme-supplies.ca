<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Database\Seeder;

class OrderAndBannerSeeder extends Seeder
{
    public function run(): void
    {
        Order::truncate();

        // Active Orders
        $orders = [
            [
                'order_code' => '20270115-08142210',
                'customer_name' => 'Al-Noor Trading LLC',
                'customer_email' => 'procurement@alnoortrading.ae',
                'customer_phone' => '+971 4 234 5678',
                'shipping_address' => 'Warehouse 14, Industrial Area 3, Dubai, UAE',
                'total_amount' => 3850.00,
                'delivery_status' => 'pending',
                'payment_status' => 'paid',
                'is_incomplete' => false,
                'items' => [
                    ['sku' => 'P005', 'title' => '85A 78A 88A 35A 36A 12A 79A 44A 48A 83A Amida Toner', 'qty' => 500, 'price' => 3.50],
                    ['sku' => 'P001', 'title' => 'Amida Patent Gear Toner Cartridge TN770 for Brother', 'qty' => 300, 'price' => 4.20],
                ],
                'notes' => 'FOB Dubai Port. Palletized packaging required.',
            ],
            [
                'order_code' => '20270116-09224415',
                'customer_name' => 'EuroPrint GmbH',
                'customer_email' => 'order@europrint-solutions.de',
                'customer_phone' => '+49 69 9876 5432',
                'shipping_address' => 'Gewerbepark 8, 60311 Frankfurt, Germany',
                'total_amount' => 7420.00,
                'delivery_status' => 'confirmed',
                'payment_status' => 'paid',
                'is_incomplete' => false,
                'items' => [
                    ['sku' => 'P011', 'title' => 'Amida Compatible Color Toner for HP 125A 126A 201A Set', 'qty' => 400, 'price' => 5.80],
                    ['sku' => 'P019', 'title' => 'Amida Universal 1000ml Bulk Dye Refill Ink Pack', 'qty' => 1200, 'price' => 1.95],
                ],
                'notes' => 'Ship via Hamburg Sea Freight. Custom barcode labels.',
            ],
            [
                'order_code' => '20270118-11053288',
                'customer_name' => 'Pacific Imaging Distribution',
                'customer_email' => 'sales@pacificimaging.com.au',
                'customer_phone' => '+61 2 8123 4567',
                'shipping_address' => 'Unit 5, 24 Distribution Way, Sydney NSW 2000, Australia',
                'total_amount' => 5120.00,
                'delivery_status' => 'on_delivery',
                'payment_status' => 'paid',
                'is_incomplete' => false,
                'items' => [
                    ['sku' => 'P021', 'title' => 'Amida Thermal POS Receipt Printer AK-80250 High Speed', 'qty' => 80, 'price' => 32.50],
                    ['sku' => 'P007', 'title' => 'CF259A CF276A CF258A Amida Toner Cartridge', 'qty' => 300, 'price' => 4.80],
                ],
                'notes' => 'Express air freight dispatched via DHL Global.',
            ],
            [
                'order_code' => '20270120-14201199',
                'customer_name' => 'Dhaka Tech & Paper Mart',
                'customer_email' => 'info@dhakatechmart.bd',
                'customer_phone' => '+880 1711 000000',
                'shipping_address' => '12 Elephant Road, Computer City Center, Dhaka 1205, Bangladesh',
                'total_amount' => 1850.00,
                'delivery_status' => 'delivered',
                'payment_status' => 'paid',
                'is_incomplete' => false,
                'items' => [
                    ['sku' => 'P005', 'title' => '85A 78A 88A 35A 36A 12A Amida Toner Cartridge', 'qty' => 400, 'price' => 3.20],
                    ['sku' => 'P020', 'title' => 'Amida A4 Monochrome Laser Desktop Printer AM-2200', 'qty' => 10, 'price' => 57.00],
                ],
                'notes' => 'Chittagong port customs cleared. Delivered successfully.',
            ],
            [
                'order_code' => '20270122-16450012',
                'customer_name' => 'Tokyo Office Consumables KK',
                'customer_email' => 'import@tokyo-imaging.jp',
                'customer_phone' => '+81 3 5555 1234',
                'shipping_address' => 'Minato-ku, Shinagawa 3-12-1, Tokyo, Japan',
                'total_amount' => 4200.00,
                'delivery_status' => 'pending',
                'payment_status' => 'unpaid',
                'is_incomplete' => false,
                'items' => [
                    ['sku' => 'P012', 'title' => 'Amida Toner 659A W2010A Compatible Color Set', 'qty' => 60, 'price' => 42.00],
                    ['sku' => 'P022', 'title' => 'Amida Universal 1000g Bulk Toner Powder Bottle', 'qty' => 400, 'price' => 3.80],
                ],
                'notes' => 'Waiting for LC bank confirmation.',
            ],
            [
                'order_code' => '20270124-18105574',
                'customer_name' => 'Sao Paulo Cartridge Hub',
                'customer_email' => 'compras@saopaulotoner.br',
                'customer_phone' => '+55 11 3456 7890',
                'shipping_address' => 'Av. Paulista 1000, Bela Vista, Sao Paulo, Brazil',
                'total_amount' => 2900.00,
                'delivery_status' => 'cancelled',
                'payment_status' => 'unpaid',
                'is_incomplete' => false,
                'items' => [
                    ['sku' => 'P009', 'title' => 'Brother Toner Cartridge TN760 TN2445 Wholesale', 'qty' => 400, 'price' => 3.50],
                ],
                'notes' => 'Customer requested cancellation due to import license renewal delay.',
            ],

            // Incomplete Orders (Abandoned carts / Incomplete checkout)
            [
                'order_code' => 'INC-20270125-01',
                'customer_name' => 'Rashid Electronics',
                'customer_email' => 'rashid@rashidelectronics.com',
                'customer_phone' => '+880 1819 123456',
                'shipping_address' => 'Agrabad C/A, Chittagong, Bangladesh',
                'total_amount' => 1450.00,
                'delivery_status' => 'pending',
                'payment_status' => 'unpaid',
                'is_incomplete' => true,
                'items' => [
                    ['sku' => 'P006', 'title' => 'CF283A Compatible for HP LaserJet Pro M127fn', 'qty' => 200, 'price' => 3.40],
                    ['sku' => 'P021', 'title' => 'Thermal Receipt Printer 80mm POS AK-80250', 'qty' => 15, 'price' => 33.00],
                ],
                'notes' => 'Customer added items to cart, entered email and phone, but paused before payment verification.',
            ],
            [
                'order_code' => 'INC-20270125-02',
                'customer_name' => 'Delta Tech Distribution',
                'customer_email' => 'orders@deltatech-me.com',
                'customer_phone' => '+966 11 456 7890',
                'shipping_address' => 'King Fahd Road, Riyadh, Saudi Arabia',
                'total_amount' => 3200.00,
                'delivery_status' => 'pending',
                'payment_status' => 'unpaid',
                'is_incomplete' => true,
                'items' => [
                    ['sku' => 'P001', 'title' => 'Patent Gear Toner TN770 for Brother', 'qty' => 250, 'price' => 4.20],
                    ['sku' => 'P019', 'title' => 'Universal 1000ml Refill Ink', 'qty' => 500, 'price' => 1.95],
                ],
                'notes' => 'Awaiting corporate credit terms approval.',
            ],
        ];

        foreach ($orders as $ord) {
            Order::create($ord);
        }

        // Default Home Hero Sliders
        $heroSliders = [
            [
                'id' => 1,
                'image' => './images/banner-1.png',
                'tag' => '25+ Years Manufacturer • OEM / ODM',
                'title' => 'High-Yield Compatible Toner Cartridges & Imaging Solutions',
                'desc' => '1,000,000+ monthly capacity across 48 automated production lines. ISO9001, ISO14001 & STMC certified quality.',
                'ctaText' => 'Explore Full Catalog',
                'ctaLink' => '/products',
            ],
            [
                'id' => 2,
                'image' => './images/banner-2.jpg',
                'tag' => 'Factory Direct • 75,000 m² Industrial Park',
                'title' => 'Automated Robotic Production & Overseas Warehousing',
                'desc' => 'Fast dispatch from our main manufacturing campus and European overseas warehouse to 120+ countries.',
                'ctaText' => 'View Company Profile',
                'ctaLink' => '/company-profile',
            ],
            [
                'id' => 3,
                'image' => './images/banner-3.jpg',
                'tag' => 'Wholesale Promotions • Up to 12% Off',
                'title' => 'Patent Gear Toner & Thermal POS Printer Specials',
                'desc' => 'Lock in factory-tier FOB pricing on Brother, HP, Canon compatible cartridges and A4 laser printers.',
                'ctaText' => 'See Hot Deals',
                'ctaLink' => '/promotion',
            ],
            [
                'id' => 4,
                'image' => './images/banner-4.jpg',
                'tag' => 'Global Exhibitions & R&D Innovation',
                'title' => 'Certified OEM/ODM Partner for Global Distributors',
                'desc' => '100% post-production print inspection and dedicated export support team.',
                'ctaText' => 'Contact Us',
                'ctaLink' => '/company-profile',
            ],
        ];

        Setting::set('home_sliders', json_encode($heroSliders), 'website');

        // Section Banners
        $sectionBanners = [
            'Patent Gear Products' => './images/sec-patent.jpg',
            'Monochrome Cartridges' => './images/sec-mono.jpg',
            'Color Cartridges' => './images/sec-color.jpg',
            'Inks & Inkjets' => './images/sec-inkjet.jpg',
            'Bulk Inks' => './images/sec-bulk-ink.jpg',
            'Toner Powder' => './images/sec-powder.jpg',
            'Printers' => './images/sec-printer.jpg',
        ];

        Setting::set('section_banners', json_encode($sectionBanners), 'website');
    }
}

