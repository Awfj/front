const FullScreenLoader = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple border-t-transparent rounded-full animate-spin"></div>
        <div
          className="w-16 h-16 border-4 border-magenta border-t-transparent rounded-full animate-spin absolute top-0 left-0"
          style={{ animationDirection: "reverse", opacity: 0.5 }}
        ></div>
      </div>
    </div>
  );
};

export default FullScreenLoader;
