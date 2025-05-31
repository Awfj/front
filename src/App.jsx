import { Route, Routes } from "react-router-dom";
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

export const UserContext = createContext({});

export const ThemeContext = createContext({});

const darkThemePreference = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const App = () => {
  const [userAuth, setUserAuth] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [theme, setTheme] = useState(() =>
    darkThemePreference() ? "dark" : "light"
  );

  useEffect(() => {
    const initializeApp = async () => {
      let userInSession = lookInSession("user");
      let themeInSession = lookInSession("theme");

      if (userInSession) {
        setUserAuth(JSON.parse(userInSession));
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
  // console.log(userAuth)

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ userAuth, setUserAuth }}>
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#242424]' : 'bg-white'}`}>
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
