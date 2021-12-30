import React, { useState, useReducer, Suspense } from "react"
import ReactDOM from "react-dom"
import { BrowserRouter, Switch, Route } from "react-router-dom"
import { useImmerReducer } from "use-immer"
import Axios from "axios"
Axios.defaults.baseURL = process.env.BACKENDURL || ""

// My Components
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Home from "./components/Home"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"
//import CreatePost from "./components/CreatePost"
const CreatePost = React.lazy(() => import("./components/CreatePost"))
//import ViewSinglePost from "./components/ViewSinglePost"
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"))

import FlashMessages from "./components/FlashMessages"
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"
import { useEffect } from "react"
import Profile from "./components/Profile"
import EditPost from "./components/EditPost"
//import Search from "./components/Search"
const Search = React.lazy(() => import("./components/Search"))

import { CSSTransition } from "react-transition-group"
//import Chat from "./components/Chat"
const Chat = React.lazy(() => import("./components/Chat"))
import axios from "axios"
import LoadingIcon from "./components/LoadingIcon"

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexappToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("complexappToken"),
      username: localStorage.getItem("complexappUsername"),
      avatar: localStorage.getItem("complexappAvatar")
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  }
  function OurReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.data
        console.log("Login dispatch:")
        console.log(action.data)
        return
      case "logout":
        draft.loggedIn = false
        return
      case "flashmessage":
        draft.flashMessages.push(action.value)
        return
      case "openSearch":
        draft.isSearchOpen = true
        return
      case "closeSearch":
        draft.isSearchOpen = false
        return
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen
        return
      case "closeChat":
        draft.isChatOpen = false
        return
      case "incrementUnreadChatCount":
        draft.unreadChatCount++
        return
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0
        return
    }
  }
  const [state, dispatch] = useImmerReducer(OurReducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("complexappToken", state.user.token)
      localStorage.setItem("complexappUsername", state.user.username)
      localStorage.setItem("complexappAvatar", state.user.avatar)
    } else {
      localStorage.removeItem("complexappToken")
      localStorage.removeItem("complexappUsername")
      localStorage.removeItem("complexappAvatar")
    }
  }, [state.loggedIn])

  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await axios.post("/checkToken", { token: state.user.token }, { cancelToken: ourRequest.token })
          if (!response.data) {
            dispatch({ type: "logout" })
            dispatch({ type: "flashmessage", value: "Your session has expired. Please log in again." })
          }
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
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingIcon />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/about-us">
                <About />
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route exact path="/post/:id/edit">
                <EditPost />
              </Route>
              <Route exact path="/post/:id">
                <ViewSinglePost />
              </Route>
              <Route path="/profile/:username">
                <Profile />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>

          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDOM.render(<Main />, document.querySelector("#app"))

if (module.hot) {
  module.hot.accept()
}
