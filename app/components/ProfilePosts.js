import axios from "axios"
import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import LoadingIcon from "./LoadingIcon"
import Post from "./Post"

function ProfilePosts() {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  const { username } = useParams()
  const request = axios.CancelToken.source()
  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await axios.get(`profile/${username}/posts`, { cancelToken: request.token })

        setPosts(response.data)
        setIsLoading(false)
      } catch (error) {
        console.log("There was a problem")
        console.log(error)
      }
    }
    fetchPosts()
    return () => {
      request.cancel()
    }
  }, [username])

  if (isLoading) return <LoadingIcon />

  return (
    <div className="list-group">
      {posts.map(post => {
        return <Post noAuthor={true} post={post} key={post._id} />
      })}
    </div>
  )
}
export default ProfilePosts
