import React, { useEffect } from "react";

export default function Comments(): JSX.Element {
    useEffect(() => {
      let script = document.createElement("script");
      let anchor = document.getElementById("inject-comments-for-uterances");
      script.setAttribute("src", "https://utteranc.es/client.js");
      script.setAttribute("crossorigin","anonymous");
      script.setAttribute("async", 'async');
      script.setAttribute("repo", "rodrigopfialho/spacetraveling");
      script.setAttribute("issue-term", "pathname");
      script.setAttribute( "theme", "github-dark");
      anchor.appendChild(script);
  }, []);

        return <div id="inject-comments-for-uterances"></div>
}