import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

// apply bootstrap 5 theme
import "bootstrap/dist/css/bootstrap.min.css";

// 부트스트랩 적용 이전 내 스타일로 우선 적용
// 부트스트랩 css 아래에 적용해서 내 스타일 적용 가능함
import "./MyCalendar.css";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Container, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import UserTable from "./component/UserTable";

function MyCalendar(props) {
  const [showModal, setShowModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showDayoffCancelModal, setShowDayoffcancelModel] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [managerFillInStatus, setManagerFillInStatus] = useState("");
  const [dateString, setDateString] = useState("");
  const [editDayoffInfo, setEditDayoffInfo] = useState({
    name: "",
    oldDate: "",
    newDate: "",
  });
  const [accessToken, setAccessToken] = useState("");
  const [name, setName] = useState("");
  const [nameFromEventInfo, setNameFromEventInfo] = useState("");
  const [type, setType] = useState("");

  // 캘린더 레퍼런스 잡기
  const calRef = useRef();

  // 관리자 권한 휴무생성 휴무자 이름 Form.Control ref 잡기
  const fillinNameRef = useRef();

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleShowManagerModal = () => setShowManagerModal(true);
  const handleCloseManagerModal = () => setShowManagerModal(false);
  const handleDayoffCloseModal = () => setShowDayoffcancelModel(false);
  const handleShowDayoffCancelModal = () => setShowDayoffcancelModel(true);
  const handleShowEditModal = () => setShowEditModal(true);
  const handleCloseEditModal = () => setShowEditModal(false);
  const handleManagerFillInStatus = (e) => {
    setManagerFillInStatus(e.target.value);
  };
  const handleShowAdminModal = () => setShowAdminModal(true);
  const handleCloseAdminModal = () => setShowAdminModal(false);

  const titleFomat = {
    month: "short",
    day: "numeric",
  };

  // // 달력의 첫번째 날짜와 마지막 날짜 구하기
  // const getStartAndEndDate = () => {
  //   const calApi = calRef.current.getApi();
  //   const startDate = calApi.view.activeStart.toISOString().slice(0, 10);
  //   const endDate = calApi.view.activeEnd.toISOString().slice(0, 10);
  //   const viewDateRange = {
  //     startDate: startDate,
  //     endDate: endDate,
  //   };
  //   return viewDateRange;
  // };

  // const requestDayoffSchedule = async () => {
  //   const dateRange = JSON.stringify(getStartAndEndDate());
  //   const resp = await fetch(`/dayoff?range=${dateRange}`, {
  //     method: "GET",
  //   });

  //   const data = await resp.json();
  //   const dayoffSchedule = data.dayoffSchedule;
  //   console.log(`dayoff schedule length : ${dayoffSchedule}`);
  // };

  // 페이지 로딩되면 곧바로 화면에 표시된 달력에 휴무스케쥴 서버에서 불러오기
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken !== null) setAccessToken(accessToken);

    const nameFromServer = localStorage.getItem("name");
    setName(nameFromServer);

    const userType = localStorage.getItem("type");
    // console.log(`userType : ${userType}`);
    setType(userType);
  }, []);

  const dateHeaderFormat = {
    weekday: "short",
    // day: "numeric",
  };

  const headerToolbarSetting = { start: "prev", center: "title", end: "next" };

  // 휴무신청 버튼 띄우기
  // const renderDaycellContent = () => {
  //   return (
  //     <>
  //       <Button variant="primary" onClick={handleShowModal}>
  //         휴무신청
  //       </Button>
  //     </>
  //   );
  // };

  // 페이지 리프레시
  const refreshPage = () => {
    window.location.reload(false);
  };

  // 휴무신청 버튼 누르면 동작
  const fillInDayoff = async (name) => {
    // console.log(`fillInDayoff에서 확인한 accessToken : ${accessToken}`);
    if (accessToken.length === 0) {
      props.onFormSwitch("login");
    }

    // POST 요청
    const resp = await fetch("/dayoff", {
      method: "POST",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      // header에 content-type 이 application/json 일때는 body 내용에
      // string 형식으로 dictionary 를 넣어줘야 서버에서 읽힌다.
      body: JSON.stringify({
        id: new Date().toLocaleString(),
        title: name,
        start: dateString,
      }),
    });

    const data = await resp.json();
    // 액세스토큰 인증 유효 검사
    if (data.result === "ok") {
      alert(data.message);
      handleCloseModal();
      refreshPage();
    } else if (data.result === "error") {
      alert(data.message);
      props.onFormSwitch("login");
    } else if (data.result === "alreadyFilled") {
      alert(data.message);
      handleCloseModal();
    }

    // console.info(data);
    // handleCloseModal();
    // refreshPage();
  };

  // 날짜를 누르면 휴무신청 모달 띄우기
  const handleDateClickEvent = (eventInfo) => {
    const date = eventInfo.dateStr;
    setDateString(date);

    // 관리자가 휴무신청 할 때는 모달을 따로 띄우기
    if (type === "teamleader" || type === "developer") {
      handleShowManagerModal();
    } else {
      // 기사가 날짜를 누를때는 자기 자신의 휴무신청 모달 띄우기
      handleShowModal();
    }
  };

  // 휴무=event를 화면에 렌더링
  const renderEventContent = (eventInfo) => {
    return (
      <>
        <p id="dayoffTitleName">{eventInfo.event.title}</p>
      </>
    );
  };

  // event=휴무 를 클릭하면 휴무 취소 모달 띄우기
  const eventClickHandler = (eventInfo) => {
    // console.info(eventInfo);

    // 클릭한 휴무자 이름. 팀장과 개발자, 이사가 취소하기 위함.
    const nameFromEventInfo = eventInfo.event._def.title;
    setNameFromEventInfo(nameFromEventInfo);

    // const startDate = eventInfo.event.start;
    const clickedEventDate = eventInfo.event.start;
    // 자바스크립트에서는 UTC 시간을 사용하기 때문에 GMT+0900을 보정해야한다.
    const dateCompensation = new Date(
      clickedEventDate.getTime() +
        Math.abs(clickedEventDate.getTimezoneOffset() * 60000)
    );
    const offsetCompensatedDate = dateCompensation.toISOString().slice(0, 10);
    setDateString(offsetCompensatedDate);

    // 팀장, 개발자는 타인의 휴무도 취소가능, 그 외 인원은 자신의 휴무만 취소가능
    if (type === "teamleader" || type === "developer") {
      handleShowDayoffCancelModal();
    } else {
      // 팀장, 개발자 아니면서 타인의 휴무를 고의든 실수든 취소하려하면 alert
      // 자신의 휴무는 취소가능
      if (name === eventInfo.event._def.title) {
        handleShowDayoffCancelModal();
      } else {
        if (name === null) {
          alert("로그인이 필요한 서비스입니다. 로그인페이지로 이동합니다.");
          props.onFormSwitch("login");
        } else {
          alert(`${name}님! 본인의 휴무만 취소가 가능합니다!`);
        }
      }
    }
  };

  // 팀장, 개발자, 이사직 이 사용가능한 휴무 드래그&드랍 핸들링
  const handleEventDrop = async (eventDropInfo) => {
    // console.log(eventDropInfo);
    const name = eventDropInfo.event._def.title;
    const oldDateString = eventDropInfo.oldEvent.startStr;
    const newDateString = eventDropInfo.event.startStr;
    console.log(
      `name: ${name}, oldDate : ${oldDateString}, newDate : ${newDateString}`
    );

    setEditDayoffInfo({
      name: name,
      oldDate: oldDateString,
      newDate: newDateString,
    });

    handleShowEditModal();
  };

  // 휴무변경 루틴
  const requestChangeDayoff = async (name, oldDate, newDate) => {
    // PUT 요청 (드래그앤드랍으로 휴무변경)
    const resp = await fetch("/dayoff", {
      method: "PUT",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      // header에 content-type 이 application/json 일때는 body 내용에
      // string 형식으로 dictionary 를 넣어줘야 서버에서 읽힌다.
      body: JSON.stringify({
        name: name,
        oldDate: oldDate,
        newDate: newDate,
      }),
    });

    const data = await resp.json();
    // console.info(data);
    if (data.result === "ok") {
      handleCloseEditModal();
      alert(data.message);
    } else {
      alert(data.message);
    }
  };

  // 휴무취소 실행
  const cancelDayoff = async () => {
    // let calApi = calRef.current.getApi();
    // let events = calApi.getEvents();
    // let event = calApi.getEventById(idString);
    // console.log(events);

    // console.log(`fillInDayoff에서 확인한 accessToken : ${accessToken}`);
    if (accessToken.length === 0) {
      props.onFormSwitch("login");
    }

    // DELETE 요청
    const resp = await fetch("/dayoff", {
      method: "DELETE",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      // header에 content-type 이 application/json 일때는 body 내용에
      // string 형식으로 dictionary 를 넣어줘야 서버에서 읽힌다.
      body: JSON.stringify({
        name: nameFromEventInfo,
        start: dateString,
      }),
    });

    const data = await resp.json();
    // 액세스토큰 인증 유효 검사
    if (data.result === "ok") {
      alert(data.message);
      refreshPage();
    } else if (data.result === "error") {
      alert(data.message);
      props.onFormSwitch("login");
    }

    handleDayoffCloseModal();
  };

  return (
    <>
      {/* 휴무확인 모달 영역 시작 */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>휴무신청</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>{dateString}일에 휴무를 신청하시겠습니까?</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            아니요
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              fillInDayoff(name);
            }}
          >
            휴무신청
          </Button>
        </Modal.Footer>
      </Modal>
      {/* 휴무확인 모달 영역 끝 */}

      {/* 팀장, 개발자외 관리자가 사용가능한 휴무추가 시작 */}
      <Modal show={showManagerModal} onHide={handleCloseManagerModal}>
        <Modal.Header closeButton>
          <Modal.Title>관리자 권한 휴무추가</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Check
              type="radio"
              value="manager-self"
              label="본인 휴무 신청"
              checked={managerFillInStatus === "manager-self"}
              onChange={handleManagerFillInStatus}
            ></Form.Check>

            <Form.Group>
              <Form.Check
                type="radio"
                value="manager-else"
                label="타인 휴무 신청"
                checked={managerFillInStatus === "manager-else"}
                onChange={handleManagerFillInStatus}
              ></Form.Check>
              <Form.Control
                type="text"
                placeholder="휴무자 이름"
                ref={fillinNameRef}
              ></Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseManagerModal}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (managerFillInStatus === "manager-self") {
                fillInDayoff(name);
              } else if (managerFillInStatus === "manager-else") {
                fillInDayoff(fillinNameRef.current.value);
              }
            }}
          >
            휴무생성
          </Button>
        </Modal.Footer>
      </Modal>
      {/* 팀장, 개발자외 관리자가 사용가능한 휴무추가 끝 */}

      {/* 휴무취소 확인 모달 영역 시작 */}
      <Modal show={showDayoffCancelModal} onHide={handleDayoffCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>휴무취소</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            {dateString}일에 등록된 {nameFromEventInfo}님의 휴무를
            취소하시겠습니까?
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleDayoffCloseModal}>
            아니요
          </Button>
          <Button variant="primary" onClick={cancelDayoff}>
            휴무취소
          </Button>
        </Modal.Footer>
      </Modal>
      {/* 휴무취소 확인 모달 영역 끝 */}

      {/* 휴무수정 확인 모달 영역 시작 */}
      <Modal show={showEditModal} onHide={handleDayoffCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>휴무수정</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            {editDayoffInfo.name}님의 {editDayoffInfo.oldDate} 의 휴무를{" "}
            {editDayoffInfo.newDate} 로 바꾸시겠습니까?
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            아니요
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              requestChangeDayoff(
                editDayoffInfo.name,
                editDayoffInfo.oldDate,
                editDayoffInfo.newDate
              );
            }}
          >
            휴무변경
          </Button>
        </Modal.Footer>
      </Modal>
      {/* 휴무수정 확인 모달 영역 끝 */}

      {/* 사용자 관리화면 모달 시작 */}
      <Modal show={showAdminModal} onHide={handleCloseAdminModal}>
        <Modal.Header closeButton>관리자 화면</Modal.Header>

        <Modal.Body className="user-table-container">
          <UserTable token={accessToken} />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAdminModal}>
            변경취소
          </Button>
          <Button variant="primary" onClick={() => {}}>
            변경사항 적용
          </Button>
        </Modal.Footer>
      </Modal>
      {/* 사용자 관리화면 모달 끝 */}

      <div className="mypage-body">
        <Navbar>
          <Container>
            <Navbar.Brand href="#home">형제물류 휴무관리</Navbar.Brand>
            <Nav>
              {accessToken.length === 0 ? (
                <Button
                  variant="outline-dark"
                  onClick={() => {
                    props.onFormSwitch("login");
                  }}
                >
                  로그인
                </Button>
              ) : (
                <NavDropdown id="nav-dropdown" title={name} menuVariant="dark">
                  {type === "teamleader" || type === "developer" ? (
                    <NavDropdown.Item
                      onClick={() => {
                        handleShowAdminModal();
                      }}
                    >
                      관리화면
                    </NavDropdown.Item>
                  ) : (
                    <></>
                  )}
                  <NavDropdown.Item
                    onClick={() => {
                      localStorage.clear();
                      refreshPage();
                    }}
                  >
                    로그아웃
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Container>
        </Navbar>
        {/* <p id="header">형제물류 휴무관리</p> */}
        <div className="body-wrapper box">
          <div className="body-info-container">
            <div className="calendar-wrapper">
              <FullCalendar
                locale="ko"
                plugins={[dayGridPlugin, interactionPlugin]}
                editable={
                  type === "teamleader" || type === "developer" ? true : false
                }
                // eventDragStart={(info) => {
                //   console.log(info);
                // }}
                eventDrop={handleEventDrop}
                initialView="dayGrid"
                duration={{ weeks: 4 }}
                headerToolbar={headerToolbarSetting}
                height="100vh"
                // contentHeight={1400}
                dateClick={handleDateClickEvent}
                // dayCellContent={renderDaycellContent}
                dayHeaderFormat={dateHeaderFormat}
                events={"/dayoff"}
                eventSourceFailure={(err) => {
                  console.log(`이벤트 받아오기 실패 : ${err}`);
                }}
                eventContent={renderEventContent}
                eventClick={eventClickHandler}
                ref={calRef}
                titleFormat={titleFomat}
              />
              <b className="dayoff_guide">
                <br></br>* 날짜를 클릭하여 휴무를 신청하세요.
                <br></br>* 취소는 본인 이름을 클릭하세요.
              </b>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyCalendar;
