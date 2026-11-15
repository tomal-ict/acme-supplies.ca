<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:128',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $slugBase = $validated['name'];
        if (!empty($validated['parent_id'])) {
            $parent = Category::find($validated['parent_id']);
            if ($parent) {
                $slugBase = $parent->name . '-' . $validated['name'];
            }
        }

        $slug = Str::slug($slugBase);
        $count = Category::where('slug', 'like', "{$slug}%")->count();
        if ($count > 0) {
            $slug .= '-' . ($count + 1);
        }

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'parent_id' => $validated['parent_id'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'category' => $category->load('children'),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:128',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'category' => $category,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found'], 404);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }
}
