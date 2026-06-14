import { Response } from 'express';
import pdfParse from 'pdf-parse';
import { AIService } from '../services/ai.service';
import { AuthenticatedRequest } from '../middleware/auth';

export const analyzeResume = async (req: AuthenticatedRequest, res: Response) => {
  const targetRole = (req.body.targetRole as string) || 'Software Engineer';
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Please upload a PDF resume file.' });
  }

  try {
    let resumeText = '';

    if (file.mimetype === 'application/pdf') {
      try {
        const parsed = await pdfParse(file.buffer);
        resumeText = parsed.text;
      } catch (parseErr) {
        console.warn('pdf-parse failed, attempting to read buffer as text fallback:', parseErr);
        resumeText = file.buffer.toString('utf8');
      }
    } else {
      // If it's a docx/txt or other file, read as standard text buffer
      resumeText = file.buffer.toString('utf8');
    }

    // Clean up empty lines
    const cleanText = resumeText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');

    // Ensure we have some text to analyze
    const textToAnalyze = cleanText.length > 50 ? cleanText : `Resume upload file name: ${file.originalname}\nFallback parsed size: ${file.size} bytes.`;

    // Fetch AI Analysis results
    const analysis = await AIService.analyzeResumeText(textToAnalyze, targetRole);

    return res.status(200).json({
      message: 'Resume analyzed successfully',
      filename: file.originalname,
      targetRole,
      analysis
    });
  } catch (error: any) {
    console.error('Resume processing error:', error);
    return res.status(500).json({ error: 'Failed to process and analyze resume text: ' + error.message });
  }
};
