<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Laravel's enum() on pgsql is a varchar guarded by a check constraint.
        DB::statement('ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check');
        DB::table('leads')->where('status', 'closed')->update(['status' => 'lost']);
        DB::statement("ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'viewing', 'negotiation', 'won', 'lost'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check');
        DB::table('leads')->whereIn('status', ['viewing', 'negotiation'])->update(['status' => 'contacted']);
        DB::table('leads')->whereIn('status', ['won', 'lost'])->update(['status' => 'closed']);
        DB::statement("ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'closed'))");
    }
};
