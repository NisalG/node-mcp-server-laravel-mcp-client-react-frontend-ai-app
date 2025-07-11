# Development of Custom MCP Server & Client

## Why Use MCP in Your Business Proposal Generation System?

Integrating **AI** using **MCP-style agents** unlocks intelligence, flexibility, and automation in ways traditional rule-based systems can’t match.

## What MCP Does

**Model Context Protocol (MCP)** is a pattern/framework that allows:

* The **AI model** (LLM) to access **context-aware tools and data**  
* Modular separation of:  
  * `resources`: background data (e.g. proposals, customer info, preferences)  
  * `tools`: executable actions (e.g. `/mcp/text-enhancement`, `/mcp/generate-html`)

## Is MCP an AI Agent?

**No — MCP (Model Context Protocol) is not an AI agent.**  
It’s a **framework or pattern** that enables an AI agent to function effectively.

### What MCP provides

It’s a support system that powers an LLM-based **AI agent** to reason, decide, and act.

* **Tools** → functions or APIs the agent can call (e.g. Laravel endpoints)  
* **Resources** → external data like customer info  
* **Memory** → logs or interaction history

### What an AI Agent Is

An AI agent is a smart system (like GPT-4) that:

* Understands user intent  
* Chooses tools to run  
* Uses context (resources \+ memory)

## MCP architecture, [Node.js](http://Node.js) MCP server, Laravel MCP client and React frontend with multiple AI providers integration:

### Prerequisites

* **PHP \>= 8.1**, Composer  
* **Node.js \>= 18**, npm or yarn  
* **MySQL** (or compatible DB engine)  
* **Laravel CLI** (optional but helpful)

### Architectural Diagram
```
        React FE
           ⇅
Laravel API BE (with MCP client)
           ⇅
    Node MCP Server
           ⇅
 AI Service Provider
```

### File & Folder structure 

**/business-proposal-app**  
**├── /mcp-server (TypeScript MCP Server)**  
│   ├── src/  
│   │   ├── server.ts  
│   ├── package.json  
│   ├── tsconfig.json  
│   └── .env  
**├── /laravel-api (Laravel Backend)**  
│   ├── app/  
│   │   ├── Http/Controllers/  
│   │   │   └── BusinessProposalController.php  
│   │   ├── Models/  
│   │   │   └── BusinessProposal.php  
│   │   ├── Services/  
│   │   │   └── McpClient.php  
│   ├── config/  
│   │   └── services.php  
│   ├── routes/  
│   │   └── api.php  
│   └── .env  
**└── /react-frontend (React App)**  
    ├── src/  
    │   ├── components/  
    │   │   └── BusinessProposal.tsx  
    ├── package.json  
    └── .env

### MCP Protocol Implementation summary

1. **Node.js MCP Server** (TypeScript):  
   * Acts as an intermediary between your Laravel API and AI services  
   * Standardizes the interface for AI operations  
   * Handles authentication with ChatGPT API  
   * Provides consistent response formats  
2. **MCP Client** (Laravel):  
   * Provides a clean interface to communicate with the MCP server  
   * Handles errors and fallback behavior  
   * Can be easily mocked for testing  
3. **React FE**:  
   * HTML Form to enter text  
   * Renders response HTML

### 1\. Node.js MCP Server with TypeScript

#### Setup Instructions

Create folder and initialize project  
```sh
mkdir mcp-server  
cd mcp-server  
npm init -y  
npm install express axios cors dotenv typescript @types/express @types/cors @types/node  
npx tsc --init
```

Create files  
```sh
mkdir src  
touch src/server.ts .env tsconfig.json
```

Edit `tsconfig.json`: 
```json 
{  
  "compilerOptions": {  
    "target": "es6",  
    "module": "commonjs",  
    "outDir": "./dist",  
    "rootDir": "./src",  
    "strict": true,  
    "esModuleInterop": true,  
    "skipLibCheck": true  
  }  
}
```

Edit `.env`:  
```sh
CHATGPT_API_KEY=your_openai_api_key  
DEEPSEEK_API_KEY=your_deepseek_api_key  
GEMINI_API_KEY=your_gemini_api_key  
GROQ_API_KEY=your_gemini_api_key  
AI_PROVIDER=groq # or "openai" / "gemini" / "deepseek"  
PORT=3001
```
Add to `package.json` scripts:  
```json
"scripts": {  
  "start": "tsc && node dist/server.js",  
  "dev": "ts-node-dev src/server.ts"  
}
```
#### Create a simple MCP server using Node.js (Express and TypeScript)

