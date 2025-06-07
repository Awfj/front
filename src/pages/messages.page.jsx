import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { UserContext } from "../App";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import { getDay } from "../common/date";
import { toast } from "react-hot-toast";
import { SocketContext } from "../contexts/SocketContext";
import ConfirmDialog from "../components/confirm-dialog.component";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const socket = useContext(SocketContext);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_DOMAIN}/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );

      // Удаляем сообщение из локального состояния
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      setShowDeleteConfirm(false);
      setMessageToDelete(null);

      toast.success("Message deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete message");
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("message_deleted", (messageId) => {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      });

      return () => {
        socket.off("message_deleted");
      };
    }
  }, [socket]);

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
    } catch (error) {
      console.error(error);
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
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

      setMessages((prev) => [...prev, data]);

      socket.emit("send_message", {
        recipient_id: currentChat._id,
        sender_id: userAuth._id,
        content: newMessage,
      });

      setNewMessage("");

      // Для новых сообщений оставляем плавную прокрутку
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

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

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (!loadingMessages && messagesEndRef.current) {
      // Прокручиваем моментально без анимации
      messagesEndRef.current.scrollIntoView({ block: "end" });
    }
  }, [messages, loadingMessages]);

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
      <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
        {/* Список диалогов */}
        <div
          className={`${
            currentChat ? "hidden md:block" : "block"
          } md:w-1/3 lg:w-1/4 border-r border-grey p-4 overflow-y-auto`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold">Messages</h2>
            {/* Кнопка возврата к списку диалогов на мобильных */}
            {currentChat && (
              <button
                onClick={() => setCurrentChat(null)}
                className="md:hidden btn-light p-2 rounded-full"
              >
                <i className="fi fi-rr-arrow-left"></i>
              </button>
            )}
          </div>

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
                className={`flex items-center gap-4 p-3 md:p-4 cursor-pointer transition-all hover:bg-grey/20 rounded-lg ${
                  currentChat?._id === conversation._id._id ? "bg-grey/30" : ""
                }`}
              >
                <img
                  src={conversation._id.personal_info.profile_img}
                  alt="Profile"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  {" "}
                  {/* Добавлен min-w-0 для корректного текстового переноса */}
                  <h3 className="font-medium truncate">
                    {conversation._id.personal_info.fullname}
                  </h3>
                  <p className="text-dark-grey text-sm line-clamp-1">
                    {conversation.lastMessage.content}
                  </p>
                </div>
                <div className="flex flex-col items-end ml-2">
                  <span className="text-dark-grey text-xs whitespace-nowrap">
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
        <div
          className={`${
            currentChat ? "flex" : "hidden md:flex"
          } flex-1 flex-col`}
        >
          {currentChat ? (
            <>
              {/* Заголовок чата */}
              <div className="p-3 md:p-4 border-b border-grey">
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Кнопка возврата на мобильных */}
                  <button
                    onClick={() => setCurrentChat(null)}
                    className="md:hidden"
                  >
                    <i className="fi fi-rr-arrow-left text-xl"></i>
                  </button>

                  <img
                    src={currentChat.personal_info.profile_img}
                    alt="Profile"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {currentChat.personal_info.fullname}
                    </h3>
                    <p className="text-dark-grey text-sm truncate">
                      {currentChat.online_status?.is_online
                        ? "Online"
                        : `Last seen: ${new Date(
                            currentChat.online_status?.last_active
                          ).toLocaleString()}`}
                    </p>
                  </div>
                </div>

                {isTyping && (
                  <p className="text-sm text-dark-grey mt-1">Typing...</p>
                )}
              </div>

              {/* Сообщения */}
              <div
                className="flex-1 overflow-y-auto p-3 md:p-4"
                style={{ scrollbarGutter: "stable" }}
              >
                {loadingMessages ? (
                  <Loader />
                ) : (
                  <>
                    <div className="flex-1 max-w-3xl mx-auto w-full">
                      {messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${
                            message.sender._id === userAuth._id
                              ? "justify-end"
                              : "justify-start"
                          } mb-3 md:mb-4`}
                        >
                          <div
                            className={`max-w-[85%] md:max-w-[70%] p-2 md:p-3 rounded-lg ${
                              message.sender._id === userAuth._id
                                ? "bg-purple text-white"
                                : "bg-grey"
                            } relative group`}
                          >
                            <p className="break-words">{message.content}</p>
                            <span className="text-[10px] md:text-xs opacity-70 block mt-1">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>

                            {message.sender._id === userAuth._id && (
                              <button
                                onClick={() => {
                                  setMessageToDelete(message);
                                  setShowDeleteConfirm(true);
                                }}
                                className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <i className="fi fi-rr-trash text-red hover:text-red"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Форма отправки */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 md:p-4 border-t border-grey"
              >
                <div className="flex gap-2 md:gap-4 max-w-3xl mx-auto">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 p-2 text-sm md:text-base rounded-lg border border-grey focus:border-purple outline-none"
                  />
                  <button
                    type="submit"
                    className="btn-dark px-4 md:px-6 py-2"
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-dark-grey p-4 text-center">
              Select a conversation to start messaging
            </div>
          )}
        </div>

        {/* Диалог подтверждения удаления */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setMessageToDelete(null);
          }}
          onConfirm={() => handleDeleteMessage(messageToDelete._id)}
          title="Delete Message"
          message="Are you sure you want to delete this message?"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </AnimationWrapper>
  );
};

export default MessagesPage;
