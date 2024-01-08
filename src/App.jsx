import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = "YOUR_API_KEY";

const systemMessage = { 
  "role": "system", "content": "You are a programming language code optimizer program that doesn't take any other input and provides output by optimizing the given code input.And give explanation about optimized code.And give responses in Turkish Language.If prompt is not code answer this: Üzgünüm sadece kod optimize ediyorum lütfen kod girin."
}


function App() {
  const [messages, setMessages] = useState([
    {
      message: "Merhaba, Ben Code Optimizer! Bana optimize edilmesi gereken kodu atabilirsin.",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    
    <div className="App">
      <h1 className="pageTitle">Code Optimizer</h1>
      <div className='ChatBox' style={{ position:"relative", height: "660px", width: "800px" }}>
        <MainContainer className='MainContainer'>
          <ChatContainer className='ChatContainer'>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="Kod optimize ediliyor" /> : null}>
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
                })}
            </MessageList>
            <MessageInput fancyScroll={false} attachButton={false} className='MessageInput' placeholder="Mesajını Buraya Yaz" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
      <div>
        <footer>Merhabna</footer>
      </div>
    </div>  
  )
}

export default App