**src/server.ts:**  
```ts
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

const PORT = process.env.PORT || 3001; // Server port
const defaultProvider = process.env.AI_PROVIDER || 'groq'; // Default AI provider

/**
 * callAI - Sends a prompt to the selected AI provider and returns the response.
 *
 * model:        The AI model to use (e.g., 'meta-llama/llama-4-scout-17b-16e-instruct' for Groq, 'gpt-4' for OpenAI).
 * systemPrompt: An optional string that sets the context or instructions for the AI (sent as a message with role 'system').
 * role:         The role of the message sender, either 'system' (for instructions/context) or 'user' (for the main prompt).
 * content:      The actual text content of each message, either the systemPrompt or userPrompt.
 * temperature:  Controls randomness/creativity of the AI output (higher = more random, lower = more focused).
 */
const callAI = async (provider: string, systemPrompt: string, userPrompt: string) => {
  console.log(`[callAI] provider: ${provider}`);
  console.log(`[callAI] systemPrompt: ${systemPrompt}`);
  console.log(`[callAI] userPrompt: ${userPrompt}`);

  if (provider === 'groq') {
    try {
      console.log('[callAI] Sending request to Groq...');
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions', // Groq API endpoint
        {
          model: 'meta-llama/llama-4-scout-17b-16e-instruct', // Groq model
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []), // Add system prompt if present
            { role: 'user', content: userPrompt } // User prompt
          ],
          temperature: 0.7 // Sampling temperature
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // Groq API key from .env
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('[callAI] Groq response:', res.data);
      return res.data.choices?.[0]?.message?.content; // Return AI response content
    } catch (err: any) {
      console.error('[callAI] Groq error:', err?.response?.data || err);
      throw err;
    }
  }

  if (provider === 'openai') {
    try {
      console.log('[callAI] Sending request to OpenAI...');
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions', // OpenAI API endpoint
        {
          model: 'gpt-4', // OpenAI model
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`, // OpenAI API key from .env
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('[callAI] OpenAI response:', res.data);
      return res.data.choices?.[0]?.message?.content;
    } catch (err) {
      console.error('[callAI] OpenAI error:', err);
      throw err;
    }
  }

  if (provider === 'deepseek') {
    try {
      console.log('[callAI] Sending request to DeepSeek...');
      const res = await axios.post(
        'https://api.deepseek.com/v1/chat/completions', // DeepSeek API endpoint
        {
          model: 'deepseek-chat', // DeepSeek model
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`, // DeepSeek API key from .env
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('[callAI] DeepSeek response:', res.data);
      return res.data.choices?.[0]?.message?.content;
    } catch (err: any) {
      console.error('[callAI] DeepSeek error:', err?.response?.data || err);
      throw err;
    }
  }

  if (provider === 'gemini') {
    try {
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\n${userPrompt}`
        : userPrompt;
      console.log('[callAI] Sending request to Gemini...');
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, // Gemini API endpoint
        {
          contents: [{ parts: [{ text: fullPrompt }] }]
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      console.log('[callAI] Gemini response:', res.data);
      return res.data.candidates?.[0]?.content?.parts?.[0]?.text || ''; // Return Gemini response content
    } catch (err: any) {
      console.error('[callAI] Gemini error:', err?.response?.data || err);
      throw err;
    }
  }

  throw new Error('Unsupported provider'); // If provider is not recognized
};

// --- /mcp/text-enhancement ---
app.post('/mcp/text-enhancement', async (req, res) => {
  const { text, provider = defaultProvider } = req.body; // Get text and provider from request
  console.log('[POST /mcp/text-enhancement] provider:', provider, 'text:', text);

  try {
    const systemPrompt =
      'Enhance this business proposal text to be more professional and compelling. Keep the original meaning but improve clarity and impact.'; // System prompt for enhancement
    const result = await callAI(provider, systemPrompt, text); // Call AI provider

    res.json({ success: true, enhancedText: result }); // Send enhanced text to client
  } catch (err: any) {
    console.error('[POST /mcp/text-enhancement] Error:', err?.response?.data || err);
    res.status(500).json({ success: false, error: 'Failed to enhance text' }); // Error response
  }
});

// --- /mcp/generate-html ---
app.post('/mcp/generate-html', async (req, res) => {
  const { proposal, provider = defaultProvider } = req.body; // Get proposal and provider from request
  console.log('[POST /mcp/generate-html] provider:', provider, 'proposal:', proposal);

  try {
    const systemPrompt = `Generate a professional HTML template for a business proposal. Use this JSON data: ${JSON.stringify(proposal)}`; // System prompt for HTML generation
    const result = await callAI(provider, systemPrompt, ''); // Call AI provider

    res.json({ success: true, html: result }); // Send generated HTML to client
  } catch (err: any) {
    console.error('[POST /mcp/generate-html] Error:', err?.response?.data || err);
    res.status(500).json({ success: false, error: 'Failed to generate HTML' }); // Error response
  }
});

app.listen(PORT, () => {
  console.log(`✅ MCP server running on http://localhost:${PORT}`); // Server started
});
```
#### Install & Run:
```sh
cd business-proposal-app/mcp-server  
npm install  
npm run dev  
```
Server runs at: [http://localhost:3001](http://localhost:3001) 

### 2\. Laravel API with MCP Client

#### Setup Instructions

Edit `.env`:  
```env
APP_NAME=Laravel  
APP_URL=http://localhost:8000

DB_CONNECTION=mysql  
DB_HOST=127.0.0.1  
DB_PORT=3306  
DB_DATABASE=business_proposals  
DB_USERNAME=root  
DB_PASSWORD=

MCP_SERVER_URL=http://localhost:3001  
MCP_PROVIDER=deepseek
```
Create Laravel project  
```sh
composer create-project laravel/laravel laravel-api  
cd laravel-api
```
Install HTTP client  
```sh
composer require guzzlehttp/guzzle
```
Install:  
```sh
composer install
```
Generate key:  
```sh
php artisan key:generate  
php artisan config:cache
```
Create controller and model  
```sh
php artisan make:controller BusinessProposalController --api  
php artisan make:model BusinessProposal -m (Migration file will be created with the ‘m’ flag)
```
File (`/xxxx_create_business_proposals_table.php`):  
```php
public function up()  
{  
    Schema::create('business_proposals', function (Blueprint $table)   
    {  
        $table->id();  
        $table->string('title');  
        $table->text('original_text');  
        $table->text('enhanced_text');  
        $table->string('status')->default('draft');  
        $table->timestamps();  
    });    
}
```
Migrate  
```sh
php artisan migrate
```
Routes `routes/api.php`: 
```php
<?php

use Illuminate\Support\Facades\Route;  
use App\Http\Controllers\BusinessProposalController;

Route::middleware('api')->group(function () {  
    Route::post('/business-proposals', [BusinessProposalController::class, 'createBusinessProposal']);  
    Route::get('/business-proposals/{id}/preview', [BusinessProposalController::class, 'showBusinessProposal']);  
});
```
Route File Registration in `bootstrap/app.php`:  
```sh
->withRouting(  
    web: __DIR__.'/../routes/web.php',  
    api: __DIR__.'/../routes/api.php',  
    commands: __DIR__.'/../routes/console.php',  
    health: '/up',  
)
```
Edit `config/services.php`:  
```php
'mcp' => [  
    'server' => env('MCP_SERVER_URL', 'http://localhost:3001'),  
    'provider' => env('MCP_PROVIDER', 'deepseek'),  
],
```
Edit `app/Models/BusinessProposal.php`
```php  
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
```
Update your Laravel project to use the MCP server:

Update your service to use the MCP server `app/Services/McpClient.php`:  
```php
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
```
Update your controller: `app/Http/Controllers/BusinessProposalController.php`:
```php
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
}
```
**Run Laravel dev server:**  
```sh
php artisan serve | php artisan serve --port=8000
```

API runs at: [http://localhost:8000](http://localhost:8000) (Use Postman or VSCode extension Thunder Client)

### 3\. React Frontend with Hooks

Create React app  
```sh
npx create-react-app react-frontend --template typescript  
cd react-frontend  
npm install axios
```
Create component  
```sh
mkdir src/components  
touch src/components/BusinessProposal.tsx
```
#### Create a React component with hooks to interact with your API:

**src/components/BusinessProposal.tsx:**  
```tsx
import { useState } from 'react';  
import axios from 'axios';

const BusinessProposal = () => {  
  const [formData, setFormData] = useState({  
    title: 'Proposal for a web site development', // Default title  
    text: 'Create me a business proposal for a web site development like Temu. Include about a matching tech stack as well.', // Default proposal text  
    provider: 'groq', // Default provider  
  });  
  const [proposal, setProposal] = useState<any>(null); // Holds the created proposal  
  const [htmlPreview, setHtmlPreview] = useState(''); // Holds the HTML preview  
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (e: React.FormEvent) => {  
    e.preventDefault(); // Prevent default form submission  
    setLoading(true); // Set loading state

    try {  
      const response = await axios.post(  
        `${process.env.REACT_APP_LARAVEL_API_BASE_URL}/api/business-proposals`, // API endpoint for creating proposal  
        {  
          title: formData.title,  
          text: formData.text,  
          provider: formData.provider,  
        }  
      );  
      setProposal(response.data); // Save proposal response  
    } catch (error) {  
      console.error('Error creating proposal:', error); // Log error  
    } finally {  
      setLoading(false); // Reset loading state  
    }  
  };

  const handlePreview = async () => {  
    if (!proposal) return; // Do nothing if no proposal

    setLoading(true); // Set loading state  
    try {  
      const response = await axios.get(  
        `${process.env.REACT_APP_LARAVEL_API_BASE_URL}/api/business-proposals/${proposal.id}/preview`, // API endpoint for HTML preview  
        { params: { provider: formData.provider } }  
      );  
      setHtmlPreview(response.data); // Save HTML preview  
    } catch (error) {  
      console.error('Error fetching preview:', error); // Log error  
    } finally {  
      setLoading(false); // Reset loading state  
    }  
  };

  return (  
    <div className="proposal-container">  
      <h1>Business Proposal Generator</h1>

      <form onSubmit={handleSubmit}>  
        <div>  
          <label>Title:</label>  
          <input  
            type="text"  
            value={formData.title}  
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} // Update title  
            required  
          />  
        </div>

        <div>  
          <label>Proposal Text:</label>  
          <textarea  
            value={formData.text}  
            onChange={(e) => setFormData({ ...formData, text: e.target.value })} // Update text  
            required  
            rows={10}  
          />  
        </div>

        <div>  
          <label>AI Provider:</label>  
          <select  
            value={formData.provider}  
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })} // Update provider  
          >  
            <option value="groq">Groq</option>  
            <option value="openai">OpenAI</option>  
            <option value="deepseek">DeepSeek</option>  
            <option value="gemini">Gemini</option>  
          </select>  
        </div>

        <button type="submit" disabled={loading}>  
          {loading ? 'Processing...' : 'Create Proposal'} {/* Button text changes on loading */}  
        </button>  
      </form>

      {proposal && (  
        <div className="proposal-actions">  
          <button onClick={handlePreview} disabled={loading}>  
            {loading ? 'Generating...' : 'Preview HTML'} {/* Button text changes on loading */}  
          </button>

          {htmlPreview && (  
            <div className="preview-container">  
              <h2>HTML Preview</h2>  
              <div dangerouslySetInnerHTML={{ __html: htmlPreview }} /> {/* Render HTML preview */}  
            </div>  
          )}  
        </div>  
      )}  
    </div>  
  );  
};

