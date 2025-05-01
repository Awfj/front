import React, { useEffect, useState } from "react";
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

// import postImg from "../imgs/post.png";
// import avatarImg from "../imgs/avatar.jpg";

const Home = () => {
  let [blogs, setBlogs] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [showFilters, setShowFilters] = useState(false);
  let [pageState, setPageState] = useState("popular");

  let categories = [
    "Programming", // (merges programming, web/mobile dev)
    "Technology", // (general tech focus)
    "Health", // (merges health/fitness)
    "Food", // (merges food/cooking)
    "Travel", // (merges travel, lifestyle)
    "Business",
    "Gaming", // (huge standalone niche)
    "Science", // (merges science/space/environment)
    "Entertainment", // (merges art, music, movies, books)
    "Education",
  ];

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
    activeTabRef.current.click();
    if (pageState === "popular") fetchLatestBlogs({ page: 1 });
    else {
      fetchBlogByCategory({ page: 1 });
    }
    if (!trendingBlogs) fetchTrendingBlogs();
  }, [pageState]);

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
              <h1 className="font-medium text-xl mb-8">Popular Topics</h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => {
                  return (
                    <button
                      onClick={loadBlogbyCategory}
                      key={i}
                      className={
                        "tag " +
                        (pageState === category ? "bg-black text-white" : "")
                      }
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FILTER BLOGS */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <h1 className="font-medium text-xl">Filter Blogs</h1>
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
                    {categories.map((category, i) => (
                      <option key={i} value={category.toLowerCase()}>
                        {category}
                      </option>
                    ))}
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
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default Home;
