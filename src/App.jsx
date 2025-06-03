import { Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import Home from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNav from "./components/sidenavbar.component";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/edit-profile.page";
import Notification from "./pages/notifications.page";
import ManageBlog from "./pages/manage-blogs.page";
import ManageBookmarks from "./pages/bookmarks.page";
import Users from "./pages/users.page";
import ModerateBlogsPage from "./pages/moderate-blogs.page";
import LikesPage from "./pages/likes.page";
import FullScreenLoader from "./components/full-screen-loader.component";
import axios from "axios";
import { toast } from "react-hot-toast";
import { logOutUser } from "./common/session";

export const UserContext = createContext({});

export const ThemeContext = createContext({});

const darkThemePreference = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const App = () => {
  const navigate = useNavigate();
  const [userAuth, setUserAuth] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [theme, setTheme] = useState(() =>
    darkThemePreference() ? "dark" : "light"
  );

  const handleApiError = (error) => {
    if (error.response?.data?.isBanned) {
      const { bannedUntil, reason } = error.response.data;
      // Показываем пользователю информацию о бане
      // toast.error(
      //   `Your account is banned until ${new Date(
      //     bannedUntil
      //   ).toLocaleDateString()}. Reason: ${reason}`
      // );

      // Разлогиниваем пользователя
      logOutUser();
      setUserAuth({ access_token: null });
      navigate("/signin");
    }

    if (
      error.response?.status === 404 &&
      error.response?.data?.error === "User not found"
    ) {
      toast.error("Your account has been deleted");
      logOutUser();
      setUserAuth({ access_token: null });
      navigate("/signin");
    }
  };

  useEffect(() => {
    // Add axios interceptor for handling ban responses
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        handleApiError(error);
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      let userInSession = lookInSession("user");
      let themeInSession = lookInSession("theme");

      if (userInSession) {
        const parsedUser = JSON.parse(userInSession);
        setUserAuth(parsedUser);

        // Устанавливаем онлайн статус сразу при инициализации
        try {
          await axios.post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/update-online-status`,
            { is_online: true },
            {
              headers: {
                Authorization: `Bearer ${parsedUser.access_token}`,
              },
            }
          );
        } catch (error) {
          console.error("Failed to update online status:", error);
        }
      } else {
        setUserAuth({ access_token: null });
      }

      if (themeInSession) {
        setTheme(() => {
          document.body.setAttribute("data-theme", themeInSession);
          return themeInSession;
        });
      } else {
        document.body.setAttribute("data-theme", theme);
      }

      setIsLoading(false);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (userAuth?.access_token) {
      // Set online when app loads
      axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/update-online-status`,
        { is_online: true },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );

      // Set offline when user leaves/closes tab
      const handleBeforeUnload = () => {
        axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/update-online-status`,
          { is_online: false },
          {
            headers: {
              Authorization: `Bearer ${userAuth.access_token}`,
            },
          }
        );
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        handleBeforeUnload();
      };
    }
  }, [userAuth?.access_token]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ userAuth, setUserAuth }}>
        <div
          className={`min-h-screen ${
            theme === "dark" ? "bg-[#242424]" : "bg-white"
          }`}
        >
          <Routes>
            <Route path="/editor" element={<Editor />} />
            <Route path="/editor/:blog_id" element={<Editor />} />

            <Route path="/" element={<Navbar />}>
              <Route index element={<Home />} />

              <Route path="dashboard" element={<SideNav />}>
                <Route path="users" element={<Users />} />
                <Route path="blogs" element={<ManageBlog />} />
                <Route path="moderation" element={<ModerateBlogsPage />} />
                <Route path="notifications" element={<Notification />} />
                <Route path="bookmarks" element={<ManageBookmarks />} />
                <Route path="likes" element={<LikesPage />} />
              </Route>

              <Route path="settings" element={<SideNav />}>
                <Route path="edit-profile" element={<EditProfile />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>

              <Route path="signin" element={<UserAuthForm type="sign-in" />} />
              <Route path="signup" element={<UserAuthForm type="sign-up" />} />
              <Route path="search/:query" element={<SearchPage />} />
              <Route path="user/:id" element={<ProfilePage />} />
              <Route path="blog/:blog_id" element={<BlogPage />} />
              <Route path="*" element={<PageNotFound />} />
            </Route>
          </Routes>
        </div>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
