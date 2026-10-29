<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->foreignId('contact_id')->nullable()->after('agent_id')->constrained()->nullOnDelete();
        });

        // Runs on deploy against live data, so only touch leads that have no contact yet.
        DB::statement(<<<'SQL'
            INSERT INTO contacts (agent_id, name, email, phone, created_at, updated_at)
            SELECT DISTINCT ON (agent_id, LOWER(email))
                agent_id, name, LOWER(email), phone, created_at, NOW()
            FROM leads
            WHERE contact_id IS NULL
            ORDER BY agent_id, LOWER(email), created_at DESC
            ON CONFLICT (agent_id, email) DO NOTHING
        SQL);

        DB::statement(<<<'SQL'
            UPDATE leads SET contact_id = contacts.id
            FROM contacts
            WHERE leads.contact_id IS NULL
              AND contacts.agent_id = leads.agent_id
              AND contacts.email = LOWER(leads.email)
        SQL);
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropConstrainedForeignId('contact_id');
        });
    }
};
