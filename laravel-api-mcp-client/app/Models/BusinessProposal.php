<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessProposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'original_text',
        'enhanced_text',
        'status',
    ];
}
