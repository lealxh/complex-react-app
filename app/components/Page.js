import React, { useEffect } from "react"
import Container from "./Container"

function Page(props) {
  useEffect(() => {
    document.title = props.title
  }, [])
  return <Container narrow={props.narrow}>{props.children}</Container>
}

export default Page
