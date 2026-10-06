<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactAgentRequest;
use App\Models\Property;
use App\Repositories\Contracts\LeadRepositoryInterface;
use Illuminate\Http\RedirectResponse;

class LeadController extends Controller
{
    public function __construct(private LeadRepositoryInterface $leads)
    {
    }

    public function store(ContactAgentRequest $request, Property $property): RedirectResponse
    {
        $this->leads->create([
            ...$request->validated(),
            'property_id' => $property->id,
            'agent_id' => $property->agent_id,
        ]);

        return back()->with('success', 'تم إرسال رسالتك إلى الوكيل بنجاح.');
    }
}
