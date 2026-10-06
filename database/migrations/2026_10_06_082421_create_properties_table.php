<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->enum('type', ['apartment', 'villa', 'townhouse', 'land', 'office', 'shop', 'building']);
            $table->enum('purpose', ['sale', 'rent']);
            $table->enum('status', ['draft', 'published', 'archived', 'sold', 'rented'])->default('draft');
            $table->decimal('price', 14, 2);
            $table->decimal('area_sqm', 10, 2);
            $table->unsignedTinyInteger('bedrooms')->default(0);
            $table->unsignedTinyInteger('bathrooms')->default(0);
            $table->unsignedSmallInteger('floor')->nullable();
            $table->unsignedSmallInteger('year_built')->nullable();
            $table->string('city');
            $table->string('district');
            $table->string('address_line')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'purpose', 'type']);
            $table->index(['city', 'district']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
