-- ============================================================
-- AMIDA Supplies Limited - Database Synchronization Snapshot
-- Exported At: 2026-11-20 18:24:41
-- Database: acme_db_2026
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Table structure for `blocked_ips`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `blocked_ips`;
CREATE TABLE `blocked_ips` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL,
  `attempt_count` int(10) unsigned NOT NULL DEFAULT 1,
  `is_blocked` tinyint(1) NOT NULL DEFAULT 0,
  `blocked_at` timestamp NULL DEFAULT NULL,
  `reason` varchar(255) NOT NULL DEFAULT 'Repeated unauthorized URL probes (404)',
  `last_path` varchar(500) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blocked_ips_ip_address_unique` (`ip_address`),
  KEY `blocked_ips_is_blocked_index` (`is_blocked`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `blocked_ips` (1 rows)
INSERT INTO `blocked_ips` (`id`, `ip_address`, `attempt_count`, `is_blocked`, `blocked_at`, `reason`, `last_path`, `user_agent`, `notes`, `created_at`, `updated_at`) VALUES 
(1, '::1', 1, 0, '2026-11-15 17:09:37', 'Multiple unauthorized 404 URL scans (2 attempts, limit 2)', 'api/storefront/settings', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22621.4249', NULL, '2026-11-15 17:09:10', '2026-11-20 15:21:37');

-- ------------------------------------------------------------
-- Table structure for `cache`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `cache` (4 rows)
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES 
('laravel-cache-424f74a6a7ed4d4ed4761507ebcd209a6ef0937b', 'i:2;', 1795199123),
('laravel-cache-424f74a6a7ed4d4ed4761507ebcd209a6ef0937b:timer', 'i:1795199123;', 1795199123),
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:2;', 1794494705),
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1794494705;', 1794494705);

-- ------------------------------------------------------------
-- Table structure for `cache_locks`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `categories`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  KEY `categories_parent_id_index` (`parent_id`),
  CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `categories` (32 rows)
INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES 
(1, 'Monochrome Cartridges', 'monochrome-cartridges', NULL, 1, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(2, 'for HP', 'monochrome-cartridges-for-hp', 1, 1, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(3, 'for Canon', 'monochrome-cartridges-for-canon', 1, 2, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(4, 'for Brother', 'monochrome-cartridges-for-brother', 1, 3, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(5, 'for Samsung', 'monochrome-cartridges-for-samsung', 1, 4, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(6, 'for Epson', 'monochrome-cartridges-for-epson', 1, 5, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(7, 'Patent Gear Products', 'patent-gear-products', NULL, 2, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(8, 'for Brother', 'patent-gear-products-for-brother', 7, 1, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(9, 'for HP', 'patent-gear-products-for-hp', 7, 2, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(10, 'Color Cartridges', 'color-cartridges', NULL, 3, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(11, 'for HP', 'color-cartridges-for-hp', 10, 1, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(12, 'for Samsung', 'color-cartridges-for-samsung', 10, 2, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(13, 'for Canon', 'color-cartridges-for-canon', 10, 3, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(14, 'for Brother', 'color-cartridges-for-brother', 10, 4, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(15, 'Inks & Inkjets', 'inks-inkjets', NULL, 4, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(16, 'for HP', 'inks-inkjets-for-hp', 15, 1, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(17, 'for Epson', 'inks-inkjets-for-epson', 15, 2, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(18, 'Bulk Inks', 'bulk-inks', NULL, 5, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(19, 'Bulk Ink', 'bulk-inks-bulk-ink', 18, 1, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(20, 'for Canon', 'bulk-inks-for-canon', 18, 2, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(21, 'for Epson', 'bulk-inks-for-epson', 18, 3, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(22, 'for Brother', 'bulk-inks-for-brother', 18, 4, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(23, 'for HP', 'bulk-inks-for-hp', 18, 5, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(24, 'Toner Powder', 'toner-powder', NULL, 6, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(25, 'Bulk Toner', 'toner-powder-bulk-toner', 24, 1, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(26, 'for HP', 'toner-powder-for-hp', 24, 2, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(27, 'for Brother', 'toner-powder-for-brother', 24, 3, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(28, 'Printers', 'printers', NULL, 7, 1, '2026-11-12 18:42:21', '2026-11-12 18:42:21'),
(29, 'A4 Laser', 'printers-a4-laser', 28, 1, 1, '2026-11-12 18:42:22', '2026-11-12 18:42:22'),
(30, 'Thermal Printers', 'thermal-printers', NULL, 8, 1, '2026-11-12 18:42:22', '2026-11-12 18:42:22'),
(31, 'Thermal POS', 'thermal-printers-thermal-pos', 30, 1, 1, '2026-11-12 18:42:22', '2026-11-12 18:42:22'),
(36, 'Thermal Paper Rolls', 'thermal-paper-rolls', NULL, 0, 1, '2026-11-16 11:32:11', '2026-11-16 11:32:11');

-- ------------------------------------------------------------
-- Table structure for `failed_jobs`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `inquiries`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `inquiries`;
CREATE TABLE `inquiries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'rfq',
  `status` varchar(255) NOT NULL DEFAULT 'new',
  `admin_notes` text DEFAULT NULL,
  `reply_message` text DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `job_batches`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `jobs`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `migrations`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `migrations` (14 rows)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES 
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_11_12_000001_create_products_table', 1),
(5, '2026_11_12_000002_create_inquiries_table', 1),
(6, '2026_11_13_000001_add_role_and_permissions_to_users_table', 2),
(7, '2026_11_13_000002_create_settings_table', 2),
(8, '2026_11_13_000003_create_categories_table', 2),
(9, '2026_11_13_000004_update_inquiries_table', 2),
(10, '2026_11_13_000005_create_orders_table', 3),
(11, '2026_11_15_000001_add_compatible_printers_to_products_table', 4),
(12, '2026_11_15_000002_create_blocked_ips_table', 4),
(13, '2026_11_20_000001_add_details_and_pricing_to_products_table', 5),
(14, '2026_11_20_000002_add_shipping_and_payment_to_orders_table', 5);

