import React from "react";

const NoDataMessage = ({ message, noMargin = false }) => {
  return (
    <div
      className={`text-center w-full p-4 rounded-full bg-grey/50 ${
        noMargin ? "" : "mb-4"
      }`}
    >
      <p>{message}</p>
    </div>
  );
};

export default NoDataMessage;
