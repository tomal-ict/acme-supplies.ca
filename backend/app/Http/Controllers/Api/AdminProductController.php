<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($q = $request->input('q')) {
            $query->where(function ($b) use ($q) {
                $b->where('title', 'like', "%{$q}%")
                  ->orWhere('sku', 'like', "%{$q}%")
                  ->orWhere('category', 'like', "%{$q}%")
                  ->orWhere('sub_category', 'like', "%{$q}%");
            });
        }

        if ($cat = $request->input('category')) {
            $query->where('category', $cat);
        }

        if ($sub = $request->input('sub_category')) {
            $query->where('sub_category', $sub);
        }

        if ($request->has('promo_only') && $request->boolean('promo_only')) {
            $query->where('promo_discount', '>', 0);
        }

        if ($request->has('top_pick_only') && $request->boolean('top_pick_only')) {
            $query->where('is_top_pick', true);
        }

        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price_min', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price_min', 'desc');
                break;
            case 'popular':
                $query->orderBy('sold', 'desc');
                break;
            case 'sku':
                $query->orderBy('sku', 'asc');
                break;
            case 'newest':
            default:
                $query->latest();
                break;
        }

        $perPage = max(5, min(100, (int) $request->input('per_page', 15)));
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'products' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show($id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        return response()->json(['success' => true, 'product' => $product]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'sku' => 'nullable|string|max:64|unique:products,sku',
            'category' => 'required|string|max:128',
            'sub_category' => 'nullable|string|max:128',
            'compatible_printers' => 'nullable|string',
            'price_mode' => 'nullable|in:single,tiered',
            'single_price' => 'nullable|numeric|min:0',
            'tiered_prices' => 'nullable|array',
            'tiered_prices.*.min_qty' => 'nullable|integer|min:1',
            'tiered_prices.*.max_qty' => 'nullable|integer',
            'tiered_prices.*.price' => 'nullable|numeric|min:0',
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0',
            'moq' => 'nullable|string|max:64',
            'sold' => 'nullable|string|max:64',
            'tags' => 'nullable|array',
            'description' => 'nullable|string',
            'specifications' => 'nullable|array',
            'image' => 'nullable|string',
            'gallery_images' => 'nullable|array',
            'detail_images' => 'nullable|array',
            'promo_discount' => 'nullable|integer|min:0|max:99',
            'is_top_pick' => 'nullable|boolean',
        ]);

        if (empty($validated['sku'])) {
            $maxNum = Product::count() + 1;
            $validated['sku'] = 'P' . str_pad((string)$maxNum, 3, '0', STR_PAD_LEFT);
        }

        $priceMode = $validated['price_mode'] ?? 'single';
        $validated['price_mode'] = $priceMode;

        if ($priceMode === 'single') {
            $single = isset($validated['single_price']) ? floatval($validated['single_price']) : floatval($validated['price_min'] ?? 0);
            $validated['single_price'] = $single;
            $validated['price_min'] = $single;
            $validated['price_max'] = $single;
            $validated['tiered_prices'] = [];
        } else {
            // Tiered mode
            $tiers = $validated['tiered_prices'] ?? [];
            if (!empty($tiers)) {
                $prices = array_column($tiers, 'price');
                $validated['price_min'] = !empty($prices) ? min($prices) : ($validated['price_min'] ?? 0);
                $validated['price_max'] = !empty($prices) ? max($prices) : ($validated['price_max'] ?? 0);
                $validated['single_price'] = $validated['price_max'];
            } else {
                $pMin = floatval($validated['price_min'] ?? 0);
                $pMax = floatval($validated['price_max'] ?? $pMin);
                $validated['price_min'] = $pMin;
                $validated['price_max'] = $pMax;
                $validated['single_price'] = $pMax;
            }
        }

        $validated['moq'] = $validated['moq'] ?? '20 Pieces';
        $validated['sold'] = $validated['sold'] ?? '100+ sold';
        $validated['image'] = $validated['image'] ?? './images/products/P001.png';
        $validated['tags'] = $validated['tags'] ?? ['Certified'];
        $validated['promo_discount'] = $validated['promo_discount'] ?? 0;
        $validated['is_top_pick'] = $validated['is_top_pick'] ?? false;
        $validated['gallery_images'] = $validated['gallery_images'] ?? [];
        $validated['specifications'] = $validated['specifications'] ?? [];
        $validated['detail_images'] = $validated['detail_images'] ?? [];

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'product' => $product,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'sku' => "sometimes|required|string|max:64|unique:products,sku,{$id}",
            'category' => 'sometimes|required|string|max:128',
            'sub_category' => 'nullable|string|max:128',
            'compatible_printers' => 'nullable|string',
            'price_mode' => 'nullable|in:single,tiered',
            'single_price' => 'nullable|numeric|min:0',
            'tiered_prices' => 'nullable|array',
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0',
            'moq' => 'nullable|string|max:64',
            'sold' => 'nullable|string|max:64',
            'tags' => 'nullable|array',
            'description' => 'nullable|string',
            'specifications' => 'nullable|array',
            'image' => 'nullable|string',
            'gallery_images' => 'nullable|array',
            'detail_images' => 'nullable|array',
            'promo_discount' => 'nullable|integer|min:0|max:99',
            'is_top_pick' => 'nullable|boolean',
        ]);

        if (isset($validated['price_mode'])) {
            if ($validated['price_mode'] === 'single') {
                $single = isset($validated['single_price']) ? floatval($validated['single_price']) : floatval($validated['price_min'] ?? $product->price_min);
                $validated['single_price'] = $single;
                $validated['price_min'] = $single;
                $validated['price_max'] = $single;
                $validated['tiered_prices'] = [];
            } else {
                $tiers = $validated['tiered_prices'] ?? $product->tiered_prices ?? [];
                if (!empty($tiers)) {
                    $prices = array_column($tiers, 'price');
                    $validated['price_min'] = !empty($prices) ? min($prices) : ($validated['price_min'] ?? $product->price_min);
                    $validated['price_max'] = !empty($prices) ? max($prices) : ($validated['price_max'] ?? $product->price_max);
                    $validated['single_price'] = $validated['price_max'];
                }
            }
        } elseif (isset($validated['single_price']) && ($product->price_mode ?? 'single') === 'single') {
            $single = floatval($validated['single_price']);
            $validated['price_min'] = $single;
            $validated['price_max'] = $single;
        }

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'product' => $product,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }

    public function toggleTopPick($id): JsonResponse
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        $product->is_top_pick = !$product->is_top_pick;
        $product->save();

        return response()->json([
            'success' => true,
            'message' => $product->is_top_pick ? 'Added to Top Picks' : 'Removed from Top Picks',
            'is_top_pick' => $product->is_top_pick,
        ]);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $targetDir = realpath(base_path('../images/products'));
        if (!$targetDir) {
            $targetDir = base_path('../images/products');
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
        }

        $filename = 'prod_' . date('Ymd_His') . '_' . Str::random(6);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $ext = strtolower($file->getClientOriginalExtension());
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                $ext = 'jpg';
            }
            $fullName = $filename . '.' . $ext;
            $file->move($targetDir, $fullName);

            return response()->json([
                'success' => true,
                'url' => './images/products/' . $fullName,
                'filename' => $fullName,
            ]);
        }

        if ($request->filled('image_base64')) {
            $base64 = $request->input('image_base64');
            $ext = 'jpg';
            if (preg_match('/^data:image\/(\w+);base64,/', $base64, $matches)) {
                $ext = strtolower($matches[1]);
                if ($ext === 'jpeg') $ext = 'jpg';
                $base64 = substr($base64, strpos($base64, ',') + 1);
            }
            $data = base64_decode($base64);
            if ($data !== false) {
                $fullName = $filename . '.' . $ext;
                file_put_contents($targetDir . DIRECTORY_SEPARATOR . $fullName, $data);

                return response()->json([
                    'success' => true,
                    'url' => './images/products/' . $fullName,
                    'filename' => $fullName,
                ]);
            }
        }

        return response()->json(['success' => false, 'message' => 'No image file or base64 data received'], 422);
    }
}
