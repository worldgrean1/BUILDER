import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Sparkles, Loader2, Bot, User } from 'lucide-react';
import { useSettingsStore } from '@/features/settings/settingsStore';
import { callGemini, parseAIResponse, type GeminiMessage, type GeminiPart, fileToBase64 } from '@/features/ai/geminiService';
import { executeAICommand } from '@/features/ai/hydrationService';
import { useCreatorStore } from '@/features/creator/store';

export const CreatorChatPanel = () => {
  const isReady = useSettingsStore(s => s.aiEnabled && s.apiKey.length > 0);
  const selectedIds = useCreatorStore(s => s.selectionIds);
  const document = useCreatorStore(s => s.document);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GeminiMessage[]>([]);
  const [previewImage, setPreviewImage] = useState<{ url: string; base64: string; mimeType: string } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, loading]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 h-full">
        <Sparkles size={24} className="text-text-disabled" />
        <p className="text-[11px] text-text-muted">AI features are disabled or no API key is configured.</p>
        <button onClick={() => window.location.href = '/settings'} className="ui-button-secondary">Open Settings</button>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() && !previewImage) return;
    
    setLoading(true);
    
    const parts: GeminiPart[] = [];
    
    // Add context if a node is selected
    if (selectedIds.length > 0) {
      const activeNode = document.nodes[selectedIds[0]];
      const contextStr = activeNode ? `\n[Context: The user currently has selected a ${activeNode.type} node named "${activeNode.name}" with ID "${activeNode.id}". Apply updates to this targetNodeId if requested.]` : '';
      parts.push({ text: input.trim() + contextStr });
    } else {
      parts.push({ text: input.trim() });
    }

    if (previewImage) {
      parts.push({ inlineData: { mimeType: previewImage.mimeType, data: previewImage.base64 } });
    }

    const newMessage: GeminiMessage = { role: 'user', parts };
    setHistory(prev => [...prev, newMessage]);
    setInput('');
    setPreviewImage(null);

    const result = await callGemini(history, parts);
    
    if (result.error) {
      setHistory(prev => [...prev, { role: 'model', parts: [{ text: `Error: ${result.error}` }] }]);
    } else {
      const parsed = parseAIResponse(result.text);
      if (parsed) {
        // Execute changes on the canvas
        if (parsed.action !== 'reply') {
          executeAICommand(parsed);
        }
        
        // Add reply to history
        const replyText = parsed.description || parsed.message || `Generated ${parsed.nodes?.length} elements.`;
        setHistory(prev => [...prev, { role: 'model', parts: [{ text: replyText }] }]);
      } else {
        setHistory(prev => [...prev, { role: 'model', parts: [{ text: "I couldn't generate a valid UI from that prompt." }] }]);
      }
    }
    
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { mimeType, data } = await fileToBase64(file);
      setPreviewImage({ url: URL.createObjectURL(file), base64: data, mimeType });
    } catch (err) {
      console.error('Failed to parse image', err);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-surface-1">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-4">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
            <Bot size={24} />
            <span className="text-[10px] max-w-[180px]">Describe a UI layout you want me to generate, or upload a reference image.</span>
          </div>
        )}
        
        {history.map((msg, i) => (
          <div key={i} className={`flex gap-2 text-[10px] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 h-5 w-5 rounded flex items-center justify-center ${msg.role === 'model' ? 'bg-brand/20 text-brand' : 'bg-surface-2 text-text-muted'}`}>
              {msg.role === 'model' ? <Sparkles size={10} /> : <User size={10} />}
            </div>
            <div className={`p-2 rounded max-w-[85%] ${msg.role === 'user' ? 'bg-surface-2 text-text-primary' : 'bg-surface-0/50 border border-border-default text-text-muted'}`}>
              {msg.parts.find(p => 'text' in p)?.text?.replace(/\[Context:.*?\]/g, '')}
              {msg.parts.find(p => 'inlineData' in p) && (
                <div className="mt-1 flex items-center gap-1 text-[9px] text-brand bg-brand/10 px-1.5 py-0.5 rounded w-fit">
                  <ImageIcon size={10} /> Image attached
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="h-5 w-5 rounded bg-brand/20 flex items-center justify-center text-brand"><Loader2 size={10} className="animate-spin" /></div>
            <div className="p-2 text-[10px] text-text-muted">Generating UI...</div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border-subtle bg-surface-0">
        {previewImage && (
          <div className="relative inline-block mb-2 ml-1">
            <img src={previewImage.url} alt="Preview" className="h-10 rounded border border-border-default object-cover" />
            <button onClick={() => setPreviewImage(null)} className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-surface-2 rounded-full border border-border-default flex items-center justify-center text-[9px]">×</button>
          </div>
        )}
        <div className="flex items-end gap-1.5 bg-surface-1 rounded border border-border-default p-1 focus-within:border-brand/50">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/jpeg,image/png,image/webp" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="h-6 w-6 flex-shrink-0 flex items-center justify-center text-text-disabled hover:text-text-primary">
            <ImageIcon size={12} />
          </button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type 'Create a pricing card'..."
            className="flex-1 bg-transparent text-[10px] text-text-primary outline-none resize-none pt-1"
            rows={previewImage ? 1 : Math.min(3, input.split('\n').length || 1)}
          />
          <button 
            onClick={handleSend} 
            disabled={loading || (!input.trim() && !previewImage)}
            className="h-6 w-6 flex-shrink-0 flex items-center justify-center rounded bg-brand text-white disabled:opacity-50"
          >
            <Send size={10} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
