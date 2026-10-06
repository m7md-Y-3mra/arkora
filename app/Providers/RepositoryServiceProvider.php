<?php

namespace App\Providers;

use App\Repositories\AmenityRepository;
use App\Repositories\Contracts\AmenityRepositoryInterface;
use App\Repositories\Contracts\LeadRepositoryInterface;
use App\Repositories\Contracts\PropertyRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\LeadRepository;
use App\Repositories\PropertyRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PropertyRepositoryInterface::class, PropertyRepository::class);
        $this->app->bind(LeadRepositoryInterface::class, LeadRepository::class);
        $this->app->bind(AmenityRepositoryInterface::class, AmenityRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
    }
}
