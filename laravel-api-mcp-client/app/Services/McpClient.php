<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class McpClient
{
    protected string $mcpServerUrl;
    protected string $defaultProvider;

    public function __construct()
    {
        $this->mcpServerUrl = config('services.mcp.server'); // MCP server URL from config
        $this->defaultProvider = config('services.mcp.provider', 'groq'); // Default to 'groq' if not set
    }

    public function enhanceText(string $text, ?string $provider = null): string
    {
        $response = Http::post("{$this->mcpServerUrl}/mcp/text-enhancement", [ // Call MCP server for text enhancement
            'text' => $text, // Proposal text to enhance
            'provider' => $provider ?? $this->defaultProvider, // Use given provider or default
        ]);
        // dd($response->json());
        // dd($response->json('enhancedText'));

        return $response->json('enhancedText') ?? $text; // If no enhancement is available, return the original text
    }

    public function generateHtml(array $proposalData, ?string $provider = null): string
    {
        $response = Http::post("{$this->mcpServerUrl}/mcp/generate-html", [ // Call MCP server to generate HTML
            'proposal' => $proposalData, // Proposal data to send
            'provider' => $provider ?? $this->defaultProvider, // Use given provider or default
        ]);

        return $response->json('html') ?? ''; // Return generated HTML or empty
    }
}
