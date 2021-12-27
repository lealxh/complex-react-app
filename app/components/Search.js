import React, { useContext, useEffect } from "react"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"
import axios from "axios"
import { Link } from "react-router-dom"
import Post from "./Post"

function Search() {
  const appDispatch = useContext(DispatchContext)
  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0
  })

  function handleSearchKeyPress(e) {
    if (e.keyCode == 27) appDispatch({ type: "closeSearch" })
  }
  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        draft.show = "loading"
      })
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++
        })
      }, 1000)

      return () => {
        clearTimeout(delay)
      }
    } else {
      setState(draft => {
        draft.show = "neither"
      })
    }
  }, [state.searchTerm])

  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = axios.CancelToken.source()

      async function fetchResults() {
        try {
          const response = await axios.post("/search", { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token })
          setState(draft => {
            draft.results = response.data
            draft.show = "results"
          })
        } catch (error) {
          console.log("There was a problem")
          console.log(error)
        }
      }
      fetchResults()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.requestCount])
  function handleChanges(e) {
    const value = e.target.value
    setState(draft => {
      draft.searchTerm = value
    })
  }
  useEffect(() => {
    document.addEventListener("keyup", handleSearchKeyPress)
    return () => {
      document.removeEventListener("keyup", handleSearchKeyPress)
    }
  }, [])
  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input autoFocus onChange={handleChanges} type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span className="close-live-search" onClick={() => appDispatch({ type: "closeSearch" })}>
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader " + (state.show == "loading" ? "circle-loader--visible" : "")} />
          <div className={"live-search-results" + (state.show == "results" ? "live-search-results--visible" : "")}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length + (state.results.length > 1 ? " items " : " item ") + "found"})
                </div>
                {state.results.map(post => {
                  return (
                    <Post
                      post={post}
                      onClick={() => {
                        appDispatch({ type: "closeSearch" })
                      }}
                    />
                  )
                })}
              </div>
            )}
            {!Boolean(state.results.length) && <p className="alert alert-danger text-center shadow-sm">Sorry, we could not find any results for that search</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
