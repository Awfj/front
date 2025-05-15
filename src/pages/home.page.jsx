import React, { useEffect, useState, useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigaion, {
  activeTabRef,
} from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimulBlogPost from "../components/nobanner-blog-post.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import { UserContext } from "../App";
import { Link } from "react-router-dom";

// import postImg from "../imgs/post.png";
// import avatarImg from "../imgs/avatar.jpg";

const Home = () => {
  const [followingAuthors, setFollowingAuthors] = useState(new Set());
  let [blogs, setBlogs] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [trendingAuthors, setTrendingAuthors] = useState(null);
  let [showFilters, setShowFilters] = useState(false);
  let [pageState, setPageState] = useState("popular");
  const [popularCategories, setPopularCategories] = useState([]);
  const { userAuth } = useContext(UserContext);

  let categories = {
    LIFE: [
      "Family",
      "Health",
      "Relationships",
      "Sexuality",
      "Home",
      "Food",
      "Pets",
    ],
    SELF_IMPROVEMENT: ["Mental Health", "Productivity", "Mindfulness"],
    WORK: ["Business", "Marketing", "Leadership", "Remote Work"],
    TECHNOLOGY: [
      "Artificial Intelligence",
      "Blockchain",
      "Data Science",
      "Gadgets",
      "Makers",
      "Security",
      "Tech Companies",
      "Design",
      "Product Management",
    ],
    SOFTWARE_DEVELOPMENT: [
      "Programming",
      "Programming Languages",
      "Dev Ops",
      "Operating Systems",
    ],
    MEDIA: [
      "Writing",
      "Art",
      "Gaming",
      "Humor",
      "Movies",
      "Music",
      "News",
      "Photography",
      "Podcasts",
      "Television",
    ],
    SOCIETY: [
      "Economics",
      "Education",
      "Equality",
      "Finance",
      "Law",
      "Transportation",
      "Politics",
      "Race",
      "Science",
      "Mathematics",
      "Drugs",
    ],
    CULTURE: [
      "Philosophy",
      "Religion",
      "Spirituality",
      "Cultural Studies",
      "Fashion",
      "Beauty",
      "Language",
      "Sports",
    ],
    WORLD: ["Cities", "Nature", "Travel"],
  };

  const fetchPopularCategories = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/popular-categories")
      .then(({ data }) => {
        // Map the categories to match existing format
        const categories = data.categories.map((cat) => ({
          name: cat._id,
          count: cat.count,
          total_reads: cat.total_reads,
        }));
        setPopularCategories(categories);
      })
      .catch((err) => console.log(err));
  };

  const handleFollow = async (e, authorId) => {
    e.preventDefault(); // Prevent navigation

    if (!userAuth.access_token) {
      return toast.error("Please login to follow authors");
    }

    const isFollowing = followingAuthors.has(authorId);
    const endpoint = isFollowing ? "/unfollow-user" : "/follow-user";

    try {
      setFollowingAuthors((prev) => {
        const newSet = new Set(prev);
        if (isFollowing) {
          newSet.delete(authorId);
        } else {
          newSet.add(authorId);
        }
        return newSet;
      });

      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + endpoint,
        { targetUserId: authorId },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );
    } catch (err) {
      // Revert on error
      setFollowingAuthors((prev) => {
        const newSet = new Set(prev);
        if (isFollowing) {
          newSet.add(authorId);
        } else {
          newSet.delete(authorId);
        }
        return newSet;
      });
      toast.error("Error updating follow status");
    }
  };

  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blog", { page })
      .then(async ({ data }) => {
        // console.log(data.blogs)
        let formateData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-latest-blogs-count",
        });
        // console.log(formateData)
        setBlogs(formateData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTrendingAuthors = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-authors", {
        params: {
          username: userAuth?.username || null,
        },
      })
      .then(({ data }) => {
        setTrendingAuthors(data.authors);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blog")
      .then(({ data }) => {
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchBlogByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        let formateData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-search-blogs-count",
          data_to_send: { tag: pageState },
        });
        // console.log(formateData)
        setBlogs(formateData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadBlogbyCategory = (e) => {
    let category = e.target.innerText.toLowerCase();
    setBlogs(null);
    if (pageState === category) {
      setPageState("popular");
      return;
    }
    setPageState(category);
  };

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  useEffect(() => {
    fetchPopularCategories();
  }, []);

  useEffect(() => {
    activeTabRef.current.click();
    if (pageState === "popular") fetchLatestBlogs({ page: 1 });
    else {
      fetchBlogByCategory({ page: 1 });
    }

    if (!trendingBlogs) fetchTrendingBlogs();
    if (!trendingAuthors) fetchTrendingAuthors();
  }, [pageState, userAuth]);

  useEffect(() => {
    if (userAuth.access_token && trendingAuthors?.length) {
      // Check following status for each author
      trendingAuthors.forEach((author) => {
        axios
          .post(
            import.meta.env.VITE_SERVER_DOMAIN + "/is-following-user",
            { targetUserId: author._id },
            {
              headers: {
                Authorization: `Bearer ${userAuth.access_token}`,
              },
            }
          )
          .then(({ data: { isFollowing } }) => {
            if (isFollowing) {
              setFollowingAuthors((prev) => new Set(prev).add(author._id));
            }
          });
      });
    }
  }, [userAuth.access_token, trendingAuthors]);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* latest blog */}
        <div className="w-full">
          <InPageNavigaion
            routes={[pageState, "Following", "New"]}
            // defaultHidden={["trending blog"]}
          >
            {/*  */}
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
              <LoadMoreDataBtn
                state={blogs}
                fetchDataFun={
                  pageState === "popular"
                    ? fetchLatestBlogs
                    : fetchBlogByCategory
                }
              />
            </>
            {trendingBlogs === null ? (
              <Loader />
            ) : trendingBlogs.length ? (
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    key={i}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  >
                    <MinimulBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessage message={"No blog Trending"} />
            )}
          </InPageNavigaion>
        </div>

        {/* filter and trending */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            {/* POPULAR TOPICS */}
            <div>
              <h1 className="font-medium text-xl mb-8">
                Popular Topics <i className="fi fi-rr-fire-flame-curved"></i>
              </h1>
              <div className="flex gap-3 flex-wrap">
                {popularCategories.map((category, i) => (
                  <button
                    onClick={loadBlogbyCategory}
                    key={i}
                    className={
                      "tag flex flex-col items-center " +
                      (pageState === category.name.toLowerCase()
                        ? "bg-black text-white"
                        : "")
                    }
                  >
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FILTER BLOGS */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <h1 className="font-medium text-xl">
                  Filter Blogs <i className="fi fi-rr-filter"></i>
                </h1>
                <button
                  onClick={toggleFilters}
                  className="flex items-center gap-2 text-dark-grey hover:text-black transition-colors"
                >
                  <i
                    className={`fi fi-rr-angle-${showFilters ? "up" : "down"}`}
                  ></i>
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>

              <div
                className={`flex flex-col gap-6 transition-all duration-300 ${
                  showFilters
                    ? "opacity-100 h-auto"
                    : "opacity-0 h-0 overflow-hidden"
                }`}
              >
                {/* Date Filter */}
                <div className="flex flex-col gap-3 mt-4">
                  <h2 className="text-base font-medium text-dark-grey">Date</h2>
                  <select
                    className="w-full p-3 pr-8 rounded-md bg-light-grey border border-magenta 
            appearance-none bg-no-repeat
            bg-[right_0.75rem_center] 
            bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==')]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="last-week">Last Week</option>
                    <option value="last-month">Last Month</option>
                    <option value="last-year">Last Year</option>
                  </select>
                </div>

                {/* Reading Time Filter */}
                <div className="flex flex-col gap-3">
                  <h2 className="text-base font-medium text-dark-grey">
                    Reading Time
                  </h2>
                  <select
                    className="w-full p-3 pr-8 rounded-md bg-light-grey border border-magenta 
            appearance-none bg-no-repeat
            bg-[right_0.75rem_center] 
            bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==')]"
                  >
                    <option value="any">Any Length</option>
                    <option value="short">Short (0-5 min)</option>
                    <option value="medium">Medium (5-15 min)</option>
                    <option value="long">Long (15+ min)</option>
                  </select>
                </div>

                {/* Topics Filter */}
                <div className="flex flex-col gap-3">
                  <h2 className="text-base font-medium text-dark-grey">
                    Topics
                  </h2>
                  <select
                    className="w-full p-3 pr-8 rounded-md bg-light-grey border border-magenta 
        appearance-none bg-no-repeat
        bg-[right_0.75rem_center] 
        bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==')]"
                  >
                    <option value="all">All Topics</option>
                    {Object.entries(categories).map(
                      ([mainCategory, subCategories]) => (
                        <optgroup key={mainCategory} label={mainCategory}>
                          {subCategories.map((subCategory, i) => (
                            <option key={i} value={subCategory.toLowerCase()}>
                              {subCategory}
                            </option>
                          ))}
                        </optgroup>
                      )
                    )}
                  </select>
                </div>

                {/* Apply Filters Button */}
                <button className="btn-dark w-full py-3 mt-4">
                  Apply Filters
                </button>
              </div>
            </div>

            {/* TRENDING AUTHORS */}
            <div>
              <h1 className="text-xl font-medium mb-8">
                Trending Authors <i className="fi fi-rr-arrow-trend-up"></i>
              </h1>
              {trendingAuthors === null ? (
                <Loader />
              ) : trendingAuthors.length ? (
                trendingAuthors.map((author, i) => (
                  <AnimationWrapper
                    key={i}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  >
                    <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-grey">
                      <div className="flex items-center gap-5 justify-between">
                        <Link
                          to={`/user/${author.personal_info.username}`}
                          className="flex items-center gap-5"
                        >
                          <img
                            src={author.personal_info.profile_img}
                            alt={author.personal_info.fullname}
                            className="w-14 h-14 rounded-full"
                          />
                          <div>
                            <h3 className="font-medium text-xl line-clamp-1">
                              {author.personal_info.fullname}
                            </h3>
                            <p className="text-dark-grey">
                              @{author.personal_info.username}
                            </p>
                          </div>
                        </Link>

                        <button
                          onClick={(e) => handleFollow(e, author._id)}
                          className={`btn-light py-2 px-4 ${
                            followingAuthors.has(author._id)
                              ? "text-purple border-purple"
                              : ""
                          }`}
                        >
                          {followingAuthors.has(author._id)
                            ? "Following"
                            : "Follow"}
                        </button>
                      </div>

                      <div className="ml-[66px]">
                        <div className="flex gap-4 text-dark-grey text-sm">
                          <div className="flex items-center gap-2">
                            <i className="fi fi-rr-book-open-reader"></i>
                            <span>
                              {author.account_info.total_reads.toLocaleString()}{" "}
                              reads
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <i className="fi fi-rr-document"></i>
                            <span>{author.account_info.total_posts} blogs</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <i className="fi fi-rr-user"></i>
                            <span>
                              {author.account_info.total_followers} followers
                            </span>
                          </div>
                        </div>
                        <p className="text-dark-grey line-clamp-2">
                          {author.personal_info.bio || "No bio available"}
                        </p>
                      </div>
                    </div>
                  </AnimationWrapper>
                ))
              ) : (
                <NoDataMessage message={"No trending authors"} />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default Home;
