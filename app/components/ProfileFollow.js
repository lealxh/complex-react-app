import axios from "axios"
import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import LoadingIcon from "./LoadingIcon"

function ProfileFollow(props) {
  const [isLoading, setIsLoading] = useState(true)
  const [follows, setFollows] = useState([])
  const action = props.action
  const { username } = useParams()
  const request = axios.CancelToken.source()
  useEffect(() => {
    async function fetchFollow() {
      try {
        const response = await axios.get(`profile/${username}/${action}`, { cancelToken: request.token })

        setFollows(response.data)
        setIsLoading(false)
      } catch (error) {
        console.log("There was a problem")
        console.log(error)
      }
    }
    fetchFollow()
    return () => {
      request.cancel()
    }
  }, [username, action])

  if (isLoading) return <LoadingIcon />

  if (follows.length == 0) return
  return (
    <div className="list-group">
      {follows.map((follow, index) => {
        return (
          <Link key={index} to={`/profile/${follow.username}`} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={follow.avatar} />
            {follow.username}
          </Link>
        )
      })}
    </div>
  )
}
export default ProfileFollow
