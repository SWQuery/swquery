/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function TypewriterMarkdown({ content }: { content: string }) {
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let i = 0;
    setTypedText("");
    const timer = setInterval(() => {
      setTypedText((prev) => prev + content[i]);
      i++;
      if (i >= content.length) clearInterval(timer);
    }, 5);

    return () => clearInterval(timer);
  }, [content]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-xl text-white font-sans font-semibold mb-4" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-lg text-white font-sans font-semibold mb-3" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-base text-white font-sans font-medium mb-2" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-white font-sans font-medium mb-2" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="text-gray-300 mb-2 whitespace-pre-wrap" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside text-gray-300 mb-2" {...props} />
        ),
        li: ({ node, ...props }) => <li className="ml-6" {...props} />,
        code: ({ node, children, ...props }) => (
          <span className="text-gray-300 px-1 py-1 rounded-md text-sm bg-[#9C88FF30]" {...props}>
            {children}
          </span>
        ),
        strong: ({ node, children }) => <span className="text-gray-300">{children}</span>,
      }}
    >
      {typedText}
    </ReactMarkdown>
  );
}

export default TypewriterMarkdown;