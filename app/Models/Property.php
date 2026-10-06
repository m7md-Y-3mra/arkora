<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agent_id',
        'title',
        'slug',
        'description',
        'type',
        'purpose',
        'status',
        'price',
        'area_sqm',
        'bedrooms',
        'bathrooms',
        'floor',
        'year_built',
        'city',
        'district',
        'address_line',
        'latitude',
        'longitude',
        'is_featured',
        'views_count',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'area_sqm' => 'decimal:2',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('sort_order');
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'property_amenity');
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function coverImage(): HasMany
    {
        return $this->images()->where('is_cover', true);
    }
}
