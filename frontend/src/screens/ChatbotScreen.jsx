import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, ListGroup, InputGroup, Badge } from 'react-bootstrap';

function getAccessFromStorage() {
  const tokenData = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
  return tokenData && (tokenData.access || (tokenData.user && tokenData.user.access))
}

function ChatbotScreen() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'AI Assistant', text: 'Hi — I\'m your local AI chatbot. How can I help?' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const nextId = useRef(2);
  const bottomRef = useRef();
  const [usageLeft, setUsageLeft] = useState(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    async function fetchUsage() {
      const access = getAccessFromStorage()
      const headers = { 'Content-Type': 'application/json' }
      if (access) headers['Authorization'] = `Bearer ${access}`
      try {
        const res = await fetch('/api/v1/subscriptions/me/', { headers })
        if (res.status === 204) {
          setUsageLeft(0)
          return
        }
        if (!res.ok) return
        const data = await res.json()
        setUsageLeft(data.usage_left)
      } catch (err) {
        // ignore
      }
    }
    fetchUsage()
  }, [])

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: nextId.current++, sender: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setSending(true);

    try {
      const access = getAccessFromStorage()
      const headers = { 'Content-Type': 'application/json' }
      if (access) headers['Authorization'] = `Bearer ${access}`

      const res = await fetch('/api/v1/chat/ask/', {
        method: 'POST',
        headers,
        // include token in body as fallback if Authorization header is lost
        body: JSON.stringify({ message: userMsg.text, access }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error || data.detail || `Status ${res.status}`
        const botMsg = { id: nextId.current++, sender: 'AI Assistant', text: `Error: ${errMsg}` }
        setMessages((m) => [...m, botMsg]);
      } else {
        const botMsg = {
          id: nextId.current++,
          sender: 'AI Assistant',
          text: data.reply || 'No reply from server',
        };
        setMessages((m) => [...m, botMsg]);
        // refresh usage left after successful chat
        try {
          const usageRes = await fetch('/api/v1/subscriptions/me/', { headers })
          if (usageRes.ok) {
            const usageData = await usageRes.json()
            setUsageLeft(usageData.usage_left)
          } else if (usageRes.status === 204) {
            setUsageLeft(0)
          }
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      const botMsg = { id: nextId.current++, sender: 'AI Assistant', text: `Error: ${err.message}` };
      setMessages((m) => [...m, botMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        AI Chatbot{' '}
        {usageLeft !== null && (
          <Badge bg={usageLeft > 0 ? 'success' : 'danger'} style={{ marginLeft: 8 }}>
            Usages left: {usageLeft}
          </Badge>
        )}
      </Card.Header>
      <Card.Body style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
        <ListGroup variant="flush" style={{ overflowY: 'auto', flex: 1 }}>
          {messages.map((msg) => (
            <ListGroup.Item key={msg.id} className={msg.sender === 'user' ? 'text-end' : ''}>
              <div><strong>{msg.sender === 'user' ? 'You' : 'AI Assistant'}</strong></div>
              <div>{msg.text}</div>
            </ListGroup.Item>
          ))}
          <div ref={bottomRef} />
        </ListGroup>

        <Form onSubmit={handleSend} className="mt-3">
          <InputGroup>
            <Form.Control
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" variant="primary" disabled={sending}>
              {sending ? 'Sending…' : 'Send'}
            </Button>
          </InputGroup>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ChatbotScreen;
