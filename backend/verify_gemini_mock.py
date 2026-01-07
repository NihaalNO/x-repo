import os
import unittest
from unittest.mock import patch, MagicMock
from services.gemini_service import get_ai_assistance

class TestGeminiService(unittest.TestCase):
    @patch.dict(os.environ, {"GEMINI_API_KEY": ""})
    def test_no_api_key(self):
        # Ensure 'GEMINI_API_KEY' is removed for this test
        if "GEMINI_API_KEY" in os.environ:
            del os.environ["GEMINI_API_KEY"]
            
        result = get_ai_assistance("Hello")
        self.assertIn("error", result)
        self.assertEqual(result["error"], "Gemini API key not configured")

    @patch.dict(os.environ, {"GEMINI_API_KEY": "fake_key"})
    @patch("services.gemini_service.genai")
    def test_success(self, mock_genai):
        # Mock the model and response
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "This is a mock response"
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model

        result = get_ai_assistance("Hello")
        
        # Verify configure was called
        mock_genai.configure.assert_called_with(api_key="fake_key")
        
        # Verify model used
        mock_genai.GenerativeModel.assert_called_with('gemini-1.5-flash')
        
        self.assertIn("response", result)
        self.assertEqual(result["response"], "This is a mock response")

    @patch.dict(os.environ, {"GEMINI_API_KEY": "fake_key"})
    @patch("services.gemini_service.genai")
    def test_api_error(self, mock_genai):
        # Mock an exception
        mock_genai.configure.side_effect = Exception("API Error")

        result = get_ai_assistance("Hello")
        self.assertIn("error", result)
        self.assertEqual(result["error"], "AI Service Error")
        self.assertIn("API Error", result["detail"])

if __name__ == "__main__":
    unittest.main()