-- ------------------------------------------------------------
-- Table structure for `orders`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_code` varchar(255) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(255) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `delivery_area` varchar(255) DEFAULT NULL,
  `delivery_charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `delivery_status` varchar(255) NOT NULL DEFAULT 'pending',
  `payment_status` varchar(255) NOT NULL DEFAULT 'unpaid',
  `payment_method` varchar(255) NOT NULL DEFAULT 'Cash on Delivery',
  `is_incomplete` tinyint(1) NOT NULL DEFAULT 0,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_code_unique` (`order_code`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `orders` (13 rows)
INSERT INTO `orders` (`id`, `order_code`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `delivery_area`, `delivery_charge`, `subtotal`, `total_amount`, `delivery_status`, `payment_status`, `payment_method`, `is_incomplete`, `items`, `notes`, `created_at`, `updated_at`) VALUES 
(1, '20270115-08142210', 'Al-Noor Trading LLC', 'procurement@alnoortrading.ae', '+971 4 234 5678', 'Warehouse 14, Industrial Area 3, Dubai, UAE', NULL, '0.00', '0.00', '3850.00', 'pending', 'paid', 'Cash on Delivery', 0, '[{\"sku\":\"P005\",\"title\":\"85A 78A 88A 35A 36A 12A 79A 44A 48A 83A Amida Toner\",\"qty\":500,\"price\":3.5},{\"sku\":\"P001\",\"title\":\"Amida Patent Gear Toner Cartridge TN770 for Brother\",\"qty\":300,\"price\":4.2}]', 'FOB Dubai Port. Palletized packaging required.', '2026-11-13 04:30:36', '2026-11-13 04:30:36'),
(2, '20270116-09224415', 'EuroPrint GmbH', 'order@europrint-solutions.de', '+49 69 9876 5432', 'Gewerbepark 8, 60311 Frankfurt, Germany', NULL, '0.00', '0.00', '7420.00', 'confirmed', 'paid', 'Cash on Delivery', 0, '[{\"sku\":\"P011\",\"title\":\"Amida Compatible Color Toner for HP 125A 126A 201A Set\",\"qty\":400,\"price\":5.8},{\"sku\":\"P019\",\"title\":\"Amida Universal 1000ml Bulk Dye Refill Ink Pack\",\"qty\":1200,\"price\":1.95}]', 'Ship via Hamburg Sea Freight. Custom barcode labels.', '2026-11-13 04:30:36', '2026-11-13 04:30:36'),
(3, '20270118-11053288', 'Pacific Imaging Distribution', 'sales@pacificimaging.com.au', '+61 2 8123 4567', 'Unit 5, 24 Distribution Way, Sydney NSW 2000, Australia', NULL, '0.00', '0.00', '5120.00', 'on_delivery', 'paid', 'Cash on Delivery', 0, '[{\"sku\":\"P021\",\"title\":\"Amida Thermal POS Receipt Printer AK-80250 High Speed\",\"qty\":80,\"price\":32.5},{\"sku\":\"P007\",\"title\":\"CF259A CF276A CF258A Amida Toner Cartridge\",\"qty\":300,\"price\":4.8}]', 'Express air freight dispatched via DHL Global.', '2026-11-13 04:30:36', '2026-11-13 04:30:36'),
(4, '20270120-14201199', 'Dhaka Tech & Paper Mart', 'info@dhakatechmart.bd', '+880 1711 000000', '12 Elephant Road, Computer City Center, Dhaka 1205, Bangladesh', NULL, '0.00', '0.00', '1850.00', 'delivered', 'paid', 'Cash on Delivery', 0, '[{\"sku\":\"P005\",\"title\":\"85A 78A 88A 35A 36A 12A Amida Toner Cartridge\",\"qty\":400,\"price\":3.2},{\"sku\":\"P020\",\"title\":\"Amida A4 Monochrome Laser Desktop Printer AM-2200\",\"qty\":10,\"price\":57}]', 'Chittagong port customs cleared. Delivered successfully.', '2026-11-13 04:30:36', '2026-11-13 04:30:36'),
(5, '20270122-16450012', 'Tokyo Office Consumables KK', 'import@tokyo-imaging.jp', '+81 3 5555 1234', 'Minato-ku, Shinagawa 3-12-1, Tokyo, Japan', NULL, '0.00', '0.00', '4200.00', 'pending', 'unpaid', 'Cash on Delivery', 0, '[{\"sku\":\"P012\",\"title\":\"Amida Toner 659A W2010A Compatible Color Set\",\"qty\":60,\"price\":42},{\"sku\":\"P022\",\"title\":\"Amida Universal 1000g Bulk Toner Powder Bottle\",\"qty\":400,\"price\":3.8}]', 'Waiting for LC bank confirmation.', '2026-11-13 04:30:36', '2026-11-13 04:30:36'),
(6, '20270124-18105574', 'Sao Paulo Cartridge Hub', 'compras@saopaulotoner.br', '+55 11 3456 7890', 'Av. Paulista 1000, Bela Vista, Sao Paulo, Brazil', NULL, '0.00', '0.00', '2900.00', 'cancelled', 'unpaid', 'Cash on Delivery', 0, '[{\"sku\":\"P009\",\"title\":\"Brother Toner Cartridge TN760 TN2445 Wholesale\",\"qty\":400,\"price\":3.5}]', 'Customer requested cancellation due to import license renewal delay.', '2026-11-13 04:30:36', '2026-11-13 04:30:36'),
(7, 'INC-20270125-01', 'Rashid Electronics', 'rashid@rashidelectronics.com', '+880 1819 123456', 'Agrabad C/A, Chittagong, Bangladesh', NULL, '0.00', '0.00', '1450.00', 'pending', 'unpaid', 'Cash on Delivery', 1, '[{\"sku\":\"P006\",\"title\":\"CF283A Compatible for HP LaserJet Pro M127fn\",\"qty\":200,\"price\":3.4},{\"sku\":\"P021\",\"title\":\"Thermal Receipt Printer 80mm POS AK-80250\",\"qty\":15,\"price\":33}]', 'Customer added items to cart, entered email and phone, but paused before payment verification.', '2026-11-13 04:30:36', '2026-11-13 04:30:36'),
(8, 'INC-20270125-02', 'Delta Tech Distribution', 'orders@deltatech-me.com', '+966 11 456 7890', 'King Fahd Road, Riyadh, Saudi Arabia', NULL, '0.00', '0.00', '3200.00', 'pending', 'unpaid', 'Cash on Delivery', 1, '[{\"sku\":\"P001\",\"title\":\"Patent Gear Toner TN770 for Brother\",\"qty\":250,\"price\":4.2},{\"sku\":\"P019\",\"title\":\"Universal 1000ml Refill Ink\",\"qty\":500,\"price\":1.95}]', 'Awaiting corporate credit terms approval.', '2026-11-13 04:30:36', '2026-11-13 04:30:36'),
(9, 'ORD-20261113-IREPU', 'David Miller', 'david.miller@guestcorp.com', '+1 555 432 1098', 'Port of Vancouver, Berth 4, BC, Canada', NULL, '0.00', '0.00', '3.83', 'pending', 'unpaid', 'Cash on Delivery', 0, '[{\"title\":\"Amida Patent Gear Toner Cartridge TN770 Compatible for Brother Printer\",\"sku\":\"P001\",\"price\":3.83,\"quantity\":1,\"image\":\".\\/images\\/products\\/P001.png\"}]', 'Payment Method: T/T Wire Transfer (30% deposit). ', '2026-11-13 06:23:51', '2026-11-13 06:23:51'),
(10, 'ORD-20261120-GJJRV', 'Tomal Krishna Howlader', 'tomalit.bd@gmail.com', '+8801720331586', 'Home-288/Baksatra, Kaodiya, Saver', NULL, '0.00', '0.00', '4.41', 'pending', 'unpaid', 'Cash on Delivery', 0, '[{\"title\":\"CF259A CF276A CF258A CF228A CF280A Amida Toner Cartridge (59A 76A 58A 28A 80A)\",\"sku\":\"P007\",\"price\":4.41,\"quantity\":1,\"image\":\".\\/images\\/products\\/P007.jpg\"}]', 'Payment Method: T/T Wire Transfer (30% deposit). ', '2026-11-20 14:33:59', '2026-11-20 14:33:59'),
(12, 'ORD-20261120-KPZ5U', 'Tomal Krishna Howlader', 'tomalit.bd@gmail.com', '+8801720331586', 'Home-288/Baksatra, Kaodiya, Saver', 'outside_city', '120.00', '102.60', '222.60', 'pending', 'unpaid', 'Cash on Delivery', 0, '[{\"title\":\"CF259A CF276A CF258A CF228A CF280A Amida Toner Cartridge (59A 76A 58A 28A 80A)\",\"sku\":\"P007\",\"price\":5.13,\"quantity\":20,\"image\":\".\\/images\\/products\\/P007.jpg\"}]', '', '2026-11-20 15:06:24', '2026-11-20 15:06:24'),
(13, 'ORD-20261120-MEFJY', 'Tomal Krishna Howlader', 'tomalit.bd@gmail.com', '+8801720331586', 'Home-288/Baksatra, Kaodiya, Saver', 'inside_city', '60.00', '102.60', '162.60', 'pending', 'unpaid', 'Cash on Delivery', 0, '[{\"title\":\"CF259A CF276A CF258A CF228A CF280A Amida Toner Cartridge (59A 76A 58A 28A 80A)\",\"sku\":\"P007\",\"price\":5.13,\"quantity\":20,\"image\":\".\\/images\\/products\\/P007.jpg\"}]', '', '2026-11-20 15:07:07', '2026-11-20 15:07:07'),
(14, 'ORD-20261120-CJH0K', 'Tomal Krishna Howlader', 'tomalit.bd@gmail.com', '+8801720331586', 'Home-288/Baksatra, Kaodiya, Saver', 'inside_city', '60.00', '205.20', '265.20', 'pending', 'unpaid', 'Cash on Delivery', 0, '[{\"title\":\"CF259A CF276A CF258A CF228A CF280A Amida Toner Cartridge (59A 76A 58A 28A 80A)\",\"sku\":\"P007\",\"price\":5.13,\"quantity\":40,\"image\":\".\\/images\\/products\\/P007.jpg\"}]', '', '2026-11-20 15:24:02', '2026-11-20 15:24:02');

-- ------------------------------------------------------------
-- Table structure for `password_reset_tokens`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `products`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `sku` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `sub_category` varchar(255) DEFAULT NULL,
  `price_mode` varchar(255) NOT NULL DEFAULT 'single',
  `single_price` decimal(10,2) DEFAULT NULL,
  `tiered_prices` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tiered_prices`)),
  `compatible_printers` text DEFAULT NULL,
  `price_min` decimal(8,2) NOT NULL,
  `price_max` decimal(8,2) NOT NULL,
  `moq` varchar(255) NOT NULL DEFAULT '20 Pieces',
  `sold` varchar(255) NOT NULL DEFAULT '1,000+ sold',
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `description` longtext DEFAULT NULL,
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `image` varchar(255) NOT NULL,
  `gallery_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery_images`)),
  `detail_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detail_images`)),
  `promo_discount` int(11) NOT NULL DEFAULT 0,
  `is_top_pick` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_sku_unique` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `products` (78 rows)
INSERT INTO `products` (`id`, `sku`, `title`, `category`, `sub_category`, `price_mode`, `single_price`, `tiered_prices`, `compatible_printers`, `price_min`, `price_max`, `moq`, `sold`, `tags`, `description`, `specifications`, `image`, `gallery_images`, `detail_images`, `promo_discount`, `is_top_pick`, `created_at`, `updated_at`) VALUES 
(1, 'P001', 'Amida Patent Gear Toner Cartridge TN770 Compatible for Brother Printer', 'Patent Gear Products', 'for Brother', 'single', NULL, NULL, 'Brother HL-L2350DW, HL-L2370DW, HL-L2370DWXL, HL-L2390DW, HL-L2395DW, DCP-L2550DW, MFC-L2710DW, MFC-L2730DW, MFC-L2750DW, MFC-L2750DWXL', '3.83', '4.99', '20 Pieces', '4,280+ sold', '[\"Certified\",\"Main Product\"]', NULL, NULL, './images/products/P001.png', NULL, NULL, 10, 1, '2026-11-12 14:44:03', '2026-11-15 03:11:19'),
(2, 'P002', 'Amida Patent Gear Toner Cartridge CF217A Compatible for HP Pro M130fn M102w', 'Patent Gear Products', 'for HP', 'single', NULL, NULL, 'HP LaserJet Pro M102a, M102w, LaserJet Pro MFP M130a, M130fn, M130fw, M130nw', '2.64', '3.69', '20 Pieces', '3,910+ sold', '[\"Certified\",\"Patent\"]', NULL, NULL, './images/products/P002.png', NULL, NULL, 11, 1, '2026-11-12 14:44:03', '2026-11-15 03:11:19'),
(3, 'P003', 'Amida Patent Gear Toner Cartridge CE255A Compatible for HP P3010 / 3015', 'Patent Gear Products', 'for HP', 'single', NULL, NULL, 'HP LaserJet Enterprise P3010, P3015, P3015d, P3015dn, P3015x, Enterprise 500 MFP M525dn, M525f, Flow M525c, LaserJet Pro M521dn, M521dw MFP', '8.35', '9.59', '20 Pieces', '2,150+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P003.png', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:19'),
(4, 'P004', 'Amida Patent Gear Toner Cartridge CF400A Compatible for HP PRO M252 / M277', 'Patent Gear Products', 'for HP', 'single', NULL, NULL, 'HP Color LaserJet Pro M252dw, M252n, Color LaserJet Pro MFP M277dw, M277n, M277c6, M274n', '4.96', '5.75', '20 Pieces', '1,840+ sold', '[\"Main Product\"]', NULL, NULL, './images/products/P004.png', NULL, NULL, 10, 1, '2026-11-12 14:44:03', '2026-11-15 03:11:19'),
(5, 'P005', '85A 78A 88A 35A 36A 12A 79A 44A 48A 83A 49A 53A Amida Toner Cartridge', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet P1102, P1102w, P1005, P1006, P1505, P1566, P1606dn, M1120, M1132, M1212nf, M1217nfw, M125a, M127fn, M12a, M26a, Canon LBP 6000, 6030, 6200', '1.00', '3.75', '20 Pieces', '18,500+ sold', '[\"Certified\",\"Hot Seller\"]', NULL, NULL, './images/products/P005.jpg', NULL, NULL, 12, 1, '2026-11-12 14:44:03', '2026-11-15 03:11:19'),
(6, 'P006', 'Amida Laser Toner Cartridge CF283A Compatible for HP PRO MFP M125 / 127FN / 202DW', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet Pro MFP M125a, M125nw, M125rnw, M127fn, M127fp, M127fw, LaserJet Pro M201dw, M201n, LaserJet Pro MFP M225dn, M225dw', '3.38', '3.88', '20 Pieces', '14,200+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P006.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:19'),
(7, 'P007', 'CF259A CF276A CF258A CF228A CF280A Amida Toner Cartridge (59A 76A 58A 28A 80A)', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet Pro M404n, M404dn, M404dw, LaserJet Pro MFP M428dw, M428fdn, M428fdw, M402d, M402n, M402dn, M402dw, MFP M426fdn, M426fdw', '4.41', '5.13', '20 Pieces', '5,620+ sold', '[\"Main Product\"]', NULL, NULL, './images/products/P007.jpg', NULL, NULL, 10, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:19'),
(8, 'P008', 'Amida Toner W1510A W1510X 151A 151X Compatible Cartridges for HP Pro 4003', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet Pro 4003dn, 4003dw, 4003n, LaserJet Pro MFP 4103dw, 4103fdn, 4103fdw', '5.25', '8.09', '500 Pieces', '2,980+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P008.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:19'),
(9, 'P009', 'Brother Toner Cartridge TN760 TN2445 TN2450 TN2420 TN2485 Wholesale', 'Monochrome Cartridges', 'for Brother', 'single', NULL, NULL, 'Brother HL-L2350DW, HL-L2370DW, HL-L2390DW, HL-L2395DW, DCP-L2550DW, MFC-L2710DW, MFC-L2730DW, MFC-L2750DW', '2.77', '3.99', '20 Pieces', '6,400+ sold', '[\"Certified\",\"Hot Seller\"]', NULL, NULL, './images/products/P009.jpg', NULL, NULL, 10, 1, '2026-11-12 14:44:03', '2026-11-15 03:11:19'),
(10, 'P010', 'Amida TN1000 TN1035 TN660 TN450 TN2280 TN760 Compatible Toner for Brother', 'Monochrome Cartridges', 'for Brother', 'single', NULL, NULL, 'Brother HL-1110, HL-1210W, DCP-1510, MFC-1810, HL-2240, HL-2270DW, HL-L2320D, HL-L2340DW, MFC-7360N, MFC-L2700DW', '1.88', '3.21', '20 Pieces', '8,120+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P010.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:19'),
(11, 'P023', 'Amida Factory 85A 78A 88A 35A 36A 12A 79A 44A 48A 83A Toner Cartridge', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet P1102, P1102w, P1566, P1606dn, M1132, M1212nf, M125a, M127fn, Canon LBP 6000, 6030, 6200', '1.00', '3.50', '20 Pieces', '9,400+ sold', '[\"Factory Direct\"]', NULL, NULL, './images/products/P023.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:19'),
(12, 'P024', 'Amida 85A 78A 79A 44A 48A 83A 88A 35A 36A 12A 83X 49A 53A Toner Cartridge', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet P1005, P1006, P1102, P1505, P1566, P1606dn, M1120, M1132, M1212nf, M1217nfw, Canon imageCLASS LBP6000, MF3010', '2.67', '4.32', '20 Pieces', '7,100+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P024.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:19'),
(13, 'P011', 'Amida Compatible Toner for HP 125A 126A 130A 131A 201A 203A 304A 305A 410A', 'Color Cartridges', 'for HP', 'single', NULL, NULL, 'HP Color LaserJet Pro CP1025, CP1025nw, M175a, M175nw, M275, M251n, M276nw, M252dw, M277dw, M452dn, M477fdw', '2.58', '6.99', '20 Pieces', '6,110+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P011.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(14, 'P012', 'Amida Toner 659A W2010A W2011A W2012A W2013A Compatible Cartridges for HP', 'Color Cartridges', 'for HP', 'single', NULL, NULL, 'HP Color LaserJet Enterprise M776dn, M776z, Flow M776zs, Color LaserJet Enterprise M856dn, M856x', '41.39', '44.99', '20 Pieces', '720+ sold', '[\"Certified\",\"Main Product\"]', NULL, NULL, './images/products/P012.jpg', NULL, NULL, 11, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(15, 'P013', 'Amida Color Compatible Toner Cartridge CLT-K405S for SAMSUNG SL-C420 / 422 / 423', 'Color Cartridges', 'for Samsung', 'single', NULL, NULL, 'Samsung Xpress SL-C420, SL-C422, SL-C423, SL-C470, SL-C472, SL-C473, CLP-360, CLP-365, CLX-3300, CLX-3305, CLX-3305FW', '4.28', '5.12', '20 Pieces', '2,150+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P013.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(16, 'P014', 'Amida Toner CRG069 CRG069H Compatible Cartridges for Canon i-SENSYS LBP673 / MF750', 'Color Cartridges', 'for Canon', 'single', NULL, NULL, 'Canon i-SENSYS LBP673Cdw, MF752Cdw, MF754Cdw, Color imageCLASS LBP674Cdw, MF753Cdw, MF751Cdw', '7.55', '10.79', '20 Pieces', '1,890+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P014.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(17, 'P015', 'Amida Premium Toner Cartridge W2120A 212A Compatible for Color LJ Enterprise M554dn', 'Color Cartridges', 'for HP', 'single', NULL, NULL, 'HP Color LaserJet Enterprise M554dn, M555dn, M555x, Color LaserJet Enterprise MFP M578dn, M578f, Flow M578c', '13.89', '20.59', '20 Pieces', '980+ sold', '[\"Main Product\"]', NULL, NULL, './images/products/P015.jpg', NULL, NULL, 10, 1, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(18, 'P016', 'Amida Toner TN227 TN237 TN277 Compatible Color Cartridge Set for Brother', 'Color Cartridges', 'for Brother', 'single', NULL, NULL, 'Brother HL-L3210CW, HL-L3230CDW, HL-L3270CDW, HL-L3290CDW, DCP-L3510CDW, DCP-L3550CDW, MFC-L3710CW, MFC-L3750CDW, MFC-L3770CDW', '3.52', '4.18', '20 Pieces', '3,450+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P016.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(19, 'P025', 'Amida Toner New Arrival W2200A W2200X 220A 220X Without Chip', 'Color Cartridges', 'for HP', 'single', NULL, NULL, 'HP Color LaserJet Pro 4201dn, 4201dw, Color LaserJet Pro MFP 4301fdn, 4301fdw', '7.70', '10.99', '20 Pieces', '1,230+ sold', '[\"New Arrival\"]', NULL, NULL, './images/products/P025.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(20, 'P017', 'Amida Inks 67XL / 305XL Remanufactured DeskJet OfficeJet Color Inkjet for HP', 'Inks & Inkjets', 'for HP', 'single', NULL, NULL, 'HP DeskJet 1255, 2710, 2720, 2722, 2755, 4155, DeskJet Plus 4122, Envy 6055, 6075, Envy Pro 6455', '9.38', '10.39', '20 Pieces', '9,300+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P017.png', NULL, NULL, 10, 1, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(21, 'P026', 'Amida Inks 305XL 305 XL Remanufactured Compatible Deskjet OfficeJet for HP', 'Inks & Inkjets', 'for HP', 'single', NULL, NULL, 'HP DeskJet 2320, 2710, 2720, 2722, DeskJet Plus 4120, 4130, Envy 6020, 6030, Envy Pro 6420, 6430', '9.38', '10.38', '20 Pieces', '6,400+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P026.png', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(22, 'P018', 'Amida Ink Wholesale T9741 T9742 T9743 T9744 Premium Compatible for Epson', 'Inks & Inkjets', 'for Epson', 'single', NULL, NULL, 'Epson WorkForce Pro WF-C869R, WF-C869RD3TWFC, WF-C869RDTWF, WF-C869RDWF', '36.55', '47.99', '20 Pieces', '1,120+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P018.png', NULL, NULL, 10, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(23, 'P027', 'Amida Inks 63XL 63 XL Remanufactured Compatible Inkjet for HP', 'Inks & Inkjets', 'for HP', 'single', NULL, NULL, 'HP DeskJet 1112, 2130, 3630, Envy 4520, OfficeJet 3830, 4650, 5255, 5258', '7.54', '8.60', '20 Pieces', '4,500+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P027.png', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(24, 'P028', 'Amida Ink Wholesale T9481 T9482 T9483 T9484 Premium Compatible for Epson', 'Inks & Inkjets', 'for Epson', 'single', NULL, NULL, 'Epson WorkForce Pro WF-C878R, WF-C879R, WF-C878RD3TWFC, WF-C878RDTWFC', '4.86', '5.99', '20 Pieces', '3,100+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P028.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(25, 'P029', 'Amida Inks 65XL 65 XL Remanufactured Compatible Inkjet for HP', 'Inks & Inkjets', 'for HP', 'single', NULL, NULL, 'HP DeskJet 2622, 2624, 2635, 3720, 3722, 3752, 3755, AMP 100, 120, 125, 130', '7.54', '8.69', '20 Pieces', '3,800+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P029.png', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(26, 'P030', 'Amida Re-Manufactured Ink Cartridge 953 953XL for OfficeJet Pro 7740/8210/8710', 'Inks & Inkjets', 'for HP', 'single', NULL, NULL, 'HP OfficeJet Pro 7720, 7730, 7740 Wide Format, OfficeJet Pro 8210, 8216, 8710, 8715, 8720, 8725, 8730, 8740', '2.66', '3.99', '20 Pieces', '5,200+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P030.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(27, 'P031', 'Amida Toner 975X 972X 913X 974X Premium Compatible Ink Cartridge for HP PageWide', 'Inks & Inkjets', 'for HP', 'single', NULL, NULL, 'HP PageWide Pro 452dn, 452dw, PageWide Pro MFP 477dn, 477dw, PageWide Pro 552dw, MFP 577dw, 577z', '13.54', '16.99', '20 Pieces', '1,400+ sold', '[\"Main Product\"]', NULL, NULL, './images/products/P031.png', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(28, 'P019', 'Amida Universal 1000ml Bulk Dye & Pigment Refill Ink for Epson / Canon / HP', 'Bulk Inks', 'Bulk Ink', 'single', NULL, NULL, 'Universal CISS & Tank Printers: Epson EcoTank L1110/L3110/L3150/L4150/L6160, Canon MegaTank G1010/G2010/G3010/G4010, HP Smart Tank 500/515/615, Brother DCP-T310/T510W/T710W', '1.62', '2.09', '20 Bottles', '11,400+ sold', '[\"Best Seller\"]', NULL, NULL, './images/products/P019.png', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(29, 'P032', 'Amida Ink GI-190 290 390 490 590 690 790 890 990 Refill Ink for Canon G Series', 'Bulk Inks', 'for Canon', 'single', NULL, NULL, 'Canon Pixma G1000, G1100, G1200, G1400, G2000, G2100, G2400, G3000, G3100, G3400, G4000, G4200, G1010, G2010, G3010, G4010 MegaTank', '0.48', '0.99', '20 Bottles', '8,900+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P032.png', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(30, 'P033', 'Amida Inks 500ML Universal Ink Compatible for Canon/Epson/Brother/HP/Lexmark', 'Bulk Inks', 'Bulk Ink', 'single', NULL, NULL, 'Universal 500ml Bottled Ink: Compatible with Canon Pixma/MegaTank, Epson EcoTank/WorkForce, Brother InkBenefit, HP Smart Tank & DeskJet CISS', '0.96', '1.49', '20 Bottles', '7,200+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P033.png', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(31, 'P034', 'Amida Ink 673 EP673 T673 Refill Compatible for Epson L800/L805/L850', 'Bulk Inks', 'for Epson', 'single', NULL, NULL, 'Epson EcoTank & WorkForce Sublimation Series: L130, L310, L800, L805, L850, L1300, L1800, ET-2720, ET-2750, WF-7710, WF-7720, F170, F570', '0.48', '0.99', '20 Bottles', '6,300+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P034.png', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(32, 'P035', 'Amida Water Based Ink Color Refill Inkjet Ink BT6000 BT5000 for Brother DCP-T300', 'Bulk Inks', 'for Brother', 'single', NULL, NULL, 'Epson EcoTank Maintenance Box: L4150, L4160, L6160, L6170, L6190, ET-2700, ET-2750, ET-3700, ET-3750, ET-4750, M1140, M1180, M2140, M3170', '0.78', '0.83', '20 Bottles', '5,400+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P035.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(33, 'P036', 'Amida Compatible GT52 GT51 GT53 Ink Refills for HP Smart Tank 515/519/615', 'Bulk Inks', 'for HP', 'single', NULL, NULL, 'HP Smart Tank 500, 515, 530, 615, HP Ink Tank 115, 315, 319, 415, 419, HP DeskJet GT5810, GT5820', '0.48', '0.99', '20 Bottles', '9,100+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P036.png', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(34, 'P037', 'Amida Ink 502 Pigment Compatible for Epson WorkForce ET4750/ET3750/ST3000', 'Bulk Inks', 'for Epson', 'single', NULL, NULL, 'Epson EcoTank L1110, L3100, L3110, L3150, L3156, L3160, L5190, EcoTank ET-2710, ET-2720, ET-4700', '0.48', '0.99', '20 Bottles', '4,200+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P037.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:03', '2026-11-15 03:11:20'),
(35, 'P038', 'Amida Ink Compatible for Canon PIXMA G3963/G3960/G2960/G1920 GI-91', 'Bulk Inks', 'for Canon', 'single', NULL, NULL, 'Epson 6-Color Photo Printers: EcoTank L800, L805, L810, L850, L1800 Photo Desktop & A3 Format Printers', '0.44', '0.99', '20 Bottles', '3,900+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P038.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(36, 'P039', 'Amida Wholesale Toner Powder CE285A Compatible for HP Printer', 'Toner Powder', 'for HP', 'single', NULL, NULL, 'HP LaserJet P1005, P1006, P1102, P1102w, P1505, M1120, M1132, M1212nf, Canon LBP 6000, 6030, MF3010', '0.89', '8.89', '20 Bags', '7,800+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P039.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(37, 'P040', 'Amida Wholesale Toner Powder Q2612A Compatible for HP Printer', 'Toner Powder', 'for HP', 'single', NULL, NULL, 'HP LaserJet 1010, 1012, 1015, 1018, 1020, 1022, 3015, 3020, 3030, 3050, 3052, 3055, M1005, M1319f, Canon LBP 2900, 3000', '0.90', '8.99', '20 Bags', '6,500+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P040.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(38, 'P041', 'Amida Toner TK3060 Cartridge Compatible for Kyocera Printer Toner Powder', 'Toner Powder', 'for Kyocera', 'single', NULL, NULL, 'Kyocera ECOSYS M3040dn, M3040idn, M3540dn, M3540idn, FS-2100D, FS-2100DN, FS-4100DN, FS-4200DN, FS-4300DN', '11.90', '12.99', '20 Bags', '1,900+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P041.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(39, 'P042', 'Amida Wholesale Toner Powder SAMSUNG Universal Compatible', 'Toner Powder', 'for Samsung', 'single', NULL, NULL, 'Samsung ML-1610, ML-1640, ML-2010, ML-2160, ML-2165, SCX-3200, SCX-3400, SCX-4300, SCX-4521F, Xpress M2020, M2070', '0.90', '8.99', '20 Bags', '4,100+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P042.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(40, 'P043', 'Amida Wholesale Toner Powder HP Universal Compatible', 'Toner Powder', 'for HP', 'single', NULL, NULL, 'Universal HP Monochrome Series: LaserJet 1020, P1102, P1566, P1606, P2035, P2055, Pro M402, M404, M428, Enterprise P3015, M506', '0.90', '8.91', '20 Bags', '12,000+ sold', '[\"Best Seller\"]', NULL, NULL, './images/products/P043.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(41, 'P044', 'Amida Cartridges CE250A Color Toner Powder Compatible', 'Toner Powder', 'for HP', 'single', NULL, NULL, 'HP Color LaserJet CP3525, CP3525n, CP3525dn, CM3530, CM3530fs MFP, Enterprise 500 Color M551, M575 MFP', '14.26', '15.29', '20 Bags', '1,300+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P044.png', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(42, 'P045', 'Amida Toner Powder 5500 Long Life and High-Performance', 'Toner Powder', 'for HP', 'single', NULL, NULL, 'HP LaserJet 5500, 5550, 4200, 4300, 4250, 4350, 9000, 9040, 9050 High-Yield Workgroup Printers', '0.90', '1.80', '20 Bags', '5,600+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P045.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(43, 'P046', 'Amida Compatible Universal Bottle Toner 88A 278A 285A 435A 436A', 'Toner Powder', 'for HP', 'single', NULL, NULL, 'HP LaserJet P1005, P1102, P1505, P1566, P1606, Canon LBP 6000, 6030, 6200, 6230 Universal Refill', '0.90', '7.99', '20 Bottles', '8,400+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P046.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(44, 'P020', 'Amida LaserJet AK-1102 A4 Black Laser Printer Office Home Laser Printer', 'Printers', 'Laser Printers', 'single', NULL, NULL, 'Supports: Windows 11 / 10 / 8.1 / 7, macOS 10.14 - 14.x, Ubuntu / Debian Linux, ChromeOS, High-Speed USB 2.0 Direct Connect', '115.00', '130.00', '2 Units', '2,410+ sold', '[\"Certified\",\"Main Product\"]', NULL, NULL, './images/products/P020.png', NULL, NULL, 11, 1, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(45, 'P021', 'Amida LaserJet AK-1105NW A4 Black Laser Multi-Function Printer', 'Printers', 'Laser Printers', 'single', NULL, NULL, 'Supports: Windows 11 / 10 / 8 / 7, macOS, Linux, iOS AirPrint, Android Mopria, 10/100M Ethernet LAN & Wireless 802.11 b/g/n', '150.00', '175.00', '2 Units', '840+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P021.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(46, 'P047', 'Amida LaserJet AK-1105 A4 Black Laser Multi Function Printer', 'Printers', 'Laser Printers', 'single', NULL, NULL, 'Supports: Windows 11 / 10 / 8 / 7, macOS, Linux, USB 2.0 Interface for Standard Office & Home Workstations', '143.00', '158.00', '2 Units', '620+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P047.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(47, 'P048', 'Amida LaserJet AK-1102NW A4 Black Laser Printer with WiFi', 'Printers', 'Laser Printers', 'single', NULL, NULL, 'Supports: Windows 11 / 10 / 8.1 / 7, macOS, Linux, Dual-Band WiFi (2.4GHz) & USB 2.0 Mobile Printing Ready', '122.00', '138.00', '2 Units', '1,150+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P048.png', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(48, 'P049', 'Amida Laser Printer AK-2361NDW Automatic Double Sided 36ppm', 'Printers', 'Laser Printers', 'single', NULL, NULL, 'Supports: Windows Server 2016-2022, Windows 11/10/8, macOS, Linux CUPS, Gigabit LAN, Automatic Duplex Printing', '180.00', '198.00', '2 Units', '490+ sold', '[\"Main Product\"]', NULL, NULL, './images/products/P049.png', NULL, NULL, 10, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(49, 'P050', 'Amida Laser Printer AK-2261NDW Automatic Double Sided 26ppm', 'Printers', 'Laser Printers', 'single', NULL, NULL, 'Supports: Windows 11 / 10 / 8, macOS, Linux, Automatic 2-Sided Duplex, High-Speed USB & Ethernet Connectivity', '138.00', '155.00', '2 Units', '530+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P050.png', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(50, 'P051', 'Amida Laser Printer AK-2401NDW Automatic Double Sided 40ppm', 'Printers', 'Laser Printers', 'single', NULL, NULL, 'Supports: Enterprise Windows 11 / Server, macOS, Linux, Network Gigabit RJ-45, USB 2.0, Heavy-Duty 40ppm Workgroup Engine', '195.00', '210.00', '2 Units', '410+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P051.png', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(51, 'P052', 'Amida Laser Printer AK-2401D Automatic Double Sided 40ppm', 'Printers', 'Laser Printers', 'single', NULL, NULL, 'Supports: Windows 11 / 10 / 8 / 7, macOS, Linux, Heavy Duty Office Workstation Auto-Duplex High-Speed Printing', '188.00', '205.00', '2 Units', '380+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P052.png', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(60, 'P060', 'Amida MPC3503 Compatible Color Toner Cartridge for Ricoh MP C3003sp C3503sp Printer', 'Color Cartridges', 'for Ricoh', 'single', NULL, NULL, 'Ricoh Aficio MP C3003, MP C3003SP, MP C3503, MP C3503SP, MP C3503ZSP Multifunction Copier System', '18.00', '24.00', '20 Pieces', '1,450+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P060.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(61, 'P061', 'Amida Color Toner W2070A W2071A W2072A W2073A 117A Compatible for HP Color LJ Pro 150A/178', 'Color Cartridges', 'for HP', 'single', NULL, NULL, 'HP Color Laser 150a, 150nw, HP Color Laser MFP 178nw, 178nwg, 179fnw, 179fwg', '4.22', '4.99', '20 Pieces', '3,800+ sold', '[\"Certified\",\"Hot Seller\"]', NULL, NULL, './images/products/P061.jpg', NULL, NULL, 10, 1, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(62, 'P062', 'Amida New Arrive 150A Compatible LaserJet Printer W1500A Toner Cartridge', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet M111a, M111w, LaserJet MFP M141a, M141w', '2.98', '4.44', '500 Pieces', '4,100+ sold', '[\"New Arrival\"]', NULL, NULL, './images/products/P062.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:19'),
(63, 'P063', 'Amida Toner 116A W2060A W2061A W2062A W2063A Compatible for HP Printer Toner Cartridge', 'Color Cartridges', 'for HP', 'single', NULL, NULL, 'HP Color Laser 150a, 150nw, HP Color Laser MFP 178nw, 179fnw', '4.22', '4.99', '20 Pieces', '2,900+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P063.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(64, 'P064', 'Amida Wholesale Toner 87X 87XL Compatible Cartridges for HP Printer CF287X Toner Cartridge', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet Enterprise M506n, M506dn, M506x, Enterprise MFP M527dn, M527f, LaserJet Pro M501dn, M501n', '10.99', '12.99', '20 Pieces', '2,200+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P064.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:19'),
(65, 'P065', 'Amida Toner W1110A 110A Compatible Cartridge for HP Printer Toner Cartridges', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP Laser 108a, 108w, HP Laser MFP 136a, 136w, 136nw, 138fnw, 138p, 138pnw', '4.05', '5.39', '20 Pieces', '3,300+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P065.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:19'),
(66, 'P066', 'Amida Printer 80mm POS System for Retail Shop AK302 AK303 AK306 Thermal Receipt Printer', 'Thermal Printers', 'POS Hardware', 'single', NULL, NULL, 'ESC/POS Compatible: Windows 11/10/8/7/XP, Android POS Devices, Linux, macOS, OPOS, Cash Drawer RJ11 Port, 80mm Receipt Printing', '30.15', '31.05', '24 Pieces', '2,800+ sold', '[\"Certified\",\"Main Product\"]', NULL, NULL, './images/products/P066.jpg', NULL, NULL, 11, 1, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(67, 'P067', '85A 78A 88A 35A 36A 12A 79A 44A 48A 83A 105A 106A 107A Compatible Laser Toner Cartridge', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet Pro P1102, P1102w, P1566, P1606dn, M1132, M1212nf, M125a, M127fn, HP Laser 107a, 107w, MFP 135a, 135w, Canon LBP 2900, 3000, 6000', '2.99', '8.99', '20 Pieces', '15,400+ sold', '[\"Hot Seller\"]', NULL, NULL, './images/products/P067.jpg', NULL, NULL, 10, 1, '2026-11-12 14:44:04', '2026-11-15 03:11:19'),
(68, 'P068', 'Amida 85A 78A 88A 35A 36A 12A 79A 44A 48A 83A 83X 49A 53A Toner Cartridge', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet P1005, P1006, P1102, P1102w, P1505, P1566, P1606dn, M1120, M1132, M1212nf, M125a, M127fn, Canon LBP6030, MF3010', '1.00', '4.85', '20 Pieces', '11,200+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P068.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:19'),
(69, 'P069', 'Amida Toner Cartridge W1105A 105A Compatible for Laser MFP 135a Printer', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP Laser 107a, 107w, 107r, HP Laser MFP 135a, 135w, 135r, MFP 137fnw', '4.50', '5.50', '20 Pieces', '4,700+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P069.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:19'),
(70, 'P070', 'Amida Premium Toner Compatible CF232A 32A Drum Unit for HP Printer', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet Pro M203d, M203dn, M203dw, LaserJet Pro MFP M227d, M227fdn, M227fdw, M227sdn', '2.99', '3.89', '20 Pieces', '5,100+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P070.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:19'),
(71, 'P071', 'Amida Toner CF230A New Compatible Cartridges for HP Printer 230A 230X', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet Pro M203d, M203dn, M203dw, LaserJet Pro MFP M227fdn, M227fdw, M227sdn', '1.99', '3.99', '20 Pieces', '6,200+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P071.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:19'),
(72, 'P072', 'Amida Toner CF230A 30A Compatible Cartridge for HP Printer Toner Cartridges', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet Pro M203d, M203dn, M203dw, LaserJet Pro MFP M227d, M227fdn, M227fdw, M227sdn', '1.99', '2.99', '20 Pieces', '7,300+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P072.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:19'),
(73, 'P073', 'Amida CF230A CF230X CF230XL CF230XXL Compatible for HP 30A Toner Cartridge', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet Pro M203d, M203dn, M203dw, LaserJet Pro MFP M227fdn, M227fdw, M227sdn', '1.99', '3.99', '20 Pieces', '5,800+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P073.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:19'),
(74, 'P074', 'Amida Toner CF230A CF230X CF230XL CF230XXL Compatible for HP Printer', 'Monochrome Cartridges', 'for HP', 'single', NULL, NULL, 'HP LaserJet Pro M203d, M203dn, M203dw, LaserJet Pro MFP M227d, M227fdn, M227fdw', '1.99', '3.99', '20 Pieces', '4,900+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P074.jpg', NULL, NULL, 0, 0, '2026-11-12 14:44:04', '2026-11-15 03:11:20'),
(75, 'P075', 'Amida POS Thermal Paper Roll - 2-1/4\" x 30\' - 30 Pack', 'Thermal Paper Rolls', '2-1/4 Inch', 'single', NULL, NULL, 'Square Terminal, Clover Flex, Verifone VX680, Ingenico ICT220, 58mm POS receipt printers', '1.25', '2.49', '10 Packs', '3,200+ sold', '[\"Certified\",\"Main Product\"]', NULL, NULL, './images/products/P075.jpg', NULL, NULL, 0, 0, '2026-11-16 11:32:11', '2026-11-16 11:32:11'),
(76, 'P076', 'Amida Thermal Paper Rolls - 3-1/8\" x 225\' - 20 Pack', 'Thermal Paper Rolls', '3-1/8 Inch', 'single', NULL, NULL, 'Epson TM-T88, Star TSP100, Bixolon SRP-350, Munbyn, Amida AK-80250 80mm POS receipt printers', '2.99', '4.85', '10 Packs', '5,400+ sold', '[\"Certified\",\"Best Seller\"]', NULL, NULL, './images/products/P076.jpg', NULL, NULL, 0, 0, '2026-11-16 11:32:11', '2026-11-16 11:32:11'),
(77, 'P077', 'Amida Thermal Paper Rolls - 2-1/4\" x 60\' - 35 Pack', 'Thermal Paper Rolls', '2-1/4 Inch', 'single', NULL, NULL, 'Verifone Vx520, Ingenico ICT220/ICT250, First Data FD400, POS credit card terminals', '1.85', '2.95', '10 Packs', '2,850+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P077.jpg', NULL, NULL, 0, 0, '2026-11-16 11:32:11', '2026-11-16 11:32:11'),
(78, 'P078', 'Amida Thermal Paper Roll - 3-1/8\" x 200\' - 50 Pack (BPA Free)', 'Thermal Paper Rolls', '3-1/8 Inch', 'single', NULL, NULL, 'Epson TM-T88 series, Star Micronics, Citizen, Bixolon, Amida AK-80250 receipt printers', '1.75', '2.65', '10 Packs', '4,100+ sold', '[\"Certified\",\"BPA Free\"]', NULL, NULL, './images/products/P078.jpg', NULL, NULL, 0, 0, '2026-11-16 11:32:11', '2026-11-16 11:32:11'),
(79, 'P079', 'Amida Thermal POS Paper Roll - 2-1/4\" x 60\' - 80 Pack', 'Thermal Paper Rolls', '2-1/4 Inch', 'single', NULL, NULL, 'Standard 58mm mobile receipt printers, Bluetooth thermal printers, POS terminals', '1.45', '2.25', '10 Packs', '6,200+ sold', '[\"Certified\",\"Bulk Value\"]', NULL, NULL, './images/products/P079.jpg', NULL, NULL, 0, 0, '2026-11-16 11:32:11', '2026-11-16 11:32:11'),
(80, 'P080', 'Amida Thermal Paper Rolls - 2-1/4\" x 75\' - 12 Pack', 'Thermal Paper Rolls', '2-1/4 Inch', 'single', NULL, NULL, 'Sharp, Casio, Royal cash registers, standard 58mm POS receipt printers', '1.95', '3.15', '10 Packs', '1,980+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P080.jpg', NULL, NULL, 0, 0, '2026-11-16 11:32:11', '2026-11-16 11:32:11'),
(81, 'P081', 'Amida Thermal Paper Rolls - 3-1/8\" x 225\' - 12 Pack', 'Thermal Paper Rolls', '3-1/8 Inch', 'single', NULL, NULL, 'Epson TM-T20 / TM-T88, Star TSP143, Citizen CT-S310, Amida AK-80250', '3.25', '4.95', '10 Packs', '3,400+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P081.jpg', NULL, NULL, 0, 0, '2026-11-16 11:32:11', '2026-11-16 11:32:11'),
(82, 'P082', 'Amida Thermal Paper Rolls - 3\" x 225\' - 20 Pack', 'Thermal Paper Rolls', '3 Inch', 'single', NULL, NULL, 'Samsung / Bixolon SRP-275, Citizen CBM series, 76mm/80mm thermal printers', '2.85', '4.50', '10 Packs', '2,150+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P082.jpg', NULL, NULL, 0, 0, '2026-11-16 11:32:11', '2026-11-16 11:32:11'),
(83, 'P083', 'Amida Thermal POS Paper Roll - 2-1/4\" x 30\' - 70 Pack', 'Thermal Paper Rolls', '2-1/4 Inch', 'single', NULL, NULL, 'Handheld POS terminals, Verifone VX680, Ingenico iWL250, Pax A920', '1.15', '1.95', '10 Packs', '4,700+ sold', '[\"Certified\",\"High Demand\"]', NULL, NULL, './images/products/P083.jpg', NULL, NULL, 0, 0, '2026-11-16 11:32:11', '2026-11-16 11:32:11'),
(84, 'P084', 'Amida Thermal Paper Rolls - 2-1/4\" x 75\' - 50 Pack', 'Thermal Paper Rolls', '2-1/4 Inch', 'single', NULL, NULL, 'Sam4s, Casio, Sharp electronic cash registers, credit card receipt printers', '1.70', '2.60', '10 Packs', '3,890+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P084.jpg', NULL, NULL, 0, 0, '2026-11-16 11:32:11', '2026-11-16 11:32:11'),
(85, 'P085', 'Amida Thermal Paper Roll - 2-1/4\" x 75\' - 30 Pack', 'Thermal Paper Rolls', '2-1/4 Inch', 'single', NULL, NULL, 'Micros, Citizen, Epson, standard desktop cash register terminals', '1.80', '2.75', '10 Packs', '2,600+ sold', '[\"Certified\"]', NULL, NULL, './images/products/P085.jpg', NULL, NULL, 0, 0, '2026-11-16 11:32:11', '2026-11-16 11:32:11'),
(86, 'P086', 'Amida Thermal Paper Roll - 2-1/4\" x 60\' - 50 Pack (BPA Free)', 'Thermal Paper Rolls', '2-1/4 Inch', 'single', NULL, NULL, 'Mobile EFTPOS terminals, Verifone, Ingenico, Dejavoo, PAX wireless payment terminals', '1.35', '2.10', '10 Packs', '5,120+ sold', '[\"Certified\",\"BPA Free\"]', NULL, NULL, './images/products/P086.jpg', NULL, NULL, 0, 0, '2026-11-16 11:32:11', '2026-11-16 11:32:11');

-- ------------------------------------------------------------
-- Table structure for `sessions`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `sessions` (2 rows)
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES 
('gha4XWGlvsXFHxPDrfqif0jaPPDadhimDCgbFBBO', NULL, '::1', 'curl/8.9.1', 'eyJfdG9rZW4iOiJHWnRlSmR5R3o4ejVZZFMzWTVNMWlCVDhNTXoxYXJiVno5d0hpaG1yIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdFwvMV9Bc3lzdGVtXC9BQ01FXC90ZXN0LXVuYXV0aG9yaXplZC1wcm9iZS0yP3BhdGg9dGVzdC11bmF1dGhvcml6ZWQtcHJvYmUtMiIsInJvdXRlIjpudWxsfSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1794762578),
('TItVv5gDeXpyjIJPzXJ4qVnMiZfejBvnDqRxRx61', NULL, '::1', 'curl/8.9.1', 'eyJfdG9rZW4iOiJRSXBEaVRZbnZPbjN0eW5xR3pVSndsRUZRWkozOW13OE5hclJvUEZnIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdFwvMV9Bc3lzdGVtXC9BQ01FXC90ZXN0LXVuYXV0aG9yaXplZC1wcm9iZT9wYXRoPXRlc3QtdW5hdXRob3JpemVkLXByb2JlIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1794762550);

-- ------------------------------------------------------------
-- Table structure for `settings`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` longtext DEFAULT NULL,
  `group` varchar(255) NOT NULL DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`),
  KEY `settings_group_index` (`group`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `settings` (96 rows)
INSERT INTO `settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES 
(1, 'site_name', 'AMIDA OFFICE SUPPLIES LIMITED', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(2, 'site_tagline', 'Price Quality Service', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(3, 'site_url', 'https://www.acme-supplies.ca', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(4, 'contact_email', 'acme.info.swapan@gmail.com', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(5, 'contact_phone', '+1 604 316 8138', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(6, 'contact_hours', 'AM 9:00 - PM 22:00', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(7, 'currency', 'USD', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(8, 'timezone', 'Asia/Dhaka', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(9, 'date_format', 'Y-m-d H:i:s', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(10, 'logo_url', './images/logo.png', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(11, 'announcement_text', 'Welcome to AMIDA OFFICE SUPPLIES LIMITED • Price Quality Service', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(12, 'footer_copyright', '© 2027 Tomal Krishna Howlader. All rights reserved.', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(13, 'footer_tagline', 'Price Quality Service • 126 Main Street, Acme, AB T0M 0A0, Canada', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(14, 'facebook_url', 'https://facebook.com', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(15, 'linkedin_url', 'https://linkedin.com', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(16, 'youtube_url', 'https://youtube.com', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(17, 'smtp_enabled', '1', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(18, 'smtp_host', 'smtp.gmail.com', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(19, 'smtp_port', '587', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(20, 'smtp_encryption', 'tls', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(21, 'smtp_username', 'admin@acme.com', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(22, 'smtp_password', 'acme_app_password_2027', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(23, 'smtp_from_name', 'AMIDA OFFICE SUPPLIES LIMITED', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(24, 'smtp_from_email', 'acme.info.swapan@gmail.com', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(25, 'admin_notify_email', 'admin@acme.com', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(26, 'autoresponder_enabled', '1', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(27, 'autoresponder_subject', 'Welcome to AMIDA OFFICE SUPPLIES LIMITED - Request Received', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(28, 'autoresponder_body', 'Dear Valued Partner,\n\nThank you for reaching out to AMIDA OFFICE SUPPLIES LIMITED.\n\nOur team under the leadership of Swapan Kumar Bairagi (CEO) has received your request.\n\nCorporate Office: 126 Main Street, Acme, AB T0M 0A0, Canada\nTel: +1 604 316 8138\nWeb: www.acme-supplies.ca\n\nBest Regards,\nAMIDA OFFICE SUPPLIES LIMITED', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:07'),
(29, 'meta_title', 'AMIDA OFFICE SUPPLIES LIMITED | Price Quality Service', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(30, 'meta_description', 'AMIDA OFFICE SUPPLIES LIMITED - Direct manufacturer & supplier of compatible toner cartridges, inks, toner powder and POS thermal printers. 126 Main Street, Acme, AB T0M 0A0, Canada.', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(31, 'meta_keywords', 'toner cartridge, wholesale toner, compatible toner, HP 85A, bulk ink, thermal printer, Amida supplies, printer consumables', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(32, 'google_tag_manager_id', 'GTM-5F8K9LM', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(33, 'google_analytics_id', 'G-7X9B3M1K2P', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(34, 'google_search_console_code', 'google-site-verification=Xv8K_AcmeVerifyToken2027', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(35, 'sitemap_enabled', '1', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(36, 'robots_txt', 'User-agent: *\nAllow: /\nDisallow: /myadmin\nDisallow: /api/\nSitemap: /sitemap.xml', 'plugins', '2026-11-12 18:42:21', '2026-11-20 17:56:08'),
(37, 'home_sliders', '[{\"id\":1,\"image\":\".\\/images\\/banner-1.png\",\"tag\":\"25+ Years Manufacturer \\u2022 OEM \\/ ODM\",\"title\":\"High-Yield Compatible Toner Cartridges & Imaging Solutions\",\"desc\":\"1,000,000+ monthly capacity across 48 automated production lines. ISO9001, ISO14001 & STMC certified quality.\",\"ctaText\":\"Explore Full Catalog\",\"ctaLink\":\"\\/products\"},{\"id\":2,\"image\":\".\\/images\\/banner-2.jpg\",\"tag\":\"Factory Direct \\u2022 75,000 m\\u00b2 Industrial Park\",\"title\":\"Automated Robotic Production & Overseas Warehousing\",\"desc\":\"Fast dispatch from our main manufacturing campus and European overseas warehouse to 120+ countries.\",\"ctaText\":\"View Company Profile\",\"ctaLink\":\"\\/company-profile\"},{\"id\":3,\"image\":\".\\/images\\/banner-3.jpg\",\"tag\":\"Wholesale Promotions \\u2022 Up to 12% Off\",\"title\":\"Patent Gear Toner & Thermal POS Printer Specials\",\"desc\":\"Lock in factory-tier FOB pricing on Brother, HP, Canon compatible cartridges and A4 laser printers.\",\"ctaText\":\"See Hot Deals\",\"ctaLink\":\"\\/promotion\"},{\"id\":4,\"image\":\".\\/images\\/banner-4.jpg\",\"tag\":\"Global Exhibitions & R&D Innovation\",\"title\":\"Certified OEM\\/ODM Partner for Global Distributors\",\"desc\":\"100% post-production print inspection and dedicated export support team.\",\"ctaText\":\"Contact Us\",\"ctaLink\":\"\\/company-profile\"}]', 'plugins', '2026-11-13 04:30:36', '2026-11-20 17:56:08'),
(38, 'section_banners', '{\"Patent Gear Products\":\".\\/images\\/sec-patent.jpg\",\"Monochrome Cartridges\":\".\\/images\\/sec-mono.jpg\",\"Color Cartridges\":\".\\/images\\/sec-color.jpg\",\"Inks & Inkjets\":\".\\/images\\/sec-inkjet.jpg\",\"Bulk Inks\":\".\\/images\\/sec-bulk-ink.jpg\",\"Toner Powder\":\".\\/images\\/sec-powder.jpg\",\"Printers\":\".\\/images\\/sec-printer.jpg\"}', 'plugins', '2026-11-13 04:30:36', '2026-11-20 17:56:08'),
(39, 'contact_address', '126 Main Street, Acme, AB T0M 0A0, Canada', 'plugins', '2026-11-13 05:53:21', '2026-11-20 17:56:07'),
(40, 'ceo_name', 'Swapan Kumar Bairagi', 'plugins', '2026-11-13 05:53:21', '2026-11-20 17:56:07'),
(41, 'ceo_title', 'Chief Executive Officer (CEO)', 'plugins', '2026-11-13 05:53:21', '2026-11-20 17:56:07'),
(42, 'delivery_charge_inside', '60', 'plugins', '2026-11-20 14:44:37', '2026-11-20 17:56:07'),
(43, 'delivery_charge_outside', '120', 'plugins', '2026-11-20 14:44:37', '2026-11-20 17:56:07'),
(44, 'free_shipping_threshold', '5000', 'plugins', '2026-11-20 14:44:37', '2026-11-20 17:56:07'),
(45, 'free_shipping_enabled', '1', 'plugins', '2026-11-20 14:44:37', '2026-11-20 17:56:07'),
(46, 'order_pause_enabled', '1', 'plugins', '2026-11-20 15:02:46', '2026-11-20 17:56:07'),
(47, 'order_pause_until', '2026-12-31T00:00', 'plugins', '2026-11-20 15:02:46', '2026-11-20 17:56:07'),
(48, 'order_pause_message', 'বর্তমানে আমাদের অর্ডার গ্রহণ সাময়িকভাবে স্থগিত আছে।', 'plugins', '2026-11-20 15:02:46', '2026-11-20 17:56:07'),
(49, 'shipping_policy', 'Express Delivery: 24-48 hours inside city, 48-72 hours nationwide.', 'plugins', '2026-11-20 15:05:59', '2026-11-20 17:56:07'),
(50, 'default_language', 'English', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(51, 'available_languages', 'English, French, Bengali', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(52, 'rtl_direction', '0', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(53, 'page_about_title', 'About AMIDA Supplies Limited', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(54, 'page_about_content', 'AMIDA OFFICE SUPPLIES LIMITED is a premier supplier of industrial stationery, printer toners, premium copier paper, and office supplies in Acme, Alberta.', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(55, 'page_privacy_title', 'Privacy Policy', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(56, 'page_privacy_content', 'We take customer data confidentiality and transaction safety very seriously under Canadian commercial privacy standards.', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(57, 'page_terms_title', 'Terms and Conditions', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(58, 'page_terms_content', 'All orders placed are subject to product availability and standard corporate trading guidelines.', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(59, 'page_return_title', 'Return and Refund Policy', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(60, 'page_return_content', 'Damaged or incorrect shipments must be reported within 7 business days of delivery for a full replacement or refund.', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(61, 'sms_provider', 'twilio', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(62, 'sms_twilio_sid', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(63, 'sms_twilio_token', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(64, 'sms_twilio_from', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(65, 'sms_order_template', 'Dear {customer_name}, your AMIDA order #{order_id} of ${total} is confirmed. Thank you!', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(66, 'notif_order_placed', '1', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(67, 'notif_low_stock', '1', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(68, 'notif_inquiry_received', '1', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(69, 'notif_customer_receipt', '1', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(70, 'notif_customer_dispatch', '1', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(71, 'plugin_tawk_active', '1', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:12'),
(72, 'plugin_tawk_property_id', '69c162acd495661c365089e8', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(73, 'plugin_tawk_widget_id', '1jkdmisou', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(74, 'plugin_recaptcha_active', '0', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(75, 'plugin_recaptcha_site_key', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(76, 'plugin_recaptcha_secret_key', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(77, 'plugin_google_analytics_active', '0', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(78, 'plugin_google_analytics_id', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(79, 'plugin_facebook_messenger_active', '0', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(80, 'plugin_facebook_page_id', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(81, 'plugin_facebook_app_id', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(82, 'plugin_reloadly_active', '0', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(83, 'plugin_reloadly_client_id', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(84, 'plugin_reloadly_client_secret', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(85, 'plugin_tpaga_active', '0', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(86, 'plugin_tpaga_api_key', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(87, 'plugin_twilio_sms_active', '0', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(88, 'plugin_twilio_sid', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(89, 'plugin_twilio_token', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(90, 'plugin_twilio_from', NULL, 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(91, 'plugin_whatsapp_active', '0', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(92, 'plugin_whatsapp_number', '+1 604 316 8138', 'plugins', '2026-11-20 17:56:07', '2026-11-20 17:56:07'),
(93, 'plugin_whatsapp_message', 'Hello AMIDA Supplies, I would like to inquire about office products.', 'plugins', '2026-11-20 17:56:08', '2026-11-20 17:56:08'),
(94, 'plugin_custom_script_active', '0', 'plugins', '2026-11-20 17:56:08', '2026-11-20 17:56:08'),
(95, 'plugin_header_script', NULL, 'plugins', '2026-11-20 17:56:08', '2026-11-20 17:56:08'),
(96, 'plugin_footer_script', NULL, 'plugins', '2026-11-20 17:56:08', '2026-11-20 17:56:08');

-- ------------------------------------------------------------
-- Table structure for `users`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'super_admin',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for `users` (1 rows)
INSERT INTO `users` (`id`, `name`, `username`, `email`, `email_verified_at`, `password`, `role`, `permissions`, `is_active`, `last_login_at`, `last_login_ip`, `remember_token`, `created_at`, `updated_at`) VALUES 
(1, 'Tomal Krishna Howlader', 'admin', 'admin@acme.com', NULL, '$2y$12$ADKABTNnQZYlJR76LWVsH.GODtHyVyqIT7Zx6czOSRDX8OqBjaSVG', 'super_admin', '[\"all\",\"products.manage\",\"categories.manage\",\"inquiries.manage\",\"settings.manage\",\"users.manage\",\"seo.manage\"]', 1, '2026-11-20 18:01:04', '::1', NULL, '2026-11-12 18:42:21', '2026-11-20 18:01:04');

SET FOREIGN_KEY_CHECKS = 1;
