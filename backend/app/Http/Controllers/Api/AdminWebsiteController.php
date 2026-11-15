<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminWebsiteController extends Controller
{
    public function getSetup(): JsonResponse
    {
        $rawSliders = Setting::get('home_sliders');
        $sliders = $rawSliders ? json_decode($rawSliders, true) : [];

        $rawBanners = Setting::get('section_banners');
        $sectionBanners = $rawBanners ? json_decode($rawBanners, true) : [];

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
            'campaign_bar_link',
            'footer_copyright',
            'footer_tagline',
            'facebook_url',
            'linkedin_url',
            'youtube_url',
            'website_base_color',
            'header_style',
        ];

        $general = [];
        foreach ($keys as $k) {
            $general[$k] = Setting::get($k, '');
        }

        return response()->json([
            'success' => true,
            'sliders' => $sliders,
            'section_banners' => $sectionBanners,
            'settings' => $general,
        ]);
    }

    public function updateSliders(Request $request): JsonResponse
    {
        $sliders = $request->input('sliders', []);
        Setting::set('home_sliders', json_encode($sliders), 'website');

        return response()->json([
            'success' => true,
            'message' => 'Home hero sliders updated successfully',
            'sliders' => $sliders,
        ]);
    }

    public function updateSectionBanners(Request $request): JsonResponse
    {
        $banners = $request->input('section_banners', []);
        Setting::set('section_banners', json_encode($banners), 'website');

        return response()->json([
            'success' => true,
            'message' => 'Product section category banners saved',
            'section_banners' => $banners,
        ]);
    }

    public function updateAppearance(Request $request): JsonResponse
    {
        $data = $request->all();
        foreach ($data as $key => $val) {
            Setting::set($key, $val, 'website');
        }

        return response()->json([
            'success' => true,
            'message' => 'Website appearance & branding updated',
        ]);
    }
}
