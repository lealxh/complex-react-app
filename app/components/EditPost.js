import React, { useEffect, useState, useContext } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import Page from "./Page"
import LoadingIcon from "./LoadingIcon"

import { useImmerReducer } from "use-immer"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function EditPost() {
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
    sendCount: 0
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
        return
      case "bodyChange":
        draft.body.value = action.value
        return
      case "submitRequest":
        draft.sendCount++
        return
      case "saveRequestStarted":
        draft.isSaving = true
        return
      case "saveRequestFinished":
        draft.isSaving = false
        return
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, originalState)

  useEffect(() => {
    const request = axios.CancelToken.source()
    async function fetchPost() {
      try {
        const response = await axios.get(`post/${state.id}`, { cancelToken: request.token })
        console.log(response.data)
        dispatch({ type: "fetchComplete", value: response.data })
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
          console.log(appState.user)
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
    dispatch({ type: "submitRequest" })
  }

  if (state.isFetching) return <LoadingIcon />

  return (
    <Page title="Edit post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            value={state.title.value}
            onChange={e => {
              dispatch({ type: "titleChange", value: e.target.value })
            }}
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
          />
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
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
          />
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Updates
        </button>
      </form>
    </Page>
  )
}

export default EditPost
