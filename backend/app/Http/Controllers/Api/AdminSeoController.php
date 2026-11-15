<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AdminSeoController extends Controller
{
    public function getSeoSettings(): JsonResponse
    {
        $keys = [
            'meta_title',
            'meta_description',
            'meta_keywords',
            'google_tag_manager_id',
            'google_analytics_id',
            'google_search_console_code',
            'robots_txt',
            'sitemap_enabled',
        ];

        $data = [];
        foreach ($keys as $k) {
            $data[$k] = Setting::get($k, '');
        }

        return response()->json([
            'success' => true,
            'seo' => $data,
        ]);
    }

    public function updateSeoSettings(Request $request): JsonResponse
    {
        $fields = $request->only([
            'meta_title',
            'meta_description',
            'meta_keywords',
            'google_tag_manager_id',
            'google_analytics_id',
            'google_search_console_code',
            'robots_txt',
            'sitemap_enabled',
        ]);

        foreach ($fields as $key => $val) {
            Setting::set($key, $val, 'seo');
        }

        return response()->json([
            'success' => true,
            'message' => 'SEO settings updated successfully',
        ]);
    }

    public function generateSitemap(): Response
    {
        $baseUrl = rtrim(Setting::get('site_url') ?: request()->root(), '/');
        $products = Product::all();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Static routes
        $staticRoutes = [
            '/' => ['freq' => 'daily', 'prio' => '1.0'],
            '/#/products' => ['freq' => 'daily', 'prio' => '0.9'],
            '/#/company-profile' => ['freq' => 'weekly', 'prio' => '0.8'],
            '/#/ratings-reviews' => ['freq' => 'weekly', 'prio' => '0.7'],
            '/#/promotion' => ['freq' => 'daily', 'prio' => '0.8'],
        ];

        foreach ($staticRoutes as $path => $meta) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . htmlspecialchars(rtrim($baseUrl, '/') . $path) . "</loc>\n";
            $xml .= "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
            $xml .= "    <changefreq>" . $meta['freq'] . "</changefreq>\n";
            $xml .= "    <priority>" . $meta['prio'] . "</priority>\n";
            $xml .= "  </url>\n";
        }

        // Product routes
        foreach ($products as $p) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . htmlspecialchars(rtrim($baseUrl, '/') . '/#/product/' . $p->sku) . "</loc>\n";
            $xml .= "    <lastmod>" . ($p->updated_at ? $p->updated_at->format('Y-m-d') : date('Y-m-d')) . "</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.85</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
        ]);
    }

    public function getRobotsTxt(): Response
    {
        $robots = Setting::get('robots_txt', "User-agent: *\nAllow: /\nDisallow: /myadmin\nDisallow: /api/");
        return response($robots, 200, [
            'Content-Type' => 'text/plain; charset=utf-8',
        ]);
    }
}
