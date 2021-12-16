import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import Page from "./Page"
import { Link } from "react-router-dom"
import LoadingIcon from "./LoadingIcon"
import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import ReactTooltip from "react-tooltip"

function ViewSinglePost() {
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState()
  const { id } = useParams()
  const request = axios.CancelToken.source()

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await axios.get(`post/${id}`, { cancelToken: request.token })
        console.log(response)
        setPost(response.data)
        setIsLoading(false)
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

  if (isLoading)
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    )
  const date = new Date(post.createdDate)
  const dateFormatted = `${date.getMonth() + 1} / ${date.getDate()} / ${date.getFullYear()}`
  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        <span className="pt-2">
          <a href="#" data-tip="Edit" data-for="edit" className="text-primary mr-2">
            <i className="fas fa-edit"></i>
          </a>
          <ReactTooltip id="edit" className="custom-tooltip" />{" "}
          <a data-tip="Delete" data-for="delete" className="delete-post-button text-danger">
            <i className="fas fa-trash"></i>
          </a>
          <ReactTooltip id="delete" className="custom-tooltip" />
        </span>
      </div>
      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>
      <div className="body-content">
        <ReactMarkdown children={post.body} allowedTypes={("paragraph", "strong", "emphasis", "text", "heading", "list", "listitem")} />
      </div>
    </Page>
  )
}

export default ViewSinglePost
