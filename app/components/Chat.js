import React, { useContext, useEffect } from "react"
import { useRef } from "react"
import { useImmer } from "use-immer"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"
import { io } from "socket.io-client"
import { Link } from "react-router-dom"

function Chat() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const chatField = useRef(null)
  const chatLog = useRef(null)
  const socket = useRef(null)
  const [state, setState] = useImmer({
    fieldValue: "",
    chatMessages: []
  })
  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus()
      appDispatch({ type: "clearUnreadChatCount" })
    }
  }, [appState.isChatOpen])

  useEffect(() => {
    socket.current = io("http://localhost:8080")
    socket.current.on("chatFromServer", message => {
      console.log("Message received: ")
      console.log(message)
      setState(draft => {
        draft.chatMessages.push(message)
      })
    })
    return () => socket.current.disconnect()
  }, [])

  useEffect(() => {
    if (appState.isChatOpen) {
      chatLog.current.scrollTop = chatLog.current.scrollHeight
    }
    if (state.chatMessages.length > 0 && !appState.isChatOpen) {
      appDispatch({ type: "incrementUnreadChatCount" })
    }
  }, [state.chatMessages.length])

  function handleValueChange(e) {
    const value = e.target.value
    setState(draft => {
      draft.fieldValue = value
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    //send message to chat server
    socket.current.emit("chatFromBrowser", { message: state.fieldValue, token: appState.user.token })
    //add message to chatMessages
    setState(draft => {
      draft.chatMessages.push({ message: draft.fieldValue, username: appState.user.username, avatar: appState.user.avatar })
      draft.fieldValue = ""
      chatField.current.value = ""
    })
  }
  return (
    <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right " + (appState.isChatOpen ? "chat-wrapper--is-visible" : "")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span
          onClick={() => {
            appDispatch({ type: "closeChat" })
          }}
          className="chat-title-bar-close"
        >
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" ref={chatLog} className="chat-log">
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message} </div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            )
          } else {
            return (
              <div key={index} className="chat-other">
                <a href="#">
                  <img className="avatar-tiny" src={message.avatar} />
                </a>
                <div className="chat-message">
                  <div className="chat-message-inner">
                    <Link to={`/profile/${message.username}`}>
                      <strong>{message.username}: </strong>
                    </Link>
                    {message.message}
                  </div>
                </div>
              </div>
            )
          }
        })}
      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input ref={chatField} onChange={handleValueChange} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
      </form>
    </div>
  )
}

export default Chat
