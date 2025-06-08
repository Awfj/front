import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { UserContext, ThemeContext } from "../App";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import { getDay } from "../common/date";
import { toast } from "react-hot-toast";
import { SocketContext } from "../contexts/SocketContext";
import ConfirmDialog from "../components/confirm-dialog.component";
import EmojiPicker from "emoji-picker-react";

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

  const [showDeleteChatConfirm, setShowDeleteChatConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const [showEmoji, setShowEmoji] = useState(false);

  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");

  const socket = useContext(SocketContext);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const { theme } = useContext(ThemeContext);
  const emojiPickerRef = useRef(null);

  const handleHideChat = async (chatPartnerId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/messages/hide-conversation`,
        { conversationPartnerId: chatPartnerId },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );

      // Удаляем чат из локального состояния
      setConversations((prev) =>
        prev.filter((conv) => conv._id._id !== chatPartnerId)
      );

      if (currentChat?._id === chatPartnerId) {
        setCurrentChat(null);
        setMessages([]);
        setSearchParams({});
      }

      toast.success("Chat hidden successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to hide chat");
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest(".emoji-trigger")
      ) {
        // добавляем класс для кнопки
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleEditMessage = async (messageId, content) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_SERVER_DOMAIN}/messages/${messageId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );

      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? data : msg))
      );

      setEditingMessage(null);
      setEditContent("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to edit message");
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("message_updated", (updatedMessage) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
      });

      return () => {
        socket.off("message_updated");
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
      <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] lg:max-w-[700px] xl:max-w-[1000px] border-r border-grey">
        {/* Список диалогов */}
        <div
          className={`${
            currentChat ? "hidden xl:block" : "block"
          } xl:w-80 2xl:w-96 border-r border-grey overflow-y-auto scrollbar-thin`}
        >
          <div className="sticky top-0 bg-white dark:bg-dark pr-3 border-b border-grey">
            <h1 className="max-md:hidden text-2xl mb-8">Messages</h1>
          </div>

          <div className="p-2 pl-0">
            {conversations?.length ? (
              conversations.map((conversation) => (
                <div key={conversation._id._id} className="relative group transition-custom">
                  <div
                    onClick={() => {
                      setCurrentChat(conversation._id);
                      fetchMessages(conversation._id._id);
                      setSearchParams({
                        chat: conversation._id.personal_info.username,
                      });
                    }}
                    className={`flex items-center gap-3 p-2 cursor-pointer border hover:bg-grey/20 rounded-lg transition-custom ${
                      currentChat?._id === conversation._id._id
                        ? "bg-grey/30 border-purple"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={conversation._id.personal_info.profile_img}
                      alt="Profile"
                      className="w-10 h-10 rounded-full flex-shrink-0 border border-magenta"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium truncate text-xl">
                          {conversation._id.personal_info.fullname}
                        </h3>
                        <span className="text-dark-grey text-xs whitespace-nowrap ml-2">
                          {getDay(conversation.lastMessage.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-dark-grey text-xs line-clamp-1 truncate message-content">
                          {conversation.lastMessage.content}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-purple text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatToDelete(conversation._id);
                      setShowDeleteChatConfirm(true);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-custom text-dark-grey hover:text-red"
                  >
                    <i className="transition-custom fi fi-rr-trash text-sm"></i>
                  </button>
                </div>
              ))
            ) : (
              <NoDataMessage message="No conversations yet" />
            )}

            {/* Диалог подтверждения удаления чата */}
            <ConfirmDialog
              isOpen={showDeleteChatConfirm}
              onClose={() => {
                setShowDeleteChatConfirm(false);
                setChatToDelete(null);
              }}
              onConfirm={() => {
                handleHideChat(chatToDelete._id);
                setShowDeleteChatConfirm(false);
                setChatToDelete(null);
              }}
              title="Remove Chat"
              message="Are you sure you want to remove this chat?"
              confirmText="Remove"
              cancelText="Cancel"
            />
          </div>
        </div>

        {/* Область чата */}
        <div
          className={`${
            currentChat ? "flex" : "hidden xl:flex"
          } flex-1 flex-col`}
        >
          {currentChat ? (
            <>
              {/* Заголовок чата */}
              <div className="p-3 md:p-4 border-b border-grey">
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Кнопка возврата - теперь видима на средних разрешениях */}
                  <button
                    onClick={() => setCurrentChat(null)}
                    className="xl:hidden"
                  >
                    <i className="fi fi-rr-arrow-left text-xl"></i>
                  </button>

                  <img
                    src={currentChat.personal_info.profile_img}
                    alt="Profile"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-magenta"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {currentChat.personal_info.fullname}
                    </h3>
                    <p
                      className={`${
                        currentChat.online_status?.is_online
                          ? "text-green"
                          : "text-dark-grey"
                      } text-sm truncate`}
                    >
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
                className="flex-1 overflow-y-auto p-3 md:p-8 scrollbar-thin"
                style={{ scrollbarGutter: "stable" }}
              >
                {loadingMessages ? (
                  <Loader />
                ) : (
                  <>
                    <div className="flex-1 mx-auto w-full">
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
                            className={`max-w-[85%] md:max-w-[70%] p-2 md:p-3 border rounded-lg ${
                              message.sender._id === userAuth._id
                                ? "border-purple bg-grey"
                                : "border-grey bg-grey"
                            } relative group`}
                          >
                            {editingMessage === message._id ? (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleEditMessage(message._id, editContent);
                                }}
                              >
                                <input
                                  type="text"
                                  value={editContent}
                                  onChange={(e) =>
                                    setEditContent(e.target.value)
                                  }
                                  className="w-full p-1 rounded border border-grey"
                                  autoFocus
                                />
                                <div className="flex gap-2 mt-2 justify-between p-1">
                                  <button
                                    type="submit"
                                    className="text-dark-grey hover:text-green"
                                    title="Save"
                                  >
                                    <i className="fi fi-rr-check text-sm transition-custom"></i>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingMessage(null);
                                      setEditContent("");
                                    }}
                                    className="text-dark-grey hover:text-red"
                                    title="Cancel"
                                  >
                                    <i className="fi fi-rr-cross text-sm transition-custom"></i>
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <p className="break-words message-content text-xl">
                                  {message.content}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[12px] md:text-xs text-dark-grey">
                                    {new Date(
                                      message.createdAt
                                    ).toLocaleTimeString()}
                                    {message.isEdited && (
                                      <span className="ml-1 italic">
                                        (edited)
                                      </span>
                                    )}
                                  </span>
                                  {message.sender._id === userAuth._id && (
                                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-custom flex flex-col gap-2 pl-2">
                                      <button
                                        onClick={() => {
                                          setEditingMessage(message._id);
                                          setEditContent(message.content);
                                        }}
                                        className="text-dark-grey hover:text-purple"
                                      >
                                        <i className="fi fi-rr-edit text-sm transition-custom"></i>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setMessageToDelete(message);
                                          setShowDeleteConfirm(true);
                                        }}
                                        className="text-dark-grey hover:text-red"
                                      >
                                        <i className="fi fi-rr-trash text-sm transition-custom"></i>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
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
                className="p-3 md:p-4 border-t border-grey relative"
              >
                <div className="flex gap-2 md:gap-4 max-w-3xl mx-auto">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type a message..."
                      className="w-full p-[0.6rem] text-xl rounded-lg border border-magenta bg-transparent focus:border-purple outline-none pl-10 input-with-emoji"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmoji(!showEmoji)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-dark-grey hover:text-purple transition-colors emoji-trigger" // добавляем класс emoji-trigger
                    >
                      <i className="flex fi fi-rr-smile text-xl transition-custom"></i>
                    </button>

                    {showEmoji && (
                      <div
                        className="absolute bottom-full left-0 mb-2"
                        ref={emojiPickerRef}
                      >
                        <EmojiPicker
                          theme={theme}
                          onEmojiClick={onEmojiClick}
                          autoFocusSearch={false}
                          searchPlaceHolder="Search emoji..."
                          width={300}
                          height={400}
                          // lazyLoadEmojis={false}
                          previewConfig={{
                            showPreview: false,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn-dark px-4 md:px-6 py-2 cursor-pointer whitespace-nowrap"
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
