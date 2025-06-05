import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCardMini from "../components/blog-post-mini.component";
import BlogContent from "../components/blog-content.component";
import CommentContainer, {
  fetchComment,
} from "../components/comments.component";
import { formatReadingTime } from "../common/formatReadingTime";

export const blogStructure = {
  title: "",
  des: "",
  content: [],
  author: {
    personal_info: {},
  },
  banner: "",
  publishedAt: "",
};

export const BlogContext = createContext({});

const BlogPage = () => {
  let { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [similarBlog, setSimilarBlog] = useState(blogStructure);
  const [loading, setLoading] = useState(true);
  const [isLikedByUser, setLikedByUser] = useState(false);
  const [isBookmarkedByUser, setBookmarkedByUser] = useState(false);
  const [totalParentComentsLoaded, setTotalCommentsLoaded] = useState(0);

  let {
    title,
    content,
    banner,
    author: {
      personal_info: { username: author_username, fullname, profile_img },
      role,
    },
    author,
    publishedAt,
    tags,
    category,
    reading_time,
  } = blog;

  const fetchBlog = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
      .then(async ({ data: { blog } }) => {
        // Получаем комментарии с пагинацией
        const { results: comments } = await fetchComment({
          blog_id: blog._id,
          setParentCommentCountFun: setTotalCommentsLoaded,
        });

        setBlog({
          ...blog,
          comments: {
            results: comments || [], // Добавляем проверку на null
            totalDocs: comments?.length || 0,
            hasMore: comments?.length >= 5,
          },
        });

        // Сначала ищем похожие посты по категории и тегам
        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
            category: blog.category,
            tags: blog.tags,
            eliminate_blog: blog_id,
            limit: 4,
          })
          .then(async ({ data: { blogs } }) => {
            // Если найдено меньше 6 похожих, добираем постами автора
            let similar = blogs || [];
            if (similar.length < 4) {
              const alreadyIds = similar.map((b) => b._id);
              const {
                data: { blogs: authorBlogs },
              } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",
                {
                  author: blog.author._id,
                  eliminate_blog: blog_id,
                  limit: 4 - similar.length,
                }
              );
              const uniqueAuthorBlogs = authorBlogs
                ? authorBlogs.filter((b) => !alreadyIds.includes(b._id))
                : [];
              similar = [...similar, ...uniqueAuthorBlogs];
            }
            // Удаляем текущий пост из similar (на всякий случай)
            similar = similar.filter(
              (b) => b.blog_id !== blog_id && b._id !== blog._id
            );
            setSimilarBlog(similar);
          })
          .catch((err) => {
            console.log(err);
          });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const updateCommentLikeStatus = (commentId, likeData) => {
    setBlog((prevBlog) => {
      const newComments = prevBlog.comments.results.map((comment) => {
        if (comment._id === commentId) {
          return {
            ...comment,
            likes: likeData.likes,
            liked_by: likeData.liked_by,
          };
        }
        return comment;
      });

      return {
        ...prevBlog,
        comments: {
          ...prevBlog.comments,
          results: newComments,
        },
      };
    });
  };

  useEffect(() => {
    resetState();
    fetchBlog();
  }, [blog_id]);

  const resetState = () => {
    setBlog(blogStructure);
    setSimilarBlog(null);
    setLoading(true);
    setLikedByUser(false);
    setBookmarkedByUser(false);
    setTotalCommentsLoaded(0);
  };

  // Добавьте функцию для загрузки дополнительных комментариев
  const loadMoreComments = async ({ skip }) => {
    const newComments = await fetchComment({
      blog_id: blog._id,
      skip,
      setParentCommentCountFun: setTotalCommentsLoaded,
    });

    setBlog((prev) => ({
      ...prev,
      comments: {
        results: [...prev.comments.results, ...newComments],
        totalDocs: prev.comments.totalDocs,
        hasMore: newComments.length >= 5,
      },
    }));
  };

  const getBorderStyle = (role) => {
    if (role === "admin") {
      return "border-red";
    } else if (role === "moderator") {
      return "border-green";
    }
    return "border-magenta";
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            isLikedByUser,
            setLikedByUser,
            isBookmarkedByUser,
            setBookmarkedByUser,
            totalParentComentsLoaded,
            setTotalCommentsLoaded,
            updateCommentLikeStatus,
            loadMoreComments,
          }}
        >
          {/* Добавляем контейнер с flex для десктопа */}
          <div className="flex flex-col lg:flex-row gap-10 max-w-[1400px] center py-10 px-5">
            {/* Основной контент блога */}
            <div className="flex-1">
              <div className="max-h-[600px] w-full">
                <img
                  src={banner}
                  alt="Banner"
                  className="aspect-video w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="mt-12">
                <h2>{title}</h2>
                <div className="flex max-sm:flex-col justify-between my-8">
                  <div className="flex gap-5 items-start ">
                    <img
                      src={profile_img}
                      alt="Author"
                      className={`w-12 h-12 rounded-full border ${getBorderStyle(
                        role
                      )}`}
                    />
                    <p className="capitalize ">
                      {fullname}
                      <br />@
                      <Link
                        className="underline"
                        to={`/user/${author_username}`}
                      >
                        {author_username}
                      </Link>
                    </p>
                  </div>
                  {/* Добавляем информацию о категории и времени чтения */}
                  <div className="flex flex-col items-end gap-2 max-sm:items-start max-sm:ml-12 max-sm:mt-4">
                    <div className="flex items-center gap-2 text-dark-grey">
                      <Link
                        to={`/search/${category.toLowerCase()}`}
                        className="btn-light py-1 px-4"
                      >
                        {category}
                      </Link>
                      <span>•</span>
                      <span>{formatReadingTime(reading_time)}</span>
                    </div>
                    <p className="text-dark-grey opacity-75">
                      Published on {getDay(publishedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 mb-8 font-gelasio blog-page-content">
                {content[0].blocks.map((block, i) => {
                  return (
                    <div className="my-4 md:my-8" key={i}>
                      <BlogContent block={block} />
                    </div>
                  );
                })}
              </div>

              {/* Tags Section */}
              {tags?.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap my-6">
                  <span className="text-dark-grey font-medium">Tags:</span>
                  {tags.map((tag, i) => (
                    <Link
                      key={i}
                      to={`/search/${tag}`}
                      className="tag-2 hover:bg-purple/10"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              <BlogInteraction />
              <CommentContainer />
            </div>

            {/* Similar Blogs Section */}
            <div className="lg:w-[380px] lg:sticky lg:top-[100px] lg:max-h-screen min-h-[200px]">
              <h1 className="font-medium text-2xl mb-8">Similar Posts</h1>
              {/* Update container styles for mobile/desktop */}
              <div
                className={`flex flex-col gap-6 
    ${
      // On desktop: scrollable container with padding
      "lg:pr-4 lg:overflow-y-auto lg:max-h-[calc(100vh-200px)] lg:scrollbar-thin" +
      // On mobile: no scroll, full height
      " max-lg:h-full max-lg:overflow-visible"
    }`}
              >
                {similarBlog && similarBlog.length > 0 ? (
                  similarBlog.map((blog, i) => (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.08 }}
                    >
                      <BlogPostCardMini
                        blog={blog}
                        author={blog.author.personal_info || blog.author}
                        isLastItem={i === similarBlog.length - 1}
                      />
                    </AnimationWrapper>
                  ))
                ) : (
                  <div className="text-dark-grey opacity-60 text-center pb-8">
                    No similar posts found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
