import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../App";
import axios from "axios";

const SideNav = () => {
  let {
    userAuth: { access_token, role, new_notification_available },
    userAuth,
  } = useContext(UserContext);

  let page = location.pathname.split("/")[2];

  let [pageState, setPageState] = useState(page.replace("-", " "));
  let [showSideNav, setShowSideNav] = useState(false);

  let activeTabLine = useRef();
  let sideBarIconTab = useRef();
  let pageStateTap = useRef();

  const chagnePageState = (e) => {
    let { offsetWidth, offsetLeft } = e.target;
    console.log(offsetLeft, offsetWidth);
    activeTabLine.current.style.width = offsetWidth + "px";
    activeTabLine.current.style.left = offsetLeft + "px";

    if (e.target == sideBarIconTab.current) {
      setShowSideNav(true);
    } else {
      setShowSideNav(false);
    }
  };

  useEffect(() => {
    setShowSideNav(false);
    pageStateTap.current.click();
  }, [pageState]);

  return access_token === null ? (
    <Navigate to="/signin" />
  ) : (
    <>
      <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
        <div className="skicky top-[80px] z-30">
          <div className="relative md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto ">
            <button
              ref={sideBarIconTab}
              className="p-5 capitalize "
              onClick={chagnePageState}
            >
              <i className="fi fi-rr-bars-staggered pointer-events-none"></i>
            </button>
            <button
              ref={pageStateTap}
              className="p-5 capitalize "
              onClick={chagnePageState}
            >
              {pageState}
            </button>

            <hr
              ref={activeTabLine}
              className="absolute bottom-0 duration-500 "
            />
          </div>

          <div
            className={
              "min-w-[200px] h-[100%] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 duration-500 " +
              (!showSideNav
                ? "max-md:opacity-0 max-md:pointer-events-none"
                : "opacity-100 pointer-events-auto")
            }
          >
            <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
            <hr className="border-grey -ml-6" />

            {/* Users */}
            {role === "admin" && (
              <NavLink
                to={"/dashboard/users"}
                onClick={(e) => setPageState(e.target.innerText)}
                className="sidebar-link"
              >
                <i className="fi fi-rr-users icon"></i>
                Users
              </NavLink>
            )}

            {(role === "admin" || role === "moderator") && (
              <NavLink
                to={"/dashboard/moderation"}
                onClick={(e) => setPageState(e.target.innerText)}
                className="sidebar-link"
              >
                <i className="fi fi-rr-shield-check icon"></i>
                Moderation
              </NavLink>
            )}

            {/* Blogs */}
            <NavLink
              to={"/dashboard/blogs"}
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-document icon"></i>
              Blog
            </NavLink>

            {/* Messages */}
            <NavLink
              to="/dashboard/messages"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-envelope icon"></i>
              Messages
            </NavLink>

            {/* Bookmarks */}
            <NavLink
              to={"/dashboard/bookmarks"}
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-drawer-alt icon"></i>
              Bookmarks
            </NavLink>

            <NavLink
              to={"/dashboard/likes"}
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-heart icon"></i>
              Likes
            </NavLink>

            {/* Notifications */}
            <NavLink
              to={"/dashboard/notifications"}
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <div className="relative">
                <i className="fi fi-rr-bell-ring icon"></i>
                {new_notification_available && (
                  <span className="bg-red h-2 w-2 rounded-full absolute z-10 top-0 right-0"></span>
                )}
              </div>
              Notifications
            </NavLink>

            <h1 className="text-xl text-dark-grey mb-3 mt-8">Settings</h1>
            <hr className="border-grey -ml-6 mr-6" />

            {/* Edit Profile */}
            <NavLink
              to={"/settings/edit-profile"}
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-user icon"></i>
              Edit Profile
            </NavLink>

            {/* Change Password */}
            <NavLink
              to={"/settings/change-password"}
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-lock icon"></i>
              Change Password
            </NavLink>
          </div>
        </div>
        <div className="max-md:-mt-8 mt-5 w-full">
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default SideNav;
