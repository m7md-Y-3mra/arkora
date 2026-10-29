<?php

use Illuminate\Support\Facades\DB;

require_once __DIR__.'/helpers.php';

test('the stage migration maps closed to lost and back', function () {
    $migration = require database_path('migrations/2026_10_29_100000_convert_lead_status_to_stages.php');
    $agent = crmUser('agent');
    $lead = crmLead($agent, ['status' => 'negotiation']);

    $migration->down();
    expect(DB::table('leads')->where('id', $lead->id)->value('status'))->toBe('contacted');

    DB::table('leads')->where('id', $lead->id)->update(['status' => 'closed']);
    $migration->up();
    expect(DB::table('leads')->where('id', $lead->id)->value('status'))->toBe('lost');
});
