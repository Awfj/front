const AvatarWrapper = ({
  children,
  style = "gradient", // gradient, shine, pulse, float
  className = "",
  online_status,
}) => {
  const getWrapperClass = () => {
    switch (style) {
      case "shine":
        return "avatar-shine";
      case "pulse":
        return "avatar-pulse";
      case "float":
        return "avatar-float";
      default:
        return "avatar-gradient";
    }
  };

  return (
    <div className="avatar-wrapper">
      <div className={`${getWrapperClass()} ${className}`}>{children}</div>
      {online_status && (
        <div
          className={`status-ring ${
            online_status.is_online ? "bg-black" : "bg-transparent"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full ${
              online_status.is_online ? "bg-green" : "bg-transparent"
            }`}
            title={
              online_status.is_online
                ? "Online"
                : `Last seen: ${new Date(
                    online_status.last_active
                  ).toLocaleString()}`
            }
          />
        </div>
      )}
    </div>
  );
};

export default AvatarWrapper;
