import React, { useContext, useEffect } from "react"
import StateContext from "../StateContext"
import Page from "./Page"
import { useImmer } from "use-immer"
import LoadingIcon from "./LoadingIcon"
import axios from "axios"
import { Link } from "react-router-dom"
import Post from "./Post"

function ComponentName() {
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    isLoading: true,
    feed: []
  })

  useEffect(() => {
    const request = axios.CancelToken.source()
    async function fetchData() {
      try {
        const resp = await axios.post("/getHomeFeed", { token: appState.user.token }, { cancelToken: request.CancelToken })
        console.log(resp.data)
        setState(draft => {
          draft.isLoading = false
          draft.feed = resp.data
        })
      } catch (error) {
        console.log("There was a problem")
        console.log(error)
      }
    }
    fetchData()
  }, [])

  if (state.isLoading) return <LoadingIcon />

  return (
    <Page>
      {state.feed.length > 0 && (
        <>
          <h2 className="text-center"> The Latest from those you follow</h2>
          <div className="list-group">
            {state.feed.map(post => {
              return <Post post={post} />
            })}
          </div>
        </>
      )}
      {state.feed.length == 0 && (
        <>
          <h2 className="text-center">
            {" "}
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">Your feed displays the latest posts from the people you follow. If you don&rsquo;t have any friends to follow that&rsquo;s okay; you can use the &ldquo;Search&rdquo; feature in the top menu bar to find content written by people with similar interests and then follow them.</p>
        </>
      )}
    </Page>
  )
}

export default ComponentName
