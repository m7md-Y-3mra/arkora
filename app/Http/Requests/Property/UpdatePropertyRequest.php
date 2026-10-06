<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $property = $this->route('property');

        if ($this->user()->hasRole('admin')) {
            return true;
        }

        return $this->user()->hasRole('agent') && $property->agent_id === $this->user()->id;
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
            'new_images' => ['array', 'max:20'],
            'new_images.*' => ['image', 'max:8192'],
            'existing_images' => ['array'],
            'existing_images.*.id' => ['required', 'integer', 'exists:property_images,id'],
            'existing_images.*.sort_order' => ['required', 'integer'],
            'existing_images.*.is_cover' => ['boolean'],
            'cover_index' => ['nullable', 'integer', 'exists:property_images,id'],
        ];
    }
}
