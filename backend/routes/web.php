<?php

use App\Http\Controllers\Api\SecurityController;
use Illuminate\Support\Facades\Route;

Route::fallback([SecurityController::class, 'serverFallback']);
