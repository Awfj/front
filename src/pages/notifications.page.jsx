import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";

const filterLabels = {
  all: "All",
  like: "Likes",
  comment: "Comments",
  reply: "Replies",
  achievement: "Achievements",
  blog_approved: "Approved Posts",
  blog_rejected: "Rejected Posts",
};

const Notification = () => {
  let {
    userAuth,
    setUserAuth,
    userAuth: { access_token, new_notification_available },
  } = useContext(UserContext);
  const [filter, setFilter] = useState("all");
  const filters = [
    "all",
    "like",
    "comment",
    "reply",
    "achievement",
    "blog_approved",
    "blog_rejected",
  ];

  const [notifications, setNotifications] = useState(null);

  const fetchNotifications = ({ page, deletedDocCount = 0 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/notifications",
        {
          page,
          filter,
          deletedDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data: { notifications: data } }) => {
        if (new_notification_available) {
          setUserAuth({ ...userAuth, new_notification_available: false });
        }
        let formatedData = await filterPaginationData({
          state: notifications,
          data,
          page,
          countRoute: "/all-notifications-count",
          data_to_send: { filter },
          user: access_token,
        });

        // Удаляем дубликаты по _id
        if (formatedData && formatedData.results) {
          const unique = [];
          const seen = new Set();
          for (const notif of formatedData.results) {
            if (!seen.has(notif._id)) {
              unique.push(notif);
              seen.add(notif._id);
            }
          }
          formatedData.results = unique;
        }

        setNotifications(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleFilter = (filterName) => {
    setFilter(filterName.toLowerCase()); // Convert to lowercase to match backend values
    setNotifications(null);
  };

  useEffect(() => {
    if (access_token) {
      fetchNotifications({ page: 1 });
    }
  }, [access_token, filter]);

  return (
    <div>
      <h1 className="max-md:hidden text-2xl mb-4">Recent Notifications</h1>
      <div className="my-8">
        <div className="flex flex-wrap gap-2 sm:gap-3 overflow-x-auto scrollbar-thin pb-2">
          {filters.map((filterName, i) => (
            <button
              key={i}
              className={
                "py-2 px-4 whitespace-nowrap rounded-full transition-colors font-medium " +
                (filter === filterName.toLowerCase() // Compare with lowercase
                  ? "btn-dark border-purple shadow font-bold"
                  : "btn-light bg-light-grey text-black")
              }
              onClick={() => handleFilter(filterName)}
              style={
                filter === filterName.toLowerCase() ? { borderWidth: 2 } : {}
              }
            >
              {filterLabels[filterName]}
            </button>
          ))}
        </div>
      </div>

      {notifications == null ? (
        <Loader />
      ) : (
        <>
          {notifications.results.length ? (
            notifications.results.map((notification, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                  <NotificationCard
                    data={notification}
                    index={i}
                    notificationState={{ notifications, setNotifications }}
                  />
                </AnimationWrapper>
              );
            })
          ) : (
            <NoDataMessage message="Nothing Available" />
          )}
          <LoadMoreDataBtn
            state={notifications}
            fetchDataFun={fetchNotifications}
            additionalParam={{ deletedDocCount: notifications.deletedDocCount }}
          />
        </>
      )}
    </div>
  );
};

export default Notification;
