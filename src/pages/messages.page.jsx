import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import { getDay } from "../common/date";
import { toast } from "react-hot-toast";
import { SocketContext } from "../contexts/SocketContext";

const MessagesPage = () => {
  const { userAuth } = useContext(UserContext);
  const [conversations, setConversations] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const socket = useContext(SocketContext);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const fetchMessages = async (userId) => {
    setLoadingMessages(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/messages/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );
      setMessages(data.messages);
      scrollToBottom();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Сначала сохраняем сообщение через API
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/messages/send`,
        {
          recipient_id: currentChat._id,
          content: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );

      // Добавляем новое сообщение в локальный state
      setMessages((prev) => [...prev, data]);

      // Эмитим событие через сокет для real-time обновления
      socket.emit("send_message", {
        recipient_id: currentChat._id,
        sender_id: userAuth._id,
        content: newMessage,
      });

      // Очищаем поле ввода только после успешной отправки
      setNewMessage("");

      // Прокручиваем к новому сообщению
      scrollToBottom();

      // Обновляем список диалогов
      fetchConversations();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", {
      sender_id: userAuth._id,
      recipient_id: currentChat._id,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (socket) {
      // При подключении сокета загружаем диалоги
      fetchConversations();

      // Проверяем наличие параметра chat в URL
      const chatUsername = searchParams.get("chat");

      if (chatUsername) {
        // Находим пользователя по username
        axios
          .post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/get-profile`,
            { username: chatUsername },
            {
              headers: {
                Authorization: `Bearer ${userAuth.access_token}`,
              },
            }
          )
          .then(({ data }) => {
            if (data) {
              setCurrentChat({
                _id: data._id,
                personal_info: data.personal_info,
                online_status: data.online_status,
              });
              fetchMessages(data._id);
            }
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }

      // Слушаем входящие сообщения
      socket.on("receive_message", (newMessage) => {
        if (currentChat?._id === newMessage.sender._id) {
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        }
        // Обновляем список диалогов
        fetchConversations();
      });

      // Слушаем статус набора текста
      socket.on("user_typing", (data) => {
        if (currentChat?._id === data.sender_id) {
          setIsTyping(true);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      });

      return () => {
        socket.off("receive_message");
        socket.off("user_typing");
      };
    }
  }, [socket, userAuth.access_token]);

  // Обновляем URL при смене чата
  useEffect(() => {
    if (currentChat) {
      setSearchParams({ chat: currentChat.personal_info.username });
    }
  }, [currentChat]);

  // Обновляем fetchConversations для корректной обработки ошибок
  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/messages/conversations`,
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );
      setConversations(data);

      // Если есть параметр chat в URL, открываем соответствующий чат
      const chatId = searchParams.get("chat");
      if (chatId && !currentChat) {
        const conversation = data.find(
          (c) => c._id.personal_info.username === chatId
        );
        if (conversation) {
          setCurrentChat(conversation._id);
          fetchMessages(conversation._id._id);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <AnimationWrapper>
      <div className="flex h-[calc(100vh-80px)]">
        {/* Список диалогов */}
        <div className="w-1/3 border-r border-grey p-4 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Messages</h2>
          {conversations?.length ? (
            conversations.map((conversation) => (
              <div
                key={conversation._id._id}
                onClick={() => {
                  setCurrentChat(conversation._id);
                  fetchMessages(conversation._id._id);
                  setSearchParams({
                    chat: conversation._id.personal_info.username,
                  });
                }}
                className={`flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-grey/20 rounded-lg ${
                  currentChat?._id === conversation._id._id ? "bg-grey/30" : ""
                }`}
              >
                <img
                  src={conversation._id.personal_info.profile_img}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-medium">
                    {conversation._id.personal_info.fullname}
                  </h3>
                  <p className="text-dark-grey text-sm line-clamp-1">
                    {conversation.lastMessage.content}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-dark-grey text-xs">
                    {getDay(conversation.lastMessage.createdAt)}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-purple text-white rounded-full px-2 py-1 text-xs">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <NoDataMessage message="No conversations yet" />
          )}
        </div>

        {/* Область чата */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {/* Заголовок чата */}
              <div className="p-4 border-b border-grey">
                <div className="flex items-center gap-4">
                  <img
                    src={currentChat.personal_info.profile_img}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">
                      {currentChat.personal_info.fullname}
                    </h3>
                    <p className="text-dark-grey text-sm">
                      {currentChat.online_status?.is_online
                        ? "Online"
                        : `Last seen: ${new Date(
                            currentChat.online_status?.last_active
                          ).toLocaleString()}`}
                    </p>
                  </div>
                </div>

                {isTyping && (
                  <p className="text-sm text-dark-grey">Typing...</p>
                )}
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingMessages ? (
                  <Loader />
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender._id === userAuth._id
                          ? "justify-end"
                          : "justify-start"
                      } mb-4`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender._id === userAuth._id
                            ? "bg-purple text-white"
                            : "bg-grey"
                        }`}
                      >
                        <p>{message.content}</p>
                        <span className="text-xs opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Форма отправки */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-grey"
              >
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 p-2 rounded-lg border border-grey focus:border-purple outline-none"
                  />
                  <button
                    type="submit"
                    className="btn-dark px-6 py-2"
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-dark-grey">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default MessagesPage;
