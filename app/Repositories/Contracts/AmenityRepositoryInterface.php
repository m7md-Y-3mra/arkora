<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface AmenityRepositoryInterface
{
    public function all(): Collection;
}
