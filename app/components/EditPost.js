import React, { useContext, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import axios from "axios"
import Page from "./Page"
import LoadingIcon from "./LoadingIcon"

import { useImmerReducer } from "use-immer"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import NotFound from "./NotFound"
import { withRouter } from "react-router-dom"

function EditPost(props) {
  const [isLoading, setIsLoading] = useState(true)
  const { id } = useParams()

  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  }
  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false

        return
      case "titleChange":
        draft.title.value = action.value
        draft.title.hasErrors = false
        draft.title.message = ""
        return
      case "bodyChange":
        draft.body.value = action.value
        draft.body.hasErrors = false
        draft.body.message = ""
        return
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) draft.sendCount++
        return
      case "saveRequestStarted":
        draft.isSaving = true
        return
      case "saveRequestFinished":
        draft.isSaving = false
        return
      case "titleRules":
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = "You must provide a title"
        }
        return
      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = "You must provide a body"
        }
        return

      case "notFound":
        draft.notFound = true
        return
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, originalState)

  useEffect(() => {
    const request = axios.CancelToken.source()
    async function fetchPost() {
      try {
        const response = await axios.get(`post/${state.id}`, { cancelToken: request.token })
        if (response.data) {
          if (response.data.author.username == appState.user.username) dispatch({ type: "fetchComplete", value: response.data })
          else {
            appDispatch({ type: "flashmessage", value: "You are not allowed to edit this post" })
            props.history.push("/")
          }
        } else {
          dispatch({ type: "notFound" })
        }
      } catch (error) {
        console.log("There was a problem")
        console.log(error)
      }
    }
    fetchPost()
    return () => {
      request.cancel()
    }
  }, [])

  useEffect(() => {
    const saveRequest = axios.CancelToken.source()
    async function editPost() {
      if (state.sendCount) {
        dispatch({ type: "saveRequestStarted" })
        try {
          const response = await axios.post(`post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: saveRequest.token })
          dispatch({ type: "saveRequestFinished" })
          appDispatch({ type: "flashmessage", value: "Post updated successfully.!!" })
        } catch (error) {
          console.log("There was a problem")
          console.log(error)
        }
      }
    }
    editPost()
    return () => {
      saveRequest.cancel()
    }
  }, [state.sendCount])

  async function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "titleRules", value: state.title.value })
    dispatch({ type: "bodyRules", value: state.body.value })
    dispatch({ type: "submitRequest" })
  }

  if (state.notFound) return <NotFound />

  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    )

  return (
    <Page title="Edit post">
      <Link to={`/post/${id}`} className="small font-weight-bold">
        &laquo; Back to Post
      </Link>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            value={state.title.value}
            onChange={e => {
              dispatch({ type: "titleChange", value: e.target.value })
            }}
            onBlur={e => dispatch({ type: "titleRules", value: e.target.value })}
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
          />
          {state.title.hasErrors ? <div className="alert alert-danger liveValidateMessage">{state.title.message}</div> : ""}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            value={state.body.value}
            onChange={e => {
              dispatch({ type: "bodyChange", value: e.target.value })
            }}
            onBlur={e => dispatch({ type: "bodyRules", value: e.target.value })}
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
          />
          {state.body.hasErrors ? <div className="alert alert-danger liveValidateMessage">{state.body.message}</div> : ""}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Updates
        </button>
      </form>
    </Page>
  )
}

export default withRouter(EditPost)
