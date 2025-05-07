import { env } from "../src/config/env"

// Service Accreditation API types and client
export interface ServiceAccreditationRequest {
  Topic: string;
}

export interface ServiceAccreditationResponse {
  content: string;
  isComplete: boolean;
  document?: string;
  comments?: string;
}

/**
 * Structure of the streaming response data
 */
interface StreamResponseData {
  status?: string;
  message?: string;
  content?: string;
  timestamp?: string;
  final?: boolean;
  document?: {
    Topic?: string;
    Document?: string;
    Comments?: string;
    [key: string]: any;
  } | string;
  comments?: string;
  [key: string]: any;
}

export class AccreditationService {
  private readonly baseUrl = env.BACKEND_URL;
  private readonly API_URL = `${this.baseUrl}/api/ServiceAccreditations`;

  /**
   * Formats content using markdown based on the response type
   * @param data - The parsed JSON data from the stream
   * @returns Formatted markdown content
   */
  private static formatAsMarkdown(data: StreamResponseData): string {
    // If it's the final complete response with document and comments
    if (data.status === "complete" && data.final === true && data.document) {
      let formattedOutput = "## 📄 Final Document\n\n";
      
      // Handle document as an object with Topic, Document, and Comments properties
      if (typeof data.document === 'object') {
        // Add Topic if available
        if (data.document.Topic) {
          formattedOutput += `### ${data.document.Topic}\n\n`;
        }
        
        // Add Document content with special marker for extraction
        if (data.document.Document) {
          formattedOutput += "<div class=\"document-content\">\n\n" + data.document.Document + "\n\n</div>\n\n";
        }
        
        // Add Comments if available
        if (data.document.Comments) {
          formattedOutput += "## 💬 AI Comments\n\n";
          formattedOutput += "<div class=\"comments-content\">\n\n" + data.document.Comments + "\n\n</div>";
        }
      } 
      // Handle document as a string
      else if (typeof data.document === 'string') {
        formattedOutput += "<div class=\"document-content\">\n\n" + data.document + "\n\n</div>\n\n";
        
        // Add separate comments if available
        if (typeof data.comments === 'string') {
          formattedOutput += "## 💬 AI Comments\n\n";
          formattedOutput += "<div class=\"comments-content\">\n\n" + data.comments + "\n\n</div>";
        }
      }
      
      return formattedOutput;
    }
    
    // Handle other status types
    if (data.status) {
      switch (data.status) {
        case "heartbeat":
          // Format heartbeat with a subtle pulse emoji and timestamp
          const timestamp = data.timestamp 
            ? new Date(data.timestamp).toLocaleTimeString() 
            : new Date().toLocaleTimeString();
          return `> 💓 **Heartbeat** at ${timestamp}`;
          
        case "conversation_starting":
          return data.content 
            ? `> 🚀 **Starting conversation:** ${data.content}` 
            : `> 🚀 **${data.message || 'Starting conversation...'}**`;
            
        case "processing":
          return data.content 
            ? `> ⏳ **Processing:** ${data.content}` 
            : `> ⏳ **${data.message || 'Processing...'}**`;
            
        case "error":
          return data.content 
            ? `> ❌ **Error:** ${data.content}` 
            : `> ❌ **Error:** ${data.message || 'An error occurred'}`;

        //response   data: {"status":"message","messageId":1,"author":"Planner","content":"We sta", "timestamp":"2023-10-01T12:00:00Z"}
        //response   data: {"status":"message","messageId":2,"author":"CompliancyOfficer","content:"lorum ipsum", "timestamp":"2023-10-01T12:00:00Z"}
        case "message":
          const author = data.author ? `**${data.author}**` : 'Message';
          const msgTime = data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '';
          const timeDisplay = msgTime ? ` (${msgTime})` : '';
          
          if (data.content) {
            return `> 💬 ${author}${timeDisplay}: ${data.content}`;
          }
          return `> 💬 ${author}${timeDisplay}: ${data.message || ''}`;
            
        case "complete":
          if (data.content) {
            return `> ✅ **Complete:** ${data.content}`;
          }
          return `> ✅ **${data.message || 'Complete'}**`;
          
        default:
          // For any other status types
          if (data.content) {
            return `> **${data.status}:** ${data.content}`;
          }
          if (data.message) {
            return `> **${data.status}:** ${data.message}`;
          }
          return `> **${data.status}**`;
      }
    }
    
    // If it has direct content
    if (data.content) {
      return data.content;
    }
    
    // Fallback: Just stringify the data, but handle objects carefully
    if (typeof data === 'object') {
      try {
        // Try to extract any text content that might be useful
        const contentValues = Object.values(data)
          .filter(val => typeof val === 'string' && val.trim() !== '')
          .join('\n\n');
        
        if (contentValues) {
          return contentValues;
        }
      } catch (e) {
        // If extraction fails, fall back to JSON
      }
    }
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Parses a chunk of the data stream that may contain multiple data: entries
   * @param text - The text chunk from the stream
   * @returns Parsed and formatted markdown content
   */
  private static parseStreamChunk(text: string): string {
    const lines = text.split('\n').filter(line => line.trim());
    let formattedContent = '';
    
    for (const line of lines) {
      if (line.startsWith('data:')) {
        try {
          const jsonStr = line.substring(5).trim();
          if (jsonStr) {
            const data = JSON.parse(jsonStr) as StreamResponseData;
            
            // Special handling for the final document
            if (data.status === "complete" && data.final === true && data.document) {
              return this.formatAsMarkdown(data); // Return only the final document, replacing previous content
            }
            
            formattedContent += this.formatAsMarkdown(data) + '\n\n';
          }
        } catch (e) {
          console.error('Error parsing stream chunk:', e);
          // If we can't parse as JSON, just use the raw content
          formattedContent += line.substring(5).trim() + '\n\n';
        }
      } else {
        // For non data: lines, just add them directly
        formattedContent += line + '\n\n';
      }
    }
    
    return formattedContent;
  }

  /**
   * Fetches service accreditation documentation for a given topic
   * @param topic - The topic to generate documentation for
   * @param onUpdate - Callback for handling streaming updates
   * @returns Promise that resolves when the generation is complete
   */
  public static async getAccreditation(
    topic: string,
    onUpdate?: (content: string, isComplete: boolean) => void
  ): Promise<string> {
    const response = await fetch(`${env.BACKEND_URL}/api/ServiceAccreditations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ Topic: topic })
    });

    if (!response.ok) {
      throw new Error(`Error fetching accreditation: ${response.statusText}`);
    }

    // If we need to handle streaming updates
    if (response.body && onUpdate) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let formattedContent = '';
      
      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onUpdate(formattedContent, true);
          break;
        }
        
        // Decode and process the content
        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;
        
        // Format the incoming data as markdown
        formattedContent = this.parseStreamChunk(accumulatedContent);
        onUpdate(formattedContent, false);
      }
      
      return formattedContent;
    } else {
      // If not handling streaming or if the response doesn't support streaming
      const text = await response.text();
      const formattedContent = this.parseStreamChunk(text);
      
      if (onUpdate) {
        onUpdate(formattedContent, true);
      }
      return formattedContent;
    }
  }
}