export default BusinessProposal;
```
**Add Route for the component:**

* Install React Router: `npm install react-router-dom`
* Wrap your app with `BrowserRouter:` In `src/main.tsx` or `src/index.tsx`:
```tsx
import React from 'react';  
import ReactDOM from 'react-dom/client';  
import { BrowserRouter } from 'react-router-dom';  
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(  
  <React.StrictMode>  
    <BrowserRouter>  
      <App />  
    </BrowserRouter>  
  </React.StrictMode>  
);
```
* Define Routes & add a link to the route in src/`App.tsx`
```tsx
import { Routes, Route, Link } from 'react-router-dom';  
import BusinessProposal from './components/BusinessProposal';

function App() {  
  return (  
    <div>  
      <nav>  
        <Link to="/proposal">Business Proposal</Link>  
      </nav>

      <Routes>  
        <Route path="/" element={<h1>Welcome</h1>} />  
        <Route path="/proposal" element={<BusinessProposal />} />  
      </Routes>  
    </div>  
  );  
}

export default App;
```
**Run React Frontend**:  
```sh
cd react-frontend  
npm start  
```
URL: [http://localhost:3000](http://localhost:3000) ([http://localhost:3000/proposal](http://localhost:3000/proposal))

### Summary of running and testing all the systems

1. **MCP Server**:

Create OpenAI API key and add to MCP server .env  
```sh
cd mcp-server  
npm run dev	|	[http://localhost:3001](http://localhost:3001)
```
2. **Laravel API**:
```sh
cd laravel-api  
php artisan serve --port=8000
```
URL: [http://localhost:8000/api](http://localhost:8000/api)

3. **React Frontend**:

```sh
cd react-frontend  
npm start
```
URL: [http://localhost:3000](http://localhost:3000)

**Test endpoints:**

* GET from `http://localhost:3000` in browser  
* POST (From React to Laravel API) `http://localhost:8000/api/business-proposals`  
* Protocol Endpoints (From Laravel to Node.js MCP server):  
  * POST `http://localhost:3001/mcp/text-enhancement` \- For enhancing proposal text  
  * POST `http://localhost:3001/mcp/generate-html` \- For generating HTML templates

**Free & Paid AI API providers**

* Free: Groq  
* Paid: OpenAI, DeepSeek, Gemini

### Notes for Each Provider

**Groq ([https://console.groq.com/home](https://console.groq.com/home))**

* Sign in with Google  
* Get an API key  
* Endpoint: `https://api.groq.com/openai/v1/chat/completions`  
* Auth: Bearer token  
* Model: "meta-llama/llama-4-scout-17b-16e-instruct",  
* 

**OpenAI**

* Endpoint: `https://api.openai.com/v1/chat/completions`  
* Auth: Bearer token  
* Model: `gpt-4`, `gpt-3.5-turbo`, etc.

**DeepSeek (default we are using)**

* Endpoint: `https://api.deepseek.com/v1/chat/completions`  
* Auth: Bearer token  
* Model: `deepseek-chat`, `deepseek-coder`  
* **Not free now \-** Get Free DeepSeek API Access and API Key  
1. **Visit the DeepSeek website**: Go to [https://www.deepseek.com](https://www.deepseek.com/)  
2. **Look for API documentation**: Check for an "API" or "Developers" section  
3. **Sign up for an account**: You'll typically need to create a developer account ([platform.deepseek.com](http://platform.deepseek.com))  
4. **Generate an API key**: There should be an option to create new API keys in your account dashboard  
   1. MCP-POC   
   2. sk-xxxxxxxxxxxxxxxxxxxxxx

**Gemini (Google)**

* Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`  
* Auth: API key as query param  
* Format: uses `contents` with `parts`

### Key Benefits of this MCP implementation

1. **Separation of Concerns**: AI logic is isolated in the MCP server  
2. **Scalability**: Can easily add more AI models or switch providers  
3. **Consistency**: Standardized interface for all AI operations  
4. **Security**: API keys and sensitive logic stay in the MCP server  
5. **Performance**: Can implement caching at multiple levels

### Troubleshooting Tips

1. If ports conflict, change in respective `.env`/configuration files  
2. For CORS issues, verify:  
   * MCP server has `cors()` middleware enabled  
   * Laravel has CORS package installed if needed  
3. For ChatGPT API errors:  
   * Verify API key is correct  
   * Check OpenAI account quota  
4. For database issues:  
   * Verify MySQL is running  
   * Check Laravel `.env` credentials

### Recommended AWS Services to host this app

| Component | AWS Service |
| :---- | :---- |
| React | AWS Amplify OR S3+CloudFront |
| Laravel | Elastic Beanstalk (PHP) |
| Node.js | Elastic Beanstalk (Node) or Lambda |
| Database | Amazon RDS (MySQL) |
| Storage | S3 |
| CI/CD | CodePipeline |

