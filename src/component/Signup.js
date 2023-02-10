import React, { useState } from "react";

function Signup(props) {
  const [id, setId] = useState("");
  const [passwd, setPasswd] = useState("");
  const [name, setName] = useState("");

  const signupRequest = async (id, passwd, name) => {
    if (id && passwd && name) {
      // 서버에 올라갈때는 주소 필요없고 nodejs 에 라우터에 정의해놓은 요청만 적으면 잘된다.
      // Content-Type 이 application/json 이 안되는 이유는 CORS 정책 떄문이다.
      // https://developer.mozilla.org/ko/docs/Web/HTTP/CORS#%EB%8B%A8%EC%88%9C_%EC%9A%94%EC%B2%ADsimple_requests 참고
      const resp = await fetch("/signup", {
        method: "POST",
        headers: {
          Accept: "text/plain",
          "Accept-Charset": "utf-8",
          "Accept-Language": "ko-kr,ko;q=0.8,en-us;q=0.5,en;q=0.3",
          "Accept-Encoding": "br, gzip, deflate",
          // "Access-Token":
          //   "eyJhbGciOiJIUzI1NiJ9.cHJpZDc3QG5hdmVyLmNvbQ.0u9G9OTvAGOMoXYh4twUjgIcvT9m-huIKlUF5qCXXeg",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // cotent-type이 urlencoded 일때는 body를 URLSearchParams로 인코딩 해줘야 된다.
        body: new URLSearchParams({
          id: id,
          passwd: passwd,
          name: name,
        }),
      });

      const data = await resp.json();
      console.log(`signup data : ${data}`);
      if (data.result === "ok") {
        // result.message에 사용자 등록 완료됬다는 메세지 나오면
        // 프롬프트 같은거 있어서 띄우면 좋겠다.
        // 여기에 프롬프트 코드 띄우기
        alert("");

        // 그리고 나서는 로그인 페이지로 바로 이동해서 사용자가 로그인 할 수 있게
        props.onFormSwitch("login");
      } else {
        // 가입하려는 아이디가 존재하는 경우에 data.result === "error" 가 나온다.
        // 경고나 에러 프롬프트 띄워서 data.message 내용을 띄우면 좋겠다
        // 여기에 에러 프롬프트 띄워서 data.message 내용 출력하는 코드 쓰기
      }
    } else {
      console.error("아이디나 비번이 입력되지 않았습니다.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signupRequest(id, passwd, name);
  };

  return (
    <div className="SignupFormContainer">
      <form className="SignupForm" onSubmit={handleSubmit}>
        <h3 className="SignupFormTitle">형제물류 네트워크</h3>
        <div className="SignupContent">
          <label htmlFor="id">아이디</label>
          <input
            value={id}
            onChange={(e) => {
              setId(e.target.value);
            }}
          ></input>
          <label htmlFor="passwd">비밀번호</label>
          <input
            value={passwd}
            onChange={(e) => {
              setPasswd(e.target.value);
            }}
            type="password"
          ></input>
          <label htmlFor="name">이름</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          ></input>
          <button className="register_btn" type="submit">
            회원가입
          </button>
        </div>

        <button
          className="link_btn"
          type="button"
          onClick={() => props.onFormSwitch("login")}
        >
          이미 회원이세요? 로그인
        </button>
      </form>
    </div>
  );
}

export default Signup;
