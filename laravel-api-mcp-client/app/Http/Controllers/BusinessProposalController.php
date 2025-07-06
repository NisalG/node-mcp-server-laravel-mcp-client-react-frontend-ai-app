<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\McpClient;
use App\Models\BusinessProposal;

class BusinessProposalController extends Controller
{
    protected McpClient $mcpClient;
    public function __construct(McpClient $mcpClient)
    {
        $this->mcpClient = $mcpClient; // Inject MCP client for AI calls
    }

    public function createBusinessProposal(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required|string', // Validate proposal text
            'title' => 'required|string', // Validate proposal title
        ]);
        
        $enhancedText = $this->mcpClient->enhanceText($validated['text']); // Enhance text using MCP/AI
        // dd($enhancedText);
        
        $proposal = BusinessProposal::create([
            'title' => $validated['title'], // Store title
            'original_text' => $validated['text'], // Store original text
            'enhanced_text' => $enhancedText, // Store enhanced text
            'status' => 'draft' // Set status as draft
        ]);
        
        return response()->json($proposal, 201); // Return created proposal as JSON
    }

    public function showBusinessProposal($id)
    {
        $proposal = BusinessProposal::findOrFail($id); // Find proposal or fail
        
        $html = $this->mcpClient->generateHtml([
            'title' => $proposal->title, // Pass title to HTML generator
            'content' => $proposal->enhanced_text, // Pass enhanced text
            'created_at' => $proposal->created_at->format('Y-m-d') // Pass creation date
        ]);
        
        return response($html)->header('Content-Type', 'text/html'); // Return HTML response
    }


    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
