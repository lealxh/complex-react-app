import React, { useEffect, useState, useContext } from "react"

import axios from "axios"
import DispatchContext from "../DispatchContext"

function HeaderLoggedOut() {
  const appDispatch = useContext(DispatchContext)

  const [username, setUsername] = useState()
  const [password, setPassword] = useState()

  async function handleSubmit(e) {
    e.preventDefault()
    const data = { username, password }

    try {
      const response = await axios.post("/login", data)
      console.log(response)

      if (response.data) {
        appDispatch({ type: "login", data: response.data })
        appDispatch({ type: "flashmessage", value: "You have successfully logged in" })
      } else {
        appDispatch({ type: "flashmessage", value: "Invalid Username/Password" })
      }
    } catch (error) {
      console.log(error)
      console.log("There was an error")
    }
  }

  return (
    <>
      <form className="mb-0 pt-2 pt-md-0" onSubmit={handleSubmit}>
        <div className="row align-items-center">
          <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
            <input name="username" onChange={e => setUsername(e.target.value)} className="form-control form-control-sm input-dark" type="text" placeholder="Username" autoComplete="off" />
          </div>
          <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
            <input name="password" onChange={e => setPassword(e.target.value)} className="form-control form-control-sm input-dark" type="password" placeholder="Password" />
          </div>
          <div className="col-md-auto">
            <button className="btn btn-success btn-sm">Sign In</button>
          </div>
        </div>
      </form>
    </>
  )
}

export default HeaderLoggedOut
