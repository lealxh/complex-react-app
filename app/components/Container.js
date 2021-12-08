import React, { useEffect } from "react"

function Container(props) {
  return <div className={"container py-md-5 " + (props.narrow ? "container--narrow" : "")}>{props.children}</div>
  // container--narrow
}

export default Container
