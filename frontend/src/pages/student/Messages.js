import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Chip,
  Avatar,
  Divider,
  Badge,
  IconButton,
  Card,
} from '@mui/material';
import { Send, Business, Message as MessageIcon } from '@mui/icons-material';
import api from '../../services/api';
import { formatDateTime } from '../../utils/helpers';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      // Mark conversation as read
      markConversationRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messaging/conversations/');
      const convs = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setConversations(convs);
      if (convs.length > 0 && !selectedConversation) {
        setSelectedConversation(convs[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoading(false);
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/messaging/conversations/${conversationId}/`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markConversationRead = async (conversationId) => {
    try {
      await api.post(`/messaging/conversations/${conversationId}/mark_read/`);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await api.post('/messaging/messages/', {
        conversation_id: selectedConversation.id,
        content: newMessage,
      });
      setNewMessage('');
      // Refresh messages
      fetchMessages(selectedConversation.id);
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Messages
      </Typography>

      <Card sx={{ height: '75vh', display: 'flex', overflow: 'hidden' }}>
        {/* Conversations List */}
        <Box sx={{ 
          width: { xs: '100%', md: '350px' }, 
          borderRight: { md: '1px solid' },
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Conversations
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List sx={{ p: 0 }}>
              {conversations.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No messages yet" 
                    primaryTypographyProps={{ color: 'text.secondary', align: 'center' }}
                  />
                </ListItem>
              ) : (
                conversations.map((conv) => (
                  <ListItem
                    key={conv.id}
                    button
                    selected={selectedConversation?.id === conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    sx={{
                      py: 2,
                      px: 2.5,
                      bgcolor: selectedConversation?.id === conv.id ? 'primary.light' : 'transparent',
                      color: selectedConversation?.id === conv.id ? 'white' : 'inherit',
                      '&:hover': { 
                        bgcolor: selectedConversation?.id === conv.id ? 'primary.light' : 'action.hover',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        mr: 2,
                        bgcolor: selectedConversation?.id === conv.id ? 'rgba(255,255,255,0.2)' : 'primary.main',
                        color: 'white',
                      }}
                    >
                      <Business />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              color: selectedConversation?.id === conv.id ? 'white' : 'inherit',
                            }}
                          >
                            {(() => {
                              const recruiter = conv.recruiter_profile;
                              if (recruiter?.company_name) {
                                return recruiter.company_name;
                              }
                              if (recruiter?.user?.username) {
                                return recruiter.user.username;
                              }
                              return 'Recruiter';
                            })()}
                          </Typography>
                          {conv.unread_count > 0 && (
                            <Chip 
                              label={conv.unread_count} 
                              size="small" 
                              color="error"
                              sx={{ 
                                height: 20,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          noWrap
                          sx={{
                            color: selectedConversation?.id === conv.id ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                            mt: 0.5,
                          }}
                        >
                          {conv.last_message?.content || 'No messages yet'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        </Box>

        {/* Messages Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          {selectedConversation ? (
            <>
              {/* Header */}
              <Box sx={{ 
                p: 3, 
                borderBottom: '1px solid', 
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {selectedConversation.recruiter_profile?.company_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedConversation.recruiter_profile?.location}
                </Typography>
              </Box>

              {/* Messages */}
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: 3, 
                bgcolor: 'background.default',
                backgroundImage: 'linear-gradient(to bottom, #f8fafc, #ffffff)',
              }}>
                {messages.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    flexDirection: 'column',
                    gap: 2,
                  }}>
                    <Typography variant="body1" color="text.secondary">
                      No messages yet.
                    </Typography>
                  </Box>
                ) : (
                  messages.map((msg) => (
                    <Box
                      key={msg.id}
                      sx={{
                        display: 'flex',
                        justifyContent: msg.sender_role === 'student' ? 'flex-end' : 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2.5,
                          maxWidth: '70%',
                          bgcolor: msg.sender_role === 'student' ? 'primary.main' : 'background.paper',
                          color: msg.sender_role === 'student' ? 'white' : 'text.primary',
                          borderRadius: 3,
                          borderTopLeftRadius: msg.sender_role === 'student' ? 0 : 3,
                          borderTopRightRadius: msg.sender_role === 'student' ? 3 : 0,
                        }}
                      >
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                          {msg.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 1,
                            opacity: 0.7,
                            fontSize: '0.75rem',
                          }}
                        >
                          {formatDateTime(msg.created_at)}
                        </Typography>
                      </Paper>
                    </Box>
                  ))
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box sx={{ 
                p: 3, 
                borderTop: '1px solid', 
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: '0 -1px 3px rgba(0,0,0,0.1)',
              }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Type your reply..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: 'background.default',
                      },
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    sx={{ 
                      alignSelf: 'flex-end',
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 48,
                      height: 48,
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '&:disabled': {
                        bgcolor: 'action.disabledBackground',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              flexDirection: 'column',
              gap: 2,
            }}>
              <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                Select a conversation to view messages
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default Messages;
