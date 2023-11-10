import { useState } from 'react';

interface Message {
  message: string;
  sender: 'user' | 'bot';
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function queryFlowiseAPI(userInput: string): Promise<void> {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://20.13.55.159:3000/api/v1/prediction/589b42e1-b518-4268-8b13-1fd9e760e953",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            question: userInput,
            history: messages.map(msg => ({
              message: msg.message,
              type: msg.sender === 'user' ? 'userMessage' : 'apiMessage'
            })),
            // If overrideConfig is not required by the API, this property can be omitted
            // overrideConfig: {
            //   returnSourceDocuments: true
            // }
          })
        }
      );
      const result = await response.json();
      console.log('API Response:', result); // Log the full API response

      if (result && typeof result.text === 'string') {
        setMessages(currentMessages => [...currentMessages, { message: result.text, sender: 'bot' }]);
      } else {
        console.error('Unexpected response structure:', result);
        setMessages(currentMessages => [...currentMessages, { message: 'Received unexpected data structure from API.', sender: 'bot' }]);
      }
    } catch (error) {
      console.error("Failed to fetch from Flowise API", error);
      setMessages(currentMessages => [...currentMessages, { message: 'Error fetching response.', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  }

  const sendMessage = (): void => {
    if (input.trim() === '') return;
    setMessages(currentMessages => [...currentMessages, { message: input, sender: 'user' }]);
    queryFlowiseAPI(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="p-4 text-2xl text-gray-800 bg-blue-100 shadow-md">Nomad Beta Chat</div>
      <div className="flex-grow p-4 overflow-auto">
        {messages.map((message, index) => (
          <div key={index} className={`flex my-1 items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`min-w-0 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg break-words ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-blue-200 text-black'}`}>
              {message.message}
            </div>
          </div>
        ))}
      </div>
      <div className="flex p-4 gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 border rounded shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}






