import { useEffect, useRef, useState } from "react";
export let activeTabLineRef;
export let activeTabRef;

const InPageNavigaion = ({
  routes,
  defaultHidden = [],
  currentRoute = "",
  setCurrentRoute,
  defaultActiveIndex = 0,
  children,
}) => {
  activeTabLineRef = useRef();
  activeTabRef = useRef();

  // Add safety check for currentRoute
  const initialIndex = currentRoute
    ? routes.findIndex(
        (route) => route.toLowerCase() === currentRoute.toLowerCase()
      )
    : defaultActiveIndex;

  let [inPageNavIndex, setInPageNavIndex] = useState(
    initialIndex !== -1 ? initialIndex : defaultActiveIndex
  );

  let [isResizeEventAdded, setIsResizeEventAdded] = useState(false);
  let [width, setWidth] = useState(window.innerWidth);

  const changePageState = (btn, i) => {
    let { offsetWidth, offsetLeft } = btn;
    activeTabLineRef.current.style.width = offsetWidth + "px";
    activeTabLineRef.current.style.left = offsetLeft + "px";
    setInPageNavIndex(i);

    if (setCurrentRoute && routes[i]) {
      const newRoute = routes[i].toLowerCase();
      setCurrentRoute(newRoute);
    }
  };

  useEffect(() => {
    if (currentRoute) {
      const routeIndex = routes.findIndex(
        (route) => route.toLowerCase() === currentRoute.toLowerCase()
      );
      if (routeIndex !== -1 && routeIndex !== inPageNavIndex) {
        const btn = document.querySelector(
          `button:nth-child(${routeIndex + 1})`
        );
        if (btn) {
          changePageState(btn, routeIndex);
        }
      }
    }
  }, [currentRoute, routes]);

  useEffect(() => {
    if (width > 766 && inPageNavIndex != defaultActiveIndex)
      changePageState(activeTabRef.current, defaultActiveIndex);

    if (!isResizeEventAdded) {
      window.addEventListener("resize", () => {
        if (!isResizeEventAdded) {
          setIsResizeEventAdded(true);
        }

        setWidth(window.innerWidth);
      });
    }
  }, [width]);

  useEffect(() => {
    changePageState(activeTabRef.current, defaultActiveIndex);
  }, []);

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {routes.map((route, i) => (
          <button
            ref={i === inPageNavIndex ? activeTabRef : null}
            onClick={(e) => changePageState(e.target, i)}
            key={i}
            className={`p-4 px-5 capitalize ${
              inPageNavIndex === i ? "text-black" : "text-dark-grey"
            } ${defaultHidden.includes(route) ? "md:hidden" : ""}`}
          >
            {route}
          </button>
        ))}
        <hr
          ref={activeTabLineRef}
          className="absolute bottom-0 duration-300 border-magenta"
        />
      </div>
      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
};

export default InPageNavigaion;
