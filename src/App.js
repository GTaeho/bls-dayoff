import "./App.css";

import { useState } from "react";
import Login from "./component/Login.js";
import Signup from "./component/Signup.js";
import MyCalendar from "./MyCalendar.js";

function App() {
  const [currentForm, setCurrentFrom] = useState("dayoffCal");
  const [accessToken, setAccessToken] = useState("");

  const toggleForm = (form) => {
    setCurrentFrom(form);
  };

  if (currentForm === "login") {
    return (
      <div className="App">
        <Login onFormSwitch={toggleForm} />
      </div>
    );
  } else if (currentForm === "signup") {
    return (
      <div className="App">
        <Signup onFormSwitch={toggleForm} />
      </div>
    );
  } else if (currentForm === "dayoffCal") {
    return (
      <div>
        <MyCalendar onFormSwitch={toggleForm} />
      </div>
    );
  }
}

export default App;
