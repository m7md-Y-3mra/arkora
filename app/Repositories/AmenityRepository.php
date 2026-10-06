<?php

namespace App\Repositories;

use App\Models\Amenity;
use App\Repositories\Contracts\AmenityRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class AmenityRepository implements AmenityRepositoryInterface
{
    public function __construct(private Amenity $model)
    {
    }

    public function all(): Collection
    {
        return $this->model->query()->orderBy('name')->get();
    }
}
