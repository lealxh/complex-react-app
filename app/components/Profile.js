import React, { useEffect, useContext, useState } from "react"
import Page from "./Page"
import { useParams, NavLink, Switch, Route } from "react-router-dom"
import axios from "axios"
import StateContext from "../StateContext"
import ProfilePosts from "./ProfilePosts"
import ProfileFollow from "./ProfileFollow"
import { useImmer } from "use-immer"

function Profile() {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" }
    }
  })

  function startFollowing() {
    setState(draft => {
      draft.startFollowingRequestCount++
    })
  }
  function stopFollowing() {
    setState(draft => {
      draft.stopFollowingRequestCount++
    })
  }

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
      const request = axios.CancelToken.source()
      async function addFollow() {
        try {
          const resp = await axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: request.CancelToken })
          setState(draft => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.followActionLoading = false
          })
        } catch (error) {
          console.log("There was a problem")
        }
      }
      addFollow()
      return () => {
        request.cancel()
      }
    }
  }, [state.startFollowingRequestCount])

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
      const request = axios.CancelToken.source()
      async function removefollow() {
        try {
          const resp = await axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: request.CancelToken })
          setState(draft => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.followActionLoading = false
          })
        } catch (error) {
          console.log("There was a problem")
        }
      }
      removefollow()
      return () => {
        request.cancel()
      }
    }
  }, [state.stopFollowingRequestCount])

  useEffect(() => {
    const request = axios.CancelToken.source()
    async function fetchData() {
      try {
        const resp = await axios.post(`/profile/${username}`, { token: appState.user.token }, { cancelToken: request.CancelToken })
        setState(draft => {
          draft.profileData = resp.data
        })
      } catch (error) {
        console.log("There was a problem")
      }
    }
    fetchData()
    return () => {
      request.cancel()
    }
  }, [username])
  return (
    <Page title="Profile screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {appState.loggedIn && !state.profileData.isFollowing && state.profileData.profileUsername != appState.user.username && state.profileData.profileUsername != "..." && (
          <button className="btn btn-primary btn-sm ml-2" onClick={startFollowing} disabled={state.followActionLoading}>
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {appState.loggedIn && state.profileData.isFollowing && state.profileData.profileUsername != appState.user.username && state.profileData.profileUsername != "..." && (
          <button className="btn btn-danger btn-sm ml-2" onClick={stopFollowing} disabled={state.followActionLoading}>
            Stop Following <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>
      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink exact to={`/profile/${state.profileData.profileUsername}`} className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path={`/profile/:username`}>
          <ProfilePosts />
        </Route>
        <Route path={`/profile/:username/followers`}>
          <ProfileFollow action="followers" />
        </Route>
        <Route path={`/profile/:username/following`}>
          <ProfileFollow action="following" />
        </Route>
      </Switch>
    </Page>
  )
}

export default Profile
