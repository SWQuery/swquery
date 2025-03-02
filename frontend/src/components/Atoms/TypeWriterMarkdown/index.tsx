/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TypewriterMarkdown({ content }: { content: string }) {
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
        h1: (props) => {
          const { ...rest } = props;
          return <h1 className="text-xl text-white font-sans font-semibold mb-4" {...rest} />;
        },
        h2: (props) => {
          const { ...rest } = props;
          return <h2 className="text-lg text-white font-sans font-semibold mb-3" {...rest} />;
        },
        h3: (props) => {
          const { ...rest } = props;
          return <h3 className="text-base text-white font-sans font-medium mb-2" {...rest} />;
        },
        h4: (props) => {
          const { ...rest } = props;
          return <h4 className="text-white font-sans font-medium mb-2" {...rest} />;
        },
        p: (props) => {
          const { ...rest } = props;
          return <p className="text-gray-300 mb-2 whitespace-pre-wrap" {...rest} />;
        },
        ul: (props) => {
          const { ...rest } = props;
          return <ul className="list-disc list-inside text-gray-300 mb-2" {...rest} />;
        },
        li: (props) => {
          const { ...rest } = props;
          return <li className="ml-6" {...rest} />;
        },
        code: ({ children, ...props }) => {
          const { ...rest } = props;
          return (
            <span className="text-gray-300 px-1 py-1 rounded-md text-sm bg-[#9C88FF30]" {...rest}>
              {children}
            </span>
          );
        },
        strong: ({ children, ...props }) => {
          const { ...rest } = props;
          return <span className="text-gray-300" {...rest}>{children}</span>;
        },
      }}
    >
      {typedText}
    </ReactMarkdown>
  );
}