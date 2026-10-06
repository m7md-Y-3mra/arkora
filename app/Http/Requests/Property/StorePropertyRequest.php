<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['admin', 'agent']);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'type' => ['required', 'in:apartment,villa,townhouse,land,office,shop,building'],
            'purpose' => ['required', 'in:sale,rent'],
            'status' => ['required', 'in:draft,published,archived,sold,rented'],
            'price' => ['required', 'numeric', 'min:0'],
            'area_sqm' => ['required', 'numeric', 'min:0'],
            'bedrooms' => ['required', 'integer', 'min:0', 'max:50'],
            'bathrooms' => ['required', 'integer', 'min:0', 'max:50'],
            'floor' => ['nullable', 'integer', 'min:0'],
            'year_built' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'city' => ['required', 'string', 'max:120'],
            'district' => ['required', 'string', 'max:120'],
            'address_line' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'is_featured' => ['boolean'],
            'agent_id' => ['nullable', 'exists:users,id'],
            'amenities' => ['array'],
            'amenities.*' => ['exists:amenities,id'],
            'images' => ['array', 'max:20'],
            'images.*' => ['image', 'max:8192'],
            'cover_index' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
