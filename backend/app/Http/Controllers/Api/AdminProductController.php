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
            'price_min' => 'required|numeric|min:0',
            'price_max' => 'required|numeric|min:0|gte:price_min',
            'moq' => 'nullable|string|max:64',
            'sold' => 'nullable|string|max:64',
            'tags' => 'nullable|array',
            'image' => 'nullable|string',
            'promo_discount' => 'nullable|integer|min:0|max:99',
            'is_top_pick' => 'nullable|boolean',
        ]);

        if (empty($validated['sku'])) {
            $maxNum = Product::count() + 1;
            $validated['sku'] = 'P' . str_pad((string)$maxNum, 3, '0', STR_PAD_LEFT);
        }

        $validated['moq'] = $validated['moq'] ?? '20 Pieces';
        $validated['sold'] = $validated['sold'] ?? '100+ sold';
        $validated['image'] = $validated['image'] ?? './images/products/P001.png';
        $validated['tags'] = $validated['tags'] ?? ['Certified'];
        $validated['promo_discount'] = $validated['promo_discount'] ?? 0;
        $validated['is_top_pick'] = $validated['is_top_pick'] ?? false;

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
            'price_min' => 'sometimes|required|numeric|min:0',
            'price_max' => 'sometimes|required|numeric|min:0',
            'moq' => 'nullable|string|max:64',
            'sold' => 'nullable|string|max:64',
            'tags' => 'nullable|array',
            'image' => 'nullable|string',
            'promo_discount' => 'nullable|integer|min:0|max:99',
            'is_top_pick' => 'nullable|boolean',
        ]);

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
}
