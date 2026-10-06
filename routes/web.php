<?php

use App\Http\Controllers\AgentDirectoryController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\LeadController as DashboardLeadController;
use App\Http\Controllers\Dashboard\PropertyController as DashboardPropertyController;
use App\Http\Controllers\Dashboard\UserController as DashboardUserController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\PropertySearchController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/search', [PropertySearchController::class, 'index'])->name('search');
Route::get('/agents', [AgentDirectoryController::class, 'index'])->name('agents.index');
Route::get('/agents/{agent}', [AgentDirectoryController::class, 'show'])->name('agents.show');
Route::get('/properties/{slug}', [PropertyController::class, 'show'])->name('properties.show');
Route::post('/properties/{property}/leads', [LeadController::class, 'store'])->name('properties.leads.store');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/favorites', [FavoriteController::class, 'index'])->name('favorites.index');
    Route::post('/favorites/{property}', [FavoriteController::class, 'toggle'])->name('favorites.toggle');

    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::middleware('role:admin|agent')->group(function () {
        Route::get('/properties', [DashboardPropertyController::class, 'index'])->name('properties.index');
        Route::get('/properties/create', [DashboardPropertyController::class, 'create'])->name('properties.create');
        Route::post('/properties', [DashboardPropertyController::class, 'store'])->name('properties.store');
        Route::get('/properties/{property}/edit', [DashboardPropertyController::class, 'edit'])->name('properties.edit');
        Route::put('/properties/{property}', [DashboardPropertyController::class, 'update'])->name('properties.update');
        Route::delete('/properties/{property}', [DashboardPropertyController::class, 'destroy'])->name('properties.destroy');
        Route::post('/properties/bulk-action', [DashboardPropertyController::class, 'bulkAction'])->name('properties.bulk-action');

        Route::get('/leads', [DashboardLeadController::class, 'index'])->name('leads.index');
        Route::patch('/leads/{lead}/status', [DashboardLeadController::class, 'updateStatus'])->name('leads.update-status');
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [DashboardUserController::class, 'index'])->name('users.index');
        Route::post('/users', [DashboardUserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [DashboardUserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [DashboardUserController::class, 'destroy'])->name('users.destroy');
    });
});

require __DIR__.'/auth.php';
