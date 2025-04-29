import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigaion from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import BlogPostCard from "../components/blog-post.component";
import LoadMoreDataBtn from "../components/load-more.component";
import PageNotFound from "./404.page";
import toast, { Toaster } from "react-hot-toast";
import UserCard from "../components/user-card.component";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
    total_followers: 0,
    total_following: 0,
  },
  social_links: {},
  joinedAt: "",
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(profileDataStructure);
  let [loading, setLoading] = useState(true);
  let [blogs, setBlogs] = useState(null);
  let [profileLoaded, setProfileLoaded] = useState();
  const { id: profileId } = useParams();
  const [followers, setFollowers] = useState(null);
  const [following, setFollowing] = useState(null);

  const getFollowers = ({ page = 1, user_id }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-followers", {
        user_id,
        page,
      })
      .then(async ({ data }) => {
        let formateData = await filterPaginationData({
          state: followers,
          data: data.followers,
          page,
          countRoute: "/followers-count",
          data_to_send: { user_id },
        });
        setFollowers(formateData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getFollowing = ({ page = 1, user_id }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-following", {
        user_id,
        page,
      })
      .then(async ({ data }) => {
        let formateData = await filterPaginationData({
          state: following,
          data: data.following,
          page,
          countRoute: "/following-count",
          data_to_send: { user_id },
        });
        setFollowing(formateData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  let {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: {
      total_posts,
      total_reads,
      total_followers,
      total_following,
    },
    social_links,
    joinedAt,
  } = profile;

  let {
    userAuth: { username, access_token },
  } = useContext(UserContext);

  const fetchUserProfile = () => {
    setLoading(true); // Set loading at the start
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
        username: profileId,
      })
      .then(({ data: user }) => {
        if (!user) {
          setProfile(null); // Set profile to null if user not found
          setLoading(false);
          return;
        }

        if (access_token) {
          axios
            .post(
              import.meta.env.VITE_SERVER_DOMAIN + "/is-following-user",
              { targetUserId: user._id },
              {
                headers: {
                  Authorization: `Bearer ${access_token}`,
                },
              }
            )
            .then(({ data: { isFollowing } }) => {
              setProfile({
                ...user,
                isFollowing,
              });
              setProfileLoaded(profileId);
              getBlogs({ user_id: user._id });
              setLoading(false);
            })
            .catch((err) => {
              console.log(err);
              setProfile(user);
              setProfileLoaded(profileId);
              getBlogs({ user_id: user._id });
              setLoading(false);
            });
        } else {
          setProfile({
            ...user,
            isFollowing: false,
          });
          setProfileLoaded(profileId);
          getBlogs({ user_id: user._id });
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setProfile(null);
        setLoading(false);
      });
  };

  const handleFollow = () => {
    if (!access_token) {
      return toast.error("Please login to follow");
    }

    const endpoint = profile.isFollowing ? "unfollow" : "follow";

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/${endpoint}-user`,
        { targetUserId: profile._id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        setProfile((prev) => ({
          ...prev,
          isFollowing: !prev.isFollowing,
          account_info: {
            ...prev.account_info,
            total_followers: data.total_followers,
          },
        }));

        toast.success(data.message);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.error || `Error ${endpoint}ing user`);
      });
  };

  const getBlogs = ({ page = 1, user_id }) => {
    user_id = user_id === undefined ? blogs.user_id : user_id;
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        let formateData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-search-blogs-count",
          data_to_send: { author: user_id },
        });
        formateData.user_id = user_id;
        setBlogs(formateData);
      })
      .catch((err) => {
        // toast.error(err)
        console.log(err);
      });
  };

  useEffect(() => {
    // Reset states when profile ID changes
    if (profileId !== profileLoaded) {
      resetState();
      setBlogs(null);
      setFollowers(null);
      setFollowing(null);
      fetchUserProfile();
    }
  }, [profileId]); // Only depend on profileId changes

  // Separate useEffect for loading data after profile is loaded
  useEffect(() => {
    if (profile?._id) {
      const user_id = profile._id;
      if (blogs === null) getBlogs({ user_id });
      if (followers === null) getFollowers({ user_id });
      if (following === null) getFollowing({ user_id });
    }
  }, [profile?._id]); // Only depend on profile._id changes

  const resetState = () => {
    setProfile(profileDataStructure);
    setLoading(true);
    setProfileLoaded("");
  };

  return (
    <AnimationWrapper>
      {/* <Toaster/> */}
      {loading ? (
        <Loader />
      ) : profile_username.length ? (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={profile_img}
              alt="Profile img"
              className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
            />
            <h1 className="text-2xl font-medium">@{profile_username}</h1>
            <p className="text-xl capitalize h-6">{fullname}</p>
            <p>{total_posts.toLocaleString()} Blogs</p>
            <p>{total_reads.toLocaleString()} Reads</p>
            {/* TODO: FOLLOWER COUNT */}
            <p>{total_followers.toLocaleString()} Followers</p>
            <p>{total_following.toLocaleString()} Following</p>

            {/* EDIT OR FOLLOW */}
            <div className="flex gap-4 mt-2">
              {profileId === username ? (
                <Link
                  to={`/settings/edit-profile`}
                  className="btn-light rounded-md"
                >
                  Edit Profile
                </Link>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`btn-light rounded-md ${
                    profile.isFollowing ? "bg-red-500 text-white" : ""
                  }`}
                >
                  {profile.isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>

            <AboutUser
              className="max-md:hidden"
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
            />
          </div>

          <div className="max-md:mt-12 w-full">
            <InPageNavigaion
              routes={["Blogs Published", "Followers", "Following"]}
              defaultActiveIndex={0}
              // defaultHidden={["About"]}
            >
              <>
                {blogs === null ? (
                  <Loader />
                ) : !blogs.results.length ? (
                  <NoDataMessage message={"No blog published"} />
                ) : (
                  blogs.results.map((blog, i) => {
                    return (
                      <AnimationWrapper
                        key={i}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      >
                        <BlogPostCard
                          content={blog}
                          author={blog.author.personal_info}
                        />
                      </AnimationWrapper>
                    );
                  })
                )}
                <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
              </>

              {/* Followers tab */}
              <>
                {followers === null ? (
                  <Loader />
                ) : !followers.results.length ? (
                  <NoDataMessage message={"No followers yet"} />
                ) : (
                  followers.results.map((user, i) => (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <UserCard
                        user={user}
                        options={{
                          btnMessage: "Remove",
                          btnHandler: (followerId) => {
                            axios
                              .post(
                                `${
                                  import.meta.env.VITE_SERVER_DOMAIN
                                }/unfollow-user`,
                                {
                                  targetUserId: profile._id,
                                  currentUserId: followerId,
                                },
                                {
                                  headers: {
                                    Authorization: `Bearer ${access_token}`,
                                  },
                                }
                              )
                              .then(() => {
                                // Update followers list
                                setFollowers((prev) => ({
                                  ...prev,
                                  results: prev.results.filter(
                                    (user) => user._id !== followerId
                                  ),
                                }));

                                // Update profile counters immediately
                                setProfile((prev) => ({
                                  ...prev,
                                  account_info: {
                                    ...prev.account_info,
                                    total_followers:
                                      prev.account_info.total_followers - 1,
                                  },
                                }));

                                toast.success("Follower removed successfully");
                              })
                              .catch((err) => {
                                console.log(err);
                                toast.error(
                                  err.response?.data?.error ||
                                    "Error removing follower"
                                );
                              });
                          },
                        }}
                      />
                    </AnimationWrapper>
                  ))
                )}
              </>

              {/* Following tab */}
              <>
                {following === null ? (
                  <Loader />
                ) : !following.results.length ? (
                  <NoDataMessage message={"Not following anyone"} />
                ) : (
                  following.results.map((user, i) => (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <UserCard
                        user={user}
                        options={{
                          btnMessage: "Unfollow",
                          btnHandler: (userId) => {
                            axios
                              .post(
                                `${
                                  import.meta.env.VITE_SERVER_DOMAIN
                                }/unfollow-user`,
                                { targetUserId: userId },
                                {
                                  headers: {
                                    Authorization: `Bearer ${access_token}`,
                                  },
                                }
                              )
                              .then(() => {
                                // Update following list
                                setFollowing((prev) => ({
                                  ...prev,
                                  results: prev.results.filter(
                                    (user) => user._id !== userId
                                  ),
                                }));

                                // Update profile counters immediately
                                setProfile((prev) => ({
                                  ...prev,
                                  account_info: {
                                    ...prev.account_info,
                                    total_following:
                                      prev.account_info.total_following - 1,
                                  },
                                }));

                                toast.success("Unfollowed successfully");
                              })
                              .catch((err) => {
                                console.log(err);
                                toast.error(
                                  err.response?.data?.error ||
                                    "Error unfollowing user"
                                );
                              });
                          },
                        }}
                      />
                    </AnimationWrapper>
                  ))
                )}
              </>
            </InPageNavigaion>
          </div>
        </section>
      ) : (
        <PageNotFound />
      )}
    </AnimationWrapper>
  );
};

export default ProfilePage;
