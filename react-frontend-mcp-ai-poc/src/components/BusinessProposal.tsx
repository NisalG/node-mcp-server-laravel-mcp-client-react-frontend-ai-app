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
