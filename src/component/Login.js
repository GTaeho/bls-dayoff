import React, { useRef } from "react";

function Login(props) {
  // useState를 쓰고 input에서 onChange에서 setState를 쓰는 방식을 버리는
  // 방식은 아래 youtube를 보고 useRef를 쓰는 방식으로 수정하였다.
  // https://www.youtube.com/watch?v=GGo3MVBFr1A
  const idRef = useRef();
  const passwdRef = useRef();

  // const [id, setId] = useState("");
  // const [passwd, setPasswd] = useState("");
  // const [loadingSpinner, setLoadingSpinner] = useState(false);

  const loginRequest = async (id, passwd) => {
    if (id && passwd) {
      // 서버에 올라갈때는 주소 필요없고 nodejs 에 라우터에 정의해놓은 요청만 적으면 잘된다.
      // Content-Type 이 application/json 이 안되는 이유는 CORS 정책 떄문이다.
      // https://developer.mozilla.org/ko/docs/Web/HTTP/CORS#%EB%8B%A8%EC%88%9C_%EC%9A%94%EC%B2%ADsimple_requests 참고
      const resp = await fetch("/login", {
        method: "POST",
        headers: {
          Accept: "text/plain",
          "Accept-Charset": "utf-8",
          "Accept-Language": "ko-kr,ko;q=0.8,en-us;q=0.5,en;q=0.3",
          "Accept-Encoding": "br, gzip, deflate",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // cotent-type이 urlencoded 일때는 body를 URLSearchParams로 인코딩 해줘야 된다.
        body: new URLSearchParams({
          id: id,
          passwd: passwd,
        }),
      });

      const serverResponse = await resp.json();
      const loginResult = serverResponse.result;
      if (loginResult === "ok") {
        const acquiredAccessToken = serverResponse.accessToken;
        console.log(`AccessToken acquired : ${acquiredAccessToken}`);
        const name = serverResponse.name;
        localStorage.setItem("accessToken", acquiredAccessToken);
        localStorage.setItem("name", name);
        props.onFormSwitch("dayoffCal");
      } else {
        alert(serverResponse.message);
      }
    } else {
      console.error("아이디나 비번이 입력되지 않았습니다");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = idRef.current.value;
    const passwd = passwdRef.current.value;
    loginRequest(id, passwd);
  };

  return (
    <div className="LoginFormContainer">
      <form className="LoginForm" onSubmit={handleSubmit}>
        <h3 className="LoginFormTitle">형제물류 네트워크</h3>
        <div className="LoginContent">
          <label htmlFor="id">아이디</label>
          <input ref={idRef}></input>
          <label htmlFor="passwd">비밀번호</label>
          <input ref={passwdRef} type="password"></input>
          <button className="login_btn" type="submit">
            로그인
          </button>
        </div>
        <button
          className="link_btn"
          type="button"
          onClick={() => props.onFormSwitch("signup")}
        >
          아직 회원이 아니세요? 회원가입
        </button>
      </form>
    </div>
  );
}

export default Login;
