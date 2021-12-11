import React, { useEffect } from "react"

function FlashMessages(props) {
  return (
    <div className="floating-alerts">
      {props.messages.map((message, index) => {
        return (
          <div key={index} className="alert alert-success text-center floating-alert shadow-sm">
            {message}
          </div>
        )
      })}
    </div>
  )
}

export default FlashMessages
