import React from "react";

export default function AlliLoader({
  onLoadingComplete,
}: {
  onLoadingComplete: () => void;
}) {
  const [displayedText, setDisplayedText] = React.useState("");
  const fullText = "Alli Arts";
  const typingSpeed = 500;

  React.useEffect(() => {
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setTimeout(() => {
          if (onLoadingComplete) {
            onLoadingComplete();
          }
        }, 500);
        clearInterval(typingInterval);
      }
    }, typingSpeed);
    return () => clearInterval(typingInterval)
  }, []);

  return (
    <div className="flex items-center justify-center inset-0 fixed z-50 bg-linear-to-r from-neutral-900 to-gray-600">
      <div className="text-center">
        <div className="inline-flex items-baseline">
          <h1 className="text-3xl md:text-5xl font-thin text-white">
            {displayedText}
          </h1>
          <span className="text-3xl md:text-5xl font-normal animate-pulse ml-1">
            |
          </span>
        </div>
      </div>
    </div>
  );
}
