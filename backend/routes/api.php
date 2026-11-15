<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminInquiryController;
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AdminSeoController;
use App\Http\Controllers\Api\AdminSettingsController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AdminWebsiteController;
use App\Http\Controllers\Api\CustomerOrderController;
use App\Http\Controllers\Api\StorefrontController;
use App\Http\Middleware\AdminAuthenticate;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\VerifyEncryptedApi;
use Illuminate\Support\Facades\Route;

// Public SEO files
Route::get('/sitemap.xml', [AdminSeoController::class, 'generateSitemap']);
Route::get('/robots.txt', [AdminSeoController::class, 'getRobotsTxt']);

// Public Storefront (Encrypted API + Signature)
Route::middleware([SecurityHeaders::class, VerifyEncryptedApi::class, 'throttle:120,1'])->group(function () {
    Route::get('/products', [StorefrontController::class, 'products']);
    Route::get('/company-profile', [StorefrontController::class, 'companyProfile']);
    Route::get('/settings', [StorefrontController::class, 'publicSettings']);
    Route::post('/inquiries', [StorefrontController::class, 'storeInquiry']);
});

// Customer Accounts & Order Checkout (Public / Guest & Authenticated)
Route::middleware([SecurityHeaders::class, 'throttle:60,1'])->prefix('customer')->group(function () {
    Route::post('/register', [CustomerOrderController::class, 'register']);
    Route::post('/login', [CustomerOrderController::class, 'login']);
    Route::get('/orders', [CustomerOrderController::class, 'customerOrders']);
});

Route::middleware([SecurityHeaders::class, 'throttle:60,1'])->prefix('orders')->group(function () {
    Route::post('/checkout', [CustomerOrderController::class, 'checkout']);
    Route::post('/abandon', [CustomerOrderController::class, 'trackIncomplete']);
});

// Admin Auth (Rate limited brute-force prevention)
Route::middleware([SecurityHeaders::class, 'throttle:10,1'])->prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);
});

// Protected Admin API (Session Token verification, Role/Permission checking)
Route::middleware([SecurityHeaders::class, AdminAuthenticate::class, 'throttle:120,1'])->prefix('admin')->group(function () {
    Route::get('/me', [AdminAuthController::class, 'me']);
    Route::post('/logout', [AdminAuthController::class, 'logout']);

    // Dashboard Analytics & Charts
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);

    // Products Management
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::get('/products/{id}', [AdminProductController::class, 'show']);
    Route::put('/products/{id}', [AdminProductController::class, 'update']);
    Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
    Route::post('/products/{id}/toggle-top-pick', [AdminProductController::class, 'toggleTopPick']);

    // Sales & Orders Management (Active & Incomplete Orders)
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::delete('/orders/{id}', [AdminOrderController::class, 'destroy']);

    // Categories Management
    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

    // Inquiries & RFQs Management
    Route::get('/inquiries', [AdminInquiryController::class, 'index']);
    Route::get('/inquiries/{id}', [AdminInquiryController::class, 'show']);
    Route::put('/inquiries/{id}/status', [AdminInquiryController::class, 'updateStatus']);
    Route::post('/inquiries/{id}/reply', [AdminInquiryController::class, 'reply']);
    Route::delete('/inquiries/{id}', [AdminInquiryController::class, 'destroy']);

    // Website Setup: Home Sliders, Banners & Appearance
    Route::get('/website/setup', [AdminWebsiteController::class, 'getSetup']);
    Route::post('/website/sliders', [AdminWebsiteController::class, 'updateSliders']);
    Route::post('/website/section-banners', [AdminWebsiteController::class, 'updateSectionBanners']);
    Route::post('/website/appearance', [AdminWebsiteController::class, 'updateAppearance']);

    // General & Header/Footer Settings
    Route::get('/settings', [AdminSettingsController::class, 'index']);
    Route::post('/settings', [AdminSettingsController::class, 'update']);
    Route::post('/settings/test-smtp', [AdminSettingsController::class, 'testSmtp']);

    // Multi-User Management
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::put('/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

    // SEO Management
    Route::get('/seo', [AdminSeoController::class, 'getSeoSettings']);
    Route::post('/seo', [AdminSeoController::class, 'updateSeoSettings']);
});
