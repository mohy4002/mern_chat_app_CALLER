import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';

// IMPORTANT: Initialize socket outside the component to ensure a single connection.
// autoConnect: false means we'll manually connect it later when currentUser is ready.
const API_BASE_URL = 'http://localhost:5000/api';
const socket = io('http://localhost:5000', { autoConnect: false });

// Helper function to create a consistent room ID (same logic as backend)
const getRoomId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}-${sortedIds[1]}`;
};

function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    // --- State Variables ---
    const [currentUser, setCurrentUser] = useState(null);
    const [token] = useState(location.state?.token || localStorage.getItem('token'));
    const [activeSection, setActiveSection] = useState('profile');

    const [editFormData, setEditFormData] = useState({ username: '', email: '', status: 'offline', avatar: null });

    const [allPotentialFriends, setAllPotentialFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // --- Chatbot Specific States ---
    const [chatbotMessages, setChatbotMessages] = useState([
        { sender: 'bot', text: "Hello! I'm your friendly chatbot. How can I help you today? Try asking me 'How do I add a friend?'" }
    ]);
    const [chatbotInput, setChatbotInput] = useState('');
    const chatbotMessagesEndRef = useRef(null); // Ref for chatbot scroll

    // --- Chat Specific States ---
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [fileToSend, setFileToSend] = useState(null);

    // --- NEW: Toast Notification State ---
    const [toast, setToast] = useState({ show: false, message: '', type: '' }); // type: 'success' or 'error'

    // --- Refs ---
    const messagesEndRef = useRef(null);
    const activeChatRef = useRef(activeChat);
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    // --- Helper to show toast notifications ---
const showToast = useCallback((message, type = 'success', duration = 3000) => {
    console.log(`Attempting to show toast: Message: "<span class="math-inline">\{message\}", Type\: "</span>{type}"`); // <--- ADD THIS LINE
    setToast({ show: true, message, type });
    const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
    }, duration);
    return () => clearTimeout(timer); // Cleanup timer if component unmounts
}, []);


    // --- Memoized Callbacks (`useCallback`) ---
    const fetchUserProfile = useCallback(async () => {
        if (!token) {
            navigate('/sign_up', { replace: true });
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/sign_up', { replace: true });
                }
                throw new Error('Failed to fetch user profile.');
            }

            const data = await response.json();
            setCurrentUser(data);
            setEditFormData({
                username: data.username,
                email: data.email,
                status: data.status,
                avatar: null
            });

            // Automatically set user to 'online' if not already
            if (data.status !== 'online') {
                // Update local state immediately for responsiveness
                setCurrentUser(prevUser => ({ ...prevUser, status: 'online' }));
                setEditFormData(prev => ({ ...prev, status: 'online' }));
                // Send update to backend
                await fetch(`${API_BASE_URL}/users/me`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'online' }),
                });
                // Emit status update via socket for other clients
                socket.emit('updateStatus', { userId: data._id, status: 'online' });
            }

        } catch (error) {
            console.error('Error fetching user profile:', error);
            localStorage.removeItem('token');
            navigate('/sign_up', { replace: true });
        }
    }, [token, navigate]);

    // --- Effects (`useEffect`) ---

    // Effect 1: Fetch User Profile on Component Mount
    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    // Effect 2: Socket.IO Connection and Event Listener Setup
    useEffect(() => {
        if (currentUser?._id && !socket.connected) {
            socket.connect();
            console.log('Attempting to connect socket...');
        }

        const handleSocketConnect = () => {
            console.log('Socket connected successfully. Joining personal room:', currentUser._id);
            socket.emit('join', currentUser._id);
        };

        if (currentUser?._id) {
            socket.on('connect', handleSocketConnect);
            socket.on('joinedPersonalRoom', (userId) => {
                console.log(`Server confirmed: User ${userId} joined their personal socket room.`);
            });
        }

        const handleUserStatusUpdate = (data) => {
            setCurrentUser(prevUser => {
                if (!prevUser) return null;
                const updatedFriends = prevUser.friends.map(friend =>
                    friend._id === data.userId ? { ...friend, status: data.status } : friend
                );
                return { ...prevUser, friends: updatedFriends };
            });
            // Also update the status in allPotentialFriends if they are there
            setAllPotentialFriends(prev => prev.map(user =>
                user._id === data.userId ? { ...user, status: data.status } : user
            ));
        };
        socket.on('userStatusUpdate', handleUserStatusUpdate);

        const handleReceiveMessage = (message) => {
            console.log('Received message:', message);
            if (activeChatRef.current && currentUser?._id && getRoomId(currentUser._id, activeChatRef.current.friend._id) === message.room) {
                setMessages(prevMessages => [...prevMessages, message]);
            }
        };
        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            console.log('Cleaning up Socket.IO listeners and disconnecting...');
            if (currentUser) {
                socket.emit('userOffline', currentUser._id);
            }
            socket.off('connect', handleSocketConnect);
            socket.off('joinedPersonalRoom');
            socket.off('userStatusUpdate', handleUserStatusUpdate);
            socket.off('receiveMessage', handleReceiveMessage);
            socket.disconnect();
            console.log('Socket disconnected.');
        };
    }, [currentUser?._id]);

    // Effect 3: Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // NEW EFFECT 4: Auto-scroll chatbot messages to bottom
    useEffect(() => {
        chatbotMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatbotMessages]);

    // NEW EFFECT 5: Fetch all potential friends when 'add-user' section becomes active
    useEffect(() => {
        const fetchAllUsersForAdd = async () => {
            if (!currentUser || !token) return;

            try {
                // Call the /api/users/search endpoint without a query parameter
                // Backend should return all users (excluding self and friends)
                const response = await fetch(`${API_BASE_URL}/users/search`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Failed to fetch all users.');
                const data = await response.json();

                // Data from backend is already filtered (excluding self and friends)
                setAllPotentialFriends(data);
                setSearchResults(data); // Initially display all of them
            } catch (error) {
                console.error('Error fetching all users for add friend section:', error);
                setAllPotentialFriends([]);
                setSearchResults([]);
            }
        };

        if (activeSection === 'add-user') {
            fetchAllUsersForAdd();
        } else {
            // Clear search query and results when leaving add-user section
            setSearchQuery('');
            setAllPotentialFriends([]);
            setSearchResults([]);
        }
    }, [activeSection, currentUser, token]);

    // Effect 6: Client-side filtering for search results
    useEffect(() => {
        const query = searchQuery.trim().toLowerCase();
        if (query === '') {
            setSearchResults(allPotentialFriends); // If query is empty, show all potential friends
        } else {
            const filtered = allPotentialFriends.filter(user =>
                user.username.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
            setSearchResults(filtered);
        }
    }, [searchQuery, allPotentialFriends]);


    // --- Handlers for User Actions ---

    const handleLogout = () => {
        localStorage.removeItem('token');
        if (currentUser) {
            socket.emit('userOffline', currentUser._id);
        }
        socket.disconnect();
        navigate('/sign_up', { replace: true });
    };

    const handleEditFormChange = (e) => {
        const { name, value, files } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleProfileUpdateSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', editFormData.username);
        formData.append('email', editFormData.email);
        formData.append('status', editFormData.status);
        if (editFormData.avatar) {
            formData.append('avatar', editFormData.avatar);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to update profile.');
            const data = await response.json();
            setCurrentUser(data.user);

            if (data.user.status !== currentUser.status) {
                socket.emit('updateStatus', { userId: data.user._id, status: data.user.status });
            }
            showToast(data.message, 'success'); // Use toast instead of alert
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Failed to update profile. Please try again.', 'error'); // Use toast instead of alert
        }
    };

    const handleAddFriend = async (friendId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/friends/add/${friendId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add friend');
            }
            showToast('Friend added successfully!', 'success'); // Use toast
            await fetchUserProfile(); // Re-fetch user to update friends list

            // After adding, re-fetch all potential friends to update the 'Add User' list
            const usersResponse = await fetch(`${API_BASE_URL}/users/search`, { headers: { 'Authorization': `Bearer ${token}` } });
            const allUsersData = await usersResponse.json();
            setAllPotentialFriends(allUsersData); // Update the master list
            // Re-filter current search results if there's a query
            setSearchResults(allUsersData.filter(user =>
                user.username.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.trim().toLowerCase())
            ));

        } catch (error) {
            console.error('Error adding friend:', error);
            showToast(error.message || 'Failed to add friend.', 'error'); // Use toast
        }
    };

    const handleRemoveFriend = async (friendId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/friends/remove/${friendId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove friend');
            }
            showToast('Friend removed successfully!', 'success'); // Use toast
            await fetchUserProfile(); // Re-fetch user to update friends list
            // Optionally, re-fetch all potential friends here too if you want the removed friend to appear in 'add-user' section
            const usersResponse = await fetch(`${API_BASE_URL}/users/search`, { headers: { 'Authorization': `Bearer ${token}` } });
            const allUsersData = await usersResponse.json();
            setAllPotentialFriends(allUsersData); // Update the master list
            setSearchResults(allUsersData); // Refresh search results after removal
        } catch (error) {
            console.error('Error removing friend:', error);
            showToast(error.message || 'Failed to remove friend.', 'error'); // Use toast
        }
    };

    const handleFriendClick = async (friend) => {
        if (!currentUser) return;

        const roomId = getRoomId(currentUser._id, friend._id);

        if (activeChat && activeChat.roomId && activeChat.roomId !== roomId) {
            socket.emit('leaveChatRoom', activeChat.roomId);
        }

        setActiveChat({ friend, roomId: roomId });
        setMessages([]);
        socket.emit('joinChatRoom', roomId);

        try {
            const messagesResponse = await fetch(`${API_BASE_URL}/messages/${friend._id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!messagesResponse.ok) throw new Error('Failed to fetch messages.');
            const messagesData = await messagesResponse.json();
            setMessages(messagesData);

        } catch (error) {
            console.error('Error handling friend click:', error);
            showToast('Could not start chat.', 'error'); // Use toast
        }
    };

    const sendMessage = async () => {
        if (!activeChat || (!newMessage.trim() && !fileToSend)) return;

        let fileUrl = null;
        let messageType = 'text';
        let messageContent = newMessage.trim();

        if (fileToSend) {
            const formData = new FormData();
            formData.append('file', fileToSend);

            try {
                const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                if (!uploadResponse.ok) throw new Error('File upload failed.');
                const uploadData = await uploadResponse.json();
                fileUrl = uploadData.fileUrl;
                messageType = fileToSend.type.startsWith('image/') ? 'image' : 'file';
                messageContent = fileToSend.name || 'File';
            } catch (error) {
                console.error('File upload error:', error);
                showToast('Failed to upload file.', 'error'); // Use toast
                return;
            }
        }

        try {
            socket.emit('sendMessage', {
                senderId: currentUser._id,
                receiverId: activeChat.friend._id,
                content: messageContent,
                type: messageType,
                fileUrl: fileUrl,
                room: activeChat.roomId
            });
            setNewMessage('');
            setFileToSend(null);
            const fileInput = document.getElementById('file-input');
            if (fileInput) fileInput.value = '';

        } catch (error) {
            console.error('Error sending message:', error);
            showToast('Failed to send message.', 'error'); // Use toast
        }
    };


    // --- Chatbot Handlers ---
    const handleChatbotSubmit = async () => {
        const userQuestion = chatbotInput.trim();
        if (!userQuestion) return;

        // 1. Add user's question to the messages
        setChatbotMessages(prevMessages => [...prevMessages, { sender: 'user', text: userQuestion }]);
        setChatbotInput(''); // Clear input

        try {
            // 2. Send question to backend
            const response = await fetch(`${API_BASE_URL}/chatbot/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ question: userQuestion })
            });

            if (!response.ok) {
                throw new Error('Failed to get chatbot response.');
            }

            const data = await response.json();
            // 3. Add chatbot's answer to the messages
            setChatbotMessages(prevMessages => [...prevMessages, { sender: 'bot', text: data.answer }]);

        } catch (error) {
            console.error('Error fetching chatbot response:', error);
            setChatbotMessages(prevMessages => [...prevMessages, { sender: 'bot', text: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
        }
    };


    // --- Render Logic ---
    if (!currentUser) {
        return <div className='loading-screen'>Loading dashboard...</div>;
    }

    return (
        <div className='dashboard'>
            {/* NEW: Toast Notification Display */}
            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <div className="sidebar">
                {/* Profile Button */}
                <button onClick={() => setActiveSection('profile')} title="My Profile">
                    {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="User Avatar" className="sidebar-avatar" />
                    ) : (
                        <i className="fa-solid fa-circle-user"></i>
                    )}
                </button>
                <hr className="sidebar-divider" />

                {/* Navigation Buttons */}
                <button onClick={() => setActiveSection('friends')} title="My Friends">
                    <i className="fa-solid fa-user-group"></i>
                </button>
                <button onClick={() => setActiveSection('add-user')} title="Add New Friend">
                    <i className="fa-solid fa-user-plus"></i>
                </button>
                {/* NEW: Chatbot Button */}
                <button onClick={() => setActiveSection('chatbot')} title="Ask Chatbot">
                    <i className="fa-solid fa-robot"></i>
                </button>
                <button onClick={handleLogout} title="Logout">
                    <i className="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>

            <div className="content">
                <div className="up-section p-2">
                    <h2 className='text-light d-block'>CALLER</h2>

                    {activeSection === 'add-user' && (
                        <div className="search-input-area mt-2">
                            <br />
                            <input
                                type="text"
                                name='search'
                                placeholder='Search for a contact'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Conditional Sections */}
                {activeSection === 'profile' && (
                    <div className="parties part-profile">
                        <form onSubmit={handleProfileUpdateSubmit}>
                            <div className='text-center py-3'>
                                {currentUser.avatarUrl ? (
                                    <img src={currentUser.avatarUrl} alt="User Avatar" className="profile-large-avatar" />
                                ) : (
                                    <i className="fa-solid fa-circle-user profile-icon-large"></i>
                                )}
                                <h3 className='text-light profile-username-display'>{currentUser.username}</h3>
                            </div>
                            <div className="form-group">
                                <label htmlFor="username">Username:</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={editFormData.username}
                                    onChange={handleEditFormChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="avatar">Change Avatar:</label>
                                <input
                                    type="file"
                                    id="avatar"
                                    name="avatar"
                                    accept="image/*"
                                    onChange={handleEditFormChange}
                                />
                            </div>
                            <button type="submit" className="submit-button">Update Profile</button>
                        </form>
                    </div>
                )}

                {activeSection === 'friends' && (
                    <div className="parties part-friends">
                        <h3 className='section-title'>My Friends</h3>
                        {currentUser.friends && currentUser.friends.length > 0 ? (
                            <div className="friends-list-container">
                                {currentUser.friends.map(friend => (
                                    <div key={friend._id} className="friend-item" onClick={() => handleFriendClick(friend)}>
                                        <img src={friend.avatarUrl || '/default-profile.png'} alt={`${friend.username}'s Avatar`} className="friend-avatar" />
                                        <span className="friend-username">{friend.username}</span>
                                        <span className={`status-dot ${friend.status}`}></span>
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveFriend(friend._id); }} className="remove-friend-btn"><i className="fa-solid fa-user-slash"></i></button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className='no-data-message'>No friends yet. Add some from "Add New Friend"!</p>
                        )}
                    </div>
                )}

                {activeSection === 'add-user' && (
                    <div className="parties part-add-user">
                        <h3 className='section-title'>Users to Add</h3>
                        {searchResults.length > 0 ? (
                            <div className="search-results-list">
                                {searchResults.map(user => (
                                    <div key={user._id} className="search-result-item">
                                        <img src={user.avatarUrl || '/default-profile.png'} alt={`${user.username}'s Avatar`} className="friend-avatar" />
                                        <span className="friend-username">{user.username}</span>
                                        <span className={`status-dot ${user.status}`}></span>
                                        {currentUser.friends.some(f => f._id === user._id) ? (
                                            <span className="already-friend"><i className="fa-solid fa-thumbs-up"></i></span>
                                        ) : (
                                            <button onClick={() => handleAddFriend(user._id)} className="add-friend-btn"><i className="fa-solid fa-user-plus"></i></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            searchQuery.trim() !== '' ? (
                                <p className='no-data-message'>No users found matching "{searchQuery}".</p>
                            ) : (
                                <p className='no-data-message'>No other users to display. Perhaps all are your friends, or none exist yet.</p>
                            )
                        )}
                    </div>
                )}

                {/* NEW: Chatbot Section */}
                {activeSection === 'chatbot' && (
                    <div className="parties part-chatbot">
                        <h3 className='section-title'>AI Assistant</h3>
                        <div className="chatbot-message-list">
                            {chatbotMessages.map((msg, index) => (
                                <div key={index} className={`chatbot-message-item ${msg.sender}`}>
                                    <div className="chatbot-message-bubble">
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatbotMessagesEndRef} /> {/* For auto-scrolling */}
                        </div>
                        <div className="chatbot-input-area">
                            <input
                                type="text"
                                placeholder="Ask me a question..."
                                value={chatbotInput}
                                onChange={(e) => setChatbotInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleChatbotSubmit();
                                    }
                                }}
                            />
                            <button onClick={handleChatbotSubmit}><i className="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </div>
                )}
            </div>

            <div className="chat-window">
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <img src={activeChat.friend?.avatarUrl || '/default-profile.png'} alt={`${activeChat.friend?.username}'s Avatar`} className="chat-header-avatar" />
                            <h3 className="chat-header-username">{activeChat.friend?.username}</h3>
                            <span className={`status-dot ${activeChat.friend?.status}`}></span>
                        </div>
                        <div className="message-list">
                            {messages.map(msg => (
                                <div key={msg._id} className={`message-item ${msg.sender?._id === currentUser?._id ? 'sent' : 'received'}`}>
                                    {msg.sender?._id !== currentUser?._id && (
                                        <img src={msg.sender?.avatarUrl || '/default-profile.png'} alt="Sender Avatar" className="message-avatar" />
                                    )}
                                    <div className="message-bubble">
                                        {msg.type === 'text' && <p>{msg.content}</p>}
                                        {msg.type === 'image' && <img src={msg.fileUrl} alt="Sent Image" className="message-image" />}
                                        {msg.type === 'file' && <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="message-file-link">📁 {msg.content || 'File'}</a>}
                                        <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    {msg.sender?._id === currentUser?._id && (
                                        <img src={msg.sender?.avatarUrl || '/default-profile.png'} alt="My Avatar" className="message-avatar" />
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="message-input-area">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        sendMessage();
                                    }
                                }}
                            />
                            <label htmlFor="file-input" className="file-input-label">
                                <i className="fa-solid fa-paperclip"></i>
                                <input
                                    type="file"
                                    id="file-input"
                                    style={{ display: 'none' }}
                                    accept="image/*, application/pdf, .doc, .docx"
                                    onChange={(e) => setFileToSend(e.target.files[0])}
                                />
                            </label>
                            {fileToSend && <span className="file-preview">{fileToSend.name}</span>}
                            <button onClick={sendMessage}><i className="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </>
                ) : (
                    <div className="chat-window-placeholder">
                        <i className="fa-solid fa-comments chat-placeholder-icon"></i>
                        <p>Select a friend to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;