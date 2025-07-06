<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BusinessProposalController;

Route::middleware('api')->group(function () {
    Route::post('/business-proposals', [BusinessProposalController::class, 'createBusinessProposal']);
    Route::get('/business-proposals/{id}/preview', [BusinessProposalController::class, 'showBusinessProposal']);
});